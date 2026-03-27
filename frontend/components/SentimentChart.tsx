"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SentimentEntry {
  date: string;
  source_title: string;
  positive: number;
  negative: number;
  neutral: number;
  snippet: string;
}

interface SentimentChartProps {
  data: SentimentEntry[];
}

export default function SentimentChart({ data }: SentimentChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-8 text-center text-[var(--text-secondary)]">
        No sentiment data available for this topic.
      </div>
    );
  }

  const labels = data.map((d) =>
    d.date !== "unknown"
      ? new Date(d.date).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        })
      : "N/A"
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "Positive",
        data: data.map((d) => d.positive),
        borderColor: "#27500A",
        backgroundColor: "rgba(39, 80, 10, 0.08)",
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
      {
        label: "Negative",
        data: data.map((d) => d.negative),
        borderColor: "#C0392B",
        backgroundColor: "rgba(192, 57, 43, 0.08)",
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
      {
        label: "Neutral",
        data: data.map((d) => d.neutral),
        borderColor: "#9CA3AF",
        backgroundColor: "rgba(156, 163, 175, 0.05)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          font: { size: 11 },
        },
      },
      tooltip: {
        callbacks: {
          afterBody: (context: any) => {
            const idx = context[0]?.dataIndex;
            if (idx !== undefined && data[idx]?.snippet) {
              return `\n"${data[idx].snippet}"`;
            }
            return "";
          },
          title: (context: any) => {
            const idx = context[0]?.dataIndex;
            const entry = data[idx];
            return entry?.source_title || context[0]?.label;
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 1,
        ticks: { font: { size: 10 } },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: {
        ticks: { font: { size: 10 } },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Sentiment Over Time</h3>
      <div className="h-[300px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
