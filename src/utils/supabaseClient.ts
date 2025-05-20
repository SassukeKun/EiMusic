import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check for missing environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL ERROR: Missing Supabase environment variables. Authentication will not work!');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env file');
}

// Função para criar um ID único para uso como prefixo de armazenamento
const getStorageKey = () => {
  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1] || 'unknown';
  return `sb-${projectId}`;
};

// Função para limpar armazenamentos existentes potencialmente corrompidos
const cleanupExistingStorage = () => {
  if (typeof window === 'undefined') return;
  
  try {
    // Verifica se há tokens desatualizados ou múltiplos no localStorage
    let tokensFound = 0;
    const storagePrefix = getStorageKey();
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') && !key.startsWith(storagePrefix)) {
        localStorage.removeItem(key);
      }
      if (key.startsWith(storagePrefix)) {
        tokensFound++;
      }
    });
    
    // Se houver mais de um token com o prefixo correto, limpar tudo
    if (tokensFound > 1) {
      console.log('Múltiplos tokens Supabase encontrados, limpando armazenamento');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
    }
  } catch (e) {
    console.warn('Erro ao limpar armazenamento:', e);
  }
};

// Limpar armazenamento existente ao inicializar
cleanupExistingStorage();

/**
 * Supabase client instance for reuse across the application
 * Used to interact with Supabase services (auth, database, storage)
 */
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: getStorageKey() + '-auth-token',
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
    storage: {
      getItem: (key) => {
        if (typeof window === 'undefined') return null;
        try {
          const value = window.localStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        } catch (e) {
          console.warn('Erro ao recuperar do armazenamento:', e);
          return null;
        }
      },
      setItem: (key, value) => {
        if (typeof window === 'undefined') return;
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
          console.warn('Erro ao salvar no armazenamento:', e);
        }
      },
      removeItem: (key) => {
        if (typeof window === 'undefined') return;
        try {
          window.localStorage.removeItem(key);
        } catch (e) {
          console.warn('Erro ao remover do armazenamento:', e);
        }
      },
    },
  },
});

export default supabase; 