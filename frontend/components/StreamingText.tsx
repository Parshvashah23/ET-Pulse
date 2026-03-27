import React, { useEffect, useState, useRef } from 'react';

/**
 * Renders streaming Markdown content.
 * Highlights `##` headings and renders a blinking cursor at the end.
 */
export default function StreamingText({ content, isStreaming }: { content: string, isStreaming: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Format content line by line
  const renderFormattedContent = () => {
    return content.split('\n').map((line, idx) => {
      // Handle headings
      if (line.trim().startsWith('## ')) {
        const text = line.replace('## ', '');
        // Adding an id to headings for SectionNav to track via IntersectionObserver
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return (
          <h3 key={idx} id={id} className="text-2xl font-serif font-bold text-et-red mt-8 mb-4 border-b border-et-gray-light pb-2 pt-4 section-heading">
            {text}
          </h3>
        );
      }
      
      // Handle bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <div key={idx} className="flex gap-3 my-2 pl-4">
            <span className="text-et-gold mt-1">•</span>
            <span>{line.substring(2)}</span>
          </div>
        );
      }
      
      // Handle source citations like [Source: ET Article]
      if (line.includes('[Source:')) {
        const parts = line.split(/(\[Source:.*?\])/g);
        return (
          <p key={idx} className="my-3 leading-relaxed">
            {parts.map((part, pIdx) => {
              if (part.startsWith('[Source:')) {
                return (
                  <span key={pIdx} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-et-gray-light text-[var(--text-secondary)] mx-1 border border-[var(--border)]">
                    {part}
                  </span>
                );
              }
              return <span key={pIdx}>{part}</span>;
            })}
          </p>
        );
      }

      // Empty lines
      if (!line.trim()) {
        return <div key={idx} className="h-4" />;
      }

      // Normal paragraphs
      return <p key={idx} className="my-3 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="text-lg text-[var(--text-primary)] font-sans">
      {renderFormattedContent()}
      
      {/* Blinking cursor while streaming */}
      {isStreaming && (
        <span className="inline-block w-2.5 h-6 bg-et-red ml-1 align-middle animate-pulse" />
      )}
    </div>
  );
}
