'use client'

export default function ContentPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Content
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        AI-powered content creation and management
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              Generate Blog Post
            </button>
            <button className="w-full py-3 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
              Create Social Media Post
            </button>
            <button className="w-full py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
              Write Email Template
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Content</h3>
          <div className="space-y-3">
            <ContentItem title="Q4 Marketing Strategy" date="2 hours ago" />
            <ContentItem title="Product Launch Announcement" date="Yesterday" />
            <ContentItem title="Weekly Newsletter" date="3 days ago" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ContentItem({ title, date }: { title: string; date: string }) {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <p className="font-medium text-gray-900 dark:text-white">{title}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{date}</p>
    </div>
  )
}
