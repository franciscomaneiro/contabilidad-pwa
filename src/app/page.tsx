'use client';

import React, { useState, useEffect } from 'react';
import { isSessionValid, clearAuthSession } from '@/lib/auth';
import { PinScreen } from '@/components/PinScreen';
import { Dashboard } from '@/components/Dashboard';

export default function Home() {
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if session exists and is still valid
    const valid = isSessionValid();
    setIsUnlocked(valid);
  }, []);

  // Avoid flash of pin screen while checking localStorage
  if (isUnlocked === null) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F0B90B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isUnlocked) {
    return <PinScreen onSuccess={() => setIsUnlocked(true)} />;
  }

  return (
    <Dashboard
      onLock={() => {
        clearAuthSession();
        setIsUnlocked(false);
      }}
    />
  );
}
