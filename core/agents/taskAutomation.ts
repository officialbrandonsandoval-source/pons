import OpenAI from 'openai'
import { IntegrationManager } from '@/lib/integrations/manager'

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  })
}

interface DetectedTask {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: 'work' | 'personal' | 'social' | 'financial' | 'health'
  estimatedDuration: number // minutes
  deadline?: Date
  suggestedTime?: Date
  confidence: number
  reasoning: string
}

interface ScheduleSlot {
  start: Date
  end: Date
  available: boolean
  reason?: string
}

interface AutomationSuggestion {
  type: 'schedule' | 'delegate' | 'automate' | 'defer' | 'delete'
  task: DetectedTask
  recommendation: string
  impact: string
}

export class SmartTaskAutomation {
  private manager: IntegrationManager

  constructor() {
    this.manager = IntegrationManager.getInstance()
  }

  /**
   * Detect tasks from various sources (emails, messages, calendar, documents)
   */
  async detectTasks(sources: {
    emails?: any[]
    messages?: any[]
    calendarEvents?: any[]
    documents?: any[]
  }): Promise<DetectedTask[]> {
    const detectedTasks: DetectedTask[] = []

    // Analyze emails for action items
    if (sources.emails && sources.emails.length > 0) {
      const emailTasks = await this.extractTasksFromEmails(sources.emails)
      detectedTasks.push(...emailTasks)
    }

    // Analyze calendar for commitments
    if (sources.calendarEvents && sources.calendarEvents.length > 0) {
      const calendarTasks = await this.extractTasksFromCalendar(sources.calendarEvents)
      detectedTasks.push(...calendarTasks)
    }

    // Analyze documents for to-do items
    if (sources.documents && sources.documents.length > 0) {
      const documentTasks = await this.extractTasksFromDocuments(sources.documents)
      detectedTasks.push(...documentTasks)
    }

    return detectedTasks
  }

  /**
   * Extract actionable tasks from emails using AI
   */
  private async extractTasksFromEmails(emails: any[]): Promise<DetectedTask[]> {
    const prompt = `Analyze these emails and extract actionable tasks:

${JSON.stringify(emails.slice(0, 10), null, 2)}

For each task, provide:
- title: Brief task title
- description: What needs to be done
- priority: high/medium/low
- category: work/personal/social/financial/health
- estimatedDuration: minutes needed
- deadline: if mentioned
- confidence: 0-1 score
- reasoning: why this is a task

Return as JSON array of tasks.`

    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at identifying actionable tasks from communications. Be precise and only identify clear action items.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(response.choices[0].message.content || '{"tasks":[]}')
    return (result.tasks || []).map((task: any) => ({
      ...task,
      id: `email-${Date.now()}-${Math.random()}`,
    }))
  }

  /**
   * Extract tasks from calendar events
   */
  private async extractTasksFromCalendar(events: any[]): Promise<DetectedTask[]> {
    const tasks: DetectedTask[] = []

    for (const event of events) {
      // Meetings often require preparation or follow-up
      if (event.title && event.start) {
        // Check if this needs prep
        if (event.title.toLowerCase().includes('meeting') || event.attendees?.length > 1) {
          tasks.push({
            id: `cal-prep-${event.id}`,
            title: `Prepare for ${event.title}`,
            description: `Review materials and agenda for upcoming ${event.title}`,
            priority: 'medium',
            category: 'work',
            estimatedDuration: 15,
            deadline: new Date(new Date(event.start).getTime() - 60 * 60 * 1000), // 1 hour before
            confidence: 0.7,
            reasoning: 'Meeting preparation is usually beneficial',
          })
        }
      }
    }

    return tasks
  }

  /**
   * Extract tasks from documents
   */
  private async extractTasksFromDocuments(documents: any[]): Promise<DetectedTask[]> {
    const tasksFromDocs: DetectedTask[] = []

    for (const doc of documents) {
      // Look for common task indicators
      const taskIndicators = ['TODO:', 'Action:', '- [ ]', 'Need to:', 'Must:', 'Should:']
      const content = doc.content || ''

      for (const indicator of taskIndicators) {
        if (content.includes(indicator)) {
          const lines = content.split('\n')
          for (const line of lines) {
            if (line.includes(indicator)) {
              tasksFromDocs.push({
                id: `doc-${doc.id}-${Date.now()}`,
                title: line.replace(indicator, '').trim().substring(0, 100),
                description: `From document: ${doc.title}`,
                priority: 'medium',
                category: 'work',
                estimatedDuration: 30,
                confidence: 0.6,
                reasoning: `Found task indicator: ${indicator}`,
              })
            }
          }
        }
      }
    }

    return tasksFromDocs
  }

  /**
   * Find optimal time slots for scheduling tasks
   */
  async findOptimalTimeSlots(
    task: DetectedTask,
    calendarEvents: any[],
    preferences: {
      workHoursStart: number // hour (0-23)
      workHoursEnd: number
      preferredDays?: string[] // ['Monday', 'Tuesday', etc.]
      focusBlocks?: { start: string; end: string }[] // Blocked focus time
    }
  ): Promise<ScheduleSlot[]> {
    const slots: ScheduleSlot[] = []
    const now = new Date()
    const daysToCheck = 7

    for (let day = 0; day < daysToCheck; day++) {
      const checkDate = new Date(now)
      checkDate.setDate(checkDate.getDate() + day)
      checkDate.setHours(preferences.workHoursStart, 0, 0, 0)

      // Check each hour within work hours
      for (
        let hour = preferences.workHoursStart;
        hour < preferences.workHoursEnd;
        hour++
      ) {
        const slotStart = new Date(checkDate)
        slotStart.setHours(hour, 0, 0, 0)

        const slotEnd = new Date(slotStart)
        slotEnd.setMinutes(slotEnd.getMinutes() + task.estimatedDuration)

        // Check if slot conflicts with existing events
        const hasConflict = calendarEvents.some(event => {
          const eventStart = new Date(event.start)
          const eventEnd = new Date(event.end)
          return (
            (slotStart >= eventStart && slotStart < eventEnd) ||
            (slotEnd > eventStart && slotEnd <= eventEnd)
          )
        })

        slots.push({
          start: slotStart,
          end: slotEnd,
          available: !hasConflict,
          reason: hasConflict ? 'Calendar conflict' : undefined,
        })
      }
    }

    return slots.filter(s => s.available).slice(0, 10)
  }

  /**
   * Generate automation suggestions for tasks
   */
  async generateAutomationSuggestions(
    tasks: DetectedTask[]
  ): Promise<AutomationSuggestion[]> {
    const suggestions: AutomationSuggestion[] = []

    for (const task of tasks) {
      // Low priority and low confidence -> suggest deferring
      if (task.priority === 'low' && task.confidence < 0.6) {
        suggestions.push({
          type: 'defer',
          task,
          recommendation: 'Consider deferring this task to next week',
          impact: 'Frees up time for high-priority items',
        })
      }

      // Repetitive tasks -> suggest automation
      if (
        task.title.toLowerCase().includes('report') ||
        task.title.toLowerCase().includes('update') ||
        task.title.toLowerCase().includes('sync')
      ) {
        suggestions.push({
          type: 'automate',
          task,
          recommendation: 'This appears to be a repetitive task - consider setting up automation',
          impact: 'Save time on recurring work',
        })
      }

      // High priority but requires expertise -> suggest delegation
      if (task.priority === 'high' && task.estimatedDuration > 120) {
        suggestions.push({
          type: 'delegate',
          task,
          recommendation: 'This is a large, high-priority task - consider delegating portions',
          impact: 'Faster completion and better focus on core work',
        })
      }

      // Has deadline -> suggest scheduling
      if (task.deadline && task.priority !== 'low') {
        suggestions.push({
          type: 'schedule',
          task,
          recommendation: `Schedule this task before ${task.deadline.toLocaleDateString()}`,
          impact: 'Ensures deadline is met',
        })
      }
    }

    return suggestions
  }

  /**
   * Prioritize tasks using AI-powered scoring
   */
  async prioritizeTasks(tasks: DetectedTask[]): Promise<DetectedTask[]> {
    const prompt = `Given these tasks, rank them by priority considering:
- Deadlines (urgent vs not urgent)
- Impact (high-impact vs low-impact)  
- Dependencies (blocks other work vs independent)
- Effort (quick wins vs large projects)

Tasks:
${JSON.stringify(tasks, null, 2)}

Return the tasks in prioritized order as JSON array.`

    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at task prioritization using the Eisenhower Matrix and GTD principles.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(response.choices[0].message.content || '{"tasks":[]}')
    return result.tasks || tasks
  }

  /**
   * Create a smart daily schedule
   */
  async createDailySchedule(
    tasks: DetectedTask[],
    calendarEvents: any[],
    preferences: {
      workHoursStart: number
      workHoursEnd: number
      breakDuration: number
      focusBlockDuration: number
    }
  ): Promise<{
    schedule: Array<{
      time: string
      activity: string
      type: 'task' | 'event' | 'break' | 'focus'
      duration: number
    }>
    summary: string
  }> {
    const schedule: any[] = []
    let currentHour = preferences.workHoursStart

    // Add calendar events
    for (const event of calendarEvents) {
      const start = new Date(event.start)
      if (start.getDate() === new Date().getDate()) {
        schedule.push({
          time: start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          activity: event.title,
          type: 'event',
          duration: Math.round(
            (new Date(event.end).getTime() - start.getTime()) / 60000
          ),
        })
      }
    }

    // Fill gaps with prioritized tasks
    const prioritizedTasks = await this.prioritizeTasks(tasks)
    
    for (const task of prioritizedTasks.slice(0, 5)) {
      const timeSlot = `${currentHour}:00`
      schedule.push({
        time: timeSlot,
        activity: task.title,
        type: 'task',
        duration: task.estimatedDuration,
      })
      currentHour += Math.ceil(task.estimatedDuration / 60)
      
      // Add breaks
      if (currentHour < preferences.workHoursEnd) {
        schedule.push({
          time: `${currentHour}:00`,
          activity: 'Break',
          type: 'break',
          duration: preferences.breakDuration,
        })
        currentHour += Math.ceil(preferences.breakDuration / 60)
      }
    }

    // Sort by time
    schedule.sort((a, b) => {
      const timeA = a.time.split(':').map(Number)
      const timeB = b.time.split(':').map(Number)
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1])
    })

    const summary = `Scheduled ${prioritizedTasks.length} tasks, ${calendarEvents.length} events, with ${schedule.filter(s => s.type === 'break').length} breaks`

    return { schedule, summary }
  }

  /**
   * Detect patterns in task completion
   */
  async analyzeTaskPatterns(completedTasks: Array<{
    task: DetectedTask
    completedAt: Date
    actualDuration: number
  }>): Promise<{
    peakProductivityHours: string[]
    averageTaskDuration: number
    completionRate: number
    commonCategories: string[]
  }> {
    // Group by hour
    const hourCounts: { [key: number]: number } = {}
    let totalDuration = 0

    for (const { completedAt, actualDuration } of completedTasks) {
      const hour = completedAt.getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
      totalDuration += actualDuration
    }

    // Find peak hours
    const sortedHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`)

    // Category frequency
    const categories = completedTasks.map(t => t.task.category)
    const categoryCount: { [key: string]: number } = {}
    categories.forEach(cat => {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1
    })

    const commonCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat)

    return {
      peakProductivityHours: sortedHours,
      averageTaskDuration: totalDuration / completedTasks.length,
      completionRate: completedTasks.length > 0 ? 0.85 : 0, // Placeholder
      commonCategories,
    }
  }
}
