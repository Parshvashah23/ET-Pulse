import type { Metadata } from 'next';
import './globals.css';
import AppLayout from '../components/AppLayout';
import Providers from '../components/Providers';

export const metadata: Metadata = {
  title: 'ET Pulse | AI Newsroom',
  description: 'AI-powered personalized financial newsroom by Economic Times.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <AppLayout>
            {children}
          </AppLayout>
        </Providers>
      </body>
    </html>
  );
}
