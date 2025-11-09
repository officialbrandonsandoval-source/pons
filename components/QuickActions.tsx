'use client'

import Link from 'next/link'

const actions = [
  { label: 'Create Post', icon: '📝', href: '/content' },
  { label: 'Schedule Task', icon: '📅', href: '/tasks' },
  { label: 'Open Copilot', icon: '🤖', href: '/copilot' },
  { label: 'Add Lead', icon: '➕', href: '/crm' },
]

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="group p-4 bg-white dark:bg-dark-lighter border border-steel-grey/20 rounded-2xl shadow-lg hover:shadow-glow hover:border-shiftly-blue/50 transition-all duration-300 flex flex-col items-center text-center"
        >
          <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{action.icon}</span>
          <span className="text-sm font-medium text-charcoal dark:text-snow-white group-hover:text-shiftly-blue transition-colors">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  )
}
