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
      // Se houver erro na sessão nas rotas protegidas, redirecionar para login
      // Mas somente se for uma rota protegida
      const path = req.nextUrl.pathname;
      const protectedRoutes = ['/dashboard', '/artist/dashboard', '/profile', '/settings'];
      
      if (protectedRoutes.some(route => path.startsWith(route))) {
        return NextResponse.redirect(new URL('/login?error=session_refresh_failed', req.url));
      }
      // Se não for uma rota protegida, apenas continua
      return res;
    }

    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/artist/dashboard', '/profile', '/settings'];
    
    // Auth routes (login, register)
    const authRoutes = ['/login', '/register'];
    
    // Current path
    const path = req.nextUrl.pathname;
    
    // Se estamos numa página de dashboard ou perfil sem sessão, redirecionar para login
    if (protectedRoutes.some(route => path.startsWith(route)) && !session) {
      return NextResponse.redirect(new URL('/login', req.url));
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