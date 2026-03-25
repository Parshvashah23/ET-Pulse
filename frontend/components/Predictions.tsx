"use client";

import React from "react";
import { TrendingUp, Landmark, Scale, Factory, Clock } from "lucide-react";

interface Prediction {
  signal: string;
  rationale: string;
  confidence: "high" | "medium" | "low";
  timeframe: string;
  impact_area: string;
}

interface PredictionsProps {
  predictions: Prediction[];
}

const CONFIDENCE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  low: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

const IMPACT_ICONS: Record<string, React.ReactNode> = {
  market: <TrendingUp className="w-5 h-5" />,
  policy: <Landmark className="w-5 h-5" />,
  regulatory: <Scale className="w-5 h-5" />,
  industry: <Factory className="w-5 h-5" />,
};

export default function Predictions({ predictions }: PredictionsProps) {
  if (!predictions || predictions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-et-gray-border p-8 text-center text-et-ink-light">
        No predictions generated for this topic.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-et-gray-border p-6">
      <h3 className="text-lg font-bold text-et-ink mb-4">Forward Signals</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {predictions.map((pred, i) => {
          const conf = CONFIDENCE_COLORS[pred.confidence] || CONFIDENCE_COLORS.medium;
          return (
            <div
              key={i}
              className={`rounded-lg border ${conf.border} p-4 ${conf.bg}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg flex items-center justify-center">
                  {IMPACT_ICONS[pred.impact_area] || <TrendingUp className="w-5 h-5" />}
                </span>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${conf.text}`}
                >
                  {pred.confidence} confidence
                </span>
              </div>

              <h4 className="font-bold text-sm text-et-ink mb-2 leading-snug">
                {pred.signal}
              </h4>

              <p className="text-xs text-et-ink-light leading-relaxed mb-3">
                {pred.rationale}
              </p>

              <div className="flex items-center gap-2 text-[10px] text-et-ink-light">
                <span className="bg-white/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {pred.timeframe}
                </span>
                <span className="bg-white/60 px-2 py-0.5 rounded-full capitalize">
                  {pred.impact_area}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
