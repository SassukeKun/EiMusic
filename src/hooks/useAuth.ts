// @ts-expect-error React Query import will be resolved when dependencies are installed
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import authService from '../services/authService';
import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

// Define estado da autenticacao com Zustand 
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));

/**
 * Hook customizado para a funcionalidade de autenticacao 
 * Fornece login, signup, logout e user state
 */
export const useAuth = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, setUser } = useAuthStore();
  
  // Buscar o usuario atual
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      }
    };
    
    checkAuth();
  }, [setUser]); // Added setUser to dependencies
  
  // mutacao de login com React Query
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      authService.signIn(email, password),
    onSuccess: (data: { user: User }) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
  
  // mutacao de signup com React Query
  const signupMutation = useMutation({
    mutationFn: ({ email, password, userData }: { email: string; password: string; userData?: Record<string, unknown> }) => 
      authService.signUp(email, password, userData),
    onSuccess: (data: { user: User }) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
  
  // mutacao de logout com React Query
  const logoutMutation = useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      setUser(null);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
  
  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    logout: logoutMutation.mutate,
    isLoading: loginMutation.isPending || signupMutation.isPending || logoutMutation.isPending,
    error: loginMutation.error || signupMutation.error || logoutMutation.error,
  };
};

export default useAuth; 