import React from 'react';

type SourceCardProps = {
  title: string;
  date: string;
  url: string;
  topic?: string;
};

export default function SourceCard({ title, date, url, topic }: SourceCardProps) {
  // Extract domain for display
  let domain = "economictimes.indiatimes.com";
  try {
    domain = new URL(url).hostname;
  } catch (e) {}

  // Format date nicely
  const displayDate = date ? new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  }) : 'Recent';

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-et-red px-2 py-0.5 bg-et-red/10 rounded">
          {topic || 'News'}
        </span>
        <span className="text-xs text-[var(--text-secondary)]">
          {displayDate}
        </span>
      </div>
      
      <h4 className="font-bold text-[var(--text-primary)] leading-tight mb-3 group-hover:text-et-red transition-colors">
        {title}
      </h4>
      
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          {domain.replace('www.', '')}
        </span>
        
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs font-medium text-et-red hover:underline"
        >
          Read original →
        </a>
      </div>
    </div>
  );
}
