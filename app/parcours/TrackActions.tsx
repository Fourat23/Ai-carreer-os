'use client';

// Activation d'un parcours disponible. Les parcours annoncés sont non cliquables.
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Check, Play } from 'lucide-react';

export default function TrackActions({ trackId, active, available }: { trackId: string; active: boolean; available: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  if (active) return <span className="track-badge active"><Check size={14} strokeWidth={2} /> Parcours actif</span>;
  if (!available) return <span className="track-badge soon">Bientôt disponible</span>;

  async function activate() {
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trackId }) });
      if (res.ok) { window.dispatchEvent(new CustomEvent('progress-changed')); router.refresh(); }
      else { const j = await res.json().catch(() => ({})); setErr(j.error ?? 'Échec.'); }
    } finally { setBusy(false); }
  }

  return (
    <span>
      <button className="btn small primary" onClick={activate} disabled={busy}><Play size={14} strokeWidth={2} /> Activer ce parcours</button>
      {err && <span className="track-err">{err}</span>}
    </span>
  );
}
