'use client';

// Panneau interactif de la vue Jour : statut, auto-évaluation, checklist,
// champ "ma réponse", notes personnelles. Persiste via l'API (debounced).

import { useEffect, useRef, useState } from 'react';
import type { DayProgress, DayStatus } from '@/lib/types';

const STATUSES: { value: DayStatus; label: string }[] = [
  { value: 'not-started', label: 'Non commencé' },
  { value: 'in-progress', label: 'En cours' },
  { value: 'done', label: 'Terminé' },
  { value: 'to-review', label: 'À revoir' },
];

async function save(day: number, patch: Partial<DayProgress>) {
  await fetch('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'day', payload: { day, patch } }),
  });
}

export default function DayPanel({
  day, initial, checklist,
}: {
  day: number;
  initial: DayProgress;
  checklist: string[];
}) {
  const [status, setStatus] = useState<DayStatus>(initial.status);
  const [selfScore, setSelfScore] = useState<number | null>(initial.selfScore);
  const [answer, setAnswer] = useState(initial.answer);
  const [notes, setNotes] = useState(initial.notes);
  const [checks, setChecks] = useState<Record<string, boolean>>(initial.checklist ?? {});
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sauvegarde debouncée du texte (answer/notes).
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

  async function immediate(patch: Partial<DayProgress>) {
    setSaved('saving');
    await save(day, patch);
    setSaved('saved');
  }

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }}>Mon suivi du jour</h3>
        <span className="muted" style={{ fontSize: 12 }}>
          {saved === 'saving' ? 'enregistrement…' : saved === 'saved' ? '✓ enregistré' : ''}
        </span>
      </div>

      <label className="field">Statut</label>
      <div className="row">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            className={`btn small ${status === s.value ? 'primary' : ''}`}
            onClick={() => { setStatus(s.value); immediate({ status: s.value }); }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <label className="field">Auto-évaluation (0-5)</label>
      <div className="row">
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            className={`btn small ${selfScore === n ? 'primary' : ''}`}
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
  );
}
