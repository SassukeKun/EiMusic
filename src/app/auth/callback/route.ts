import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirect_to') || '/';
  const type = requestUrl.searchParams.get('type') || 'recovery';
  
  console.log(`Auth callback invocado: type=${type}, code present=${!!code}, redirectTo=${redirectTo}`);
  
  // Se não houver código, verificar se isso é uma tentativa de login direta
  if (!code) {
    console.log('Auth callback chamado sem código de autenticação');
    // Se vier da tela de login (referer), podemos assumir que é um problema no fluxo de login
    const referer = request.headers.get('referer') || '';
    if (referer.includes('/login')) {
      return NextResponse.redirect(new URL('/login?error=session_expired', request.url));
    }
    // Caso contrário, é provavelmente um acesso direto à rota de callback
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }
  
  try {
    // Create a Supabase client for the server component
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Erro ao trocar código por sessão:', error.message);
      
      // Em vez de tentar limpar todos os cookies, vamos deixar para o cliente fazer isso
      // O Next.js tem limitações na manipulação de cookies em route handlers
      
      // Códigos de erro específicos
      if (error.message.includes('code verifier')) {
        return NextResponse.redirect(new URL('/login?error=pkce_error&clear_cookies=true', request.url));
      } else if (error.message.includes('Invalid code')) {
        return NextResponse.redirect(new URL('/login?error=invalid_code&clear_cookies=true', request.url));
      } else {
        return NextResponse.redirect(new URL(`/login?error=auth_error&message=${encodeURIComponent(error.message)}&clear_cookies=true`, request.url));
      }
    }
    
    // Verificar se este é um callback de verificação de email
    if (data?.user?.email_confirmed_at) {
      // Se o email foi verificado com sucesso, redirecionar diretamente para home
      // Verificar se o usuário é artista
      const { data: userData } = await supabase.auth.getUser();
      
      console.log('Email verificado com sucesso, redirecionando usuário');
      
      if (userData?.user?.user_metadata?.is_artist) {
        return NextResponse.redirect(new URL('/artist/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    
    // Redirect to our callback page which will handle the session
    // Preserving the redirect_to parameter if it exists
    const callbackUrl = new URL('/auth/callback', request.url);
    if (redirectTo && redirectTo !== '/') {
      callbackUrl.searchParams.set('redirect_to', redirectTo);
    }
    
    return NextResponse.redirect(callbackUrl);
  } catch (error: any) {
    console.error('Error in auth callback route:', error);
    const errorMessage = error?.message || 'Erro desconhecido';
    return NextResponse.redirect(new URL(`/login?error=auth_callback_error&message=${encodeURIComponent(errorMessage)}&clear_cookies=true`, request.url));
  }
} 