import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check for missing environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

/**
 * Supabase client instance for reuse across the application
 * Used to interact with Supabase services (auth, database, storage)
 */
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; 