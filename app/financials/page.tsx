'use client'

export default function FinancialsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Financials
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Track your revenue, expenses, and financial metrics
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard label="Monthly Revenue" value="$24,500" change="+12%" positive />
        <MetricCard label="Expenses" value="$8,200" change="-5%" positive />
        <MetricCard label="Profit Margin" value="66.5%" change="+3%" positive />
        <MetricCard label="Runway" value="18 mo" change="Stable" positive />
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Transactions</h3>
        <div className="space-y-3">
          <Transaction type="income" label="Client Payment - Acme Corp" amount="+$5,000" />
          <Transaction type="expense" label="Software Subscriptions" amount="-$299" />
          <Transaction type="income" label="Product Sales" amount="+$1,200" />
          <Transaction type="expense" label="Marketing Ads" amount="-$450" />
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, change, positive }: { label: string; value: string; change: string; positive: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
      <p className={`text-sm ${positive ? 'text-green-500' : 'text-red-500'}`}>{change}</p>
    </div>
  )
}

function Transaction({ type, label, amount }: { type: 'income' | 'expense'; label: string; amount: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
          type === 'income' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
        }`}>
          <span className="text-xl">{type === 'income' ? '↑' : '↓'}</span>
        </div>
        <span className="text-gray-900 dark:text-white">{label}</span>
      </div>
      <span className={`font-semibold ${type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
        {amount}
      </span>
    </div>
  )
}
