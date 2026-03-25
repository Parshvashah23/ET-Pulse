"use client";

import React, { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import LanguageToggle from "../../components/LanguageToggle";
import AudioBriefing from "../../components/AudioBriefing";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const SAMPLE_TOPICS = [
  "Union Budget 2026 mutual funds",
  "SEBI algo trading regulations",
  "RBI rate decision impact",
  "Zepto IPO valuation",
];

interface TranslatedStory {
  original: string;
  translated: string;
  language: string;
  glossary_terms: string[];
}

export default function VernacularPage() {
  const [selectedLang, setSelectedLang] = useState("hi");
  const [stories, setStories] = useState<TranslatedStory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadVernacularFeed(selectedLang);
  }, [selectedLang]);

  const loadVernacularFeed = async (lang: string) => {
    if (lang === "en") {
      setStories([]);
      return;
    }

    setLoading(true);
    setError("");
    const translatedStories: TranslatedStory[] = [];

    try {
      // Translate each sample topic's description
      for (const topic of SAMPLE_TOPICS.slice(0, 4)) {
        const briefSummary = `Latest news analysis on ${topic}. This story covers the key developments, market impact, and what investors should watch for in the coming weeks.`;
        
        const res = await fetch(`${API_URL}/api/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: briefSummary, language: lang }),
        });
        const data = await res.json();
        translatedStories.push({
          original: briefSummary,
          translated: data.translated_text || briefSummary,
          language: lang,
          glossary_terms: data.glossary_terms_found || [],
        });
      }
      setStories(translatedStories);
    } catch (err) {
      setError("Failed to load vernacular feed. Is the backend running?");
    }
    setLoading(false);
  };

  const langNames: Record<string, string> = {
    hi: "Hindi",
    mr: "Marathi",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-et-ink mb-2">
            Vernacular Newsroom
          </h1>
          <p className="text-sm text-et-ink-light">
            Business news culturally adapted for regional readers — not just translated, but rewritten.
          </p>
        </div>
        <LanguageToggle selected={selectedLang} onChange={setSelectedLang} />
      </div>

      {/* Language Banner */}
      {selectedLang !== "en" && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4 mb-6 flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold flex items-center gap-1.5 text-blue-800">
              <Globe className="w-4 h-4" /> {langNames[selectedLang] || "Selected"} Edition
            </span>
            <p className="text-xs text-blue-600 mt-0.5">
              Culturally adapted with regional newspaper style and finance glossary
            </p>
          </div>
          <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
            Regional Language
          </span>
        </div>
      )}

      {/* English Mode */}
      {selectedLang === "en" && (
        <div className="bg-et-offwhite rounded-xl border border-et-gray-border p-8 text-center">
          <p className="text-et-ink-light text-sm">
            Select a regional language above to see the Vernacular Newsroom.
            <br />
            Available: Hindi (हि), Marathi (म)
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-12">
          <div className="w-5 h-5 border-2 border-et-ink border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-et-ink-light">
            Translating with cultural adaptation...
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Translated Stories */}
      {!loading && stories.length > 0 && (
        <div className="space-y-4">
          {stories.map((story, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-et-gray-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-et-ink text-base">
                  {SAMPLE_TOPICS[i]}
                </h3>
                <AudioBriefing text={story.translated} language={story.language} />
              </div>

              {/* Translated text */}
              <p className="text-sm text-et-ink leading-relaxed mb-3">
                {story.translated}
              </p>

              {/* Glossary terms found */}
              {story.glossary_terms.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-et-ink-light">
                    Finance terms:
                  </span>
                  {story.glossary_terms.map((term, j) => (
                    <span
                      key={j}
                      className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              )}

              {/* Original */}
              <details className="mt-3">
                <summary className="text-xs text-et-ink-light cursor-pointer hover:text-et-ink">
                  View original English
                </summary>
                <p className="text-xs text-et-ink-light mt-2 italic">
                  {story.original}
                </p>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
