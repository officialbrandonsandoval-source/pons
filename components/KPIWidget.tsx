import React from 'react'

type Props = {
  title: string
  value: string
  trend: string
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

export default function KPIWidget({ title, value, trend, color = 'blue' }: Props) {
  const positive = trend.startsWith('+')
  
  const colorClasses = {
    blue: 'border-l-shiftly-blue shadow-glow-sm',
    green: 'border-l-green-500',
    purple: 'border-l-purple-500',
    orange: 'border-l-orange-500',
  }

  return (
    <div className={`p-6 rounded-2xl bg-white dark:bg-dark-lighter shadow-lg border-l-4 ${colorClasses[color]} hover:shadow-glow transition-all duration-300`}>
      <div className="text-steel-grey text-sm font-medium mb-2">{title}</div>
      <div className="text-3xl font-bold text-charcoal dark:text-snow-white mb-1">{value}</div>
      <div className={`text-sm font-medium ${positive ? 'text-green-500' : 'text-red-500'}`}>
        {trend} {positive ? '↑' : '↓'}
      </div>
    </div>
  )
}
