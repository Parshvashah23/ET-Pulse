"use client";

import React from "react";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
  selected: string;
  onChange: (lang: string) => void;
  compact?: boolean;
}

const LANGUAGES = [
  { code: "en", label: "EN", full: "English" },
  { code: "hi", label: "हि", full: "Hindi" },
  { code: "mr", label: "म", full: "Marathi" },
];

export default function LanguageToggle({
  selected,
  onChange,
  compact = false,
}: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-1">
      {!compact && (
        <Globe className="w-4 h-4 text-et-ink-light mr-1" />
      )}
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onChange(lang.code)}
          title={lang.full}
          className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
            selected === lang.code
              ? "bg-et-ink text-white shadow-sm"
              : "bg-white border border-et-gray-border text-et-ink-light hover:bg-et-gray-light hover:text-et-ink"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
