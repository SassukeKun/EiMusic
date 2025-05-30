import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Verificar se há erros de OAuth na URL
  const url = req.nextUrl;
  const error = url.searchParams.get('error');
  const errorCode = url.searchParams.get('error_code');
  
  // Interceptar erros de OAuth e redirecionar para a página de login
  if (error && (errorCode === 'bad_oauth_state' || error === 'invalid_request')) {
    console.error('Erro OAuth detectado no middleware:', error, errorCode);
    const errorDescription = url.searchParams.get('error_description') || 'Erro na autenticação OAuth';
    
    // Redirecionar para a página de login com a mensagem de erro
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('error', 'oauth_error');
    loginUrl.searchParams.set('message', errorDescription.replace(/\+/g, ' '));
    loginUrl.searchParams.set('clear_cookies', 'true');
    
    return NextResponse.redirect(loginUrl);
  }
  
  try {
    // Create a Supabase client for the middleware
    const supabase = createMiddlewareClient({ req, res });
    
    // Refresh the session if it exists
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      // Se houver erro na sessão nas rotas protegidas, redirecionar para login
      // Mas somente se for uma rota protegida
      const path = req.nextUrl.pathname;
      const protectedRoutes = ['/dashboard', '/artist/dashboard', '/profile', '/settings', '/upload'];
      
      if (protectedRoutes.some(route => path.startsWith(route))) {
        return NextResponse.redirect(new URL('/login?error=session_refresh_failed', req.url));
      }
      // Se não for uma rota protegida, apenas continua
      return res;
    }

    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/artist/dashboard', '/profile', '/settings', '/upload'];
    
    // Auth routes (login, register)
    const authRoutes = ['/login', '/register'];
    
    // Current path
    const path = req.nextUrl.pathname;
    
    // Se estamos numa página de dashboard ou perfil sem sessão, redirecionar para login
    if (protectedRoutes.some(route => path.startsWith(route)) && !session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    // Rota de upload: verificar se o usuário é artista
    if (path.startsWith('/upload')) {
      // Se temos sessão, verificar se é artista
      if (session) {
        const { data: userData } = await supabase.auth.getUser();
        const isArtist = userData?.user?.user_metadata?.is_artist === true;
        
        // Se não for artista, redirecionar para a página inicial
        if (!isArtist) {
          return NextResponse.redirect(new URL('/', req.url));
        }
      } else {
        // Se não temos sessão, já redirecionamos para login acima
      }
    }
    
    // Se o usuário já está autenticado (com sessão válida) e tenta acessar login ou registro,
    // redirecioná-lo para a página inicial
    if (session && authRoutes.some(route => path === route)) {
      try {
        // Verificar se o usuário é artista
        const { data: userData } = await supabase.auth.getUser();
        
        console.log('Middleware redirecionando para a página inicial');
        // Independente de ser artista ou usuário comum, redirecionamos para a página inicial
        return NextResponse.redirect(new URL('/', req.url));
      } catch (err) {
        console.error('Erro no middleware:', err);
        // Em caso de erro, vai para a página inicial
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
    
    return res;
  } catch (error) {
    // Em caso de erro geral, continua a navegação normal em vez de redirecionar
    // Isso evita loops infinitos quando há problemas no middleware
    return res;
  }
}

// Match all routes except API routes, static files, and _next
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public|musicSS.svg).*)',
  ],
}; 