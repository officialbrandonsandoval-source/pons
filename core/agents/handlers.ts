import { crmManager } from '@/lib/crm/manager'

export async function handleSchedule(input: string) {
  return `Scheduling task: ${input}`
}

export async function handleCRM(input: string) {
  const adapter = crmManager.getAdapter()
  
  if (!adapter || !crmManager.isConnected()) {
    return 'CRM is not connected. Please connect your CRM in Settings first.'
  }

  try {
    // Parse the intent from input
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('search') || lowerInput.includes('find')) {
      // Extract search query
      const query = input.replace(/search|find|for|contact|lead/gi, '').trim()
      const contacts = await adapter.searchContacts(query)
      
      if (contacts.length === 0) {
        return `No contacts found matching "${query}"`
      }
      
      const contactList = contacts.slice(0, 5).map(c => 
        `- ${c.firstName} ${c.lastName} (${c.email}${c.company ? `, ${c.company}` : ''})`
      ).join('\n')
      
      return `Found ${contacts.length} contact(s):\n\n${contactList}${contacts.length > 5 ? '\n\n...and more' : ''}`
    }
    
    if (lowerInput.includes('list') || lowerInput.includes('show')) {
      const contacts = await adapter.getContacts(10)
      
      if (contacts.length === 0) {
        return 'No contacts found in your CRM.'
      }
      
      const contactList = contacts.map(c => 
        `- ${c.firstName} ${c.lastName} (${c.email}${c.company ? `, ${c.company}` : ''})`
      ).join('\n')
      
      return `Here are your recent contacts:\n\n${contactList}`
    }
    
    if (lowerInput.includes('deal') || lowerInput.includes('opportunity')) {
      const deals = await adapter.getDeals(10)
      
      if (deals.length === 0) {
        return 'No deals found in your CRM.'
      }
      
      const dealList = deals.map(d => 
        `- ${d.name}: $${d.amount.toLocaleString()} (${d.stage})`
      ).join('\n')
      
      return `Here are your recent deals:\n\n${dealList}`
    }
    
    return `CRM connected! Try asking me to:\n- "Search for contacts named John"\n- "List my contacts"\n- "Show me my deals"`
  } catch (error) {
    console.error('CRM handler error:', error)
    return 'Sorry, I encountered an error accessing your CRM. Please try again.'
  }
}

export async function handleContent(input: string) {
  return `Creating content from input: ${input}`
}
