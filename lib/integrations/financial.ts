import { IFinancialAdapter, IntegrationConfig, BankAccount, Transaction, FinancialSummary } from '@/types/integrations'

export class PlaidAdapter implements IFinancialAdapter {
  private accessToken: string = ''
  private connected = false
  private baseUrl = 'https://production.plaid.com'

  async connect(config: IntegrationConfig): Promise<boolean> {
    if (config.type !== 'plaid') {
      throw new Error('Invalid integration type for Plaid adapter')
    }

    this.accessToken = config.accessToken || ''
    this.connected = !!this.accessToken
    return this.connected
  }

  async disconnect(): Promise<void> {
    this.connected = false
    this.accessToken = ''
  }

  isConnected(): boolean {
    return this.connected
  }

  async getAccounts(): Promise<BankAccount[]> {
    if (!this.connected) throw new Error('Not connected to Plaid')

    const response = await fetch(`${this.baseUrl}/accounts/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: this.accessToken,
      }),
    })

    const data = await response.json()
    
    return data.accounts?.map((account: any) => ({
      id: account.account_id,
      institution: account.name,
      accountType: account.type,
      balance: account.balances.current,
      currency: account.balances.iso_currency_code || 'USD',
      lastSync: new Date(),
    })) || []
  }

  async getTransactions(accountId?: string, days = 30): Promise<Transaction[]> {
    if (!this.connected) throw new Error('Not connected to Plaid')

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
    const endDate = new Date().toISOString().split('T')[0]

    const response = await fetch(`${this.baseUrl}/transactions/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: this.accessToken,
        start_date: startDate,
        end_date: endDate,
      }),
    })

    const data = await response.json()
    
    return data.transactions?.map((txn: any) => ({
      id: txn.transaction_id,
      accountId: txn.account_id,
      date: new Date(txn.date),
      amount: txn.amount,
      description: txn.name,
      category: txn.category?.[0] || 'Uncategorized',
      merchant: txn.merchant_name,
      pending: txn.pending,
    })) || []
  }

  async getSummary(days = 30): Promise<FinancialSummary> {
    const accounts = await this.getAccounts()
    const transactions = await this.getTransactions(undefined, days)

    const totalBalance = accounts.reduce((sum: number, acc: BankAccount) => sum + acc.balance, 0)
    
    const income = transactions
      .filter((t: Transaction) => t.amount < 0) // Negative amounts are income in Plaid
      .reduce((sum: number, t: Transaction) => sum + Math.abs(t.amount), 0)
    
    const expenses = transactions
      .filter((t: Transaction) => t.amount > 0)
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0)

    // Categorize expenses
    const categoryMap = new Map<string, number>()
    transactions
      .filter((t: Transaction) => t.amount > 0)
      .forEach((t: Transaction) => {
        const current = categoryMap.get(t.category) || 0
        categoryMap.set(t.category, current + t.amount)
      })

    const topCategories = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    // Find recurring charges
    const recurringCharges = transactions
      .filter((t: Transaction) => {
        const occurrences = transactions.filter(
          (tx: Transaction) => tx.merchant === t.merchant && Math.abs(tx.amount - t.amount) < 1
        ).length
        return occurrences >= 2
      })
      .slice(0, 5)

    return {
      totalBalance,
      totalIncome: income,
      totalExpenses: expenses,
      monthlyBurn: expenses / (days / 30),
      savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
      topCategories,
      recurringCharges,
    }
  }

  async categorizeTransaction(transaction: Transaction): Promise<string> {
    // Use AI to categorize transactions
    // Would integrate with OpenAI for smart categorization
    return transaction.category
  }

  async sync(): Promise<void> {
    await this.getAccounts()
    await this.getTransactions(undefined, 30)
  }

  async getInsights(): Promise<any> {
    const summary = await this.getSummary(30)
    
    return {
      summary,
      insights: [
        `You're spending $${summary.monthlyBurn.toFixed(0)}/month on average`,
        `Your savings rate is ${summary.savingsRate.toFixed(1)}%`,
        `Top spending category: ${summary.topCategories[0]?.category}`,
      ],
      recommendations: [
        'Consider reducing dining expenses',
        'You have recurring charges that could be optimized',
        'Set up automatic savings transfers',
      ],
    }
  }
}
