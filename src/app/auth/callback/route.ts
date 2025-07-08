import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabaseServer';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const userType = requestUrl.searchParams.get('user_type') || 'user';
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  
  console.log('Auth callback recebido:', {
    temCodigo: !!code,
    userType,
    temErro: !!error
  });
  
  // Se houver erro no retorno do provedor OAuth
  if (error) {
    console.log('OAuth provider error:', error, errorDescription);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=oauth_provider_error&message=${encodeURIComponent(errorDescription || 'Erro no provedor de autenticação')}&clear_cookies=true`
    );
  }
  
  // Verificar se temos o código de autorização
  if (!code) {
    console.log('No code provided in callback');
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=no_code&message=${encodeURIComponent('Código de autenticação ausente')}&clear_cookies=true`
    );
  }

  try {
    // Criar cliente Supabase do lado do servidor utilizando a abordagem mais recente
    const supabase = await createSupabaseServerClient();
    
    console.log('Trocando código por sessão...');
    
    // Trocar o código por uma sessão
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.log('Auth callback error:', error);
      
      // Determinar tipo de erro para mensagem mais específica
      let errorType = 'auth_error';
      let errorMsg = error.message || 'Erro de autenticação desconhecido';
      
      if (errorMsg.includes('PKCE') || errorMsg.includes('code verifier') || errorMsg.includes('code challenge')) {
        errorType = 'pkce_error';
        errorMsg = 'Erro de verificação PKCE. Por favor, tente fazer login novamente em uma nova janela ou guia privativa.';
      } else if (errorMsg.includes('expired')) {
        errorType = 'code_expired';
        errorMsg = 'Código de autenticação expirado. Por favor, tente fazer login novamente.';
      } else if (errorMsg.includes('invalid')) {
        errorType = 'invalid_code';
        errorMsg = 'Código de autenticação inválido. Por favor, tente fazer login novamente.';
      }
      
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${errorType}&message=${encodeURIComponent(errorMsg)}&clear_cookies=true`
      );
    }

    if (!data?.user) {
      console.log('Nenhum usuário retornado após troca de código');
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=no_user&message=${encodeURIComponent('Nenhum usuário encontrado')}&clear_cookies=true`
      );
    }
    
    console.log('Sessão criada com sucesso para:', data.user.email);
    
    try {
      // Extrair informações do usuário do provedor OAuth
      const userData = data.user;
      const userMetadata = userData.user_metadata || {};
      
      console.log('Metadados do usuário:', JSON.stringify(userMetadata));
      
      // Definir se é artista com base no parâmetro da URL
      const isArtist = userType === 'artist';
      
      // Atualizar metadados do usuário
      const updateResult = await supabase.auth.updateUser({
        data: { 
          is_artist: isArtist,
          name: userMetadata.name || userMetadata.full_name || userData.email?.split('@')[0] || 'Usuário',
          provider: 'google'
        }
      });
      
      if (updateResult.error) {
        console.log('Erro ao atualizar metadados:', updateResult.error);
      } else {
        console.log('Metadados de autenticação atualizados com sucesso');
      }

      // Inserir registros apropriados nas tabelas com base no tipo de usuário
      if (isArtist) {
        // Preparar dados de artista
        const artistRecord = {
          id: userData.id,
          name: userMetadata.name || userMetadata.full_name || userData.email?.split('@')[0] || 'Artista',
          email: userData.email,
          profile_image_url: userMetadata.avatar_url || userMetadata.picture || null,
          oauth_provider: 'google'
        };
        
        // Inserir ou atualizar registro na tabela artists
        const { error: insertArtistError } = await supabase
          .from('artists')
          .upsert(artistRecord, { onConflict: 'id' });
          
        if (insertArtistError) {
          console.log('Erro ao criar/atualizar registro de artista:', insertArtistError);
        } else {
          console.log('Registro de artista processado com sucesso');
        }
      } else {
        // Preparar dados de usuário regular
        const userRecord = {
          id: userData.id,
          name: userMetadata.name || userMetadata.full_name || userData.email?.split('@')[0] || 'Usuário',
          email: userData.email,
          profile_image: userMetadata.avatar_url || userMetadata.picture || null,
          oauth_provider: 'google'
        };
        
        // Inserir ou atualizar registro na tabela users
        const { error: insertUserError } = await supabase
          .from('users')
          .upsert(userRecord, { onConflict: 'id' });
          
        if (insertUserError) {
          console.log('Erro ao criar/atualizar registro de usuário:', insertUserError);
        } else {
          console.log('Registro de usuário processado com sucesso');
        }
      }
      
      // Redirecionar para a home page em todos os casos
      return NextResponse.redirect(requestUrl.origin);
    } catch (updateError: any) {
      console.log('Erro ao processar dados do usuário:', updateError);
      // Mesmo com erro na atualização, continuar com a autenticação e ir para a home
      return NextResponse.redirect(requestUrl.origin);
    }
  } catch (error: any) {
    console.log('Exception in auth callback:', error);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=callback_error&message=${encodeURIComponent(error?.message || 'Erro inesperado')}&clear_cookies=true`
    );
  }
}