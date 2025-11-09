// Environment variable validation
// Ensures all required env vars are set before the app starts

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'OPENAI_API_KEY',
]

const optionalEnvVars = [
  'TWITTER_CLIENT_ID',
  'INSTAGRAM_CLIENT_ID',
  'LINKEDIN_CLIENT_ID',
  'FACEBOOK_APP_ID',
  'TIKTOK_CLIENT_KEY',
  'YOUTUBE_CLIENT_ID',
  'PLAID_CLIENT_ID',
  'STRIPE_SECRET_KEY',
  'PAYPAL_CLIENT_ID',
  'GOOGLE_CLIENT_ID',
  'NOTION_API_KEY',
  'SPOTIFY_CLIENT_ID',
  'GITHUB_TOKEN',
]

export function validateEnv() {
  const missing: string[] = []
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n\n` +
      `Please check your .env.local file. See .env.example for reference.`
    )
  }

  // Warn about missing optional vars (integrations won't work without them)
  const missingOptional = optionalEnvVars.filter(v => !process.env[v])
  if (missingOptional.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn(
      `⚠️  Missing optional environment variables (some integrations may not work):\n${missingOptional.join(', ')}`
    )
  }
}

export function getEnv(key: string, fallback?: string): string {
  const value = process.env[key]
  if (!value && !fallback) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value || fallback || ''
}

// Validate on import (server-side only)
if (typeof window === 'undefined') {
  try {
    validateEnv()
    console.log('✅ Environment variables validated successfully')
  } catch (error) {
    console.error('❌ Environment validation failed:', error)
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  }
}
