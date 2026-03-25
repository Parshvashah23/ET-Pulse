"use client";

import React, { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AudioBriefingProps {
  text: string;
  language: string;
}

export default function AudioBriefing({ text, language }: AudioBriefingProps) {
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");

  const handlePlay = async () => {
    if (audioUrl) {
      // Already have audio, just play
      const audio = new Audio(`${API_URL}${audioUrl}`);
      audio.play();
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/audio-brief`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      });
      const data = await res.json();
      if (data.audio_url) {
        setAudioUrl(data.audio_url);
        const audio = new Audio(`${API_URL}${data.audio_url}`);
        audio.play();
      } else {
        setError("Audio generation failed");
      }
    } catch (err) {
      setError("Failed to generate audio");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handlePlay}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
        loading
          ? "bg-et-gray-light text-et-ink-light cursor-not-allowed"
          : "bg-et-green-light text-et-green hover:bg-green-100"
      }`}
      title="Listen to this briefing"
    >
      {loading ? (
        <>
          <span className="w-3 h-3 border-2 border-et-green border-t-transparent rounded-full animate-spin" />
          Generating audio...
        </>
      ) : (
        <>🔊 Listen</>
      )}
    </button>
  );
}
