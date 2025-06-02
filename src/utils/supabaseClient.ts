'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useMemo } from 'react';

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check for missing environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL ERROR: Missing Supabase environment variables. Authentication will not work!');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env file');
}

/**
 * Creates a Supabase browser client with the latest recommended approach
 * This should only be used in client components
 */
export function getSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}

/**
 * React hook to use the Supabase client in client components
 * Uses useMemo to prevent recreation on re-renders
 */
export function useSupabaseClient() {
  return useMemo(getSupabaseBrowserClient, []);
}

// Default export for backwards compatibility with existing code
const supabase = typeof window !== 'undefined' ? getSupabaseBrowserClient() : null;
export default supabase;

/**
 * Returns the initialized Supabase client or throws an error if it's not available.
 * This function should be used by services or other parts of the app that depend on the default Supabase client.
 */
export function getSafeSupabaseClient() {
  if (supabase === null) {
    throw new Error(
      'Supabase client is null. This might be due to missing environment variables ' +
      '(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) or usage in a server-side context ' +
      'where the browser client (default export) is not available. For server-side operations, ' +
      'ensure you are using a server-compatible Supabase client (e.g., from createServerClient).'
    );
  }
  return supabase;
}