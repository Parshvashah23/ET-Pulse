import React from 'react';

type Persona = 'general' | 'mf_investor' | 'founder' | 'student';

type PersonaSwitcherProps = {
  currentPersona: Persona;
  onChange: (persona: Persona) => void;
  disabled?: boolean;
};

const PERSONAS: Array<{ id: Persona; label: string; icon: string }> = [
  { id: 'general', label: 'General Reader', icon: '📰' },
  { id: 'mf_investor', label: 'MF Investor', icon: '📈' },
  { id: 'founder', label: 'Startup Founder', icon: '🚀' },
  { id: 'student', label: 'Student', icon: '🎓' },
];

export default function PersonaSwitcher({ currentPersona, onChange, disabled }: PersonaSwitcherProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-et-ink-light mr-2">Perspective:</span>
      <div className="flex bg-white border border-et-gray-border rounded-full p-1 shadow-sm">
        {PERSONAS.map((p) => {
          const isActive = currentPersona === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onChange(p.id)}
              disabled={disabled}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all
                ${isActive 
                  ? 'bg-et-ink text-white font-medium shadow-md' 
                  : 'text-et-ink-light hover:bg-et-gray-light hover:text-et-ink'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <span>{p.icon}</span>
              <span className="hidden sm:inline">{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
