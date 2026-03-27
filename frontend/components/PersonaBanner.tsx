"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PersonaBanner() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("et_user_profile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  if (!profile) return null;

  return (
    <div className="bg-et-gray-light border-b border-[var(--border)] px-4 py-2 flex justify-between items-center text-sm">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-[var(--text-primary)]">Active Profile:</span>
        <span className="text-[var(--text-secondary)] bg-[var(--surface)] px-2 py-0.5 rounded shadow-sm border border-[var(--border)]">
          {profile.role} ({profile.expertise_level})
        </span>
      </div>
      <Link href="/onboarding" className="text-et-red hover:underline font-medium">
        Update Preferences
      </Link>
    </div>
  );
}
