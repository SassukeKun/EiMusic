/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import { trackError } from "@/utils/trackError";
import { handleOAuthCallback, PKCE_STORAGE_KEY } from '@/utils/supabaseOAuth';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processAuthCallback = async () => {
      setIsLoading(true);
      
      // Add null check for searchParams
      if (!searchParams) {
        console.warn('searchParams is null in auth callback. Waiting for hydration or this is an issue.');
        return;
      }

      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      console.log('Auth callback received:', {
        hasCode: !!code,
        hasError: !!errorParam,
        errorParam,
        errorDescription
      });

      // Debug the PKCE state
      console.log(`PKCE verifier in callback: ${sessionStorage.getItem(PKCE_STORAGE_KEY) ? 'Present' : 'Missing'}`);
      
      // Handle OAuth errors from the provider
      if (errorParam) {
        let errorMessage = errorDescription || 'Erro desconhecido durante a autenticação OAuth.';
        if (errorParam === 'access_denied') {
          errorMessage = 'Acesso negado pelo provedor de autenticação.';
        } else if (errorParam === 'pkce_error' || errorDescription?.includes('PKCE')) {
          errorMessage = 'Erro de verificação PKCE. Por favor, tente fazer login novamente em uma nova janela ou guia privativa.';
          router.push(`/login?error=pkce_error&message=${encodeURIComponent(errorMessage)}&clear_cookies=true`);
          return;
        }
        trackError(new Error(`OAuth Error: ${errorParam}`), { context: 'AuthCallback', errorDescription });
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      if (!code) {
        setError('Código de autorização ausente. Não é possível prosseguir.');
        setIsLoading(false);
        return;
      }

      console.log('Trocando código por sessão...');
      
      try {
        // Use our new utility to handle the OAuth callback
        const result = await handleOAuthCallback(code);
        
        if (!result.success) {
          console.log('Auth callback error:', result.error);
          trackError(result.error as Error, { context: 'AuthCallback-ExchangeCode' });
          
          // Check if this is a PKCE error
          const errorMessage = result.error instanceof Error ? result.error.message : String(result.error);
          if (errorMessage.includes('PKCE') || errorMessage.includes('code verifier')) {
            const detailedMessage = 'Erro de verificação PKCE ao trocar o código. O code_verifier pode estar ausente ou inválido. Tente novamente.';
            router.push(`/login?error=pkce_error&message=${encodeURIComponent(detailedMessage)}&clear_cookies=true`);
            return;
          }
          
          setError(`Erro ao trocar código por sessão: ${errorMessage}`);
          setIsLoading(false);
          return;
        }
        
        // Success! Redirect based on user type
        console.log('Sessão obtida com sucesso');
        
        // Redirect based on user type from the callback result
        if (result.userType === 'artist') {
          router.push('/artist/dashboard');
        } else {
          router.push('/');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        console.log('Exception in auth callback:', errorMessage);
        setError(`Ocorreu um erro inesperado: ${errorMessage}`);
        setIsLoading(false);
      }
    };

    processAuthCallback();
  }, [router, searchParams]);

  if (isLoading) {
    return <LoadingSpinner message="Processando autenticação..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
        <ErrorAlert title="Erro de Autenticação" message={error} />
        <button 
          onClick={() => router.push('/login')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Voltar para Login
        </button>
      </div>
    );
  }

  // Em caso de sucesso, o redirecionamento já ocorreu no useEffect
  return null; 
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Carregando callback..." />}>
      <AuthCallbackContent />
    </Suspense>
  );
}