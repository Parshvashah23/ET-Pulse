"use client";

import { useState, useEffect, useCallback } from 'react';

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  visitedAt: string;
  type: 'briefing' | 'story' | 'arc' | 'video';
}

interface UseReadingHistoryReturn {
  history: HistoryItem[];
  addToHistory: (item: Omit<HistoryItem, 'visitedAt'>) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
}

const STORAGE_KEY = 'et_history';
const MAX_HISTORY_ITEMS = 50;

export function useReadingHistory(): UseReadingHistoryReturn {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const saveHistory = useCallback((newHistory: HistoryItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    setHistory(newHistory);
  }, []);

  const addToHistory = useCallback(
    (item: Omit<HistoryItem, 'visitedAt'>) => {
      const newItem: HistoryItem = {
        ...item,
        visitedAt: new Date().toISOString(),
      };

      // Remove existing entry for same item, add to front, limit to max items
      const filtered = history.filter((h) => h.id !== item.id);
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      saveHistory(updated);
    },
    [history, saveHistory]
  );

  const removeFromHistory = useCallback(
    (id: string) => {
      const updated = history.filter((h) => h.id !== id);
      saveHistory(updated);
    },
    [history, saveHistory]
  );

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return {
      history: [],
      addToHistory: () => {},
      clearHistory: () => {},
      removeFromHistory: () => {},
    };
  }

  return { history, addToHistory, clearHistory, removeFromHistory };
}

export default useReadingHistory;
