"use client";

import React, { useState, useEffect, useRef } from 'react';
import StreamingText from './StreamingText';
import SectionNav from './SectionNav';
import SourceCard from './SourceCard';
import PersonaSwitcher from './PersonaSwitcher';
import { streamSSE } from '../lib/sse';

type BriefingLayoutProps = {
  initialQuery: string;
};

export default function BriefingLayout({ initialQuery }: BriefingLayoutProps) {
  const [query, setQuery] = useState(initialQuery);
  const [persona, setPersona] = useState<'general' | 'mf_investor' | 'founder' | 'student'>('general');
  
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sources, setSources] = useState<any[]>([]); // We'll mock this for now since stream doesn't send sources directly yet
  
  const [activeSection, setActiveSection] = useState('background');
  
  // Track scroll for active section
  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll('.section-heading');
      let currentActive = 'background';
      
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        // If heading is near the top of the viewport
        if (rect.top <= 150) {
          currentActive = heading.id;
        }
      });
      
      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [content]);

  // Fetch the briefing stream
  const fetchBriefing = (q: string, p: string) => {
    setContent("");
    setIsStreaming(true);
    
    // Mocking some sources for the UI demonstration
    setSources([
      { title: "RBI keeps repo rate unchanged", date: "2026-03-21", url: "#", topic: "RBI" },
      { title: "Markets react to latest inflation data", date: "2026-03-20", url: "#", topic: "Markets" }
    ]);
    
    const url = "http://localhost:8000/api/brief/stream";
    const body = { query: q, persona: p };
    
    streamSSE(
      url, 
      body, 
      (chunk) => {
        setContent((prev) => prev + chunk);
      },
      () => {
        setIsStreaming(false);
      },
      (err) => {
        console.error("Stream error:", err);
        setContent((prev) => prev + "\n\n**Error loading partial briefing.**");
        setIsStreaming(false);
      }
    );
  };

  // Start initial stream
  useEffect(() => {
    if (initialQuery) {
      fetchBriefing(initialQuery, persona);
    }
  }, [initialQuery]);

  // Handle persona change
  const handlePersonaChange = (newPersona: any) => {
    if (newPersona !== persona && !isStreaming) {
      setPersona(newPersona);
      fetchBriefing(query, newPersona);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="mb-8 border-b border-et-gray-border pb-6">
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-et-ink mb-4 leading-tight">
          {query}
        </h1>
        <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-et-gray-border shadow-sm">
          <PersonaSwitcher 
            currentPersona={persona} 
            onChange={handlePersonaChange} 
            disabled={isStreaming} 
          />
          {isStreaming && (
            <span className="text-sm font-medium text-et-red flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-et-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-et-red"></span>
              </span>
              Generating Briefing...
            </span>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-12 relative">
        
        {/* Left Nav (Sticky) */}
        <SectionNav activeSection={activeSection} />

        {/* Center Content (Stream) */}
        <div className="flex-grow max-w-3xl min-h-[500px]">
          <StreamingText content={content} isStreaming={isStreaming} />
          
          {!isStreaming && content && (
            <div className="mt-12 p-6 bg-et-green-light border border-et-green/20 rounded-lg text-center">
              <h4 className="font-bold text-et-green mb-2">Briefing Complete</h4>
              <p className="text-sm text-et-green/80">Want to know more? Chat with the AI below.</p>
            </div>
          )}
        </div>

        {/* Right Sidebar (Sources) */}
        <div className="lg:w-80 shrink-0">
          <div className="sticky top-24">
            <h3 className="text-sm font-bold uppercase tracking-wider text-et-ink-light mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14" />
              </svg>
              Verified Sources
            </h3>
            
            <div className="space-y-4">
              {sources.map((src, i) => (
                <SourceCard key={i} {...src} />
              ))}
              
              {sources.length === 0 && isStreaming && (
                <div className="animate-pulse space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-28 bg-et-gray-light rounded-lg"></div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
