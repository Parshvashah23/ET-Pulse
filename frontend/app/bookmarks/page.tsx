"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Bookmark, Trash2, ExternalLink, Clock } from 'lucide-react';
import { useBookmarks, Bookmark as BookmarkType } from '@/lib/useBookmarks';
import FadeIn from '@/components/motion/FadeIn';
import StaggerList from '@/components/motion/StaggerList';

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useBookmarks();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTypeColor = (type: BookmarkType['type']) => {
    const colors = {
      briefing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      story: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      arc: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      video: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return colors[type] || colors.briefing;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <FadeIn>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-et-gold/10 rounded-xl">
            <Bookmark className="w-6 h-6 text-et-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Saved Items
            </h1>
            <p className="text-[var(--text-muted)] text-sm">
              {bookmarks.length} {bookmarks.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>

        {bookmarks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-[var(--surface-hover)] rounded-full flex items-center justify-center">
              <Bookmark className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <h2 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              No saved items yet
            </h2>
            <p className="text-[var(--text-muted)] mb-6">
              Start saving stories, briefings, and videos to access them later
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-et-red to-et-red-hover text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              Explore News
            </Link>
          </motion.div>
        ) : (
          <StaggerList className="space-y-4">
            {bookmarks.map((bookmark) => (
              <motion.div
                key={bookmark.id}
                className="card p-4 flex items-start justify-between gap-4"
                whileHover={{ scale: 1.01 }}
              >
                <Link href={bookmark.url} className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    {bookmark.thumbnail && (
                      <img
                        src={bookmark.thumbnail}
                        alt=""
                        className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${getTypeColor(
                            bookmark.type
                          )}`}
                        >
                          {bookmark.type.charAt(0).toUpperCase() +
                            bookmark.type.slice(1)}
                        </span>
                      </div>
                      <h3 className="font-medium text-[var(--text-primary)] line-clamp-2 hover:text-et-red transition-colors">
                        {bookmark.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-xs text-[var(--text-muted)]">
                        <Clock className="w-3 h-3" />
                        <span>Saved {formatDate(bookmark.savedAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  <Link
                    href={bookmark.url}
                    className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                    aria-label="Open"
                  >
                    <ExternalLink className="w-4 h-4 text-[var(--text-muted)]" />
                  </Link>
                  <button
                    onClick={() => removeBookmark(bookmark.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    aria-label="Remove bookmark"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </motion.div>
            ))}
          </StaggerList>
        )}
      </FadeIn>
    </div>
  );
}
