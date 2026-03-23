import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  const isValid = supabaseUrl && 
                  supabaseAnonKey && 
                  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
                  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
                  supabaseUrl.trim().length > 0 &&
                  supabaseAnonKey.trim().length > 0 &&
                  supabaseUrl.startsWith('http')
  
  console.log('Supabase check:', { 
    hasUrl: !!supabaseUrl, 
    hasKey: !!supabaseAnonKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseAnonKey?.length || 0,
    isValid 
  })
  
  return isValid
}

// Create Supabase client only if configured
export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper to check if Supabase is available
export const isSupabaseAvailable = () => {
  const available = supabase !== null
  console.log('isSupabaseAvailable:', available)
  return available
}

// Log configuration status
if (!isSupabaseConfigured()) {
  console.log('ℹ️ Supabase not configured. File uploads will be disabled.')
} else {
  console.log('✅ Supabase client initialized')
}
