/**
 * Productivity & Communication Integrations
 * Google Calendar, Notion, Gmail, Spotify
 */

import { IntegrationConfig } from '@/types/integrations'

// Base interfaces for productivity adapters
export interface IProductivityAdapter {
  connect(config: IntegrationConfig): Promise<boolean>
  disconnect(): Promise<void>
  isConnected(): boolean
  sync(): Promise<void>
  getInsights(): Promise<any>
}

// Google Calendar Adapter
export class GoogleCalendarAdapter implements IProductivityAdapter {
  private accessToken: string = ''
  private connected = false
  private baseUrl = 'https://www.googleapis.com/calendar/v3'

  async connect(config: IntegrationConfig): Promise<boolean> {
    if (config.type !== 'google-calendar') {
      throw new Error('Invalid integration type for Google Calendar adapter')
    }

    this.accessToken = config.accessToken || ''
    
    try {
      // Test connection by fetching calendar list
      const response = await fetch(`${this.baseUrl}/users/me/calendarList`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      })
      
      this.connected = response.ok
      return this.connected
    } catch (error) {
      console.error('Google Calendar connection failed:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false
    this.accessToken = ''
  }

  isConnected(): boolean {
    return this.connected
  }

  async getCalendars(): Promise<any[]> {
    if (!this.connected) throw new Error('Not connected to Google Calendar')

    const response = await fetch(`${this.baseUrl}/users/me/calendarList`, {
      headers: { 'Authorization': `Bearer ${this.accessToken}` },
    })

    const data = await response.json()
    return data.items || []
  }

  async getEvents(days = 30): Promise<any[]> {
    if (!this.connected) throw new Error('Not connected to Google Calendar')

    const timeMin = new Date().toISOString()
    const timeMax = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

    const response = await fetch(
      `${this.baseUrl}/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      }
    )

    const data = await response.json()
    return data.items || []
  }

  async createEvent(event: {
    summary: string
    description?: string
    start: Date
    end: Date
    attendees?: string[]
  }): Promise<any> {
    if (!this.connected) throw new Error('Not connected to Google Calendar')

    const response = await fetch(`${this.baseUrl}/calendars/primary/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.start.toISOString() },
        end: { dateTime: event.end.toISOString() },
        attendees: event.attendees?.map(email => ({ email })),
      }),
    })

    return response.json()
  }

  async sync(): Promise<void> {
    await this.getCalendars()
    await this.getEvents(30)
  }

  async getInsights(): Promise<any> {
    const events = await this.getEvents(30)
    
    const totalEvents = events.length
    const meetings = events.filter((e: any) => e.attendees && e.attendees.length > 1).length
    const soloEvents = totalEvents - meetings
    
    // Calculate busiest days
    const dayCount = new Map<string, number>()
    events.forEach((e: any) => {
      if (e.start?.dateTime) {
        const day = new Date(e.start.dateTime).toLocaleDateString('en-US', { weekday: 'long' })
        dayCount.set(day, (dayCount.get(day) || 0) + 1)
      }
    })
    
    const busiestDay = Array.from(dayCount.entries())
      .sort((a, b) => b[1] - a[1])[0]

    return {
      totalEvents,
      meetings,
      soloEvents,
      insights: [
        `${totalEvents} events in the next 30 days`,
        `${meetings} meetings scheduled`,
        `${soloEvents} personal events`,
        `Busiest day: ${busiestDay?.[0] || 'N/A'} (${busiestDay?.[1] || 0} events)`,
      ],
      recommendations: [
        'Consider blocking focus time on calendar',
        'Add buffer time between meetings',
        'Schedule breaks for optimal productivity',
      ],
    }
  }
}

// Notion Adapter
export class NotionAdapter implements IProductivityAdapter {
  private accessToken: string = ''
  private connected = false
  private baseUrl = 'https://api.notion.com/v1'

  async connect(config: IntegrationConfig): Promise<boolean> {
    if (config.type !== 'notion') {
      throw new Error('Invalid integration type for Notion adapter')
    }

    this.accessToken = config.accessToken || ''
    
    try {
      // Test connection by searching
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page_size: 1 }),
      })
      
      this.connected = response.ok
      return this.connected
    } catch (error) {
      console.error('Notion connection failed:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false
    this.accessToken = ''
  }

  isConnected(): boolean {
    return this.connected
  }

  async getPages(): Promise<any[]> {
    if (!this.connected) throw new Error('Not connected to Notion')

    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: { property: 'object', value: 'page' },
        page_size: 100,
      }),
    })

    const data = await response.json()
    return data.results || []
  }

  async getDatabases(): Promise<any[]> {
    if (!this.connected) throw new Error('Not connected to Notion')

    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: { property: 'object', value: 'database' },
        page_size: 100,
      }),
    })

    const data = await response.json()
    return data.results || []
  }

  async createPage(data: {
    parent: string
    title: string
    content?: any[]
  }): Promise<any> {
    if (!this.connected) throw new Error('Not connected to Notion')

    const response = await fetch(`${this.baseUrl}/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { page_id: data.parent },
        properties: {
          title: {
            title: [{ text: { content: data.title } }],
          },
        },
        children: data.content || [],
      }),
    })

    return response.json()
  }

  async sync(): Promise<void> {
    await this.getPages()
    await this.getDatabases()
  }

  async getInsights(): Promise<any> {
    const pages = await this.getPages()
    const databases = await this.getDatabases()
    
    return {
      totalPages: pages.length,
      totalDatabases: databases.length,
      insights: [
        `${pages.length} pages in your workspace`,
        `${databases.length} databases`,
        'Your Notion workspace is synced and accessible',
      ],
      recommendations: [
        'Create templates for recurring tasks',
        'Use databases for structured information',
        'Link related pages for better organization',
      ],
    }
  }
}

// Gmail Adapter
export class GmailAdapter implements IProductivityAdapter {
  private accessToken: string = ''
  private connected = false
  private baseUrl = 'https://gmail.googleapis.com/gmail/v1'

  async connect(config: IntegrationConfig): Promise<boolean> {
    if (config.type !== 'gmail') {
      throw new Error('Invalid integration type for Gmail adapter')
    }

    this.accessToken = config.accessToken || ''
    
    try {
      // Test connection by fetching profile
      const response = await fetch(`${this.baseUrl}/users/me/profile`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      })
      
      this.connected = response.ok
      return this.connected
    } catch (error) {
      console.error('Gmail connection failed:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false
    this.accessToken = ''
  }

  isConnected(): boolean {
    return this.connected
  }

  async getProfile(): Promise<any> {
    if (!this.connected) throw new Error('Not connected to Gmail')

    const response = await fetch(`${this.baseUrl}/users/me/profile`, {
      headers: { 'Authorization': `Bearer ${this.accessToken}` },
    })

    return response.json()
  }

  async getMessages(maxResults = 50): Promise<any[]> {
    if (!this.connected) throw new Error('Not connected to Gmail')

    const response = await fetch(
      `${this.baseUrl}/users/me/messages?maxResults=${maxResults}`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      }
    )

    const data = await response.json()
    return data.messages || []
  }

  async sendEmail(to: string, subject: string, body: string): Promise<any> {
    if (!this.connected) throw new Error('Not connected to Gmail')

    const email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      body,
    ].join('\n')

    const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

    const response = await fetch(`${this.baseUrl}/users/me/messages/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedEmail }),
    })

    return response.json()
  }

  async sync(): Promise<void> {
    await this.getProfile()
    await this.getMessages(100)
  }

  async getInsights(): Promise<any> {
    const profile = await this.getProfile()
    const messages = await this.getMessages(100)
    
    return {
      emailAddress: profile.emailAddress,
      totalMessages: profile.messagesTotal,
      threadsTotal: profile.threadsTotal,
      recentMessages: messages.length,
      insights: [
        `Email: ${profile.emailAddress}`,
        `${profile.messagesTotal.toLocaleString()} total messages`,
        `${profile.threadsTotal.toLocaleString()} conversations`,
        `${messages.length} recent emails fetched`,
      ],
      recommendations: [
        'Set up filters to organize incoming mail',
        'Unsubscribe from unnecessary newsletters',
        'Use labels for better email management',
      ],
    }
  }
}

// Spotify Adapter
export class SpotifyAdapter implements IProductivityAdapter {
  private accessToken: string = ''
  private connected = false
  private baseUrl = 'https://api.spotify.com/v1'

  async connect(config: IntegrationConfig): Promise<boolean> {
    if (config.type !== 'spotify') {
      throw new Error('Invalid integration type for Spotify adapter')
    }

    this.accessToken = config.accessToken || ''
    
    try {
      // Test connection by fetching current user
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      })
      
      this.connected = response.ok
      return this.connected
    } catch (error) {
      console.error('Spotify connection failed:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false
    this.accessToken = ''
  }

  isConnected(): boolean {
    return this.connected
  }

  async getProfile(): Promise<any> {
    if (!this.connected) throw new Error('Not connected to Spotify')

    const response = await fetch(`${this.baseUrl}/me`, {
      headers: { 'Authorization': `Bearer ${this.accessToken}` },
    })

    return response.json()
  }

  async getTopTracks(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<any[]> {
    if (!this.connected) throw new Error('Not connected to Spotify')

    const response = await fetch(
      `${this.baseUrl}/me/top/tracks?time_range=${timeRange}&limit=50`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      }
    )

    const data = await response.json()
    return data.items || []
  }

  async getTopArtists(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<any[]> {
    if (!this.connected) throw new Error('Not connected to Spotify')

    const response = await fetch(
      `${this.baseUrl}/me/top/artists?time_range=${timeRange}&limit=50`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      }
    )

    const data = await response.json()
    return data.items || []
  }

  async getRecentlyPlayed(limit = 50): Promise<any[]> {
    if (!this.connected) throw new Error('Not connected to Spotify')

    const response = await fetch(
      `${this.baseUrl}/me/player/recently-played?limit=${limit}`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      }
    )

    const data = await response.json()
    return data.items || []
  }

  async sync(): Promise<void> {
    await this.getProfile()
    await this.getTopTracks()
    await this.getTopArtists()
    await this.getRecentlyPlayed()
  }

  async getInsights(): Promise<any> {
    const profile = await this.getProfile()
    const topTracks = await this.getTopTracks()
    const topArtists = await this.getTopArtists()
    const recent = await this.getRecentlyPlayed()
    
    const genres = new Set<string>()
    topArtists.forEach((artist: any) => {
      artist.genres?.forEach((genre: string) => genres.add(genre))
    })

    return {
      profile,
      insights: [
        `Spotify User: ${profile.display_name}`,
        `Top track: ${topTracks[0]?.name} by ${topTracks[0]?.artists[0]?.name}`,
        `Top artist: ${topArtists[0]?.name}`,
        `Favorite genres: ${Array.from(genres).slice(0, 3).join(', ')}`,
        `${recent.length} songs played recently`,
      ],
      recommendations: [
        'Discover new music in your favorite genres',
        'Create playlists for different moods/activities',
        'Explore artists similar to your top picks',
      ],
    }
  }
}
