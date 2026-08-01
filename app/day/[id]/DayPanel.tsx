'use client';

// Espace de travail actif de la Vue Jour : réponses PAR SECTION (dérivées du
// contenu, jamais du HTML sauvegardé), notes globales, workflow de statut.
// Sauvegarde debouncée + flush avant de quitter ; une erreur API n'efface jamais
// le texte local. Un seul modèle de progression (data/progress.json via l'API).

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Check, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';
import type { DayProgress, DayStatus } from '@/lib/types';
import type { Activity } from '@/lib/section-family';
import { nextStatusFor } from '@/lib/resume';
import { updateReviewSchedule } from '@/lib/review';

const FAMILY_LABEL: Record<string, string> = {
  practice: 'Pratiquer', apply: 'Appliquer', prepare: 'Préparer', retain: 'Retenir',
};
const STATUS_LABEL: Record<DayStatus, string> = {
  'not-started': 'Non commencée', 'in-progress': 'En cours', 'done': 'Terminée', 'to-review': 'À revoir',
};

async function postDay(day: number, patch: Partial<DayProgress>, keepalive = false) {
  const res = await fetch('/api/progress', {
    method: 'POST', keepalive,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'day', payload: { day, patch } }),
  });
  if (!res.ok) throw new Error('save failed');
}

export default function DayPanel({
  day, nextDay, initial, checklist, activities,
}: {
  day: number;
  nextDay?: number | null;
  initial: DayProgress;
  checklist: string[];
  activities: Activity[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState<DayStatus>(initial.status);
  const [answers, setAnswers] = useState<Record<string, string>>(initial.answers ?? {});
  const [legacyAnswer, setLegacyAnswer] = useState(initial.answer ?? '');
  const [notes, setNotes] = useState(initial.notes ?? '');
  const [selfScore, setSelfScore] = useState<number | null>(initial.selfScore ?? null);
  const [checks, setChecks] = useState<Record<string, boolean>>(initial.checklist ?? {});
  const [confidence, setConfidence] = useState<string | null>(initial.selfAssessment?.confidence ?? null);
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [savedAt, setSavedAt] = useState<string>('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef(false);
  const latest = useRef<Partial<DayProgress>>({});

  const hasActivities = activities.length > 0;

  // Contenu utilisateur courant (jamais de HTML rendu).
  const buildPatch = useCallback((): Partial<DayProgress> => (
    hasActivities ? { answers, notes } : { answer: legacyAnswer, notes }
  ), [hasActivities, answers, legacyAnswer, notes]);

  // Sauvegarde debouncée du texte ; l'échec n'efface pas le texte local.
  useEffect(() => {
    latest.current = buildPatch();
    if (!dirty.current) { dirty.current = true; return; } // pas de save au montage
    if (timer.current) clearTimeout(timer.current);
    setSaved('saving');
    timer.current = setTimeout(async () => {
      try {
        await postDay(day, latest.current);
        setSaved('saved'); setSavedAt(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      } catch { setSaved('error'); }
    }, 700);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [buildPatch, day]);

  // Flush avant de quitter la page / changer de journée (garde-fou anti-perte).
  useEffect(() => {
    const flush = () => {
      if (timer.current) clearTimeout(timer.current);
      postDay(day, latest.current, true).catch(() => {});
    };
    window.addEventListener('pagehide', flush);
    return () => { window.removeEventListener('pagehide', flush); flush(); };
  }, [day]);

  async function setStatusAction(action: 'start' | 'complete' | 'reopen' | 'review') {
    if (action === 'reopen' && !confirm('Rouvrir cette journée ? Son statut repassera à « en cours ». Tes réponses et notes sont conservées.')) return;
    const next = nextStatusFor(action, status);
    setStatus(next);
    try { await postDay(day, { status: next }); } catch { setSaved('error'); return; }
    window.dispatchEvent(new CustomEvent('progress-changed'));
    router.refresh();
  }

  async function immediate(patch: Partial<DayProgress>) {
    setSaved('saving');
    try { await postDay(day, patch); setSaved('saved'); } catch { setSaved('error'); }
  }

  async function chooseConfidence(v: 'low' | 'medium' | 'high') {
    setConfidence(v);
    const sa = initial.selfAssessment ?? { level: null, confidence: null, criteria: {}, comment: '' };
    await immediate({ selfAssessment: { ...sa, confidence: v } });
  }

  // Clôture explicite : terminer / terminer et revoir / laisser en cours.
  async function closeDay(mode: 'done' | 'review-later' | 'in-progress') {
    const now = new Date().toISOString();
    const patch: Partial<DayProgress> =
      mode === 'in-progress' ? { status: 'in-progress' }
        : { status: 'done', completedAt: now };
    if (mode === 'review-later') {
      patch.review = updateReviewSchedule(initial.review ?? null, { comprehension: 'partial', confidence, now: new Date() });
    }
    setStatus(patch.status as DayStatus);
    try { await postDay(day, patch); } catch { setSaved('error'); return; }
    window.dispatchEvent(new CustomEvent('progress-changed'));
    router.refresh();
  }

  // Synthèse dérivée (client) pour la clôture.
  const answeredCount = activities.filter((a) => (answers[a.id] ?? '').trim()).length;
  const unanswered = Math.max(0, activities.length - answeredCount);
  const correctionViewed = initial.correctionState === 'viewed' || initial.correctionState === 'acknowledged';

  const savedText = saved === 'saving' ? 'Enregistrement…'
    : saved === 'error' ? 'Échec de sauvegarde — texte conservé'
    : saved === 'saved' ? `Enregistré${savedAt ? ` · ${savedAt}` : ''}` : '';

  return (
    <section className="day-panel" aria-label="Suivi de la journée">
      <div className="dpx-head">
        <div>
          <p className="dpx-eyebrow">Mon suivi</p>
          <div className={`dpx-state s-${status}`} aria-live="polite">
            <span className="dot" aria-hidden="true" /> {STATUS_LABEL[status]}
          </div>
        </div>
        <span className={`dpx-saved${saved === 'error' ? ' err' : ''}`} aria-live="polite">{savedText}</span>
      </div>

      <div className="dpx-actions">
        {status === 'not-started' && (
          <button className="btn primary" onClick={() => setStatusAction('start')}><Play size={15} strokeWidth={2.2} /> Commencer la journée</button>
        )}
        {status === 'done' && (
          <span className="dpx-done"><Check size={15} strokeWidth={2.2} /> Journée terminée</span>
        )}
        {status === 'done' && (
          <button className="btn" onClick={() => setStatusAction('reopen')}><RotateCcw size={14} strokeWidth={2} /> Rouvrir</button>
        )}
        {nextDay != null && (
          <a className="btn ghost dpx-next" href={`/day/${nextDay}`}>Jour suivant <ArrowRight size={14} strokeWidth={2} /></a>
        )}
      </div>

      {/* Espace de travail : une réponse par activité, ou une réponse globale */}
      <div className="dpx-work">
        {hasActivities ? (
          activities.map((a) => (
            <div className="work-item" key={a.id}>
              <label className="work-label" htmlFor={`ans-${a.id}`}>
                <span className="work-fam" data-family={a.family}>{FAMILY_LABEL[a.family] ?? a.family}</span>
                {a.label}
              </label>
              <textarea
                id={`ans-${a.id}`}
                className="work-textarea"
                value={answers[a.id] ?? ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [a.id]: e.target.value }))}
                placeholder="Ta réponse, ton raisonnement, ton code…"
              />
            </div>
          ))
        ) : (
          <div className="work-item">
            <label className="work-label" htmlFor="ans-global">Ma réponse <span className="muted">(d'abord seul, sans copier-coller l'IA)</span></label>
            <textarea id="ans-global" className="work-textarea" value={legacyAnswer} onChange={(e) => setLegacyAnswer(e.target.value)} placeholder="Ta solution, ton raisonnement, ton code…" />
          </div>
        )}
        <div className="work-item">
          <label className="work-label" htmlFor="day-notes">Notes personnelles</label>
          <textarea id="day-notes" className="work-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ce qui m'a surpris, ce qui m'a bloqué, une question ouverte…" />
        </div>
      </div>

      {/* Clôture de journée — explicite, non aveugle */}
      {status !== 'not-started' && (
        <div className="day-close">
          <p className="dpx-eyebrow">Clôturer la journée</p>
          <div className="dc-summary">
            {activities.length > 0 && <span className="dc-chip">{answeredCount}/{activities.length} activités répondues</span>}
            <span className="dc-chip">Correction {correctionViewed ? 'consultée' : 'non consultée'}</span>
            {initial.evidence && initial.evidence.length > 0 && <span className="dc-chip">{initial.evidence.length} preuve(s)</span>}
          </div>
          {unanswered > 0 && (
            <p className="dc-warn"><AlertTriangle size={13} strokeWidth={2} /> {unanswered} activité(s) sans réponse — tu peux terminer quand même.</p>
          )}
          <div className="dc-conf" role="group" aria-label="Confiance globale">
            <span className="dc-conf-label">Confiance</span>
            {(['low', 'medium', 'high'] as const).map((v) => (
              <button key={v} className={`btn small${confidence === v ? ' primary' : ''}`} aria-pressed={confidence === v}
                onClick={() => chooseConfidence(v)}>{v === 'low' ? 'Faible' : v === 'medium' ? 'Moyenne' : 'Élevée'}</button>
            ))}
          </div>
          {status !== 'done' && (
            <div className="dc-actions">
              <button className="btn primary" onClick={() => closeDay('done')}><Check size={15} strokeWidth={2.2} /> Terminer</button>
              <button className="btn" onClick={() => closeDay('review-later')}><AlertTriangle size={14} strokeWidth={2} /> Terminer et revoir plus tard</button>
              <button className="btn ghost" onClick={() => closeDay('in-progress')}>Laisser en cours</button>
            </div>
          )}
        </div>
      )}

      <details className="dpx-more">
        <summary>Auto-évaluation et checklist</summary>
        <div className="dpx-more-body">
          <label className="field">Auto-évaluation (0-5)</label>
          <div className="row" role="group" aria-label="Auto-évaluation de 0 à 5">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <button key={n} className={`btn small ${selfScore === n ? 'primary' : ''}`} aria-pressed={selfScore === n}
                onClick={() => { setSelfScore(n); immediate({ selfScore: n }); }}>{n}</button>
            ))}
          </div>
          {checklist.length > 0 && (
            <>
              <label className="field">Checklist de validation</label>
              {checklist.map((item, i) => {
                const key = String(i);
                return (
                  <label key={key} className="row" style={{ cursor: 'pointer', margin: '4px 0' }}>
                    <input type="checkbox" style={{ width: 'auto' }} checked={!!checks[key]}
                      onChange={(e) => { const n = { ...checks, [key]: e.target.checked }; setChecks(n); immediate({ checklist: n }); }} />
                    <span>{item}</span>
                  </label>
                );
              })}
            </>
          )}
        </div>
      </details>
    </section>
  );
}
