"use client";

import React from "react";

export function BriefingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-10 bg-[var(--surface)] rounded-lg w-3/4 mb-4" />
      <div className="h-6 bg-[var(--surface)] rounded w-1/2 mb-8" />
      <div className="flex gap-12">
        <div className="hidden lg:block w-40 space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-4 bg-[var(--surface)] rounded w-full" />
          ))}
        </div>
        <div className="flex-grow space-y-4">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="h-4 bg-[var(--surface)] rounded" style={{ width: `${90 - i * 5}%` }} />
          ))}
        </div>
        <div className="hidden lg:block w-80 space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-28 bg-[var(--surface)] rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="bg-[var(--surface)] p-6 rounded-xl h-20" />
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-3">
          <div className="h-4 bg-[var(--bg-secondary)] rounded w-24" />
          <div className="h-6 bg-[var(--bg-secondary)] rounded w-3/4" />
          <div className="h-16 bg-[var(--bg-secondary)] rounded" />
          <div className="h-4 bg-[var(--bg-secondary)] rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function ArcSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse">
      <div className="h-8 bg-[var(--surface)] rounded w-1/3 mb-6" />
      <div className="flex gap-3 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-8 bg-[var(--surface)] rounded-full w-32" />
        ))}
      </div>
      <div className="h-32 bg-[var(--surface)] rounded-xl mb-6" />
      <div className="grid grid-cols-2 gap-6">
        <div className="h-64 bg-[var(--surface)] rounded-xl" />
        <div className="h-64 bg-[var(--surface)] rounded-xl" />
      </div>
    </div>
  );
}

export function VideoSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-[var(--surface)] rounded w-1/3 mb-8" />
      <div className="bg-[var(--surface)] rounded-xl p-6 space-y-4">
        <div className="h-48 bg-[var(--bg-secondary)] rounded-lg" />
        <div className="h-8 bg-[var(--bg-secondary)] rounded w-1/4" />
      </div>
    </div>
  );
}
