import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in duration-500">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
      
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 md:p-12 shadow-sm">
        <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-6">Privacy Policy</h1>
        <p className="text-[var(--text-muted)] mb-8 shadow-sm text-sm">Last updated: March 2026</p>
        
        <div className="space-y-8 text-[var(--text-secondary)] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">1. Information We Collect</h2>
            <p>During the onboarding process, ET Pulse requests your professional demographic (Role, Expertise) and News Interests. We store these explicitly in your browser's Local Storage architecture as `et_user_profile`. We do not require account creation, emails, or personal identification on the basic tier.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">2. How We Use Your Data</h2>
            <p>Your tracking preferences are transmitted to our Backend APIs explicitly to seed our LLM curation models (e.g. LLaMA via Groq API) or NewsData.io standard HTTP requests. This filters the specific, personalized financial feed. The backend tracks your reading history internally solely to render your `Story Arc` feature.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">3. External Cloud Services</h2>
            <p>Your search queries and briefing profiles are securely processed via the Groq language model cloud. We do not use your distinct query inputs to train standard intelligence baseline models.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">4. Cookies and Security</h2>
            <p>Our platform uses essential Local Storage techniques to maintain session persistence. At any time, clearing your browser application data completely removes your ET Pulse operational footprint locally.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
