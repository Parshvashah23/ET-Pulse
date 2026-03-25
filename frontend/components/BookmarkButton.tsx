"use client";

import { motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { useBookmarks, Bookmark as BookmarkType } from '@/lib/useBookmarks';

interface BookmarkButtonProps {
  item: Omit<BookmarkType, 'savedAt'>;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function BookmarkButton({
  item,
  size = 'md',
  showLabel = false,
  className = '',
}: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(item.id);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  return (
    <motion.button
      onClick={() => toggleBookmark(item)}
      className={`flex items-center gap-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors ${buttonSizeClasses[size]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <motion.div
        initial={false}
        animate={{
          scale: bookmarked ? [1, 1.3, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <Bookmark
          className={`${sizeClasses[size]} ${
            bookmarked
              ? 'fill-et-gold text-et-gold'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          } transition-colors`}
        />
      </motion.div>
      {showLabel && (
        <span
          className={`text-sm ${
            bookmarked ? 'text-et-gold' : 'text-[var(--text-muted)]'
          }`}
        >
          {bookmarked ? 'Saved' : 'Save'}
        </span>
      )}
    </motion.button>
  );
}
