"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FeedPage() {
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [feed, setFeed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Get profile from local storage
    const saved = localStorage.getItem("et_user_profile");
    if (!saved) {
      router.push("/onboarding");
      return;
    }
    
    const parsedObj = JSON.parse(saved);
    setProfile(parsedObj);
    
    // 2. Fetch personalized feed
    const fetchFeed = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/feed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsedObj),
        });
        
        if (!res.ok) throw new Error("Failed to load feed");
        
        const data = await res.json();
        setFeed(data.feed || []);
      } catch (err) {
        console.error(err);
        setError("Unable to generate your feed right now.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFeed();
  }, [router]);

  if (!profile) return null; // Redirecting

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Persona Banner Header */}
      <div className="bg-et-ink text-white p-6 rounded-xl mb-8 flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-2xl font-serif tracking-tight font-bold mb-1">My ET Feed</h1>
          <p className="opacity-80 text-sm">Curated for a {profile.expertise_level} {profile.role}</p>
        </div>
        <div className="hidden sm:flex gap-2">
          {profile.interests.map((topic: string) => (
            <span key={topic} className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-semibold">
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-6 flex flex-col items-center">
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center opacity-60">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-et-red mb-4"></div>
             <p className="font-medium animate-pulse">Running {profile.role} curation models...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-et-red/10 border border-et-red/20 text-et-red rounded-lg w-full">
            {error}
          </div>
        )}

        {!isLoading && !error && feed.length === 0 && (
          <div className="p-8 text-center bg-white border border-et-gray-border rounded-xl w-full">
            <h3 className="text-xl font-bold mb-2">No relevant stories found yet</h3>
            <p className="text-et-ink-light mb-4">We are still collecting data for your hyper-specific interests.</p>
            <Link href="/onboarding" className="text-et-red font-medium hover:underline">
              Adjust your preferences
            </Link>
          </div>
        )}

        {!isLoading && feed.length > 0 && feed.map((story, i) => {
          const displayDate = story.date ? new Date(story.date).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
          }) : 'Today';
          
          return (
            <div key={i} className="bg-white border text-left border-et-gray-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow w-full">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-et-red bg-et-red/5 px-2 py-1 rounded">
                  {story.topic || 'News'}
                </span>
                <span className="text-xs font-medium text-et-ink-light">{displayDate}</span>
              </div>
              
              <h2 className="text-2xl font-bold leading-tight mb-4 group-hover:text-et-red transition-colors">
                <a href={story.url} target="_blank" rel="noopener noreferrer">{story.title}</a>
              </h2>
              
              <div className="bg-gradient-to-r from-et-gray-light/40 to-transparent p-4 rounded-lg border-l-4 border-et-gold mb-5">
                 <p className="text-sm font-semibold text-et-gold mb-1 uppercase tracking-wide">Why it matters for you</p>
                 <p className="text-et-ink-light leading-relaxed">{story.ai_summary}</p>
              </div>

              <div className="flex justify-between items-center border-t border-et-gray-light pt-4 mt-2">
                 <span className="text-xs text-et-ink-light opacity-80">Curated by Claude 3 Haiku</span>
                 <a href={story.url} target="_blank" rel="noopener noreferrer" className="px-5 py-2 bg-et-red text-white text-sm font-medium rounded-full hover:bg-et-red-hover transition-colors">
                   Read Full Story
                 </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
