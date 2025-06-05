import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;
  const requestTimestamp = new Date().toISOString();
  console.log(`[${requestTimestamp}] Middleware triggered for path: ${path}`);

  // Skip auth check for public routes and static files
  const publicRoutes = ['/login', '/register', '/', '/api', '/_next', '/static'];
  if (publicRoutes.some(route => path.startsWith(route))) {
    return res;
  }

  try {
    // Create a Supabase client for this request
    const supabase = createMiddlewareClient({ req, res });
    
    // Try to get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error(`[${requestTimestamp}] Session error:`, sessionError);
      if (path.startsWith('/upload')) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
      return res;
    }

    // Handle protected routes
    const protectedRoutes = ['/dashboard', '/artist/dashboard', '/profile', '/settings', '/upload'];
    
    if (protectedRoutes.some(route => path.startsWith(route))) {
      // No session, redirect to login
      if (!session) {
        console.log(`[${requestTimestamp}] No session found for protected route ${path}`);
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('from', path);
        return NextResponse.redirect(loginUrl);
      }

      // Special handling for /upload route
      if (path.startsWith('/upload')) {
        const isArtist = session.user?.user_metadata?.is_artist === true;
        
        if (!isArtist) {
          console.log('User is not an artist, redirecting to home');
          return NextResponse.redirect(new URL('/', req.url));
        }
      }
    }

    return res;
  } catch (e: any) {
    console.error(`[${requestTimestamp}] Critical error in middleware for path ${path}:`, e.message);
    // On critical errors, redirect to login for protected routes
    if (path.startsWith('/upload')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return res;
  }
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/ routes
     * 2. /_next/ (Next.js internals)
     * 3. /static (public files)
     * 4. /_vercel (Vercel internals)
     * 5. all root files inside public (favicon.ico, robots.txt, etc.)
     */
    '/((?!api|_next|static|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};
