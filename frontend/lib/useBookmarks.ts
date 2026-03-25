"use client";

import { useState, useEffect, useCallback } from 'react';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  savedAt: string;
  type: 'briefing' | 'story' | 'arc' | 'video';
  thumbnail?: string;
}

interface UseBookmarksReturn {
  bookmarks: Bookmark[];
  addBookmark: (item: Omit<Bookmark, 'savedAt'>) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (item: Omit<Bookmark, 'savedAt'>) => void;
}

const STORAGE_KEY = 'et_bookmarks';

export function useBookmarks(): UseBookmarksReturn {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setBookmarks(JSON.parse(stored));
      } catch {
        setBookmarks([]);
      }
    }
  }, []);

  const saveBookmarks = useCallback((newBookmarks: Bookmark[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
    setBookmarks(newBookmarks);
  }, []);

  const addBookmark = useCallback(
    (item: Omit<Bookmark, 'savedAt'>) => {
      const newBookmark: Bookmark = {
        ...item,
        savedAt: new Date().toISOString(),
      };
      const updated = [...bookmarks.filter((b) => b.id !== item.id), newBookmark];
      saveBookmarks(updated);
    },
    [bookmarks, saveBookmarks]
  );

  const removeBookmark = useCallback(
    (id: string) => {
      const updated = bookmarks.filter((b) => b.id !== id);
      saveBookmarks(updated);
    },
    [bookmarks, saveBookmarks]
  );

  const isBookmarked = useCallback(
    (id: string) => {
      return bookmarks.some((b) => b.id === id);
    },
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    (item: Omit<Bookmark, 'savedAt'>) => {
      if (isBookmarked(item.id)) {
        removeBookmark(item.id);
      } else {
        addBookmark(item);
      }
    },
    [isBookmarked, removeBookmark, addBookmark]
  );

  // Prevent hydration mismatch
  if (!mounted) {
    return {
      bookmarks: [],
      addBookmark: () => {},
      removeBookmark: () => {},
      isBookmarked: () => false,
      toggleBookmark: () => {},
    };
  }

  return { bookmarks, addBookmark, removeBookmark, isBookmarked, toggleBookmark };
}

export default useBookmarks;
