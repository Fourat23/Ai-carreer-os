'use client';

// Panneau interactif de la vue Jour : workflow de progression (statut), auto-
// évaluation, checklist, « ma réponse », notes. Persiste via l'API (data/progress.json).
// Un seul modèle de statut, partagé avec le Dashboard et le calendrier.

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Check, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';
import type { DayProgress, DayStatus } from '@/lib/types';
import { nextStatusFor } from '@/lib/resume';

async function save(day: number, patch: Partial<DayProgress>) {
  await fetch('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'day', payload: { day, patch } }),
  });
}

const STATUS_LABEL: Record<DayStatus, string> = {
  'not-started': 'Non commencée', 'in-progress': 'En cours', 'done': 'Terminée', 'to-review': 'À revoir',
};

export default function DayPanel({
  day, initial, checklist,
}: {
  day: number;
  initial: DayProgress;
  checklist: string[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<DayStatus>(initial.status);
  const [selfScore, setSelfScore] = useState<number | null>(initial.selfScore);
  const [answer, setAnswer] = useState(initial.answer);
  const [notes, setNotes] = useState(initial.notes);
  const [checks, setChecks] = useState<Record<string, boolean>>(initial.checklist ?? {});
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    setSaved('saving');
    timer.current = setTimeout(async () => {
      await save(day, { answer, notes });
      setSaved('saved');
    }, 700);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer, notes]);

  // Change de statut, persiste, puis rafraîchit les composants serveur (header,
  // et au retour : dashboard/calendrier/trajectoire lisent le même fichier).
  async function setStatusAction(action: 'start' | 'complete' | 'reopen' | 'review') {
    if (action === 'reopen' && !confirm('Rouvrir cette journée ? Son statut repassera à « en cours ». Tes réponses et notes sont conservées.')) return;
    const next = nextStatusFor(action, status);
    setStatus(next);
    setSaved('saving');
    await save(day, { status: next });
    setSaved('saved');
    window.dispatchEvent(new CustomEvent('progress-changed'));
    router.refresh();
  }

  async function immediate(patch: Partial<DayProgress>) {
    setSaved('saving');
    await save(day, patch);
    setSaved('saved');
  }

  return (
    <section className="day-panel" aria-label="Suivi de la journée">
      <div className="dpx-head">
        <div>
          <p className="dpx-eyebrow">Mon suivi</p>
          <div className={`dpx-state s-${status}`} aria-live="polite">
            <span className="dot" aria-hidden="true" /> {STATUS_LABEL[status]}
          </div>
        </div>
        <span className="dpx-saved" aria-live="polite">
          {saved === 'saving' ? 'Enregistrement…' : saved === 'saved' ? 'Enregistré' : ''}
        </span>
      </div>

      <div className="dpx-actions">
        {status !== 'done' && status !== 'in-progress' && (
          <button className="btn primary" onClick={() => setStatusAction('start')}>
            <Play size={15} strokeWidth={2.2} /> Commencer la journée
          </button>
        )}
        {status === 'in-progress' && (
          <button className="btn primary" onClick={() => setStatusAction('complete')}>
            <Check size={15} strokeWidth={2.2} /> Marquer comme terminée
          </button>
        )}
        {status === 'done' && (
          <button className="btn" onClick={() => setStatusAction('reopen')}>
            <RotateCcw size={14} strokeWidth={2} /> Rouvrir la journée
          </button>
        )}
        {status !== 'to-review' && status !== 'not-started' && (
          <button className="btn ghost" onClick={() => setStatusAction('review')}>
            <AlertTriangle size={14} strokeWidth={2} /> À revoir
          </button>
        )}
        {day < 365 && (
          <a className="btn ghost dpx-next" href={`/day/${day + 1}`}>
            Jour suivant <ArrowRight size={14} strokeWidth={2} />
          </a>
        )}
      </div>

      <details className="dpx-more">
        <summary>Auto-évaluation, checklist et notes</summary>
        <div className="dpx-more-body">
          <label className="field">Auto-évaluation (0-5)</label>
          <div className="row" role="group" aria-label="Auto-évaluation de 0 à 5">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className={`btn small ${selfScore === n ? 'primary' : ''}`}
                aria-pressed={selfScore === n}
                onClick={() => { setSelfScore(n); immediate({ selfScore: n }); }}
              >
                {n}
              </button>
            ))}
          </div>

          {checklist.length > 0 && (
            <>
              <label className="field">Checklist de validation</label>
              {checklist.map((item, i) => {
                const key = String(i);
                return (
                  <label key={key} className="row" style={{ cursor: 'pointer', margin: '4px 0' }}>
                    <input
                      type="checkbox"
                      style={{ width: 'auto' }}
                      checked={!!checks[key]}
                      onChange={(e) => {
                        const next = { ...checks, [key]: e.target.checked };
                        setChecks(next);
                        immediate({ checklist: next });
                      }}
                    />
                    <span>{item}</span>
                  </label>
                );
              })}
            </>
          )}

          <label className="field">Ma réponse (rappel : d'abord seul, sans copier-coller l'IA)</label>
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Ta solution, ton raisonnement, ton code…" />

          <label className="field">Notes personnelles</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ce qui m'a surpris, ce qui m'a bloqué, une question ouverte…" />
        </div>
      </details>
    </section>
  );
}
