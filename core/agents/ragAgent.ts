import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai'
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { createClient } from '@supabase/supabase-js'
import { Document } from '@langchain/core/documents'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

let vectorStore: SupabaseVectorStore | null = null

export function initializeRAG() {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials not found.')
    return null
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  })

  vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabase,
    tableName: 'documents',
    queryName: 'match_documents',
  })

  return vectorStore
}

export async function ingestDocument(
  content: string,
  metadata: {
    filename: string
    type: string
    uploadedAt: Date
  }
): Promise<void> {
  if (!vectorStore) {
    vectorStore = initializeRAG()
    if (!vectorStore) throw new Error('RAG not initialized')
  }

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  })

  const chunks = await textSplitter.splitText(content)
  
  const documents = chunks.map(
    (chunk, i) =>
      new Document({
        pageContent: chunk,
        metadata: {
          ...metadata,
          chunkIndex: i,
          totalChunks: chunks.length,
        },
      })
  )

  await vectorStore.addDocuments(documents)
}

export async function ragQuery(
  query: string,
  options?: {
    maxResults?: number
    filter?: Record<string, any>
  }
): Promise<{
  answer: string
  sources: Array<{ content: string; metadata: any }>
}> {
  if (!vectorStore) {
    vectorStore = initializeRAG()
    if (!vectorStore) {
      return {
        answer: 'RAG system not configured. Please add Supabase credentials to use document search.',
        sources: [],
      }
    }
  }

  const { maxResults = 4 } = options || {}

  const results = await vectorStore.similaritySearch(query, maxResults)

  if (results.length === 0) {
    return {
      answer: 'No relevant documents found. Try uploading documents first or rephrase your question.',
      sources: [],
    }
  }

  const context = results
    .map((doc, i) => `[Source ${i + 1}: ${doc.metadata.filename}]\n${doc.pageContent}`)
    .join('\n\n---\n\n')

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that answers questions based on provided document context. Always cite which source you\'re referencing. If the context doesn\'t contain the answer, say so clearly.',
        },
        {
          role: 'user',
          content: `Context from uploaded documents:\n\n${context}\n\nQuestion: ${query}\n\nPlease answer based on the context above and cite your sources.`,
        },
      ],
      temperature: 0.7,
    }),
  })

  const data = await response.json()
  const answer = data.choices?.[0]?.message?.content || 'No answer generated'

  return {
    answer,
    sources: results.map((doc) => ({
      content: doc.pageContent,
      metadata: doc.metadata,
    })),
  }
}

/**
 * Quick add - "Remember this" command
 */
export async function quickAdd(
  content: string,
  title?: string
): Promise<void> {
  const metadata = {
    filename: title || `Quick Note - ${new Date().toLocaleDateString()}`,
    type: 'note',
    uploadedAt: new Date(),
  }

  await ingestDocument(content, metadata)
}

export async function searchDocuments(query: string): Promise<Array<{ content: string; metadata: any; score: number }>> {
  if (!vectorStore) {
    vectorStore = initializeRAG()
    if (!vectorStore) return []
  }

  const results = await vectorStore.similaritySearchWithScore(query, 10)

  return results.map(([doc, score]) => ({
    content: doc.pageContent,
    metadata: doc.metadata,
    score,
  }))
}
