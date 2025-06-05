import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;
  const requestTimestamp = new Date().toISOString();
  console.log(`[${requestTimestamp}] Middleware triggered for path: ${path}`);

  // Verificar se há erros de OAuth na URL
  const url = req.nextUrl;
  const errorParam = url.searchParams.get('error');
  const errorCode = url.searchParams.get('error_code');

  if (errorParam && (errorCode === 'bad_oauth_state' || errorParam === 'invalid_request')) {
    console.error(`[${requestTimestamp}] OAuth error detected in middleware: ${errorParam}, Code: ${errorCode}`);
    const errorDescription = url.searchParams.get('error_description') || 'Erro na autenticação OAuth';
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('error', 'oauth_error');
    loginUrl.searchParams.set('message', errorDescription.replace(/\+/g, ' '));
    loginUrl.searchParams.set('clear_cookies', 'true');
    return NextResponse.redirect(loginUrl);
  }

  try {
    const supabase = createMiddlewareClient({ req, res });
    console.log(`[${requestTimestamp}] Supabase client created for path: ${path}`);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error(`[${requestTimestamp}] Error getting session for path ${path}:`, sessionError.message);
      const protectedRoutesForError = ['/dashboard', '/artist/dashboard', '/profile', '/settings', '/upload'];
      if (protectedRoutesForError.some(route => path.startsWith(route))) {
        console.log(`[${requestTimestamp}] Redirecting to /login due to session error on protected route: ${path}`);
        return NextResponse.redirect(new URL('/login?error=session_refresh_failed&from_middleware_error=true', req.url));
      }
      return res; 
    }

    if (session) {
      console.log(`[${requestTimestamp}] Session found for path ${path}. User ID: ${session.user.id}, Email: ${session.user.email}`);
      if (session.user.user_metadata) {
        console.log(`[${requestTimestamp}] User metadata:`, JSON.stringify(session.user.user_metadata));
      } else {
        console.log(`[${requestTimestamp}] No user_metadata found in session.`);
      }
    } else {
      console.log(`[${requestTimestamp}] No session found for path ${path}.`);
    }

    const protectedRoutes = ['/dashboard', '/artist/dashboard', '/profile', '/settings', '/upload'];
    const authRoutes = ['/login', '/register'];

    if (protectedRoutes.some(route => path.startsWith(route)) && !session) {
      console.log(`[${requestTimestamp}] Accessing protected route ${path} without session. Redirecting to /login.`);
      return NextResponse.redirect(new URL('/login?from_middleware_no_session=true', req.url));
    }

    if (path.startsWith('/upload')) {
      if (session) {
        const isArtist = session.user?.user_metadata?.is_artist === true;
        console.log(`[${requestTimestamp}] Checking /upload access. User isArtist: ${isArtist}`);
        if (!isArtist) {
          console.log(`[${requestTimestamp}] User is not artist. Redirecting from /upload to /.`);
          return NextResponse.redirect(new URL('/?from_middleware_not_artist=true', req.url));
        }
      } else {
        console.log(`[${requestTimestamp}] Accessing /upload without session (should be caught earlier). Redirecting to /login.`);
        return NextResponse.redirect(new URL('/login?from_middleware_upload_no_session=true', req.url));
      }
    }

    if (session && authRoutes.some(route => path === route)) {
      console.log(`[${requestTimestamp}] Authenticated user accessing auth route ${path}. Redirecting to /.`);
      // No need to fetch user data again if already in session, directly redirect.
      return NextResponse.redirect(new URL('/?from_middleware_auth_route_loggedin=true', req.url));
    }

    console.log(`[${requestTimestamp}] Middleware finished for path: ${path}. Allowing request.`);
    return res;
  } catch (e: any) {
    console.error(`[${requestTimestamp}] Critical error in middleware for path ${path}:`, e.message, e.stack);
    // Return res to avoid redirect loops on critical errors, allowing Next.js to handle.
    return res; 
  }
}

// Match all routes except API routes, static files, and _next
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public|musicSS.svg).*)',
  ],
}; 