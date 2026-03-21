import React, { useState } from 'react';

type FollowUpChatProps = {
  onAsk: (question: string) => void;
  disabled?: boolean;
};

export default function FollowUpChat({ onAsk, disabled }: FollowUpChatProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !disabled) {
      onAsk(question.trim());
      setQuestion("");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-et-gray-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-sm font-bold text-et-ink-light whitespace-nowrap">
          <svg className="w-5 h-5 text-et-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Ask ET AI
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={disabled}
            placeholder="Ask a follow-up question..."
            className="w-full bg-et-gray-light border-none rounded-full py-3 pl-6 pr-14 focus:ring-2 focus:ring-et-red/20 outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={disabled || !question.trim()}
            className="absolute right-2 top-1.5 bottom-1.5 p-2 bg-et-ink text-white rounded-full hover:bg-et-red transition-colors disabled:opacity-50 disabled:hover:bg-et-ink"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
