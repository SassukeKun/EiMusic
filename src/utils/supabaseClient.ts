import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check for missing environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL ERROR: Missing Supabase environment variables. Authentication will not work!');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env file');
}

/**
 * Supabase client instance for reuse across the application
 * Used to interact with Supabase services (auth, database, storage)
 */
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // default is true - keeps the session alive between page refreshes
    autoRefreshToken: true, // automatically refreshes the token
    detectSessionInUrl: true, // checks for auth tokens in the URL
    storageKey: 'sb-auth-token', // key to use for localStorage
    flowType: 'pkce', // Use PKCE flow for better security
  }
});

export default supabase; 