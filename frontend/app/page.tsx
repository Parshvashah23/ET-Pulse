"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Compass, Newspaper, BarChart3, Video, Globe, 
  ArrowRight, Search, TrendingUp, TrendingDown, Minus,
  Zap, Shield, Clock, ChevronRight, Sparkles, Activity,
  PieChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import BriefingLayout from '../components/BriefingLayout';

/* ─── Feature Definitions ─── */
const FEATURES = [
  {
    title: "News Navigator",
    description: "AI-powered briefings with citations, persona switching, and structured analysis",
    icon: Compass,
    action: "search",
    gradient: "from-emerald-500 to-teal-600",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    darkBg: "dark:bg-emerald-950/30",
  },
  {
    title: "My ET Feed",
    description: "Personalized news curated by AI based on your role and interests",
    icon: Newspaper,
    href: "/feed",
    gradient: "from-violet-500 to-purple-600",
    color: "text-violet-600",
    bg: "bg-violet-50",
    darkBg: "dark:bg-violet-950/30",
  },
  {
    title: "Story Arc Tracker",
    description: "Timeline intelligence, key players, sentiment analysis, and predictions",
    icon: BarChart3,
    href: "/arc",
    gradient: "from-amber-500 to-orange-600",
    color: "text-amber-600",
    bg: "bg-amber-50",
    darkBg: "dark:bg-amber-950/30",
  },
  {
    title: "AI Video Studio",
    description: "Generate broadcast-quality video briefings from any article in seconds",
    icon: Video,
    href: "/video",
    gradient: "from-rose-500 to-red-600",
    color: "text-rose-600",
    bg: "bg-rose-50",
    darkBg: "dark:bg-rose-950/30",
  },
  {
    title: "Vernacular Newsroom",
    description: "Business news culturally adapted in Hindi & Marathi with regional context",
    icon: Globe,
    href: "/vernacular",
    gradient: "from-blue-500 to-indigo-600",
    color: "text-blue-600",
    bg: "bg-blue-50",
    darkBg: "dark:bg-blue-950/30",
  },
];

const TRENDING_QUERIES = [
  "Union Budget 2026 mutual funds",
  "SEBI Algo Trading regulations",
  "RBI rate decision impact",
  "Zepto IPO valuation",
];

/* ─── Simulated Market Data ─── */
const MARKET_INDICES = [
  { name: "SENSEX", value: "82,431.50", change: "+1.24%", positive: true },
  { name: "NIFTY 50", value: "24,867.30", change: "+0.98%", positive: true },
  { name: "BANK NIFTY", value: "51,234.80", change: "-0.32%", positive: false },
  { name: "NIFTY IT", value: "38,567.20", change: "+2.15%", positive: true },
  { name: "USD/INR", value: "83.42", change: "-0.08%", positive: false },
  { name: "GOLD", value: "72,450", change: "+0.56%", positive: true },
];

const SECTOR_HEATMAP = [
  { name: "IT", change: 2.15, size: "large" },
  { name: "Pharma", change: 1.82, size: "large" },
  { name: "Banking", change: -0.32, size: "large" },
  { name: "Auto", change: 1.45, size: "medium" },
  { name: "FMCG", change: 0.67, size: "medium" },
  { name: "Metals", change: -1.23, size: "medium" },
  { name: "Energy", change: 0.89, size: "medium" },
  { name: "Realty", change: -0.56, size: "small" },
  { name: "Infra", change: 0.34, size: "small" },
  { name: "Media", change: -0.78, size: "small" },
  { name: "PSU", change: 1.12, size: "small" },
  { name: "Fin Svc", change: 0.45, size: "small" },
];

const PORTFOLIO_OVERVIEW = [
  { name: "TCS", allocation: 22, change: 2.4, value: "₹4,215" },
  { name: "HDFC Bank", allocation: 18, change: -0.3, value: "₹1,678" },
  { name: "Reliance", allocation: 15, change: 1.1, value: "₹2,890" },
  { name: "Infosys", allocation: 12, change: 3.2, value: "₹1,567" },
  { name: "ICICI Bank", allocation: 10, change: 0.8, value: "₹1,245" },
  { name: "Others", allocation: 23, change: 0.5, value: "₹3,102" },
];

const STATS = [
  { value: "5", label: "AI Features", icon: Sparkles },
  { value: "3", label: "Languages", icon: Globe },
  { value: "35+", label: "Articles Indexed", icon: Activity },
  { value: "<8s", label: "Briefing Time", icon: Clock },
];

/* ─── Animation Variants ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

/* ─── Heatmap Color Helper ─── */
function getHeatmapColor(change: number): string {
  if (change > 2) return 'bg-emerald-500 text-white';
  if (change > 1) return 'bg-emerald-400/80 text-white';
  if (change > 0) return 'bg-emerald-300/60 text-emerald-900';
  if (change > -1) return 'bg-red-300/60 text-red-900';
  if (change > -2) return 'bg-red-400/80 text-white';
  return 'bg-red-500 text-white';
}

function getHeatmapDarkColor(change: number): string {
  if (change > 2) return 'bg-emerald-600';
  if (change > 1) return 'bg-emerald-700/80';
  if (change > 0) return 'bg-emerald-800/50';
  if (change > -1) return 'bg-red-800/50';
  if (change > -2) return 'bg-red-700/80';
  return 'bg-red-600';
}

/* ─── Component ─── */
export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (searchQuery) {
    return <BriefingLayout initialQuery={searchQuery} />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">

      {/* Market Ticker */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="flex animate-[ticker_30s_linear_infinite] whitespace-nowrap py-2 px-4">
          {[...MARKET_INDICES, ...MARKET_INDICES].map((index, i) => (
            <div key={i} className="flex items-center gap-3 mx-6 shrink-0">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">{index.name}</span>
              <span className="text-xs font-mono font-medium">{index.value}</span>
              <span className={`flex items-center text-[11px] font-semibold ${index.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                {index.positive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {index.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4">
        <div className="absolute inset-0 gradient-mesh" />
        
        <motion.div 
          className="max-w-4xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-xs font-semibold mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[var(--text-muted)]">AI-Powered Financial Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight mb-4 leading-[1.1]">
            <span className="gradient-text">Pulse Protocol</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl font-serif italic text-[var(--text-secondary)] mb-3">
            Your AI Newsroom for the Markets
          </p>

          <p className="text-sm md:text-base text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed mb-10">
            Ask anything about markets, policies, or companies. Get structured, 
            citation-backed briefings personalized to your role.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-6">
            <SearchBar onSubmit={handleSearch} isSearching={false} />
          </div>

          {/* Trending */}
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <span className="text-[var(--text-faint)] text-xs font-medium py-1.5">Trending:</span>
            {TRENDING_QUERIES.map((query) => (
              <motion.button
                key={query}
                onClick={() => handleSearch(query)}
                className="px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-et-red hover:border-et-red/30 transition-smooth text-xs font-medium cursor-pointer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {query}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-5xl mx-auto px-4 py-5">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {STATS.map((stat) => (
              <motion.div key={stat.label} variants={itemVariants} className="flex flex-col items-center gap-1.5">
                <stat.icon className="w-4 h-4 text-[var(--text-faint)]" />
                <div className="text-2xl md:text-3xl font-bold gradient-text tracking-tight">{stat.value}</div>
                <div className="text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Market Heatmap + Portfolio */}
      <section className="py-12 px-4 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Sector Heatmap */}
            <motion.div
              className="card p-6"
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
                <span className="text-[10px] font-medium text-[var(--text-faint)] uppercase tracking-wider">Live</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {SECTOR_HEATMAP.map((sector) => (
                  <div
                    key={sector.name}
                    className={`${getHeatmapColor(sector.change)} rounded-lg p-3 text-center cursor-pointer transition-smooth hover:scale-[1.02] ${
                      sector.size === 'large' ? 'col-span-2 row-span-1' : 'col-span-1'
                    }`}
                  >
                    <div className="text-[11px] font-bold leading-tight">{sector.name}</div>
                    <div className="text-[10px] font-mono mt-0.5 opacity-90">
                      {sector.change > 0 ? '+' : ''}{sector.change}%
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-[var(--text-faint)]">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> Bearish</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[var(--surface-elevated)] inline-block border border-[var(--border)]" /> Flat</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Bullish</span>
              </div>
            </motion.div>

            {/* Portfolio Tracker */}
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
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Model portfolio allocation</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">₹14,697</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">+1.42% today</div>
                </div>
              </div>

              {/* Allocation Bar */}
              <div className="flex rounded-full h-3 overflow-hidden mb-4">
                <div className="bg-blue-500" style={{ width: '22%' }} title="TCS" />
                <div className="bg-violet-500" style={{ width: '18%' }} title="HDFC Bank" />
                <div className="bg-amber-500" style={{ width: '15%' }} title="Reliance" />
                <div className="bg-emerald-500" style={{ width: '12%' }} title="Infosys" />
                <div className="bg-rose-500" style={{ width: '10%' }} title="ICICI Bank" />
                <div className="bg-slate-400" style={{ width: '23%' }} title="Others" />
              </div>

              {/* Stock list */}
              <div className="space-y-2">
                {PORTFOLIO_OVERVIEW.map((stock) => (
                  <div key={stock.name} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[var(--surface-hover)] transition-smooth cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[10px] font-bold text-[var(--text-muted)]">
                        {stock.allocation}%
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{stock.name}</div>
                        <div className="text-[10px] text-[var(--text-faint)]">{stock.value}</div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${stock.change > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {stock.change > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {stock.change > 0 ? '+' : ''}{stock.change}%
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3">
              Five AI Features. One Platform.
            </h2>
            <p className="text-[var(--text-muted)] text-sm max-w-lg mx-auto">
              Every feature is interconnected — generate a video from a briefing, track a story from your feed, translate anything into regional languages.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              const CardContent = (
                <motion.div
                  variants={itemVariants}
                  className="group card card-interactive p-6 overflow-hidden relative"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 rounded-2xl`} />
                  
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                      <Icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <h3 className="text-base font-bold mb-1.5 group-hover:text-et-red transition-colors font-sans">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-et-red opacity-0 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-1">
                      {feature.action === 'search' ? 'Search above' : 'Explore'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </motion.div>
              );

              if (feature.href) {
                return <Link key={feature.title} href={feature.href} className="block">{CardContent}</Link>;
              }
              return <div key={feature.title}>{CardContent}</div>;
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-[var(--surface)] border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3">How It Works</h2>
            <p className="text-[var(--text-muted)] text-sm">RAG-powered AI that cites every claim</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { step: "01", title: "Ask", desc: "Type any market question — from Union Budget to IPO analysis", icon: Search },
              { step: "02", title: "Retrieve", desc: "AI searches 35+ indexed ET articles using vector similarity", icon: Zap },
              { step: "03", title: "Synthesize", desc: "LLM generates structured briefing with citations and persona framing", icon: Shield },
            ].map((item) => (
              <motion.div key={item.step} variants={itemVariants} className="text-center">
                <div className="w-14 h-14 rounded-2xl gradient-brand text-white font-bold text-sm flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-faint)] mb-2">Step {item.step}</div>
                <h3 className="font-bold text-lg mb-2 font-sans">{item.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="card p-8 md:p-12 gradient-mesh relative overflow-hidden"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
              Ready to experience AI-powered financial intelligence?
            </h2>
            <p className="text-[var(--text-muted)] text-sm mb-6">
              Set up your personalized profile to get curated news tailored to your expertise.
            </p>
            <Link href="/onboarding">
              <motion.button
                className="px-8 py-3 gradient-brand text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer flex items-center gap-2 mx-auto"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Set Up My Profile
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
