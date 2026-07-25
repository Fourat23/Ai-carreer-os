'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Play } from 'lucide-react';

export default function StartDayButton({ day, label }: { day: number; label?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'day', payload: { day, patch: { status: 'in-progress' } } }),
    });
    router.push(`/day/${day}`);
  }

  return (
    <button className="btn primary big" onClick={start} disabled={loading}>
      <Play size={15} strokeWidth={2.2} />
      {loading ? 'Ouverture…' : (label ?? 'Commencer la journée')}
    </button>
  );
}
