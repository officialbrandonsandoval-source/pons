import { NextRequest, NextResponse } from 'next/server'
import { SmartTaskAutomation } from '@/core/agents/taskAutomation'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { action } = body

    const automation = new SmartTaskAutomation()

    switch (action) {
      case 'detect_tasks': {
        const { sources } = body
        const tasks = await automation.detectTasks(sources)
        return NextResponse.json({ success: true, tasks })
      }

      case 'find_time_slots': {
        const { task, calendarEvents, preferences } = body
        const slots = await automation.findOptimalTimeSlots(task, calendarEvents, preferences)
        return NextResponse.json({ success: true, slots })
      }

      case 'automation_suggestions': {
        const { tasks } = body
        const suggestions = await automation.generateAutomationSuggestions(tasks)
        return NextResponse.json({ success: true, suggestions })
      }

      case 'prioritize_tasks': {
        const { tasks } = body
        const prioritized = await automation.prioritizeTasks(tasks)
        return NextResponse.json({ success: true, tasks: prioritized })
      }

      case 'create_schedule': {
        const { tasks, calendarEvents, preferences } = body
        const schedule = await automation.createDailySchedule(tasks, calendarEvents, preferences)
        return NextResponse.json({ success: true, schedule })
      }

      case 'analyze_patterns': {
        const { completedTasks } = body
        const patterns = await automation.analyzeTaskPatterns(completedTasks)
        return NextResponse.json({ success: true, patterns })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Task automation error:', error)
    return NextResponse.json(
      { error: error.message || 'Automation failed' },
      { status: error.message === 'Unauthorized - please sign in' ? 401 : 500 }
    )
  }
}
