import '../../styles/globals.css'
// Removido Google Font para evitar falha em build offline
import type { Metadata } from "next";
import ClientLayout from '@/components/ClientLayout';
import { Providers } from '@/utils/providers';
import { PlayerProvider } from '@/context/PlayerContext';

// const inter = Inter({ subsets: ["latin"] }); // removido

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
      <body>
        <Providers>
          <PlayerProvider>
            <ClientLayout>{children}</ClientLayout>
          </PlayerProvider>
        </Providers>
      </body>
    </html>
  );
}