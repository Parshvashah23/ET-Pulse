"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Video } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिंदी", flag: "🇮🇳" },
  { code: "mr", label: "मराठी", flag: "🇮🇳" },
];

interface VideoResult {
  video_url: string;
  duration_seconds: number;
  script: any;
  generation_time_seconds: number;
}

export default function VideoStudioPage() {
  const searchParams = useSearchParams();
  const [articleText, setArticleText] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<VideoResult | null>(null);
  const [error, setError] = useState("");
  const [showScript, setShowScript] = useState(false);

  // Pre-fill from URL params (when navigating from briefing)
  useEffect(() => {
    const textParam = searchParams.get("text");
    if (textParam) {
      setArticleText(decodeURIComponent(textParam));
    }
  }, [searchParams]);

  const handleGenerate = async () => {
    if (!articleText.trim()) return;
    
    setLoading(true);
    setError("");
    setResult(null);
    setProgress("Generating script with AI...");

    try {
      // Simulate progress updates
      const progressSteps = [
        { msg: "Generating 5-part broadcast script...", delay: 3000 },
        { msg: "Creating narration audio...", delay: 6000 },
        { msg: "Building visual slides...", delay: 9000 },
        { msg: "Assembling final video...", delay: 12000 },
      ];

      progressSteps.forEach(({ msg, delay }) => {
        setTimeout(() => {
          if (loading) setProgress(msg);
        }, delay);
      });

      const res = await fetch(`${API_URL}/api/video/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article_text: articleText, language }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        setProgress("Done!");
      }
    } catch (err: any) {
      setError("Failed to generate video. Is the backend running?");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-2">
          AI Video Studio
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Paste any article text → get a broadcast-quality 60-90 second MP4 with AI narration and animated slides.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 mb-6">
        <label className="text-sm font-semibold text-[var(--text-primary)] block mb-2">
          Article Text
        </label>
        <textarea
          value={articleText}
          onChange={(e) => setArticleText(e.target.value)}
          placeholder="Paste the full article text here..."
          className="w-full h-48 px-4 py-3 border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] resize-none focus:outline-none focus:ring-2 focus:ring-et-red/30 focus:border-et-red"
        />

        <div className="flex items-center justify-between mt-4">
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Language:</span>
            <div className="flex gap-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                    language === lang.code
                      ? "bg-et-ink text-white"
                      : "bg-et-gray-light text-[var(--text-secondary)] hover:bg-et-gray-border"
                  }`}
                >
                  {lang.flag} {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !articleText.trim()}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-smooth ${
              loading || !articleText.trim()
                ? "bg-[var(--surface-elevated)] text-[var(--text-faint)] cursor-not-allowed border border-[var(--border)]"
                : "gradient-brand text-white hover:shadow-lg cursor-pointer"
            }`}
          >
            {loading ? "Generating..." : <><Video className="w-4 h-4" /> Generate Video</>}
          </button>
        </div>
      </div>

      {/* Progress */}
      {loading && (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-et-red border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[var(--text-primary)] font-medium">{progress}</span>
          </div>
          <div className="mt-3 w-full h-1.5 bg-et-gray-light rounded-full overflow-hidden">
            <div className="h-full bg-et-red rounded-full animate-pulse-slow" style={{ width: "60%" }} />
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            This may take 60-90 seconds. The AI is writing, narrating, designing, and assembling your video.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden mb-6">
          {/* Video Player */}
          <div className="bg-black">
            <video
              controls
              className="w-full max-h-[500px]"
              src={`${API_URL}${result.video_url}`}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Video Info */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-et-green-light text-et-green text-xs font-semibold px-2.5 py-1 rounded-full">
                ✓ Generated
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                {result.duration_seconds}s duration • Generated in {result.generation_time_seconds}s
              </span>
            </div>

            {/* Script Accordion */}
            <button
              onClick={() => setShowScript(!showScript)}
              className="w-full text-left text-sm font-semibold text-[var(--text-primary)] flex items-center justify-between py-2 border-t border-[var(--border)]"
            >
              <span>📝 View Script</span>
              <span className="text-[var(--text-secondary)]">{showScript ? "▲" : "▼"}</span>
            </button>

            {showScript && result.script?.script && (
              <div className="space-y-3 mt-3">
                {Object.entries(result.script.script).map(([key, value]: [string, any]) => (
                  <div key={key} className="bg-et-offwhite rounded-lg p-3">
                    <div className="text-xs font-semibold text-et-red uppercase tracking-wider mb-1">
                      {key.replace("_", " ")}
                    </div>
                    <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                      {value?.text || ""}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Download Button */}
            <div className="mt-4 flex gap-3">
              <a
                href={`${API_URL}${result.video_url}`}
                download
                className="px-4 py-2 bg-et-ink text-white text-sm font-medium rounded-full hover:bg-et-ink-light transition-colors"
              >
                ⬇️ Download MP4
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
