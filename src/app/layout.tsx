import '../../styles/globals.css'
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import ClientLayout from '@/components/ClientLayout';

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
