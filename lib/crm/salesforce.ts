import { ICRMAdapter, CRMConfig, CRMContact, CRMDeal, CRMNote } from '@/types/crm'

export class SalesforceAdapter implements ICRMAdapter {
  private accessToken: string = ''
  private instanceUrl: string = ''
  private connected = false

  async connect(config: CRMConfig): Promise<boolean> {
    if (config.type !== 'salesforce') {
      throw new Error('Invalid CRM type for Salesforce adapter')
    }

    this.accessToken = config.accessToken || ''
    this.instanceUrl = config.domain || ''
    
    try {
      // Test connection
      const response = await fetch(`${this.instanceUrl}/services/data/v57.0/sobjects/Contact`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      })
      
      this.connected = response.ok
      return this.connected
    } catch (error) {
      console.error('Salesforce connection failed:', error)
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

  async getContacts(limit = 100): Promise<CRMContact[]> {
    if (!this.connected) throw new Error('Not connected to Salesforce')

    const query = `SELECT Id, FirstName, LastName, Email, Phone, Company, Title FROM Contact LIMIT ${limit}`
    const response = await this.query(query)
    
    return response.records.map((record: any) => this.transformSalesforceContact(record))
  }

  async getContact(id: string): Promise<CRMContact | null> {
    if (!this.connected) throw new Error('Not connected to Salesforce')

    const response = await fetch(
      `${this.instanceUrl}/services/data/v57.0/sobjects/Contact/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    return this.transformSalesforceContact(data)
  }

  async createContact(contact: Partial<CRMContact>): Promise<CRMContact> {
    if (!this.connected) throw new Error('Not connected to Salesforce')

    const response = await fetch(
      `${this.instanceUrl}/services/data/v57.0/sobjects/Contact`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FirstName: contact.firstName,
          LastName: contact.lastName,
          Email: contact.email,
          Phone: contact.phone,
          Company: contact.company,
          Title: contact.title,
        }),
      }
    )

    const data = await response.json()
    return this.getContact(data.id) as Promise<CRMContact>
  }

  async updateContact(id: string, contact: Partial<CRMContact>): Promise<CRMContact> {
    if (!this.connected) throw new Error('Not connected to Salesforce')

    await fetch(`${this.instanceUrl}/services/data/v57.0/sobjects/Contact/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        FirstName: contact.firstName,
        LastName: contact.lastName,
        Email: contact.email,
        Phone: contact.phone,
        Company: contact.company,
        Title: contact.title,
      }),
    })

    return this.getContact(id) as Promise<CRMContact>
  }

  async deleteContact(id: string): Promise<boolean> {
    if (!this.connected) throw new Error('Not connected to Salesforce')

    const response = await fetch(
      `${this.instanceUrl}/services/data/v57.0/sobjects/Contact/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    )

    return response.ok
  }

  async searchContacts(query: string): Promise<CRMContact[]> {
    if (!this.connected) throw new Error('Not connected to Salesforce')

    const soqlQuery = `SELECT Id, FirstName, LastName, Email, Phone, Company, Title FROM Contact WHERE Name LIKE '%${query}%' OR Email LIKE '%${query}%' LIMIT 50`
    const response = await this.query(soqlQuery)
    
    return response.records.map((record: any) => this.transformSalesforceContact(record))
  }

  async getDeals(limit = 100): Promise<CRMDeal[]> {
    if (!this.connected) throw new Error('Not connected to Salesforce')

    const query = `SELECT Id, Name, Amount, StageName, CloseDate FROM Opportunity LIMIT ${limit}`
    const response = await this.query(query)
    
    return response.records.map((record: any) => this.transformSalesforceDeal(record))
  }

  async getDeal(id: string): Promise<CRMDeal | null> {
    if (!this.connected) throw new Error('Not connected to Salesforce')

    const response = await fetch(
      `${this.instanceUrl}/services/data/v57.0/sobjects/Opportunity/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    return this.transformSalesforceDeal(data)
  }

  async createDeal(deal: Partial<CRMDeal>): Promise<CRMDeal> {
    if (!this.connected) throw new Error('Not connected to Salesforce')

    const response = await fetch(
      `${this.instanceUrl}/services/data/v57.0/sobjects/Opportunity`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Name: deal.name,
          Amount: deal.amount,
          StageName: deal.stage,
          CloseDate: deal.closeDate?.toISOString().split('T')[0],
        }),
      }
    )

    const data = await response.json()
    return this.getDeal(data.id) as Promise<CRMDeal>
  }

  async updateDeal(id: string, deal: Partial<CRMDeal>): Promise<CRMDeal> {
    if (!this.connected) throw new Error('Not connected to Salesforce')

    await fetch(`${this.instanceUrl}/services/data/v57.0/sobjects/Opportunity/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Name: deal.name,
        Amount: deal.amount,
        StageName: deal.stage,
        CloseDate: deal.closeDate?.toISOString().split('T')[0],
      }),
    })

    return this.getDeal(id) as Promise<CRMDeal>
  }

  async getNotes(contactId: string): Promise<CRMNote[]> {
    // Salesforce notes implementation
    return []
  }

  async createNote(note: Partial<CRMNote>): Promise<CRMNote> {
    // Salesforce notes implementation
    throw new Error('Not implemented')
  }

  async syncAll(): Promise<void> {
    console.log('Syncing all Salesforce data...')
  }

  private async query(soql: string): Promise<any> {
    const response = await fetch(
      `${this.instanceUrl}/services/data/v57.0/query?q=${encodeURIComponent(soql)}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.json()
  }

  private transformSalesforceContact(data: any): CRMContact {
    return {
      id: data.Id,
      firstName: data.FirstName || '',
      lastName: data.LastName || '',
      email: data.Email || '',
      phone: data.Phone,
      company: data.Company,
      title: data.Title,
    }
  }

  private transformSalesforceDeal(data: any): CRMDeal {
    return {
      id: data.Id,
      name: data.Name || '',
      amount: parseFloat(data.Amount || '0'),
      stage: data.StageName || '',
      closeDate: data.CloseDate ? new Date(data.CloseDate) : undefined,
    }
  }
}
