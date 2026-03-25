"use client";

import React from "react";

interface Player {
  name: string;
  role: string;
  latest_action: string;
  mentioned_count: number;
  entity_type?: string;
}

interface KeyPlayersProps {
  players: Player[];
}

const ENTITY_BADGES: Record<string, { bg: string; text: string }> = {
  person: { bg: "bg-blue-50", text: "text-blue-700" },
  company: { bg: "bg-amber-50", text: "text-amber-700" },
  regulator: { bg: "bg-red-50", text: "text-red-700" },
  institution: { bg: "bg-green-50", text: "text-green-700" },
};

export default function KeyPlayers({ players }: KeyPlayersProps) {
  if (!players || players.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-et-gray-border p-8 text-center text-et-ink-light">
        No key players identified for this topic.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-et-gray-border p-6">
      <h3 className="text-lg font-bold text-et-ink mb-4">Key Players</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {players.map((player, i) => {
          const badge =
            ENTITY_BADGES[player.entity_type || "person"] ||
            ENTITY_BADGES.person;
          return (
            <div
              key={i}
              className="border border-et-gray-border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-et-ink text-sm">
                    {player.name}
                  </div>
                  <div className="text-xs text-et-ink-light">{player.role}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}
                  >
                    {player.entity_type || "person"}
                  </span>
                  <span className="text-[10px] bg-et-gray-light text-et-ink-light px-2 py-0.5 rounded-full font-medium">
                    {player.mentioned_count}×
                  </span>
                </div>
              </div>
              <p className="text-xs text-et-ink-light leading-relaxed">
                {player.latest_action}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
