/**
 * OpenAI Client Utility
 * 
 * Provides a centralized, lazy-loaded OpenAI client for the PONS AI OS.
 * Uses environment variables to configure API access securely.
 * 
 * Usage:
 *   import { getOpenAIClient } from '@/lib/ai/openaiClient'
 *   const openai = getOpenAIClient()
 *   const response = await openai.chat.completions.create(...)
 */

import OpenAI from 'openai'

let cachedClient: OpenAI | null = null

/**
 * Get or create OpenAI client instance
 * Lazy initialization ensures env vars are loaded before instantiation
 * 
 * @returns OpenAI client configured with API key from environment
 * @throws Error if OPENAI_API_KEY is not configured
 */
export function getOpenAIClient(): OpenAI {
  // Return cached client if already initialized
  if (cachedClient) {
    return cachedClient
  }

  // Try both server-side and client-side env var names
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY

  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY environment variable is not set. ' +
      'Please add it to your .env.local file.'
    )
  }

  // Create and cache the client
  cachedClient = new OpenAI({
    apiKey,
  })

  return cachedClient
}

/**
 * Reset the cached client (useful for testing or hot reload)
 */
export function resetOpenAIClient(): void {
  cachedClient = null
}

/**
 * Check if OpenAI is properly configured
 * 
 * @returns true if API key is available
 */
export function isOpenAIConfigured(): boolean {
  return !!(process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY)
}
