"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
);

export const PORTFOLIO_OVERVIEW = [
  { name: "TCS", allocation: 22, change: 2.4, value: "₹4,215", ltp: "₹4,123.50", qty: 10, color: '#3B82F6', sparkline: [40, 42, 38, 45, 48, 44, 50] },
  { name: "HDFC Bank", allocation: 18, change: -0.3, value: "₹1,678", ltp: "₹1,678.25", qty: 10, color: '#8B5CF6', sparkline: [35, 38, 36, 34, 33, 35, 34] },
  { name: "Reliance", allocation: 15, change: 1.1, value: "₹2,890", ltp: "₹2,890.80", qty: 10, color: '#F59E0B', sparkline: [25, 28, 27, 30, 29, 32, 31] },
  { name: "Infosys", allocation: 12, change: 3.2, value: "₹1,567", ltp: "₹1,567.40", qty: 10, color: '#10B981', sparkline: [18, 20, 22, 21, 25, 28, 30] },
  { name: "ICICI Bank", allocation: 10, change: 0.8, value: "₹1,245", ltp: "₹1,245.15", qty: 10, color: '#F43F5E', sparkline: [15, 14, 16, 17, 16, 18, 19] },
  { name: "Others", allocation: 23, change: 0.5, value: "₹3,102", ltp: "-", qty: 0, color: '#94A3B8', sparkline: [20, 21, 20, 22, 21, 23, 22] },
];

const mockHistory = Array.from({ length: 30 }, (_, i) => ({
  date: `D-${29 - i}`,
  value: 12000 + (Math.sin(i / 3) * 800) + (i * 80) + (Math.random() * 200 - 100)
}));

function Sparkline({ data, positive }: { data: number[], positive: boolean }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 40;
    const y = 16 - ((val - min) / range) * 14;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="40" height="16" className="ml-2">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#10b981" : "#ef4444"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PortfolioTracker() {
  const [portfolioView, setPortfolioView] = useState<'allocation' | 'performance'>('allocation');

  const totalValue = PORTFOLIO_OVERVIEW.reduce((sum, stock) => {
    const numVal = parseFloat(stock.value.replace(/[₹,]/g, ''));
    return sum + numVal;
  }, 0);
  const totalChange = PORTFOLIO_OVERVIEW.reduce((sum, stock) => {
    return sum + (stock.change * stock.allocation / 100);
  }, 0);

  const doughnutData = {
    labels: PORTFOLIO_OVERVIEW.map(o => o.name),
    datasets: [{
      data: PORTFOLIO_OVERVIEW.map(o => o.allocation),
      backgroundColor: PORTFOLIO_OVERVIEW.map(o => o.color),
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const lineData = {
    labels: mockHistory.map(h => h.date),
    datasets: [{
      label: 'Portfolio Value',
      data: mockHistory.map(h => h.value),
      fill: true,
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
    }]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => `₹${context.parsed.y.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
        }
      }
    },
    scales: {
      x: { display: false },
      y: { display: false }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    }
  };

  return (
    <motion.div
      className="card p-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[var(--text-muted)]" />
            Portfolio Overview
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Model portfolio details</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">₹{totalValue.toLocaleString()}</div>
          <div className={`text-[11px] font-semibold ${totalChange > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {totalChange > 0 ? '+' : ''}{totalChange.toFixed(2)}% today
          </div>
        </div>
      </div>

      <div className="flex bg-[var(--bg-secondary)] rounded-lg p-1 mb-4">
        <button
          onClick={() => setPortfolioView('allocation')}
          className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors cursor-pointer ${
            portfolioView === 'allocation' ? 'bg-[var(--surface)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Allocation
        </button>
        <button
          onClick={() => setPortfolioView('performance')}
          className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors cursor-pointer ${
            portfolioView === 'performance' ? 'bg-[var(--surface)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Performance
        </button>
      </div>

      <div className="h-48 mb-6 relative flex justify-center items-center">
        {portfolioView === 'allocation' ? (
          <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false } } }} />
        ) : (
          <Line data={lineData} options={lineOptions} />
        )}
      </div>

      <div className="space-y-1 h-[256px] overflow-y-auto scrollbar-thin">
        {PORTFOLIO_OVERVIEW.map((stock, idx) => (
          <motion.div
            key={stock.name}
            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[var(--surface-hover)] transition-smooth cursor-pointer group"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                style={{ backgroundColor: stock.color }}
              >
                {stock.allocation}%
              </div>
              <div>
                <div className="text-sm font-semibold">{stock.name}</div>
                <div className="text-[10px] text-[var(--text-faint)]">
                  {portfolioView === 'allocation' ? stock.value : `LTP: ${stock.ltp}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {stock.name !== 'Others' && (
                <Sparkline data={stock.sparkline} positive={stock.change > 0} />
              )}
              <div className={`flex items-center gap-1 text-xs font-semibold min-w-[50px] justify-end ${stock.change > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {stock.change > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {stock.change > 0 ? '+' : ''}{stock.change}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[var(--border)]">
        <div className="text-center">
          <div className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider">Day Gain</div>
          <div className="text-sm font-bold text-emerald-600">+₹205</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider">Invested</div>
          <div className="text-sm font-bold">₹12,450</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider">Returns</div>
          <div className="text-sm font-bold text-emerald-600">+18.04%</div>
        </div>
      </div>
    </motion.div>
  );
}
