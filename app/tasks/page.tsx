'use client'

export default function TasksPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Tasks
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Manage your daily tasks and priorities
      </p>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="space-y-3">
          <TaskItem title="Review Q4 strategy" completed={false} />
          <TaskItem title="Follow up with leads" completed={false} />
          <TaskItem title="Update website content" completed={true} />
          <TaskItem title="Prepare investor deck" completed={false} />
        </div>
      </div>
    </div>
  )
}

function TaskItem({ title, completed }: { title: string; completed: boolean }) {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <input type="checkbox" checked={completed} readOnly className="h-5 w-5 rounded" />
      <span className={`${completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
        {title}
      </span>
    </div>
  )
}
