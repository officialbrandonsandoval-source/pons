'use client'

export default function ProjectsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Projects
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Track your ongoing projects and initiatives
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProjectCard 
          name="Q4 Marketing Campaign"
          status="In Progress"
          progress={65}
        />
        <ProjectCard 
          name="Product Launch"
          status="Planning"
          progress={30}
        />
        <ProjectCard 
          name="Website Redesign"
          status="In Progress"
          progress={80}
        />
        <ProjectCard 
          name="Partnership Deals"
          status="Active"
          progress={45}
        />
      </div>
    </div>
  )
}

function ProjectCard({ name, status, progress }: { name: string; status: string; progress: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{status}</p>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{progress}% complete</p>
    </div>
  )
}
