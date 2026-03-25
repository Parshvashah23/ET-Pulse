"use client";

import { Clock } from 'lucide-react';
import { calculateReadingTime, formatReadingTime } from '@/lib/readingTime';

interface ReadingTimeProps {
  text: string;
  className?: string;
  showIcon?: boolean;
}

export default function ReadingTime({
  text,
  className = '',
  showIcon = true,
}: ReadingTimeProps) {
  const minutes = calculateReadingTime(text);
  const formatted = formatReadingTime(minutes);

  return (
    <span
      className={`flex items-center gap-1.5 text-xs text-[var(--text-muted)] ${className}`}
    >
      {showIcon && <Clock className="w-3.5 h-3.5" />}
      {formatted}
    </span>
  );
}
