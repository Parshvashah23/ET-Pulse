"use client";

import React, { useEffect, useState } from "react";

interface AuditEntry {
  id: number;
  timestamp: string;
  agent: string;
  query: string;
  input_summary: string;
  output_summary: string;
  duration_ms: number;
  status: string;
}

interface AuditPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const AGENT_COLORS: Record<string, string> = {
  timeline: "#3B82F6",
  players: "#F59E0B",
  sentiment: "#10B981",
  predict: "#8B5CF6",
  contrarian: "#EF4444",
  synthesis: "#06B6D4",
  factcheck: "#F97316",
  feed: "#EC4899",
};

export default function AuditPanel({ isOpen, onToggle }: AuditPanelProps) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAuditLog();
    }
  }, [isOpen]);

  const fetchAuditLog = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/audit?limit=30`);
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (err) {
      console.error("Failed to fetch audit log:", err);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-30 bg-et-ink text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-et-ink-light transition-colors text-sm font-medium flex items-center gap-2"
      >
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        {isOpen ? "Close" : "Agent Log"}
      </button>

      {/* Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-30"
            onClick={onToggle}
          />
          <div className="fixed bottom-0 right-0 w-full max-w-lg h-[70vh] bg-white border-l border-t border-et-gray-border shadow-2xl z-40 rounded-tl-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-et-gray-border bg-et-offwhite">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <h3 className="text-sm font-bold text-et-ink">
                  AI Decision Log
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchAuditLog}
                  className="text-xs text-et-ink-light hover:text-et-ink transition-colors"
                >
                  Refresh
                </button>
                <button
                  onClick={onToggle}
                  className="text-et-ink-light hover:text-et-ink text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Entries */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading ? (
                <div className="text-center text-et-ink-light text-sm py-8">
                  Loading audit log...
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center text-et-ink-light text-sm py-8">
                  No agent activity logged yet.
                </div>
              ) : (
                entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-et-offwhite rounded-lg p-3 border border-et-gray-border text-xs"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            AGENT_COLORS[entry.agent] || "#9CA3AF",
                        }}
                      />
                      <span className="font-semibold text-et-ink capitalize">
                        {entry.agent}
                      </span>
                      <span className="text-et-ink-light ml-auto">
                        {entry.duration_ms}ms
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          entry.status === "success"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </div>
                    <div className="text-et-ink-light truncate">
                      Query: {entry.query}
                    </div>
                    {entry.output_summary && (
                      <div className="text-et-ink-light mt-1 line-clamp-2">
                        → {entry.output_summary}
                      </div>
                    )}
                    <div className="text-et-ink-light mt-1 text-[10px]">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
