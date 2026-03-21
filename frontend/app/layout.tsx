import type { Metadata } from 'next';
import './globals.css';
import AppLayout from '../components/AppLayout';

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
    <html lang="en">
      <body className="antialiased">
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
