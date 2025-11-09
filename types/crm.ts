// CRM Integration Types

export interface CRMContact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  title?: string
  status?: 'lead' | 'prospect' | 'customer' | 'inactive'
  lastContactDate?: Date
  tags?: string[]
  customFields?: Record<string, any>
}

export interface CRMDeal {
  id: string
  name: string
  amount: number
  stage: string
  probability?: number
  closeDate?: Date
  contactId?: string
  customFields?: Record<string, any>
}

export interface CRMNote {
  id: string
  content: string
  contactId: string
  createdAt: Date
  createdBy?: string
}

export interface CRMConfig {
  type: 'hubspot' | 'salesforce' | 'pipedrive' | 'custom'
  apiKey?: string
  accessToken?: string
  refreshToken?: string
  domain?: string
  customEndpoint?: string
}

// Abstract CRM Adapter Interface
export interface ICRMAdapter {
  // Authentication
  connect(config: CRMConfig): Promise<boolean>
  disconnect(): Promise<void>
  isConnected(): boolean

  // Contacts
  getContacts(limit?: number): Promise<CRMContact[]>
  getContact(id: string): Promise<CRMContact | null>
  createContact(contact: Partial<CRMContact>): Promise<CRMContact>
  updateContact(id: string, contact: Partial<CRMContact>): Promise<CRMContact>
  deleteContact(id: string): Promise<boolean>
  searchContacts(query: string): Promise<CRMContact[]>

  // Deals
  getDeals(limit?: number): Promise<CRMDeal[]>
  getDeal(id: string): Promise<CRMDeal | null>
  createDeal(deal: Partial<CRMDeal>): Promise<CRMDeal>
  updateDeal(id: string, deal: Partial<CRMDeal>): Promise<CRMDeal>

  // Notes
  getNotes(contactId: string): Promise<CRMNote[]>
  createNote(note: Partial<CRMNote>): Promise<CRMNote>

  // Sync
  syncAll(): Promise<void>
}
