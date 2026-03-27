import React from 'react';

type SectionNavProps = {
  activeSection: string;
};

const SECTIONS = [
  { id: 'background', label: 'Background' },
  { id: 'key-development', label: 'Key Development' },
  { id: 'market-impact', label: 'Market Impact' },
  { id: 'key-players', label: 'Key Players' },
  { id: 'what-to-watch', label: 'What to Watch' },
];

export default function SectionNav({ activeSection }: SectionNavProps) {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Offset by 100px for sticky header
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-24 z-10 hidden lg:block w-48 shrink-0">
      <div className="border-l-2 border-et-gray-light pl-4 space-y-4 py-2 text-sm font-medium">
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <div 
              key={sec.id}
              onClick={() => scrollTo(sec.id)}
              className={`cursor-pointer transition-all duration-300 relative ${
                isActive ? 'text-et-red translate-x-1' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {isActive && (
                <div className="absolute -left-[19px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-et-red shadow-[0_0_8px_rgba(192,57,43,0.6)]" />
              )}
              {sec.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
