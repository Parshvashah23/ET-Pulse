"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Maximize2 } from 'lucide-react';

export const SECTOR_HEATMAP = [
  { name: "IT", change: 2.15, size: "large", stocks: ["TCS", "Infosys", "Wipro", "HCL"], marketCap: "₹45.2L Cr" },
  { name: "Pharma", change: 1.82, size: "large", stocks: ["Sun Pharma", "Dr Reddy", "Cipla"], marketCap: "₹12.8L Cr" },
  { name: "Banking", change: -0.32, size: "large", stocks: ["HDFC", "ICICI", "SBI", "Kotak"], marketCap: "₹38.5L Cr" },
  { name: "Auto", change: 1.45, size: "medium", stocks: ["Tata Motors", "M&M", "Maruti"], marketCap: "₹18.3L Cr" },
  { name: "FMCG", change: 0.67, size: "medium", stocks: ["HUL", "ITC", "Nestle"], marketCap: "₹22.1L Cr" },
  { name: "Metals", change: -1.23, size: "medium", stocks: ["Tata Steel", "JSW", "Hindalco"], marketCap: "₹8.9L Cr" },
  { name: "Energy", change: 0.89, size: "medium", stocks: ["Reliance", "ONGC", "BPCL"], marketCap: "₹28.4L Cr" },
  { name: "Realty", change: -0.56, size: "small", stocks: ["DLF", "Godrej Prop"], marketCap: "₹4.2L Cr" },
  { name: "Infra", change: 0.34, size: "small", stocks: ["L&T", "Adani Ports"], marketCap: "₹9.1L Cr" },
  { name: "Media", change: -0.78, size: "small", stocks: ["Zee", "PVR"], marketCap: "₹1.8L Cr" },
  { name: "PSU Bank", change: 1.12, size: "small", stocks: ["SBI", "PNB", "BOB"], marketCap: "₹12.3L Cr" },
  { name: "Fin Svc", change: 0.45, size: "small", stocks: ["Bajaj Fin", "SBI Life"], marketCap: "₹15.7L Cr" },
  { name: "Telecom", change: 1.78, size: "small", stocks: ["Airtel", "Jio"], marketCap: "₹11.2L Cr" },
  { name: "Cement", change: -0.34, size: "small", stocks: ["UltraTech", "ACC"], marketCap: "₹5.6L Cr" },
  { name: "Chemicals", change: 2.45, size: "small", stocks: ["SRF", "Pidilite"], marketCap: "₹4.8L Cr" },
  { name: "Textiles", change: -1.67, size: "small", stocks: ["Page", "Arvind"], marketCap: "₹1.2L Cr" },
];

function getHeatmapColor(change: number): string {
  if (change > 2) return 'bg-[#059669] text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]'; // Deep Green
  if (change > 1) return 'bg-[#10B981] text-white'; // Emerald
  if (change > 0) return 'bg-[#34D399] text-emerald-950'; // Light Green
  if (change > -1) return 'bg-[#FCA5A5] text-red-950'; // Light Red
  if (change > -2) return 'bg-[#EF4444] text-white'; // Red
  return 'bg-[#B91C1C] text-white shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]'; // Deep Red
}

export default function MarketHeatmap() {
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);

  return (
    <motion.div
      className="card p-6 flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-[var(--text-muted)]" />
            Sector Heatmap
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Today&apos;s sectoral performance</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-[var(--text-faint)] uppercase tracking-wider">Live</span>
          <button className="p-1.5 hover:bg-[var(--surface-hover)] rounded-lg transition-colors cursor-pointer">
            <Maximize2 className="w-4 h-4 text-[var(--text-faint)]" />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-4 grid-rows-4 gap-1.5 relative min-h-[350px]">
        {SECTOR_HEATMAP.map((sector) => {
          // Calculate grid spans based on size to simulate Treemap
          let colSpan = 'col-span-1';
          let rowSpan = 'row-span-1';
          
          if (sector.size === 'large') {
            colSpan = 'col-span-2';
            rowSpan = 'row-span-2';
          } else if (sector.size === 'medium') {
            colSpan = 'col-span-2';
            rowSpan = 'row-span-1';
          }

          return (
            <motion.div
              key={sector.name}
              className={`${getHeatmapColor(sector.change)} ${colSpan} ${rowSpan} rounded-sm p-3 flex flex-col items-start justify-between cursor-pointer transition-all relative overflow-hidden group border border-black/10 dark:border-white/5`}
              onMouseEnter={() => setHoveredSector(sector.name)}
              onMouseLeave={() => setHoveredSector(null)}
              whileHover={{ scale: 1.02, zIndex: 10, borderRadius: '8px' }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-full flex justify-between items-start">
                <div className={`font-bold leading-tight ${sector.size === 'large' ? 'text-lg' : sector.size === 'medium' ? 'text-sm' : 'text-xs'}`}>
                  {sector.name}
                </div>
                {sector.size === 'large' && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                     <Maximize2 className="w-3 h-3 mix-blend-overlay" />
                  </div>
                )}
              </div>
              
              <div className={`font-mono font-medium tracking-tight ${sector.size === 'large' ? 'text-xl' : sector.size === 'medium' ? 'text-sm' : 'text-xs mt-1'} opacity-90 mix-blend-overlay`}>
                {sector.change > 0 ? '+' : ''}{sector.change}%
              </div>

              {/* Enhanced Tooltip */}
              <AnimatePresence>
                {hoveredSector === sector.name && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl p-4 shadow-2xl min-w-[180px] text-left pointer-events-none"
                  >
                    <div className="flex justify-between items-center mb-2 border-b border-[var(--border)] pb-2">
                       <div className="text-sm font-bold text-[var(--text-primary)]">{sector.name}</div>
                       <div className={`text-xs font-bold ${sector.change > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                         {sector.change > 0 ? '+' : ''}{sector.change}%
                       </div>
                    </div>
                    
                    <div className="text-[11px] text-[var(--text-muted)] mb-3 flex justify-between">
                      <span>Market Cap</span>
                      <span className="font-semibold text-[var(--text-primary)]">{sector.marketCap}</span>
                    </div>
                    
                    <div className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider mb-1">Top Constituents</div>
                    <div className="flex flex-wrap gap-1.5">
                      {sector.stocks.map(stock => (
                        <span key={stock} className="text-[10px] bg-[var(--bg-secondary)] border border-[var(--border)] px-2 py-0.5 rounded-md text-[var(--text-secondary)] font-medium">
                          {stock}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-5 text-[11px] font-medium text-[var(--text-muted)] border-t border-[var(--border)] pt-4">
        <span>Performance Scale</span>
        <div className="flex items-center gap-1.5 opacity-90">
          <span className="w-12 h-3 rounded-sm bg-gradient-to-r from-[#B91C1C] via-[var(--surface-elevated)] to-[#059669]" />
        </div>
      </div>
    </motion.div>
  );
}
