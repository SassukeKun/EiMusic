import { createClient } from '@supabase/supabase-js'

// You'll need to add these environment variables to your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const getSupabaseBrowserClient = () => {
  return supabase
}
