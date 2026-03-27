"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Compass, Newspaper, BarChart3, Video, Globe,
  ArrowRight, Search,
  Zap, Shield, Clock, ChevronRight, Sparkles, Activity,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import BriefingLayout from '../components/BriefingLayout';
import StockCarousel from '../components/StockCarousel';
import MarketHeatmap from '../components/MarketHeatmap';
import PortfolioTracker from '../components/PortfolioTracker';
import { NewsArticle, fetchMarketNews, formatNewsDate } from '../lib/newsService';

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


/* ─── Component ─── */
export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  // Fetch live news
  useEffect(() => {
    async function loadNews() {
      setNewsLoading(true);
      const articles = await fetchMarketNews();
      setNews(articles.slice(0, 6)); // Take top 6 articles
      setNewsLoading(false);
    }
    loadNews();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const refreshNews = async () => {
    setNewsLoading(true);
    const articles = await fetchMarketNews();
    setNews(articles.slice(0, 6));
    setNewsLoading(false);
  };

  if (searchQuery) {
    return <BriefingLayout initialQuery={searchQuery} />;
  }

  // Calculate portfolio totals


  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">

      {/* Enhanced Stock Ticker Carousel */}
      <StockCarousel />

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

      {/* Live News Section */}
      <section className="py-10 px-4 bg-[var(--bg-primary)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-serif font-bold">Live Market News</h2>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                Live
              </span>
            </div>
            <button
              onClick={refreshNews}
              className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-et-red transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${newsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {newsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-4 bg-[var(--surface-hover)] rounded w-1/4 mb-3" />
                  <div className="h-5 bg-[var(--surface-hover)] rounded w-full mb-2" />
                  <div className="h-5 bg-[var(--surface-hover)] rounded w-3/4 mb-3" />
                  <div className="h-3 bg-[var(--surface-hover)] rounded w-full mb-1" />
                  <div className="h-3 bg-[var(--surface-hover)] rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)]">
              <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Unable to load news. Please try again later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {news.map((article, i) => (
                <motion.a
                  key={article.article_id || i}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card p-4 group cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-et-red bg-et-red/5 px-2 py-0.5 rounded">
                      {article.category?.[0] || 'Business'}
                    </span>
                    <span className="text-[10px] text-[var(--text-faint)]">
                      {formatNewsDate(article.pubDate)}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold leading-snug mb-2 line-clamp-2 group-hover:text-et-red transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-3">
                    {article.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[var(--text-faint)]">
                      {article.source_name || 'News Source'}
                    </span>
                    <ExternalLink className="w-3 h-3 text-[var(--text-faint)] group-hover:text-et-red transition-colors" />
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Market Heatmap + Portfolio */}
      <section className="py-12 px-4 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Enhanced Sector Heatmap */}
            <MarketHeatmap />

            {/* Enhanced Portfolio Tracker */}
            <PortfolioTracker />

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
