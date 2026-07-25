'use client';

// Liste des révisions dues / à venir. « Révision effectuée » recalcule la
// prochaine échéance via le moteur pur (completeReview) et met à jour le statut.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Check, CircleDot, AlertTriangle } from 'lucide-react';
import type { DayProgress } from '@/lib/types';
import { completeReview } from '@/lib/review';

type DueRow = { day: number; title: string; reason: string; overdueDays: number; review: DayProgress['review'] };
type UpRow = { day: number; title: string; reason: string; inDays: number };

async function patchDay(day: number, patch: Partial<DayProgress>) {
  const res = await fetch('/api/progress', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'day', payload: { day, patch } }),
  });
  if (!res.ok) throw new Error('save failed');
}

const RESULTS = [
  { key: 'hard', label: 'Toujours difficile', Icon: AlertTriangle, status: 'to-review' as const },
  { key: 'partial', label: 'Partiellement acquis', Icon: CircleDot, status: 'to-review' as const },
  { key: 'good', label: 'Acquis', Icon: Check, status: 'done' as const },
];

export default function ReviewList({ due, upcoming }: { due: DueRow[]; upcoming: UpRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);

  async function complete(row: DueRow, result: string, status: 'to-review' | 'done') {
    setBusy(row.day);
    const review = completeReview(row.review ?? null, result, new Date());
    try {
      await patchDay(row.day, { review, status });
      window.dispatchEvent(new CustomEvent('progress-changed'));
      router.refresh();
    } finally { setBusy(null); }
  }

  return (
    <>
      <div className="section-head">
        <span className="section-label">À revoir</span>
        <h2 className="section-title">Aujourd'hui &amp; en retard</h2>
        <span className="section-note">{due.length} révision(s)</span>
      </div>
      {due.length === 0 ? (
        <div className="empty">Rien à revoir aujourd'hui. Reviens quand une révision arrive à échéance.</div>
      ) : (
        <div className="rev-list">
          {due.map((r) => (
            <div className="rev-row" key={r.day}>
              <div className="rev-main">
                <Link className="rev-title" href={`/day/${r.day}`}>Jour {r.day} — {r.title}</Link>
                <div className="rev-meta">
                  <span className="rev-reason">{r.reason || 'À revoir'}</span>
                  {r.overdueDays > 0 && <span className="rev-late">{r.overdueDays} j de retard</span>}
                </div>
              </div>
              <div className="rev-actions" role="group" aria-label={`Résultat de la révision du jour ${r.day}`}>
                {RESULTS.map(({ key, label, Icon, status }) => (
                  <button key={key} className={`btn small rev-${key}`} disabled={busy === r.day}
                    onClick={() => complete(r, key, status)} title={label} aria-label={label}>
                    <Icon size={14} strokeWidth={2} /> <span className="rev-btn-txt">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {upcoming.length > 0 && (
        <>
          <div className="section-head" style={{ marginTop: 'var(--sp-8)' }}>
            <span className="section-label">À venir</span>
            <h2 className="section-title">Prochaines révisions</h2>
          </div>
          <div className="day-list">
            {upcoming.map((r) => (
              <Link key={r.day} href={`/day/${r.day}`} className="dl-row">
                <span><span className="dl-num">J{r.day}</span>{r.title}</span>
                <span className="muted" style={{ fontSize: 'var(--fs-xs)' }}>dans {r.inDays} j</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
