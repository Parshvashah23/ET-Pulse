"use client";

import React, { useState, useEffect } from "react";

interface RelatedStory {
  title: string;
  url: string;
  date: string;
  topic: string;
  score: number;
}

interface RelatedStoriesProps {
  query: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RelatedStories({ query }: RelatedStoriesProps) {
  const [stories, setStories] = useState<RelatedStory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    const fetchRelated = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/related?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        setStories(data.related || []);
      } catch {
        // Silently fail
      }
      setLoading(false);
    };

    fetchRelated();
  }, [query]);

  if (loading) {
    return (
      <div className="mt-6 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Related Stories</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-[var(--surface)] border border-[var(--border)] rounded-lg animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (stories.length === 0) return null;

  return (
    <div className="mt-6">
      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-2">
        <span>🔗</span> Related Stories
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stories.map((story, i) => (
          <a
            key={i}
            href={story.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:shadow-md hover:border-et-red/30 transition-all group"
          >
            <div className="text-[10px] font-semibold text-et-red uppercase tracking-wider mb-1">
              {story.topic || "News"}
            </div>
            <div className="text-sm font-medium leading-snug group-hover:text-et-red transition-colors line-clamp-2">
              {story.title}
            </div>
            {story.date && (
              <div className="text-[10px] text-[var(--text-muted)] mt-1.5">
                {new Date(story.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
