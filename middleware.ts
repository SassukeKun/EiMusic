import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  try {
  // Create a Supabase client for the middleware
  const supabase = createMiddlewareClient({ req, res });
  
  // Refresh the session if it exists
  const {
    data: { session },
      error,
  } = await supabase.auth.getSession();

    if (error) {
      console.error('Error refreshing session:', error);
      // If there's an error refreshing the session, redirect to login
      return NextResponse.redirect(new URL('/login?error=session_refresh_failed', req.url));
    }

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/artist/dashboard', '/profile', '/settings'];
  
  // Auth routes (login, register)
  const authRoutes = ['/login', '/register'];
  
  // Current path
  const path = req.nextUrl.pathname;
  
  // If accessing a protected route without a session, redirect to login
  if (protectedRoutes.some(route => path.startsWith(route)) && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // If already logged in and trying to access auth routes, redirect to dashboard
  if (session && authRoutes.some(route => path === route)) {
    // Check if user is an artist for proper redirection
    try {
      const { data: artistData } = await supabase
        .from('artists')
        .select('id')
        .eq('id', session.user.id)
        .single();
      
      if (artistData) {
        return NextResponse.redirect(new URL('/artist/dashboard', req.url));
      } else {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    } catch {
      // If we can't determine if artist, default to user dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }
  
  return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // In case of any error, redirect to login
    return NextResponse.redirect(new URL('/login?error=middleware_error', req.url));
  }
}

// Match all routes except API routes, static files, and _next
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public|musicSS.svg).*)',
  ],
}; 