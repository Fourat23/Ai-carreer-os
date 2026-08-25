'use client';

// Liste des révisions dues / à venir. « Révision effectuée » recalcule la
// prochaine échéance via le moteur pur (completeReview) et met à jour le statut.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Check, CircleDot, AlertTriangle } from 'lucide-react';
import type { DayProgress } from '@/lib/types';
import { completeReview } from '@/lib/review';
import { EmptyState } from '@/app/ui';

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

// `suppressEmpty` : quand la file est TOTALEMENT vide, la page rend une
// composition d'état vide complète (pourquoi / quand / quoi faire). Afficher en
// plus un « Rien à revoir aujourd'hui » ferait deux blocs pour la même donnée —
// exactement la redondance que la loi de composition interdit.
export default function ReviewList({ due, upcoming, suppressEmpty = false }: { due: DueRow[]; upcoming: UpRow[]; suppressEmpty?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);
  const overdue = due.filter((r) => r.overdueDays > 0).length;

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
      {/* V58 · CP9 — En-tête aligné sur la grammaire de la station (`rev-h` /
          `rev-h-note`) plutôt que sur le `SectionHeader` générique, et libellé
          au vrai nombre : « 6 révision(s) » était la dernière formulation
          parenthésée du produit. */}
      {!(due.length === 0 && suppressEmpty) && (
        <div className="rev-work-head">
          <h2 className="rev-h">À réactiver maintenant</h2>
          <span className="rev-h-note">
            {due.length} journée{due.length > 1 ? 's' : ''}
            {overdue > 0 ? ` · ${overdue} en retard` : ' · aucune en retard'}
          </span>
        </div>
      )}
      {due.length === 0 ? (suppressEmpty ? null : (
        <EmptyState
          title="Rien à revoir aujourd'hui."
          hint={upcoming.length ? `Ta prochaine révision arrive bientôt (voir « À venir »).` : 'Les journées marquées « à revoir » apparaîtront ici à échéance.'}
        />
      )) : (
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
              {/* V58 · CP9 — La conséquence de chaque réponse est affichée AU
                  MOMENT du choix. L'intervalle vient de `completeReview()`, le
                  moteur qui replanifiera réellement l'échéance au clic : c'est
                  la même fonction, appelée en lecture. Aucune valeur recopiée,
                  aucune seconde source de vérité. */}
              <div className="rev-actions" role="group" aria-label={`Résultat de la révision du jour ${r.day}`}>
                {RESULTS.map(({ key, label, Icon, status }) => {
                  const next = completeReview(r.review ?? null, key, new Date()).interval;
                  return (
                    <button key={key} className={`btn small rev-${key}`} disabled={busy === r.day}
                      onClick={() => complete(r, key, status)}
                      title={`${label} — prochaine échéance dans ${next} j`}
                      aria-label={`${label} — prochaine échéance dans ${next} jours`}>
                      <Icon size={14} strokeWidth={2} />
                      <span className="rev-btn-txt">{label}</span>
                      <span className="rev-btn-next" aria-hidden="true">+{next} j</span>
                    </button>
                  );
                })}
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
