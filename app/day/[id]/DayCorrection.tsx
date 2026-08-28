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
import { sendCommand, announceProgressChanged } from '@/app/progress-command';

const COMPREHENSION_LABEL: Record<string, string> = {
  understood: 'Compris', partial: 'Partiellement', review: 'À revoir',
};

export default function DayCorrection({
  day, solutionHtml, isReview, initial, skillId,
}: {
  day: number; solutionHtml: string; isReview: boolean; initial: DayProgress; skillId?: string;
}) {
  const router = useRouter();
  const [state, setState] = useState(initial.correctionState ?? 'locked');
  const [comprehension, setComprehension] = useState(initial.comprehension ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const revealed = state !== 'locked';

  // Déclarer une tentative est une ACTION : elle enregistre l'essai et ouvre la
  // correction. Le calcul de révision se fait côté serveur, dans le moteur —
  // le client ne compose plus l'état qu'il envoie.
  async function confirmAttempt() {
    setBusy(true); setError(null);
    const a = await sendCommand({ type: 'RECORD_ATTEMPT', day, outcome: 'attempted' });
    if (!a.ok) { setBusy(false); setError(a.error); return; }
    const r = await sendCommand({ type: 'SET_CORRECTION_STATE', day, value: 'viewed' });
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    setState('viewed');
  }

  async function chooseComprehension(value: 'understood' | 'partial' | 'review') {
    setBusy(true); setError(null);
    setComprehension(value);
    const r = await sendCommand({
      type: 'SET_COMPREHENSION', day, value,
      skills: skillId ? [skillId] : [],
    });
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    setState('acknowledged');
    announceProgressChanged();
    router.refresh();
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
            {comprehension && !error && (
              <p className="corr-assess-note">
                {comprehension === 'review' ? 'Ajouté à ta file de révision.' : 'Enregistré — prochaine révision planifiée.'}
              </p>
            )}
            {error && (
              <p className="cmd-error" role="alert"><AlertTriangle size={13} strokeWidth={2} /> {error}</p>
            )}
          </div>
        </details>
      )}
    </section>
  );
}
