"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Sun, Moon, User, LogIn, Bookmark, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/useTheme';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/', label: 'News Navigator' },
  { href: '/feed', label: 'My ET Feed' },
  { href: '/arc', label: 'Story Arc' },
  { href: '/video', label: 'Video Studio' },
  { href: '/vernacular', label: 'Vernacular' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] font-sans text-[var(--text-primary)] transition-colors duration-300">
      {/* Top Navigation */}
      <header className="glass-header border-b border-[var(--border)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-et-red to-et-red-hover rounded-lg flex items-center justify-center text-white font-serif font-bold text-xl shadow-lg"
                whileHover={{ scale: 1.05, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                ET
              </motion.div>
              <span className="font-bold tracking-tight text-xl hidden sm:inline">Pulse</span>
            </Link>

            <nav className="hidden md:flex gap-1 text-sm font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-et-red font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-et-red to-et-gold rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'light' ? (
                    <Moon className="w-5 h-5 text-[var(--text-muted)]" />
                  ) : (
                    <Sun className="w-5 h-5 text-et-gold" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* Profile / Auth */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/onboarding"
                  className="hidden sm:block text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                >
                  Profile
                </Link>
                <motion.button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-et-red to-et-gold text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </motion.button>
              </div>
            ) : (
              <Link href="/login">
                <motion.button
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-et-red to-et-red-hover text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </motion.button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              {/* Drawer */}
              <motion.nav
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-16 left-0 bottom-0 w-72 bg-[var(--surface)] border-r border-[var(--border)] z-50 md:hidden overflow-y-auto"
              >
                <div className="p-4 space-y-2">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-3 rounded-xl transition-all ${
                          isActive(item.href)
                            ? 'bg-et-red/10 text-et-red font-semibold border-l-4 border-et-red'
                            : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}

                  <div className="border-t border-[var(--border)] my-4" />

                  {/* User features */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <Link
                      href="/bookmarks"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive('/bookmarks')
                          ? 'bg-et-gold/10 text-et-gold font-semibold'
                          : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <Bookmark className="w-5 h-5" />
                      Saved Items
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link
                      href="/history"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive('/history')
                          ? 'bg-et-red/10 text-et-red font-semibold'
                          : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <History className="w-5 h-5" />
                      Reading History
                    </Link>
                  </motion.div>

                  <div className="border-t border-[var(--border)] my-4" />

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <Link
                      href="/onboarding"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-all"
                    >
                      Profile Setup
                    </Link>
                  </motion.div>

                  {!user && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 rounded-xl bg-gradient-to-r from-et-red to-et-red-hover text-white text-center font-medium"
                      >
                        Sign In
                      </Link>
                    </motion.div>
                  )}
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[var(--surface)] border-t border-[var(--border)] py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-[var(--text-muted)]">
          <p>&copy; {new Date().getFullYear()} Economic Times Pulse Protocol.</p>
          <p className="mt-2 text-xs opacity-70">AI-powered personalized newsroom. Not real financial advice.</p>
        </div>
      </footer>
    </div>
  );
}
