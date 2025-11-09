import { chat } from '@/lib/openai'
import { defaultPrompt } from '@/core/prompts/defaultPrompt'
import { handleSchedule, handleCRM, handleContent } from './handlers'
import { InsightsEngine } from './insights'
import { PredictiveInsightsEngine } from './predictiveInsights'

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

    // Check for predictive insights command
    if (
      input.toLowerCase().includes('predict') ||
      input.toLowerCase().includes('forecast') ||
      input.toLowerCase().includes('what will happen') ||
      input.toLowerCase().includes('give me insights')
    ) {
      try {
        const predictiveEngine = new PredictiveInsightsEngine()
        const insights = await predictiveEngine.generateInsights()
        
        let response = "📊 Here are your predictive insights:\n\n"
        
        // High priority insights
        const highPriority = insights.insights.filter(i => i.priority === 'high')
        if (highPriority.length > 0) {
          response += "🔴 HIGH PRIORITY:\n"
          highPriority.forEach(insight => {
            response += `• ${insight.insight}\n`
            if (insight.actions && insight.actions.length > 0) {
              response += `  Actions: ${insight.actions.join(', ')}\n`
            }
          })
          response += "\n"
        }
        
        // Predictions
        if (insights.predictions.nextWeek.length > 0) {
          response += "🔮 NEXT WEEK PREDICTIONS:\n"
          insights.predictions.nextWeek.forEach(pred => {
            response += `• ${pred}\n`
          })
          response += "\n"
        }
        
        // Opportunities
        if (insights.predictions.opportunities.length > 0) {
          response += "✨ OPPORTUNITIES:\n"
          insights.predictions.opportunities.forEach(opp => {
            response += `• ${opp}\n`
          })
          response += "\n"
        }
        
        // Immediate recommendations
        if (insights.recommendations.immediate.length > 0) {
          response += "⚡ DO NOW:\n"
          insights.recommendations.immediate.forEach(rec => {
            response += `• ${rec}\n`
          })
        }
        
        conversationHistory.push({ role: 'user', content: input })
        conversationHistory.push({ role: 'assistant', content: response })
        return response
      } catch (error) {
        console.error('Predictive insights error:', error)
      }
    }

    // Check for smart suggestions command
    if (
      input.toLowerCase().includes('suggest') ||
      input.toLowerCase().includes('what should i') ||
      input.toLowerCase().includes('recommend')
    ) {
      try {
        const predictiveEngine = new PredictiveInsightsEngine()
        const now = new Date()
        const hour = now.getHours()
        const day = now.toLocaleDateString('en-US', { weekday: 'long' })
        
        let timeOfDay = 'morning'
        if (hour >= 12 && hour < 17) timeOfDay = 'afternoon'
        else if (hour >= 17) timeOfDay = 'evening'
        
        const suggestions = await predictiveEngine.generateSmartSuggestions({
          timeOfDay,
          dayOfWeek: day,
          recentActivity: [],
          upcomingEvents: [],
        })
        
        let response = `💡 Smart suggestions for ${day} ${timeOfDay}:\n\n`
        suggestions.forEach((suggestion, index) => {
          response += `${index + 1}. ${suggestion}\n`
        })
        
        conversationHistory.push({ role: 'user', content: input })
        conversationHistory.push({ role: 'assistant', content: response })
        return response
      } catch (error) {
        console.error('Smart suggestions error:', error)
      }
    }

    // Check for "remember this" command
    const rememberPattern = /remember (?:this|that):?\s*(.+)/i
    const rememberMatch = input.match(rememberPattern)
    
    if (rememberMatch) {
      const contentToRemember = rememberMatch[1]
      
      try {
        const response = await fetch('/api/rag/remember', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            content: contentToRemember,
            title: `Note from ${new Date().toLocaleDateString()}`,
          }),
        })
        
        if (response.ok) {
          return `✅ Got it! I've saved that information to your knowledge base. You can ask me about it anytime.`
        } else {
          return `❌ I couldn't save that information. Make sure your Supabase credentials are configured.`
        }
      } catch (error) {
        return `❌ Error saving information. Please check your RAG system configuration.`
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
