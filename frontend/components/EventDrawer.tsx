"use client";

import React from "react";

interface TimelineEvent {
  date: string;
  event: string;
  type: string;
  significance: number;
  source_title?: string;
}

interface EventDrawerProps {
  event: TimelineEvent | null;
  onClose: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  policy: "#3B82F6",
  market: "#F59E0B",
  regulatory: "#EF4444",
  statement: "#9CA3AF",
};

export default function EventDrawer({ event, onClose }: EventDrawerProps) {
  if (!event) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 w-full max-w-md h-full bg-[var(--surface)] shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: TYPE_COLORS[event.type] || "#9CA3AF",
                }}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                {event.type}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-et-gray-light transition-colors text-[var(--text-secondary)]"
            >
              ✕
            </button>
          </div>

          {/* Date */}
          <div className="text-sm text-[var(--text-secondary)] mb-2">
            {new Date(event.date).toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>

          {/* Event description */}
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 leading-tight">
            {event.event}
          </h2>

          {/* Significance */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs text-[var(--text-secondary)]">Significance:</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-full ${
                    level <= event.significance
                      ? "bg-et-gold"
                      : "bg-et-gray-light"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-[var(--text-primary)]">
              {event.significance === 3
                ? "Major"
                : event.significance === 2
                ? "Notable"
                : "Minor"}
            </span>
          </div>

          {/* Source */}
          {event.source_title && (
            <div className="bg-et-offwhite rounded-lg p-4 border border-[var(--border)]">
              <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Source Article
              </div>
              <div className="text-sm font-medium text-[var(--text-primary)]">
                {event.source_title}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
