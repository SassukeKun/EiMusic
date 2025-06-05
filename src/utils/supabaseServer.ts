'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase server client with the latest recommended approach
 * This should only be used in server components and server actions
 * Following the exact pattern from the Supabase docs:
 * https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${cookieStore.get('sb-access-token')?.value ?? ''}`
        }
      }
    }
  );
}
