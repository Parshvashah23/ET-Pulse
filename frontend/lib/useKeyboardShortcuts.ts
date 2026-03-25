"use client";

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardShortcutsReturn {
  showShortcutsModal: boolean;
  setShowShortcutsModal: (show: boolean) => void;
}

export function useKeyboardShortcuts(): KeyboardShortcutsReturn {
  const router = useRouter();
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger in inputs or textareas
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape in inputs to blur
        if (e.key === 'Escape') {
          target.blur();
          return;
        }
        return;
      }

      // "/" - Focus search
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[type="text"], input[placeholder*="search"], input[placeholder*="Search"], input[placeholder*="Ask"]'
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }

      // "Escape" - Close modals/drawers
      if (e.key === 'Escape') {
        setShowShortcutsModal(false);
        document.dispatchEvent(new CustomEvent('close-drawer'));
        document.dispatchEvent(new CustomEvent('close-modal'));
      }

      // "?" - Show keyboard shortcuts
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
      }

      // "d" - Toggle dark mode
      if (e.key === 'd' && !e.metaKey && !e.ctrlKey) {
        document.dispatchEvent(new CustomEvent('toggle-theme'));
      }

      // "g h" - Go home (requires tracking previous key)
      if (e.key === 'h' && e.ctrlKey) {
        e.preventDefault();
        router.push('/');
      }

      // "g f" - Go to feed
      if (e.key === 'f' && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        router.push('/feed');
      }

      // "b" - Toggle bookmark on current item
      if (e.key === 'b' && !e.metaKey && !e.ctrlKey) {
        document.dispatchEvent(new CustomEvent('toggle-bookmark'));
      }

      // "s" - Share current item
      if (e.key === 's' && !e.metaKey && !e.ctrlKey) {
        document.dispatchEvent(new CustomEvent('share-item'));
      }
    },
    [router]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Listen for theme toggle events
  useEffect(() => {
    const handleToggleTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      document.documentElement.classList.toggle('dark', !isDark);
      localStorage.setItem('et_theme', isDark ? 'light' : 'dark');
    };

    document.addEventListener('toggle-theme', handleToggleTheme);
    return () => document.removeEventListener('toggle-theme', handleToggleTheme);
  }, []);

  return { showShortcutsModal, setShowShortcutsModal };
}

export const shortcuts = [
  { key: '/', description: 'Focus search' },
  { key: 'Esc', description: 'Close modals/menus' },
  { key: '?', description: 'Show keyboard shortcuts' },
  { key: 'd', description: 'Toggle dark mode' },
  { key: 'b', description: 'Toggle bookmark' },
  { key: 's', description: 'Share current item' },
  { key: 'Ctrl+H', description: 'Go to home' },
];

export default useKeyboardShortcuts;
