"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  
  const [role, setRole] = useState("");
  const [expertise, setExpertise] = useState("intermediate");
  const [interests, setInterests] = useState<string[]>([]);
  
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const toggleInterest = (topic: string) => {
    setInterests(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleFinish = () => {
    setIsSaving(true);
    
    // Default fallback if skipped
    const finalRole = role || "General Reader";
    const finalInterests = interests.length > 0 ? interests : ["markets", "economy"];
    
    const profile = {
      role: finalRole,
      expertise_level: expertise,
      interests: finalInterests,
      created_at: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem("et_user_profile", JSON.stringify(profile));
    
    // Redirect to feed
    setTimeout(() => {
      router.push('/feed');
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 animate-in fade-in duration-700">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-et-ink mb-4">Set up My ET</h1>
        <p className="text-lg text-et-ink-light">Tell us what you care about so we can personalize your intelligence feed.</p>
      </div>

      <div className="bg-white border border-et-gray-border rounded-xl shadow-lg p-8 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-et-gray-light">
          <div 
            className="h-full bg-et-red transition-all duration-500 ease-out" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Step 1: Role */}
        {step === 1 && (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl font-bold mb-6">What describes you best?</h2>
            <div className="space-y-3">
              {['Startup Founder', 'Retail Investor', 'Mutual Fund Manager', 'Student', 'Corporate Executive'].map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    role === r ? 'border-et-red bg-et-red/5' : 'border-et-gray-light hover:border-et-gray-border'
                  }`}
                >
                  <div className="font-semibold text-et-ink">{r}</div>
                </button>
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setStep(2)}
                disabled={!role}
                className="px-8 py-3 bg-et-ink text-white rounded-full font-medium hover:bg-et-ink-light disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl font-bold mb-6">Which topics are you tracking?</h2>
            <div className="flex flex-wrap gap-3">
              {['Quick Commerce', 'Union Budget 2026', 'RBI Policy', 'SEBI Regulations', 'EVs', 'AI', 'Banking', 'Small-caps'].map(topic => (
                <button
                  key={topic}
                  onClick={() => toggleInterest(topic)}
                  className={`px-5 py-3 rounded-full border-2 transition-all font-medium ${
                    interests.includes(topic) 
                      ? 'border-et-red bg-et-red text-white' 
                      : 'border-et-gray-border text-et-ink-light hover:border-et-ink hover:text-et-ink'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
            <div className="mt-12 flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-3 font-medium text-et-ink-light hover:text-et-ink">Back</button>
              <button 
                onClick={() => setStep(3)}
                disabled={interests.length === 0}
                className="px-8 py-3 bg-et-ink text-white rounded-full font-medium hover:bg-et-ink-light disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Expertise */}
        {step === 3 && (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl font-bold mb-6">How deep should we go?</h2>
            <div className="space-y-4">
              {[
                { id: 'beginner', label: 'Explain it simply', desc: 'Focus on the basics and big picture.' },
                { id: 'intermediate', label: 'Standard News', desc: 'Standard business reporting.' },
                { id: 'expert', label: 'Deep Dive', desc: 'Financial jargon, deep analysis, and metrics.' }
              ].map(level => (
                <button
                  key={level.id}
                  onClick={() => setExpertise(level.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    expertise === level.id ? 'border-et-red bg-et-red/5' : 'border-et-gray-light hover:border-et-gray-border'
                  }`}
                >
                  <div className="font-bold text-et-ink mb-1">{level.label}</div>
                  <div className="text-sm text-et-ink-light">{level.desc}</div>
                </button>
              ))}
            </div>
            <div className="mt-8 flex justify-between items-center">
              <button onClick={() => setStep(2)} className="px-6 py-3 font-medium text-et-ink-light hover:text-et-ink">Back</button>
              <button 
                onClick={handleFinish}
                disabled={isSaving}
                className="px-8 py-3 bg-et-red text-white flex items-center justify-center min-w-[140px] rounded-full font-bold hover:bg-et-red-hover transition-colors"
              >
                {isSaving ? 'Saving...' : 'Finish Setup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
