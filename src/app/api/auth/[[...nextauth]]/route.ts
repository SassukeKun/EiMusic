import { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import authService from '@/services/authService';
import { Session } from 'next-auth';

// Add type augmentation for the Session
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      userType?: string;
    };
    accessToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
        userType: { label: 'Tipo de Usuário', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        try {
          // Verifica o tipo de usuário (artista ou usuário comum)
          if (credentials.userType === 'artist') {
            const { session, user } = await authService.signInArtist(
              credentials.email,
              credentials.password
            );
            
            // Adiciona o tipo de usuário ao objeto de usuário
            return { 
              ...user, 
              id: user.id, 
              userType: 'artist',
              accessToken: session.access_token
            };
          } else {
            const { session, user } = await authService.signInUser(
              credentials.email,
              credentials.password
            );
            
            // Adiciona o tipo de usuário ao objeto de usuário
            return { 
              ...user, 
              id: user.id, 
              userType: 'user',
              accessToken: session.access_token
            };
          }
        } catch (error) {
          console.log('Erro de autenticação:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Preserva os dados do usuário no token JWT
      if (user) {
        token.id = user.id;
        token.userType = (user as any).userType;
        
        // Adiciona o token de acesso do Supabase
        if ((user as any).accessToken) {
          token.accessToken = (user as any).accessToken;
        }
        
        // Se for login OAuth, obtém ou cria o usuário no Supabase
        if (account?.provider === 'google') {
          try {
            // TODO: Implementar lógica para vincular ou criar usuário no Supabase após OAuth
          } catch (error) {
            console.log('Erro ao processar autenticação OAuth:', error);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Passa informações do token para a sessão
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).userType = token.userType;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 