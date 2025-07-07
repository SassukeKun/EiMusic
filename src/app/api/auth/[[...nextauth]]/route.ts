import NextAuth from 'next-auth';
import { authOptions } from '@/auth.config';

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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };