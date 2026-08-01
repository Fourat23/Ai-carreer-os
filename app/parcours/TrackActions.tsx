'use client';

// Activation / bascule d'un parcours disponible. Les parcours annoncés sont non
// cliquables. La bascule est CONFIRMÉE en deux temps (accessible, aria-live) : la
// progression de chaque parcours est conservée par le store v3, jamais écrasée.
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Check, Play } from 'lucide-react';

export default function TrackActions({ trackId, active, available, hasActiveOther }: { trackId: string; active: boolean; available: boolean; hasActiveOther?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [err, setErr] = useState('');

  if (active) return <span className="track-badge active"><Check size={14} strokeWidth={2} /> Parcours actif</span>;
  if (!available) return <span className="track-badge soon">Bientôt disponible</span>;

  async function activate() {
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trackId }) });
      if (res.ok) { window.dispatchEvent(new CustomEvent('progress-changed')); router.refresh(); }
      else { const j = await res.json().catch(() => ({})); setErr(j.error ?? 'Échec.'); setConfirming(false); }
    } finally { setBusy(false); }
  }

  // Bascule depuis un autre parcours actif → confirmation en deux temps.
  if (hasActiveOther && confirming) {
    return (
      <span className="track-confirm" role="alertdialog" aria-live="polite" aria-label="Confirmer la bascule de parcours">
        <span className="track-confirm-msg">Basculer vers ce parcours ? Ta progression actuelle est conservée.</span>
        <button className="btn small primary" onClick={activate} disabled={busy}>Confirmer</button>
        <button className="btn small ghost" onClick={() => setConfirming(false)} disabled={busy}>Annuler</button>
      </span>
    );
  }

  const label = hasActiveOther ? 'Basculer vers ce parcours' : 'Activer ce parcours';
  return (
    <span>
      <button className="btn small primary" onClick={() => (hasActiveOther ? setConfirming(true) : activate())} disabled={busy}>
        <Play size={14} strokeWidth={2} /> {label}
      </button>
      {err && <span className="track-err" role="status">{err}</span>}
    </span>
  );
}
