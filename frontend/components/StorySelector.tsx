"use client";

import React, { useState } from "react";

interface Topic {
  id: string;
  label: string;
  query: string;
}

interface StorySelectorProps {
  topics: Topic[];
  selectedTopic: string;
  onSelect: (topicId: string) => void;
  loading?: boolean;
}

export default function StorySelector({
  topics,
  selectedTopic,
  onSelect,
  loading = false,
}: StorySelectorProps) {
  return (
    <div className="flex items-center gap-3 py-4 overflow-x-auto">
      <span className="text-sm font-semibold text-[var(--text-secondary)] whitespace-nowrap">
        Story:
      </span>
      <div className="flex gap-2">
        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onSelect(topic.id)}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap
              ${
                selectedTopic === topic.id
                  ? "bg-et-ink text-white shadow-md"
                  : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-et-gray-light hover:text-[var(--text-primary)]"
              }
              ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {loading && selectedTopic === topic.id ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {topic.label}
              </span>
            ) : (
              topic.label
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
