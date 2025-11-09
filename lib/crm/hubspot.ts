import { ICRMAdapter, CRMConfig, CRMContact, CRMDeal, CRMNote } from '@/types/crm'

export class HubSpotAdapter implements ICRMAdapter {
  private apiKey: string = ''
  private baseUrl = 'https://api.hubapi.com'
  private connected = false

  async connect(config: CRMConfig): Promise<boolean> {
    if (config.type !== 'hubspot') {
      throw new Error('Invalid CRM type for HubSpot adapter')
    }

    this.apiKey = config.apiKey || ''
    
    try {
      // Test connection
      const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts?limit=1`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })
      
      this.connected = response.ok
      return this.connected
    } catch (error) {
      console.error('HubSpot connection failed:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false
    this.apiKey = ''
  }

  isConnected(): boolean {
    return this.connected
  }

  async getContacts(limit = 100): Promise<CRMContact[]> {
    if (!this.connected) throw new Error('Not connected to HubSpot')

    const response = await fetch(
      `${this.baseUrl}/crm/v3/objects/contacts?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()
    return this.transformHubSpotContacts(data.results || [])
  }

  async getContact(id: string): Promise<CRMContact | null> {
    if (!this.connected) throw new Error('Not connected to HubSpot')

    const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) return null

    const data = await response.json()
    return this.transformHubSpotContact(data)
  }

  async createContact(contact: Partial<CRMContact>): Promise<CRMContact> {
    if (!this.connected) throw new Error('Not connected to HubSpot')

    const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          firstname: contact.firstName,
          lastname: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          jobtitle: contact.title,
        },
      }),
    })

    const data = await response.json()
    return this.transformHubSpotContact(data)
  }

  async updateContact(id: string, contact: Partial<CRMContact>): Promise<CRMContact> {
    if (!this.connected) throw new Error('Not connected to HubSpot')

    const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          firstname: contact.firstName,
          lastname: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          jobtitle: contact.title,
        },
      }),
    })

    const data = await response.json()
    return this.transformHubSpotContact(data)
  }

  async deleteContact(id: string): Promise<boolean> {
    if (!this.connected) throw new Error('Not connected to HubSpot')

    const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    })

    return response.ok
  }

  async searchContacts(query: string): Promise<CRMContact[]> {
    if (!this.connected) throw new Error('Not connected to HubSpot')

    const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 50,
      }),
    })

    const data = await response.json()
    return this.transformHubSpotContacts(data.results || [])
  }

  async getDeals(limit = 100): Promise<CRMDeal[]> {
    if (!this.connected) throw new Error('Not connected to HubSpot')

    const response = await fetch(`${this.baseUrl}/crm/v3/objects/deals?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return this.transformHubSpotDeals(data.results || [])
  }

  async getDeal(id: string): Promise<CRMDeal | null> {
    if (!this.connected) throw new Error('Not connected to HubSpot')

    const response = await fetch(`${this.baseUrl}/crm/v3/objects/deals/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) return null

    const data = await response.json()
    return this.transformHubSpotDeal(data)
  }

  async createDeal(deal: Partial<CRMDeal>): Promise<CRMDeal> {
    if (!this.connected) throw new Error('Not connected to HubSpot')

    const response = await fetch(`${this.baseUrl}/crm/v3/objects/deals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          dealname: deal.name,
          amount: deal.amount,
          dealstage: deal.stage,
          closedate: deal.closeDate?.toISOString(),
        },
      }),
    })

    const data = await response.json()
    return this.transformHubSpotDeal(data)
  }

  async updateDeal(id: string, deal: Partial<CRMDeal>): Promise<CRMDeal> {
    if (!this.connected) throw new Error('Not connected to HubSpot')

    const response = await fetch(`${this.baseUrl}/crm/v3/objects/deals/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          dealname: deal.name,
          amount: deal.amount,
          dealstage: deal.stage,
          closedate: deal.closeDate?.toISOString(),
        },
      }),
    })

    const data = await response.json()
    return this.transformHubSpotDeal(data)
  }

  async getNotes(contactId: string): Promise<CRMNote[]> {
    // HubSpot notes implementation
    return []
  }

  async createNote(note: Partial<CRMNote>): Promise<CRMNote> {
    // HubSpot notes implementation
    throw new Error('Not implemented')
  }

  async syncAll(): Promise<void> {
    // Implement full sync logic
    console.log('Syncing all HubSpot data...')
  }

  // Helper methods to transform HubSpot data to our format
  private transformHubSpotContact(data: any): CRMContact {
    return {
      id: data.id,
      firstName: data.properties.firstname || '',
      lastName: data.properties.lastname || '',
      email: data.properties.email || '',
      phone: data.properties.phone,
      company: data.properties.company,
      title: data.properties.jobtitle,
      customFields: data.properties,
    }
  }

  private transformHubSpotContacts(data: any[]): CRMContact[] {
    return data.map(item => this.transformHubSpotContact(item))
  }

  private transformHubSpotDeal(data: any): CRMDeal {
    return {
      id: data.id,
      name: data.properties.dealname || '',
      amount: parseFloat(data.properties.amount || '0'),
      stage: data.properties.dealstage || '',
      closeDate: data.properties.closedate ? new Date(data.properties.closedate) : undefined,
      customFields: data.properties,
    }
  }

  private transformHubSpotDeals(data: any[]): CRMDeal[] {
    return data.map(item => this.transformHubSpotDeal(item))
  }
}
