"use client";

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const MARKET_INDICES = [
  { name: "SENSEX", value: "82,431.50", change: "+1.24%", positive: true, fullName: "BSE Sensex" },
  { name: "NIFTY 50", value: "24,867.30", change: "+0.98%", positive: true, fullName: "NSE Nifty 50" },
  { name: "BANK NIFTY", value: "51,234.80", change: "-0.32%", positive: false, fullName: "Bank Nifty" },
  { name: "NIFTY IT", value: "38,567.20", change: "+2.15%", positive: true, fullName: "Nifty IT" },
  { name: "MIDCAP", value: "48,234.10", change: "+1.56%", positive: true, fullName: "Nifty Midcap 50" },
  { name: "SMALLCAP", value: "15,678.40", change: "+2.34%", positive: true, fullName: "Nifty Smallcap 100" },
  { name: "USD/INR", value: "83.42", change: "-0.08%", positive: false, fullName: "US Dollar / Indian Rupee" },
  { name: "GOLD", value: "72,450", change: "+0.56%", positive: true, fullName: "Gold Spot" },
  { name: "CRUDE", value: "5,834", change: "-1.23%", positive: false, fullName: "Crude Oil" },
  { name: "SILVER", value: "84,230", change: "+0.89%", positive: true, fullName: "Silver Spot" },
];

export default function StockCarousel() {
  return (
    <div className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--surface)] via-[var(--bg-secondary)] to-[var(--surface)] overflow-hidden relative flex">
      {/* Dynamic Overlay Gradients for smooth fade out */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[var(--surface)] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--surface)] to-transparent z-10 pointer-events-none" />

      {/* Repeating groups for continuous fluid marquee via framer-motion */}
      <motion.div
        className="flex whitespace-nowrap py-2.5 px-0"
        animate={{
          x: ["0%", "-50%"]
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 35
        }}
      >
        {/* We duplicate the array to ensure it spans effectively for large screens */}
        {[...MARKET_INDICES, ...MARKET_INDICES, ...MARKET_INDICES, ...MARKET_INDICES].map((index, i) => (
          <div
            key={`${index.name}-${i}`}
            className="flex items-center gap-2 mx-4 shrink-0 px-3 py-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors cursor-pointer group"
          >
            {/* Pulsing indicator */}
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${index.positive ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${index.positive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{index.name}</span>
            <span className="text-xs font-mono font-semibold">{index.value}</span>
            <span className={`flex items-center text-[11px] font-bold ${index.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {index.positive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
              {index.change}
            </span>
            <span className="hidden group-hover:inline text-[9px] text-[var(--text-faint)] ml-1 truncate max-w-[80px]">
              {index.fullName}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
