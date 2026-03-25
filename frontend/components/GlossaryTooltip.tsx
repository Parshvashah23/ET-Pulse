"use client";

import React, { useState, useEffect } from "react";

interface GlossaryTerm {
  term: string;
  definition: string;
}

interface GlossaryTooltipProps {
  text: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function GlossaryTooltip({ text }: GlossaryTooltipProps) {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  useEffect(() => {
    if (!text || text.length < 50) return;

    const detectTerms = async () => {
      try {
        const res = await fetch(`${API_URL}/api/glossary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        const data = await res.json();
        setTerms(data.terms || []);
      } catch {
        // Silently fail — glossary is a nice-to-have
      }
    };

    const timer = setTimeout(detectTerms, 1000); // Debounce
    return () => clearTimeout(timer);
  }, [text]);

  if (terms.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-2">
        <span>📖</span> Finance Terms Detected ({terms.length})
      </h4>
      <div className="flex flex-wrap gap-2">
        {terms.slice(0, 15).map((term) => (
          <div key={term.term} className="relative">
            <button
              onMouseEnter={() => setActiveTooltip(term.term)}
              onMouseLeave={() => setActiveTooltip(null)}
              onClick={() => setActiveTooltip(activeTooltip === term.term ? null : term.term)}
              className="px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 rounded-full hover:bg-blue-100 transition-all cursor-help"
            >
              {term.term}
            </button>
            {activeTooltip === term.term && (
              <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-3 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs rounded-lg shadow-xl leading-relaxed">
                <div className="font-bold mb-0.5">{term.term}</div>
                {term.definition}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--text-primary)] rotate-45 -mt-1" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
