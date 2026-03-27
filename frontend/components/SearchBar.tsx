import React, { useState, useEffect } from 'react';

const PLACEHOLDERS = [
  "What did the Union Budget announce for mutual funds?",
  "What is SEBI doing about algo trading?",
  "Explain RBI rate decision impact on home loans",
  "Tell me about Zepto IPO valuation",
];

export default function SearchBar({ onSubmit, isSearching }: { onSubmit: (query: string) => void, isSearching: boolean }) {
  const [query, setQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isSearching) {
      onSubmit(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto relative group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <svg className="h-6 w-6 text-et-red opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={PLACEHOLDERS[placeholderIndex]}
        className="w-full pl-14 pr-32 py-4 text-lg bg-[var(--surface)] text-[var(--text-primary)] border-2 border-[var(--border)] rounded-full outline-none focus:border-et-red focus:ring-4 focus:ring-et-red/10 transition-all shadow-sm group-hover:shadow-md"
        disabled={isSearching}
      />
      <button
        type="submit"
        disabled={isSearching || !query.trim()}
        className="absolute inset-y-2 right-2 px-6 bg-et-red text-white font-medium rounded-full hover:bg-et-red-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSearching ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Searching
          </span>
        ) : (
          "Ask ET"
        )}
      </button>
    </form>
  );
}
