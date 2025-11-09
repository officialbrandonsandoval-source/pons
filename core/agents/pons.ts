import { chat } from '@/lib/openai'
import { defaultPrompt } from '@/core/prompts/defaultPrompt'
import { handleSchedule, handleCRM, handleContent } from './handlers'
import { InsightsEngine } from './insights'

// In-memory conversation history (in production, use a database)
const conversationHistory: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
  { role: 'system', content: defaultPrompt }
]

let personalContextAdded = false

export async function ponsAgent(input: string) {
  try {
    // Add personal context to system prompt on first interaction
    if (!personalContextAdded) {
      const insightsEngine = InsightsEngine.getInstance()
      const personalContext = await insightsEngine.getAIContext()
      
      if (personalContext) {
        conversationHistory[0].content = defaultPrompt + personalContext
        personalContextAdded = true
      }
    }

    // Check for document-related queries (RAG)
    const ragKeywords = ['document', 'documents', 'uploaded', 'files', 'file', 'knowledge base', 'vault', 'what do i have', 'what documents', 'in my', 'from my'];
    const shouldUseRAG = ragKeywords.some(keyword => input.toLowerCase().includes(keyword));
    
    if (shouldUseRAG) {
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input }),
      })
      const data = await response.json()
      
      let result = data.answer
      
      if (data.sources && data.sources.length > 0) {
        result += '\n\n**Sources:**\n'
        data.sources.forEach((source: any, i: number) => {
          result += `\n${i + 1}. ${source.metadata.filename}`
        })
      }
      
      return result
    }

    // Check for specific handlers first
    if (input.toLowerCase().includes('schedule') || input.toLowerCase().includes('calendar')) {
      return handleSchedule(input)
    }
    if (input.toLowerCase().includes('lead') || input.toLowerCase().includes('contact') || input.toLowerCase().includes('crm')) {
      return handleCRM(input)
    }
    if (input.toLowerCase().includes('post') || input.toLowerCase().includes('reel') || input.toLowerCase().includes('content')) {
      return handleContent(input)
    }

    // Handle insights queries
    if (input.toLowerCase().includes('insight') || input.toLowerCase().includes('analyze me') || input.toLowerCase().includes('tell me about my')) {
      const insightsEngine = InsightsEngine.getInstance()
      const insights = await insightsEngine.getInsights()
      const recommendations = await insightsEngine.generateRecommendations()
      
      let response = '📊 **Personal Insights**\n\n'
      
      if (insights.socialPresence) {
        response += `**Social Media:**\n${insights.socialPresence.platforms.length} platforms connected, ${insights.socialPresence.totalFollowers} total followers\n\n`
      }
      
      if (insights.financialHealth) {
        response += `**Financial Health:**\nNet Worth: $${insights.financialHealth.netWorth.toLocaleString()}\nCash Flow: $${insights.financialHealth.cashFlow.toLocaleString()}/mo\n\n`
      }
      
      if (recommendations.length > 0) {
        response += `**Recommendations:**\n${recommendations.join('\n')}\n`
      }
      
      return response
    }

    // Add user message to history
    conversationHistory.push({ role: 'user', content: input })

    // Keep only last 10 messages to avoid token limits
    if (conversationHistory.length > 11) {
      conversationHistory.splice(1, 2) // Keep system prompt, remove oldest user/assistant pair
    }

    // Get AI response
    const response = await chat(conversationHistory)

    // Add assistant response to history
    conversationHistory.push({ role: 'assistant', content: response })

    return response
  } catch (error) {
    console.error('Pons Agent Error:', error)
    return "I'm having trouble processing that request right now. Please make sure your OpenAI API key is configured."
  }
}
