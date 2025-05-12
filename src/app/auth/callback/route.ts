import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // If there's no code, this isn't a callback request
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }
  
  try {
    // Create a Supabase client for the server component
    const supabase = createRouteHandlerClient({ cookies });
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);
    
    // Redirect to our callback page which will handle the session
    return NextResponse.redirect(new URL('/auth/callback', request.url));
  } catch (error) {
    console.error('Error in auth callback route:', error);
    return NextResponse.redirect(new URL('/login?error=auth_callback_error', request.url));
  }
} 