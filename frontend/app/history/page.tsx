"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { History, Trash2, ExternalLink, Clock, X } from 'lucide-react';
import { useReadingHistory, HistoryItem } from '@/lib/useReadingHistory';
import FadeIn from '@/components/motion/FadeIn';
import StaggerList from '@/components/motion/StaggerList';

export default function HistoryPage() {
  const { history, removeFromHistory, clearHistory } = useReadingHistory();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeColor = (type: HistoryItem['type']) => {
    const colors = {
      briefing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      story: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      arc: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      video: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return colors[type] || colors.briefing;
  };

  // Group history by date
  const groupedHistory = history.reduce(
    (groups, item) => {
      const date = new Date(item.visitedAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    },
    {} as Record<string, HistoryItem[]>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-et-red/10 rounded-xl">
              <History className="w-6 h-6 text-et-red" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                Reading History
              </h1>
              <p className="text-[var(--text-muted)] text-sm">
                {history.length} {history.length === 1 ? 'item' : 'items'} viewed
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-[var(--surface-hover)] rounded-full flex items-center justify-center">
              <History className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <h2 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              No reading history
            </h2>
            <p className="text-[var(--text-muted)] mb-6">
              Your recently viewed stories and briefings will appear here
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-et-red to-et-red-hover text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              Start Reading
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedHistory).map(([date, items]) => (
              <div key={date}>
                <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
                  {date}
                </h2>
                <StaggerList className="space-y-3">
                  {items.map((item) => (
                    <motion.div
                      key={item.id + item.visitedAt}
                      className="card p-4 flex items-center justify-between gap-4"
                      whileHover={{ scale: 1.01 }}
                    >
                      <Link href={item.url} className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${getTypeColor(
                              item.type
                            )}`}
                          >
                            {item.type.charAt(0).toUpperCase() +
                              item.type.slice(1)}
                          </span>
                          <h3 className="font-medium text-[var(--text-primary)] truncate hover:text-et-red transition-colors">
                            {item.title}
                          </h3>
                        </div>
                      </Link>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(item.visitedAt)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Link
                            href={item.url}
                            className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                            aria-label="Open"
                          >
                            <ExternalLink className="w-4 h-4 text-[var(--text-muted)]" />
                          </Link>
                          <button
                            onClick={() => removeFromHistory(item.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            aria-label="Remove from history"
                          >
                            <X className="w-4 h-4 text-[var(--text-muted)] hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </StaggerList>
              </div>
            ))}
          </div>
        )}
      </FadeIn>
    </div>
  );
}
