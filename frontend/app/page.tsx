"use client";

import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import BriefingLayout from '../components/BriefingLayout';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // If a search has been executed, render the briefing layout
  if (searchQuery) {
    return <BriefingLayout initialQuery={searchQuery} />;
  }

  // Otherwise render the homepage landing
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tight text-et-ink mb-6">
          Pulse Protocol
        </h1>
        <p className="text-xl md:text-2xl text-et-ink-light max-w-2xl mx-auto leading-relaxed">
          Ask ET anything about the markets, policies, or companies. Get structured, context-rich briefings instantly.
        </p>
      </div>
      
      <div className="w-full max-w-3xl shadow-2xl rounded-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
        <SearchBar onSubmit={handleSearch} isSearching={false} />
      </div>
      
      <div className="mt-16 flex gap-4 text-sm font-medium text-et-ink-light cursor-pointer animate-in fade-in duration-1000 delay-300 fill-mode-both">
        <span className="hover:text-et-red transition-colors">Trending:</span>
        <span onClick={() => handleSearch("Union Budget 2026 mutual funds")} className="px-3 py-1 bg-et-gray-light rounded hover:bg-et-gray-border transition-colors">Union Budget 2026</span>
        <span onClick={() => handleSearch("SEBI Algo Trading regulations")} className="px-3 py-1 bg-et-gray-light rounded hover:bg-et-gray-border transition-colors">SEBI Algo Trading</span>
      </div>
    </div>
  );
}
