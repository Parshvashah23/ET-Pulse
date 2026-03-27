"use client";

import React from "react";

interface ContrarianData {
  dominant_narrative: string;
  contrarian_view: string;
  supporting_evidence: string;
  evidence_count: number;
  risk_if_ignored: string;
}

interface ContrarianViewProps {
  data: ContrarianData | null;
}

export default function ContrarianView({ data }: ContrarianViewProps) {
  if (!data || !data.contrarian_view) {
    return (
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-8 text-center text-[var(--text-secondary)]">
        No contrarian analysis available for this topic.
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🔄</span>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Contrarian View</h3>
        <span className="ml-auto text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
          {data.evidence_count} source{data.evidence_count !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Dominant Narrative */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
          What Most Coverage Says
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic">
          &ldquo;{data.dominant_narrative}&rdquo;
        </p>
      </div>

      {/* Contrarian View */}
      <div className="bg-[var(--surface)]/70 rounded-lg p-4 mb-4 border border-amber-100">
        <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
          The Other Side
        </div>
        <p className="text-sm text-[var(--text-primary)] leading-relaxed font-medium">
          {data.contrarian_view}
        </p>
      </div>

      {/* Supporting Evidence */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
          Supporting Evidence
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {data.supporting_evidence}
        </p>
      </div>

      {/* Risk Warning */}
      <div className="bg-red-50 rounded-lg p-3 border border-red-100">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-xs">⚠️</span>
          <span className="text-xs font-semibold text-red-700">Risk If Ignored</span>
        </div>
        <p className="text-xs text-red-600 leading-relaxed">
          {data.risk_if_ignored}
        </p>
      </div>
    </div>
  );
}
