import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in duration-500">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
      
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 md:p-12 shadow-sm">
        <h1 className="text-3xl font-serif font-bold text-[var(--text-primary)] mb-6">Terms of Service</h1>
        <p className="text-[var(--text-muted)] mb-8 shadow-sm text-sm">Last updated: March 2026</p>
        
        <div className="space-y-8 text-[var(--text-secondary)] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">1. Background</h2>
            <p>Welcome to ET Pulse. By accessing or using our AI-driven financial intelligence platform, you agree to be bound by these Terms of Service. ET Pulse is a prototype application curating news and financial data.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">2. AI-Generated Content</h2>
            <p>ET Pulse utilizes advanced large language models (LLMs) to summarize and analyze market news. While we strive to anchor AI generations to verified news data, AI outputs may occasionally hallucinate or misinterpret financial information. You agree to use the briefings and insights for informational purposes only, and not as professional financial advice.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">3. Data Usage & APIs</h2>
            <p>Our news data is securely fetched from third-party APIs including NewsData.io. Any disruptions to our downstream APIs may cause platform outages, in which case ET Pulse will strategically fallback to locally cached vector data (ChromaDB). We are not liable for gaps in real-time reporting during these failover events.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">4. Limitation of Liability</h2>
            <p>Under no circumstances shall ET Pulse, its developers or partners be liable for any trading losses incurred as a result of using this platform. Financial markets are inherently risky.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
