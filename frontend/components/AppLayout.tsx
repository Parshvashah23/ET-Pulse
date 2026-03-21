import React from 'react';
import Link from 'next/link';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-et-offwhite font-sans text-et-ink">
      {/* Top Navigation */}
      <header className="bg-white border-b border-et-gray-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-et-red rounded flex items-center justify-center text-white font-serif font-bold text-xl group-hover:bg-et-red-hover transition-colors">
                ET
              </div>
              <span className="font-bold tracking-tight text-xl">Pulse</span>
            </Link>
            
            <nav className="hidden md:flex gap-6 text-sm font-medium">
              <Link href="/" className="text-et-red pb-5 border-b-2 border-et-red translate-y-[10px]">
                News Navigator
              </Link>
              <Link href="/feed" className="text-et-ink-light hover:text-et-red transition-colors pb-5 translate-y-[10px]">
                My ET Feed
              </Link>
              <Link href="/video" className="text-et-ink-light hover:text-et-red transition-colors pb-5 translate-y-[10px]">
                Video Studio
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/onboarding" className="text-sm font-medium text-et-ink-light hover:text-et-ink px-3 py-2 rounded-md hover:bg-et-gray-light transition-colors">
              Profile Setup
            </Link>
            <div className="w-8 h-8 bg-et-ink text-white rounded-full flex items-center justify-center text-xs font-bold">
              U
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-et-gray-border py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-et-ink-light">
          <p>© {new Date().getFullYear()} Economic Times Pulse Protocol.</p>
          <p className="mt-2 text-xs">AI-powered personalized newsroom. Not real financial advice.</p>
        </div>
      </footer>
    </div>
  );
}
