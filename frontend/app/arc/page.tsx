"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Video, Bookmark, BookmarkCheck, Clock, Users, TrendingUp, 
  AlertTriangle, Brain, ChevronDown, Loader2, ExternalLink,
  BarChart3, Activity, Eye, Sparkles, ArrowRight, Shield, X
} from "lucide-react";
import StorySelector from "../../components/StorySelector";
import Timeline from "../../components/Timeline";
import EventDrawer from "../../components/EventDrawer";
import KeyPlayers from "../../components/KeyPlayers";
import SentimentChart from "../../components/SentimentChart";
import Predictions from "../../components/Predictions";
import ContrarianView from "../../components/ContrarianView";
import AuditPanel from "../../components/AuditPanel";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ArcData {
  topic: string;
  query: string;
  generation_time_seconds: number;
  timeline: any[];
  players: any[];
  sentiment_series: any[];
  predictions: any[];
  contrarian: any;
}

const AGENT_STEPS = [
  { name: "Timeline", icon: Clock, color: "text-blue-500" },
  { name: "Players", icon: Users, color: "text-violet-500" },
  { name: "Sentiment", icon: TrendingUp, color: "text-emerald-500" },
  { name: "Predictions", icon: Sparkles, color: "text-amber-500" },
  { name: "Contrarian", icon: Brain, color: "text-rose-500" },
];

export default function StoryArcPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [arcData, setArcData] = useState<ArcData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [error, setError] = useState("");
  const [isTracked, setIsTracked] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'analysis'>('overview');

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      const tracked = JSON.parse(localStorage.getItem('et_tracked_stories') || '[]');
      setIsTracked(tracked.includes(selectedTopic));
    }
  }, [selectedTopic]);

  const fetchTopics = async () => {
    try {
      const res = await fetch(`${API_URL}/api/topics`);
      const data = await res.json();
      setTopics(data.topics || []);
      if (data.topics?.length > 0) {
        const firstTopic = data.topics[0].id;
        setSelectedTopic(firstTopic);
        fetchArc(firstTopic);
      }
    } catch {
      setError("Failed to load topics. Is the backend running?");
    }
  };

  const fetchArc = async (topicId: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/arc/${topicId}`);
      const data = await res.json();
      setArcData(data);
    } catch {
      setError("Failed to load Story Arc data. Please try again.");
    }
    setLoading(false);
  };

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    setActiveTab('overview');
    fetchArc(topicId);
  };

  const handleTrackStory = () => {
    const tracked = JSON.parse(localStorage.getItem('et_tracked_stories') || '[]');
    if (!tracked.includes(selectedTopic)) {
      tracked.push(selectedTopic);
      localStorage.setItem('et_tracked_stories', JSON.stringify(tracked));
      setIsTracked(true);
    } else {
      const updated = tracked.filter((t: string) => t !== selectedTopic);
      localStorage.setItem('et_tracked_stories', JSON.stringify(updated));
      setIsTracked(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold">Story Arc Tracker</h1>
                <p className="text-xs text-[var(--text-muted)]">
                  Narrative intelligence — timeline, entity network, sentiment, and predictions
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              onClick={handleTrackStory}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-smooth cursor-pointer ${
                isTracked
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--text-faint)]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isTracked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              {isTracked ? 'Tracking' : 'Track Story'}
            </motion.button>

            <a
              href="/video"
              className="inline-flex items-center gap-1.5 px-4 py-2 gradient-brand text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow-md transition-smooth cursor-pointer"
            >
              <Video className="w-3.5 h-3.5" />
              Generate Video
            </a>

            <button
              onClick={() => setAuditOpen(!auditOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] text-xs font-medium rounded-xl hover:border-[var(--text-faint)] transition-smooth cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              Audit
            </button>
          </div>
        </div>
      </div>

      {/* Topic Selector */}
      <StorySelector
        topics={topics}
        selectedTopic={selectedTopic}
        onSelect={handleTopicSelect}
        loading={loading}
      />

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
            <button onClick={() => setError("")} className="p-1 hover:bg-red-100 rounded-lg transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State — Multi-Agent Progress */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-12"
        >
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <Loader2 className="w-8 h-8 animate-spin text-et-red mx-auto mb-3" />
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                Running 5 AI agents in parallel
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                This may take 15-30 seconds on first load
              </p>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {AGENT_STEPS.map((agent, i) => (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="card p-3 text-center"
                >
                  <agent.icon className={`w-5 h-5 mx-auto mb-2 ${agent.color}`} />
                  <div className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden mb-1.5">
                    <motion.div
                      className="h-full gradient-brand rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ duration: 2 + i * 0.5, ease: "easeInOut" }}
                    />
                  </div>
                  <div className="text-[10px] font-medium text-[var(--text-muted)]">{agent.name}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Arc Content */}
      {!loading && arcData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Meta Bar */}
          <div className="flex items-center justify-between">
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-[var(--bg-secondary)] p-1 rounded-xl">
              {[
                { id: 'overview' as const, label: 'Overview', icon: Eye },
                { id: 'timeline' as const, label: 'Timeline', icon: Clock },
                { id: 'analysis' as const, label: 'Deep Analysis', icon: Brain },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-smooth cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs text-[var(--text-faint)]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {arcData.generation_time_seconds}s
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {arcData.timeline?.length || 0} events
              </span>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold text-[var(--text-muted)]">Timeline Events</span>
                  </div>
                  <div className="text-2xl font-bold">{arcData.timeline?.length || 0}</div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-violet-500" />
                    <span className="text-xs font-semibold text-[var(--text-muted)]">Key Players</span>
                  </div>
                  <div className="text-2xl font-bold">{arcData.players?.length || 0}</div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-semibold text-[var(--text-muted)]">Predictions</span>
                  </div>
                  <div className="text-2xl font-bold">{arcData.predictions?.length || 0}</div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-semibold text-[var(--text-muted)]">Analysis Depth</span>
                  </div>
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-[10px] text-[var(--text-faint)]">agents used</div>
                </div>
              </div>

              {/* Timeline */}
              <Timeline
                events={arcData.timeline}
                onEventClick={(event) => setSelectedEvent(event)}
              />

              {/* Key Players + Sentiment */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <KeyPlayers players={arcData.players} />
                <SentimentChart data={arcData.sentiment_series} />
              </div>
            </motion.div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Timeline
                events={arcData.timeline}
                onEventClick={(event) => setSelectedEvent(event)}
              />
              <KeyPlayers players={arcData.players} />
            </motion.div>
          )}

          {/* Deep Analysis Tab */}
          {activeTab === 'analysis' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <SentimentChart data={arcData.sentiment_series} />
              <Predictions predictions={arcData.predictions} />
              <ContrarianView data={arcData.contrarian} />
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Event Drawer */}
      <EventDrawer
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      {/* Audit Panel */}
      <AuditPanel isOpen={auditOpen} onToggle={() => setAuditOpen(!auditOpen)} />
    </div>
  );
}
