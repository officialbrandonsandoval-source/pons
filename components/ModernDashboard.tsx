'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import InsightsCards from './InsightsCards'
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  BoltIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

export default function ModernDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    revenue: { value: 24500, change: 8.2, trend: 'up' },
    leads: { value: 47, change: 12, trend: 'up' },
    tasks: { value: 12, change: 3, trend: 'up' },
    appointments: { value: 8, change: -2, trend: 'down' },
  })

  return (
    <div className="p-6 space-y-6 bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {session?.user?.name || 'Elite Operator'}
          </h1>
          <p className="text-slate-600 mt-1">
            Here's what's happening with your business today
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700">
            Export Report
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/30">
            + New Deal
          </button>
        </div>
      </div>

      {/* KPI Cards - Monday.com style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Revenue"
          value="$24.5K"
          change={stats.revenue.change}
          trend={stats.revenue.trend}
          icon={<CurrencyDollarIcon className="w-5 h-5" />}
          color="green"
          sparklineData={[20, 22, 21, 23, 24, 24.5]}
        />
        <KPICard
          title="Active Leads"
          value="47"
          change={stats.leads.change}
          trend={stats.leads.trend}
          icon={<UsersIcon className="w-5 h-5" />}
          color="blue"
          sparklineData={[35, 38, 42, 40, 45, 47]}
        />
        <KPICard
          title="Tasks Completed"
          value="12"
          change={stats.tasks.change}
          trend={stats.tasks.trend}
          icon={<CheckCircleIcon className="w-5 h-5" />}
          color="purple"
          sparklineData={[8, 9, 10, 11, 11, 12]}
        />
        <KPICard
          title="Appointments"
          value="8"
          change={stats.appointments.change}
          trend={stats.appointments.trend}
          icon={<CalendarIcon className="w-5 h-5" />}
          color="orange"
          sparklineData={[12, 11, 10, 9, 9, 8]}
        />
      </div>

      {/* AI Insights Engine - Phase F */}
      <InsightsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Pipeline - VinSolutions style */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Sales Pipeline</h2>
              <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700">
                <option>This Month</option>
                <option>This Quarter</option>
                <option>This Year</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <PipelineStage
                name="New Leads"
                count={15}
                value="$45.2K"
                color="bg-slate-500"
                percentage={100}
              />
              <PipelineStage
                name="Contacted"
                count={12}
                value="$38.5K"
                color="bg-blue-500"
                percentage={80}
              />
              <PipelineStage
                name="Qualified"
                count={8}
                value="$28.3K"
                color="bg-indigo-500"
                percentage={53}
              />
              <PipelineStage
                name="Proposal Sent"
                count={5}
                value="$19.8K"
                color="bg-purple-500"
                percentage={33}
              />
              <PipelineStage
                name="Negotiation"
                count={3}
                value="$12.5K"
                color="bg-orange-500"
                percentage={20}
              />
              <PipelineStage
                name="Closed Won"
                count={2}
                value="$8.2K"
                color="bg-green-500"
                percentage={13}
              />
            </div>
          </div>

          {/* Activity Feed - VinSolutions style */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <ActivityItem
                type="call"
                title="Outbound call to Sarah Johnson"
                time="10 minutes ago"
                status="completed"
              />
              <ActivityItem
                type="email"
                title="Follow-up email sent to Michael Chen"
                time="1 hour ago"
                status="sent"
              />
              <ActivityItem
                type="meeting"
                title="Demo scheduled with Acme Corp"
                time="2 hours ago"
                status="scheduled"
              />
              <ActivityItem
                type="task"
                title="Proposal prepared for TechStart Inc"
                time="3 hours ago"
                status="completed"
              />
              <ActivityItem
                type="call"
                title="Inbound call from David Martinez"
                time="4 hours ago"
                status="missed"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* AI Copilot Status - GHL style */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <BoltIcon className="w-5 h-5" />
              <h2 className="text-lg font-bold">AI Copilot</h2>
            </div>
            <div className="space-y-3">
              <AIStatus label="Memory System" status="active" detail="234 data points" />
              <AIStatus label="Lead Scoring" status="active" detail="5 hot leads" />
              <AIStatus label="Auto-Follow-up" status="active" detail="Next in 2h" />
              <AIStatus label="Content Gen" status="ready" detail="0 in queue" />
            </div>
          </div>

          {/* Quick Actions - GHL style */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <QuickActionButton icon={<PhoneIcon />} label="Call Lead" color="green" />
              <QuickActionButton icon={<EnvelopeIcon />} label="Send Email" color="blue" />
              <QuickActionButton icon={<CalendarIcon />} label="Schedule" color="purple" />
              <QuickActionButton icon={<CheckCircleIcon />} label="Add Task" color="orange" />
            </div>
          </div>

          {/* Today's Schedule - Monday.com style */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Today's Schedule</h2>
            <div className="space-y-3">
              <ScheduleItem
                time="9:00 AM"
                title="Team Standup"
                color="bg-blue-500"
              />
              <ScheduleItem
                time="11:00 AM"
                title="Demo - Acme Corp"
                color="bg-purple-500"
              />
              <ScheduleItem
                time="2:00 PM"
                title="Follow-up Calls"
                color="bg-green-500"
              />
              <ScheduleItem
                time="4:00 PM"
                title="Review Analytics"
                color="bg-orange-500"
              />
            </div>
          </div>

          {/* Goals Widget - Monday.com style */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Monthly Goals</h2>
            <div className="space-y-4">
              <GoalProgress label="Revenue Target" current={24.5} target={30} unit="K" />
              <GoalProgress label="New Deals" current={8} target={15} />
              <GoalProgress label="Calls Made" current={47} target={100} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({
  title,
  value,
  change,
  trend,
  icon,
  color,
  sparklineData,
}: {
  title: string
  value: string
  change: number
  trend: string
  icon: React.ReactNode
  color: string
  sparklineData: number[]
}) {
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 ${colorClasses[color as keyof typeof colorClasses]} rounded-lg text-white`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? <ArrowTrendingUpIcon className="w-4 h-4" /> : <ArrowTrendingDownIcon className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
      {/* Mini sparkline */}
      <div className="mt-4 h-8">
        <MiniSparkline data={sparklineData} color={color} />
      </div>
    </div>
  )
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min
  
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * 100
      const y = 100 - ((val - min) / range) * 100
      return `${x},${y}`
    })
    .join(' ')

  const colorMap = {
    green: '#10b981',
    blue: '#3b82f6',
    purple: '#a855f7',
    orange: '#f97316',
  }

  return (
    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={colorMap[color as keyof typeof colorMap]}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PipelineStage({
  name,
  count,
  value,
  color,
  percentage,
}: {
  name: string
  count: number
  value: string
  color: string
  percentage: number
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 ${color} rounded-full`} />
          <span className="font-medium text-slate-900">{name}</span>
          <span className="text-sm text-slate-600">({count})</span>
        </div>
        <span className="font-semibold text-slate-900">{value}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

function ActivityItem({
  type,
  title,
  time,
  status,
}: {
  type: string
  title: string
  time: string
  status: string
}) {
  const iconMap = {
    call: <PhoneIcon className="w-4 h-4" />,
    email: <EnvelopeIcon className="w-4 h-4" />,
    meeting: <CalendarIcon className="w-4 h-4" />,
    task: <CheckCircleIcon className="w-4 h-4" />,
  }

  const statusColors = {
    completed: 'bg-green-100 text-green-700',
    sent: 'bg-blue-100 text-blue-700',
    scheduled: 'bg-purple-100 text-purple-700',
    missed: 'bg-red-100 text-red-700',
  }

  return (
    <div className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
      <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
        {iconMap[type as keyof typeof iconMap]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 text-sm">{title}</p>
        <p className="text-xs text-slate-600 mt-1">{time}</p>
      </div>
      <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
        {status}
      </span>
    </div>
  )
}

function AIStatus({ label, status, detail }: { label: string; status: string; detail: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-blue-100">{detail}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-xs font-medium capitalize">{status}</span>
      </div>
    </div>
  )
}

function QuickActionButton({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
  }

  return (
    <button className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} transition-colors flex flex-col items-center gap-2`}>
      <div className="w-5 h-5">{icon}</div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

function ScheduleItem({ time, title, color }: { time: string; title: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-1 h-12 ${color} rounded-full`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="text-xs text-slate-600">{time}</p>
      </div>
    </div>
  )
}

function GoalProgress({ label, current, target, unit = '' }: { label: string; current: number; target: number; unit?: string }) {
  const percentage = (current / target) * 100

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-900">{label}</span>
        <span className="text-sm font-semibold text-slate-900">
          {current}{unit} / {target}{unit}
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}
