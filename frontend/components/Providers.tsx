"use client";

import { ReactNode, createContext, useContext } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { useKeyboardShortcuts } from '@/lib/useKeyboardShortcuts';
import { ToastProvider } from '@/components/Toast';
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal';
import ReadingProgress from '@/components/ReadingProgress';

interface ProvidersProps {
  children: ReactNode;
}

// Keyboard shortcuts context
const KeyboardShortcutsContext = createContext<{
  showShortcuts: () => void;
}>({ showShortcuts: () => {} });

export const useShortcutsModal = () => useContext(KeyboardShortcutsContext);

function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  const { showShortcutsModal, setShowShortcutsModal } = useKeyboardShortcuts();

  return (
    <KeyboardShortcutsContext.Provider
      value={{ showShortcuts: () => setShowShortcutsModal(true) }}
    >
      {children}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </KeyboardShortcutsContext.Provider>
  );
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <ToastProvider>
        <KeyboardShortcutsProvider>
          <ReadingProgress />
          {children}
        </KeyboardShortcutsProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
