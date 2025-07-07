import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import authService from '@/services/authService';

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
          if (credentials.userType === 'artist') {
            const { session, user } = await authService.signInArtist(
              credentials.email,
              credentials.password
            );
            
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
            
            return { 
              ...user, 
              id: user.id, 
              userType: 'user',
              accessToken: session.access_token
            };
          }
        } catch (error) {
          console.error('Erro de autenticação:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.userType = (user as any).userType;
        
        if ((user as any).accessToken) {
          token.accessToken = (user as any).accessToken;
        }
        
        if (account?.provider === 'google') {
          try {
            // TODO: Implement OAuth user linking/creation
          } catch (error) {
            console.error('Erro ao processar autenticação OAuth:', error);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.userType = token.userType as string;
        session.accessToken = token.accessToken as string;
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
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
}
