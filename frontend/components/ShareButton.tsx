"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Check, Link2 } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function ShareButton({
  title,
  text,
  url,
  size = 'md',
  showLabel = false,
  className = '',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

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

  const handleShare = async () => {
    // Use native share API if available (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        // User cancelled or error, fall back to clipboard
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setShowTooltip(true);
      setTimeout(() => {
        setCopied(false);
        setShowTooltip(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={handleShare}
        className={`flex items-center gap-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors ${buttonSizeClasses[size]} ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Share"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check className={`${sizeClasses[size]} text-green-500`} />
            </motion.div>
          ) : (
            <motion.div
              key="share"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Share2
                className={`${sizeClasses[size]} text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors`}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {showLabel && (
          <span className="text-sm text-[var(--text-muted)]">
            {copied ? 'Copied!' : 'Share'}
          </span>
        )}
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg shadow-lg text-xs text-[var(--text-primary)] whitespace-nowrap flex items-center gap-1.5"
          >
            <Link2 className="w-3 h-3" />
            Link copied!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
