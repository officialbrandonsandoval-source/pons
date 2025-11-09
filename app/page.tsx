'use client'

export default function Dashboard() {
  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, Elite Operator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your AI-powered command center is ready
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Tasks"
          value="12"
          trend="+3 from yesterday"
          color="blue"
        />
        <StatCard
          title="AI Interactions"
          value="47"
          trend="+12% this week"
          color="purple"
        />
        <StatCard
          title="Revenue"
          value="$24.5K"
          trend="+8.2% from last month"
          color="green"
        />
        <StatCard
          title="Projects"
          value="8"
          trend="2 in progress"
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Status */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🤖 AI Copilot Status
          </h2>
          <div className="space-y-4">
            <AIStatusItem 
              name="Memory System" 
              status="Active" 
              description="Tracking 234 data points"
            />
            <AIStatusItem 
              name="Content Generator" 
              status="Ready" 
              description="Ready for new requests"
            />
            <AIStatusItem 
              name="Lead Follow-up" 
              status="Active" 
              description="5 leads being monitored"
            />
            <AIStatusItem 
              name="Scheduler" 
              status="Active" 
              description="Next task in 2 hours"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            ⚡ Quick Actions
          </h2>
          <div className="space-y-3">
            <QuickAction icon="💬" label="Chat with AI" href="/copilot" />
            <QuickAction icon="📝" label="Create Content" href="/content" />
            <QuickAction icon="✅" label="Add Task" href="/tasks" />
            <QuickAction icon="👥" label="Check CRM" href="/crm" />
            <QuickAction icon="📊" label="View Projects" href="/projects" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          📌 Today's Priorities
        </h2>
        <div className="space-y-3">
          <PriorityItem 
            title="Review Q4 marketing strategy"
            time="9:00 AM"
            type="meeting"
          />
          <PriorityItem 
            title="Follow up with top 3 leads"
            time="11:30 AM"
            type="task"
          />
          <PriorityItem 
            title="Prepare investor pitch deck"
            time="2:00 PM"
            type="project"
          />
          <PriorityItem 
            title="Team sync - Product roadmap"
            time="4:00 PM"
            type="meeting"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, trend, color }: { 
  title: string
  value: string
  trend: string
  color: 'blue' | 'purple' | 'green' | 'orange'
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
      <p className={`text-3xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent mb-1`}>
        {value}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-500">{trend}</p>
    </div>
  )
}

function AIStatusItem({ name, status, description }: {
  name: string
  status: string
  description: string
}) {
  return (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="flex-shrink-0 h-2 w-2 mt-2 rounded-full bg-green-500" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-medium text-gray-900 dark:text-white">{name}</p>
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">{status}</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  )
}

function QuickAction({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <a
      href={href}
      className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium text-gray-900 dark:text-white">{label}</span>
    </a>
  )
}

function PriorityItem({ title, time, type }: { title: string; time: string; type: string }) {
  const typeColors = {
    meeting: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    task: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    project: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="flex items-center space-x-3">
        <input type="checkbox" className="h-5 w-5 rounded border-gray-300" />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{time}</p>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[type as keyof typeof typeColors]}`}>
        {type}
      </span>
    </div>
  )
}
