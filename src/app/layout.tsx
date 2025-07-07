import '../../styles/globals.css'
// Removido Google Font para evitar falha em build offline
import type { Metadata } from "next";
import ClientLayout from '@/components/ClientLayout';
import { Providers } from '@/utils/providers';
import { PlayerProvider } from '@/context/PlayerContext';

// const inter = Inter({ subsets: ["latin"] }); // removido

// Definição dos metadados do site (lado do servidor)
export const metadata: Metadata = {
  title: "EiMusic - Plataforma de streaming",
  description: "Plataforma de streaming de musicas nacionais",
};

// Componente principal de layout (lado do servidor)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
