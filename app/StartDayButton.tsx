'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function StartDayButton({ day }: { day: number }) {
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
    <button className="btn primary" onClick={start} disabled={loading}>
      {loading ? '…' : '▶ Commencer la journée'}
    </button>
  );
}
