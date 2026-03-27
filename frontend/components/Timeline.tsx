"use client";

import React, { useEffect, useRef } from "react";

interface TimelineEvent {
  date: string;
  event: string;
  type: "policy" | "market" | "regulatory" | "statement";
  significance: number;
  source_title?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  onEventClick: (event: TimelineEvent) => void;
}

const TYPE_COLORS: Record<string, string> = {
  policy: "#3B82F6",
  market: "#F59E0B",
  regulatory: "#EF4444",
  statement: "#9CA3AF",
};

const TYPE_LABELS: Record<string, string> = {
  policy: "Policy",
  market: "Market",
  regulatory: "Regulatory",
  statement: "Statement",
};

export default function Timeline({ events, onEventClick }: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!events || events.length === 0) {
    return (
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-8 text-center text-[var(--text-secondary)]">
        No timeline events available for this topic.
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Event Timeline</h3>
      
      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs">
        {Object.entries(TYPE_LABELS).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: TYPE_COLORS[type] }}
            />
            <span className="text-[var(--text-secondary)]">{label}</span>
          </div>
        ))}
      </div>

      {/* Scrollable timeline */}
      <div ref={scrollRef} className="overflow-x-auto pb-4">
        <div className="relative min-w-max">
          {/* Horizontal line */}
          <div className="absolute top-8 left-8 right-8 h-0.5 bg-et-gray-border" />

          {/* Events */}
          <div className="flex items-start gap-1 px-4">
            {events.map((event, i) => {
              const size = 20 + event.significance * 8; // 28, 36, 44 px
              return (
                <div
                  key={i}
                  className="flex flex-col items-center cursor-pointer group"
                  style={{ minWidth: "100px" }}
                  onClick={() => onEventClick(event)}
                >
                  {/* Date label */}
                  <div className="text-[10px] text-[var(--text-secondary)] mb-1 whitespace-nowrap">
                    {new Date(event.date).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>

                  {/* Node */}
                  <div
                    className="rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-125 group-hover:shadow-lg flex items-center justify-center"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      backgroundColor: TYPE_COLORS[event.type] || "#9CA3AF",
                    }}
                  >
                    <span className="text-white text-[10px] font-bold">
                      {event.significance}
                    </span>
                  </div>

                  {/* Event snippet */}
                  <div className="mt-2 px-1 text-[11px] text-center text-[var(--text-secondary)] leading-tight max-w-[100px] line-clamp-3 group-hover:text-[var(--text-primary)] transition-colors">
                    {event.event.length > 60
                      ? event.event.slice(0, 57) + "..."
                      : event.event}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
