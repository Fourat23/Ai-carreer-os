'use client';

// Correction comme workflow pédagogique (pas un panneau ouvert par défaut) :
// verrou souple → confirmation « j'ai tenté » → lecture → auto-évaluation de
// compréhension (Compris / Partiel / À revoir) qui alimente la révision espacée.
// La réponse de l'utilisateur reste visible au-dessus ; le contenu de correction
// n'est jamais copié dans les données utilisateur.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ClipboardCheck, Check, CircleDot, AlertTriangle } from 'lucide-react';
import type { DayProgress } from '@/lib/types';
import { recordAttempt, setCorrectionState } from '@/lib/learning';
import { updateReviewSchedule } from '@/lib/review';

async function patchDay(day: number, patch: Partial<DayProgress>) {
  const res = await fetch('/api/progress', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'day', payload: { day, patch } }),
  });
  if (!res.ok) throw new Error('save failed');
}

const COMPREHENSION_LABEL: Record<string, string> = {
  understood: 'Compris', partial: 'Partiellement', review: 'À revoir',
};

export default function DayCorrection({
  day, solutionHtml, isReview, initial,
}: {
  day: number; solutionHtml: string; isReview: boolean; initial: DayProgress;
}) {
  const router = useRouter();
  const [state, setState] = useState(initial.correctionState ?? 'locked');
  const [comprehension, setComprehension] = useState(initial.comprehension ?? null);
  const [busy, setBusy] = useState(false);
  const revealed = state !== 'locked';

  async function confirmAttempt() {
    setBusy(true);
    const next = recordAttempt(setCorrectionState(initial, 'viewed'), { at: new Date().toISOString(), outcome: 'attempted' });
    try { await patchDay(day, { correctionState: 'viewed', attempts: next.attempts }); setState('viewed'); }
    finally { setBusy(false); }
  }

  async function chooseComprehension(value: 'understood' | 'partial' | 'review') {
    setBusy(true);
    setComprehension(value);
    const review = updateReviewSchedule(initial.review ?? null, {
      comprehension: value, confidence: initial.selfAssessment?.confidence ?? null, now: new Date(),
    });
    const patch: Partial<DayProgress> = { comprehension: value, correctionState: 'acknowledged', review };
    if (value === 'review') patch.status = 'to-review';
    try {
      await patchDay(day, patch);
      setState('acknowledged');
      window.dispatchEvent(new CustomEvent('progress-changed'));
      router.refresh();
    } finally { setBusy(false); }
  }

  const title = isReview ? "Grille d'évaluation" : 'Correction';

  return (
    <section className="day-corr" aria-label={title}>
      {!revealed ? (
        <div className="corr-lock">
          <div className="corr-lock-head"><Lock size={16} strokeWidth={2} /> {title} verrouillée</div>
          <p className="muted">
            {isReview
              ? "Auto-évalue-toi d'abord, puis confirme pour comparer à la grille."
              : "Rédige d'abord ta réponse ci-dessus. La correction reste plus utile après une vraie tentative."}
          </p>
          <button className="btn primary" onClick={confirmAttempt} disabled={busy}>
            <ClipboardCheck size={15} strokeWidth={2} /> J'ai vraiment tenté — afficher {isReview ? 'la grille' : 'la correction'}
          </button>
        </div>
      ) : (
        <details className="solution" open>
          <summary><ClipboardCheck size={15} strokeWidth={2} /> {title}</summary>
          <div className="prose" style={{ borderRadius: '0 0 8px 8px', borderTop: 'none' }}
               dangerouslySetInnerHTML={{ __html: solutionHtml }} />
          <div className="corr-assess" role="group" aria-label="Où en es-tu après lecture ?">
            <span className="corr-assess-q">Après comparaison avec ta réponse :</span>
            <div className="corr-assess-btns">
              {(['understood', 'partial', 'review'] as const).map((v) => {
                const Icon = v === 'understood' ? Check : v === 'partial' ? CircleDot : AlertTriangle;
                return (
                  <button key={v} className={`btn small corr-${v}${comprehension === v ? ' active' : ''}`}
                    aria-pressed={comprehension === v} disabled={busy}
                    onClick={() => chooseComprehension(v)}>
                    <Icon size={14} strokeWidth={2} /> {COMPREHENSION_LABEL[v]}
                  </button>
                );
              })}
            </div>
            {comprehension && (
              <p className="corr-assess-note">
                {comprehension === 'review' ? 'Ajouté à ta file de révision.' : 'Enregistré — prochaine révision planifiée.'}
              </p>
            )}
          </div>
        </details>
      )}
    </section>
  );
}
