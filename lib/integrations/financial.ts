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

// Stripe Adapter
export class StripeAdapter implements IFinancialAdapter {
  private accessToken: string = ''
  private connected = false
  private baseUrl = 'https://api.stripe.com/v1'

  async connect(config: IntegrationConfig): Promise<boolean> {
    if (config.type !== 'stripe') {
      throw new Error('Invalid integration type for Stripe adapter')
    }

    this.accessToken = config.accessToken || ''
    
    try {
      // Test connection by fetching account
      const response = await fetch(`${this.baseUrl}/account`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      })
      
      this.connected = response.ok
      return this.connected
    } catch (error) {
      console.error('Stripe connection failed:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false
    this.accessToken = ''
  }

  isConnected(): boolean {
    return this.connected
  }

  async getAccounts(): Promise<BankAccount[]> {
    if (!this.connected) throw new Error('Not connected to Stripe')

    const balanceResponse = await fetch(`${this.baseUrl}/balance`, {
      headers: { 'Authorization': `Bearer ${this.accessToken}` },
    })
    const balance = await balanceResponse.json()

    return balance.available.map((b: any) => ({
      id: `stripe_${b.currency}`,
      institution: 'Stripe',
      accountType: 'checking' as const,
      balance: b.amount / 100, // Convert from cents
      currency: b.currency.toUpperCase(),
      lastSync: new Date(),
    }))
  }

  async getTransactions(accountId?: string, days = 30): Promise<Transaction[]> {
    if (!this.connected) throw new Error('Not connected to Stripe')

    const created = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60)

    // Get charges (payments received)
    const chargesResponse = await fetch(
      `${this.baseUrl}/charges?created[gte]=${created}&limit=100`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      }
    )
    const chargesData = await chargesResponse.json()

    const transactions: Transaction[] = chargesData.data?.map((charge: any) => ({
      id: charge.id,
      accountId: 'stripe_main',
      date: new Date(charge.created * 1000),
      amount: -charge.amount / 100, // Negative for income
      description: charge.description || `Payment from ${charge.billing_details?.name || 'customer'}`,
      category: 'Revenue',
      merchant: charge.customer,
      pending: !charge.paid,
    })) || []

    // Get payouts (money transferred to bank)
    const payoutsResponse = await fetch(
      `${this.baseUrl}/payouts?created[gte]=${created}&limit=100`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      }
    )
    const payoutsData = await payoutsResponse.json()

    const payouts: Transaction[] = payoutsData.data?.map((payout: any) => ({
      id: payout.id,
      accountId: 'stripe_main',
      date: new Date(payout.created * 1000),
      amount: payout.amount / 100, // Positive for expense
      description: `Payout to ${payout.destination || 'bank'}`,
      category: 'Transfer',
      merchant: 'Stripe',
      pending: payout.status !== 'paid',
    })) || []

    return [...transactions, ...payouts].sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  async getSummary(days = 30): Promise<FinancialSummary> {
    const accounts = await this.getAccounts()
    const transactions = await this.getTransactions(undefined, days)

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
    const revenue = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
    const transfers = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      totalBalance,
      totalIncome: revenue,
      totalExpenses: transfers,
      monthlyBurn: 0, // Stripe doesn't have typical expenses
      savingsRate: 100, // All revenue is "saved" until transferred
      topCategories: [
        { category: 'Revenue', amount: revenue },
        { category: 'Transfers', amount: transfers },
      ],
      recurringCharges: [],
    }
  }

  async categorizeTransaction(transaction: Transaction): Promise<string> {
    return transaction.category
  }

  async sync(): Promise<void> {
    await this.getAccounts()
    await this.getTransactions(undefined, 30)
  }

  async getInsights(): Promise<any> {
    const summary = await this.getSummary(30)
    const transactions = await this.getTransactions(undefined, 30)
    
    const revenueTransactions = transactions.filter(t => t.amount < 0)
    const avgTransactionValue = revenueTransactions.length > 0 
      ? Math.abs(revenueTransactions.reduce((sum, t) => sum + t.amount, 0) / revenueTransactions.length)
      : 0

    return {
      summary,
      insights: [
        `Total revenue: $${summary.totalIncome.toLocaleString()}`,
        `${revenueTransactions.length} payments received`,
        `Average transaction: $${avgTransactionValue.toFixed(2)}`,
        `Current balance: $${summary.totalBalance.toLocaleString()}`,
      ],
      recommendations: [
        'Consider setting up automatic payouts',
        'Monitor failed payment attempts',
        'Review pricing strategy based on transaction sizes',
      ],
    }
  }
}

// PayPal Adapter
export class PayPalAdapter implements IFinancialAdapter {
  private accessToken: string = ''
  private connected = false
  private baseUrl = 'https://api.paypal.com/v1'

  async connect(config: IntegrationConfig): Promise<boolean> {
    if (config.type !== 'paypal') {
      throw new Error('Invalid integration type for PayPal adapter')
    }

    this.accessToken = config.accessToken || ''
    
    try {
      // Test connection
      const response = await fetch(`${this.baseUrl}/identity/oauth2/userinfo?schema=paypalv1.1`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      })
      
      this.connected = response.ok
      return this.connected
    } catch (error) {
      console.error('PayPal connection failed:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false
    this.accessToken = ''
  }

  isConnected(): boolean {
    return this.connected
  }

  async getAccounts(): Promise<BankAccount[]> {
    if (!this.connected) throw new Error('Not connected to PayPal')

    // Get balance
    const balanceResponse = await fetch(`${this.baseUrl}/reporting/balances`, {
      headers: { 
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await balanceResponse.json()

    return [{
      id: 'paypal_main',
      institution: 'PayPal',
      accountType: 'checking' as const,
      balance: parseFloat(data.balances?.[0]?.total_balance?.value || '0'),
      currency: data.balances?.[0]?.total_balance?.currency_code || 'USD',
      lastSync: new Date(),
    }]
  }

  async getTransactions(accountId?: string, days = 30): Promise<Transaction[]> {
    if (!this.connected) throw new Error('Not connected to PayPal')

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    const endDate = new Date().toISOString()

    const response = await fetch(
      `${this.baseUrl}/reporting/transactions?start_date=${startDate}&end_date=${endDate}&fields=all&page_size=100`,
      {
        headers: { 
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )
    const data = await response.json()

    return data.transaction_details?.map((txn: any) => {
      const amount = parseFloat(txn.transaction_info?.transaction_amount?.value || '0')
      return {
        id: txn.transaction_info?.transaction_id || '',
        accountId: 'paypal_main',
        date: new Date(txn.transaction_info?.transaction_initiation_date),
        amount: amount,
        description: txn.transaction_info?.transaction_subject || 'PayPal Transaction',
        category: txn.transaction_info?.transaction_event_code || 'Uncategorized',
        merchant: txn.payer_info?.payer_name?.alternate_full_name || 'Unknown',
        pending: txn.transaction_info?.transaction_status !== 'S',
      }
    }) || []
  }

  async getSummary(days = 30): Promise<FinancialSummary> {
    const accounts = await this.getAccounts()
    const transactions = await this.getTransactions(undefined, days)

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
    const income = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
    const expenses = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)

    const categoryMap = new Map<string, number>()
    transactions.forEach(t => {
      const current = categoryMap.get(t.category) || 0
      categoryMap.set(t.category, current + Math.abs(t.amount))
    })

    const topCategories = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    return {
      totalBalance,
      totalIncome: income,
      totalExpenses: expenses,
      monthlyBurn: expenses / (days / 30),
      savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
      topCategories,
      recurringCharges: [],
    }
  }

  async categorizeTransaction(transaction: Transaction): Promise<string> {
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
        `PayPal balance: $${summary.totalBalance.toLocaleString()}`,
        `Income: $${summary.totalIncome.toLocaleString()}`,
        `Expenses: $${summary.totalExpenses.toLocaleString()}`,
        `Net: $${(summary.totalIncome - summary.totalExpenses).toLocaleString()}`,
      ],
      recommendations: [
        'Transfer excess balance to your bank',
        'Monitor international transaction fees',
        'Consider PayPal Business for better rates',
      ],
    }
  }
}
