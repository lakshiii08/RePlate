import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/context/QueryProvider';
import { AuthProvider } from '@/context/AuthContext';
import { RescueProvider } from '@/context/RescueContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RePlate — From Surplus to Someone’s Plate',
  description: 'Real-time food rescue and routing platform connecting food donors, shelters, and volunteer drivers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#faf9f6] text-slate-900 antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <RescueProvider>
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
            </RescueProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
