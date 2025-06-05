import '@/styles/globals.css'
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import ClientLayout from '@/components/ClientLayout';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import PlayerBar from '@/components/PlayerBar';
import Providers from '@/utils/providers';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EiMusic - Plataforma de streaming",
  description: "Plataforma de streaming de musicas nacionais",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = [
    '/login',
    '/register',
    '/artist/login',
    '/artist/register',
    '/auth/callback'
  ].includes(pathname);

  return (
    <html lang="pt-PT">
      <head />
      <body className={isAuthPage ? '' : 'pb-24 bg-gray-50'}>
        <Providers>
          {isAuthPage ? (
            children
          ) : (
            <div className="flex">
              <Sidebar />
              <main className="flex-1 max-w-7xl px-4 pb-14">
                {children}
              </main>
            </div>
          )}

          {!isAuthPage && <PlayerBar />}
        </Providers>
      </body>
    </html>
  );
}