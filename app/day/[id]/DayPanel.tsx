'use client';

// Poste de travail de la journée — V64 · Learning Engine (ADR-064).
//
// La journée a désormais une SESSION : un état (`not_started | active | paused
// | completed`), une heure de début réelle, des ÉTAPES dérivées du corpus et
// des SOUMISSIONS ajoutées, jamais écrasées.
//
// Deux gestes distincts, et la distinction compte :
//   • le BROUILLON est sauvegardé en continu et n'ouvre PAS la session —
//     écrire n'est pas commencer ;
//   • RENDRE est un acte explicite qui crée une soumission horodatée.
//
// Toute mutation passe par une commande nommée. Aucun patch libre : le serveur
// refuse un statut imposé par le client.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Check, RotateCcw, AlertTriangle, ArrowRight, Pause, Send, CircleDot } from 'lucide-react';
import type { DayProgress } from '@/lib/types';
import type { SessionView, SessionState, StepState } from '@/lib/learning-engine';
import type { Activity } from '@/lib/section-family';
import { sendCommand, announceProgressChanged } from '@/app/progress-command';

const FAMILY_LABEL: Record<string, string> = {
  practice: 'Pratiquer', apply: 'Appliquer', prepare: 'Préparer', retain: 'Retenir',
};
const SESSION_LABEL: Record<SessionState, string> = {
  not_started: 'Non commencée', active: 'En cours', paused: 'En pause', completed: 'Terminée',
};
const SESSION_TONE: Record<SessionState, string> = {
  not_started: 'not-started', active: 'in-progress', paused: 'paused', completed: 'done',
};
const STEP_LABEL: Record<StepState, string> = {
  pending: 'À faire', in_progress: 'Rendu', done: 'Validée',
};

export default function DayPanel({
  day, nextDay, initial, checklist, activities, session,
}: {
  day: number;
  nextDay?: number | null;
  initial: DayProgress;
  checklist: string[];
  activities: Activity[];
  session: SessionView;
}) {
  const router = useRouter();
  const [view, setView] = useState<SessionView>(session);
  const [answers, setAnswers] = useState<Record<string, string>>(initial.answers ?? {});
  const [legacyAnswer, setLegacyAnswer] = useState(initial.answer ?? '');
  const [notes, setNotes] = useState(initial.notes ?? '');
  const [confidence, setConfidence] = useState<string | null>(initial.selfAssessment?.confidence ?? null);
  const [selfLevel, setSelfLevel] = useState<number | null>(initial.selfAssessment?.level ?? initial.selfScore ?? null);
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [savedAt, setSavedAt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busyStep, setBusyStep] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false); // garde de MONTAGE : le 1er effet n'écrit pas
  const edited = useRef(false);  // l'utilisateur a RÉELLEMENT modifié le texte
  const latest = useRef<Record<string, unknown>>({});

  const hasActivities = activities.length > 0;
  const stepState = (id: string): StepState =>
    view.steps.find((s) => s.id === id)?.state ?? 'pending';

  // Brouillon courant (jamais de HTML rendu, jamais le corpus).
  const buildDraft = useCallback(() => (
    hasActivities ? { answers, notes } : { answer: legacyAnswer, notes }
  ), [hasActivities, answers, legacyAnswer, notes]);

  // ── Sauvegarde debouncée du brouillon ────────────────────────────────────
  // Un échec n'efface jamais le texte local, et il est DIT.
  useEffect(() => {
    latest.current = buildDraft();
    if (!mounted.current) { mounted.current = true; return; }
    edited.current = true;
    if (timer.current) clearTimeout(timer.current);
    setSaved('saving');
    timer.current = setTimeout(async () => {
      const r = await sendCommand({ type: 'SAVE_DRAFT', day, ...latest.current });
      if (r.ok) {
        setSaved('saved'); setError(null);
        setSavedAt(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      } else {
        setSaved('error'); setError(r.error);
      }
    }, 700);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [buildDraft, day]);

  // Flush avant de quitter. P0 V54, toujours en vigueur : ne JAMAIS écrire si
  // l'utilisateur n'a rien modifié — une consultation ne crée aucune progression.
  useEffect(() => {
    const flush = () => {
      if (!edited.current) return;
      if (timer.current) clearTimeout(timer.current);
      void sendCommand({ type: 'SAVE_DRAFT', day, ...latest.current }, { keepalive: true });
    };
    window.addEventListener('pagehide', flush);
    return () => { window.removeEventListener('pagehide', flush); flush(); };
  }, [day]);

  // ── Commandes ────────────────────────────────────────────────────────────

  async function send(command: Record<string, unknown>, optimistic?: Partial<SessionView>) {
    setError(null);
    const r = await sendCommand({ ...command, day });
    if (!r.ok) { setError(r.error); setSaved('error'); return false; }
    if (optimistic) setView((v) => ({ ...v, ...optimistic }));
    announceProgressChanged();
    router.refresh();
    return true;
  }

  async function lifecycle(type: 'START' | 'PAUSE' | 'RESUME' | 'REOPEN') {
    if (type === 'REOPEN' && !confirm('Rouvrir cette journée ? Son état repassera à « en cours ». Tes réponses, soumissions et preuves sont conservées.')) return;
    const next: SessionState = type === 'PAUSE' ? 'paused' : 'active';
    await send({ type }, { state: next, canStart: false, canResume: next === 'paused', canComplete: true });
  }

  async function closeDay(mode: 'done' | 'review-later' | 'keep-open') {
    if (mode === 'keep-open') return; // rien à écrire : la session est déjà ouverte
    const ok = await send(
      { type: 'COMPLETE', ...(mode === 'review-later' ? { scheduleReview: true, comprehension: 'partial' } : {}) },
      { state: 'completed', canComplete: false, canStart: false, canResume: false },
    );
    if (ok) setSaved('saved');
  }

  async function submitStep(stepId: string, kind: string) {
    const content = (answers[stepId] ?? '').trim();
    if (!content) { setError('Écris d’abord ta réponse : une soumission vide n’est pas enregistrée.'); return; }
    setBusyStep(stepId);
    const r = await sendCommand({ type: 'SUBMIT', day, stepId, kind, content });
    setBusyStep(null);
    if (!r.ok) { setError(r.error); return; }
    setError(null);
    setView((v) => ({
      ...v,
      submissions: v.submissions + 1,
      steps: v.steps.map((s) => (s.id === stepId ? { ...s, state: 'in_progress' as StepState, submissions: s.submissions + 1 } : s)),
      stepsDone: v.stepsDone,
    }));
    announceProgressChanged();
    router.refresh();
  }

  async function chooseConfidence(v: 'low' | 'medium' | 'high') {
    setConfidence(v);
    await send({ type: 'SET_SELF_ASSESSMENT', confidence: v });
  }

  async function chooseLevel(n: number) {
    setSelfLevel(n);
    await send({ type: 'SET_SELF_ASSESSMENT', level: n });
  }

  // ── Synthèse dérivée pour la clôture ─────────────────────────────────────
  const answeredCount = activities.filter((a) => (answers[a.id] ?? '').trim()).length;
  const unanswered = Math.max(0, activities.length - answeredCount);
  const correctionViewed = initial.correctionState === 'viewed' || initial.correctionState === 'acknowledged';
  const state = view.state;

  const savedText = saved === 'saving' ? 'Enregistrement…'
    : saved === 'error' ? 'Échec de sauvegarde — texte conservé'
    : saved === 'saved' ? `Enregistré${savedAt ? ` · ${savedAt}` : ''}` : '';

  return (
    <section className="day-panel" aria-label="Suivi de la journée">
      <div className="dpx-head">
        <div>
          <p className="dpx-eyebrow">Ma session</p>
          <div className={`dpx-state s-${SESSION_TONE[state]}`} aria-live="polite">
            <span className="dot" aria-hidden="true" /> {SESSION_LABEL[state]}
            {view.stepsTotal > 0 && (
              <span className="dpx-steps">· {view.stepsDone}/{view.stepsTotal} étapes</span>
            )}
          </div>
        </div>
        <span className={`dpx-saved${saved === 'error' ? ' err' : ''}`} aria-live="polite">{savedText}</span>
      </div>

      <div className="dpx-actions">
        {state === 'not_started' && (
          <button className="btn primary" onClick={() => lifecycle('START')}>
            <Play size={15} strokeWidth={2.2} /> Commencer la journée
          </button>
        )}
        {state === 'active' && (
          <button className="btn" onClick={() => lifecycle('PAUSE')}>
            <Pause size={14} strokeWidth={2} /> Mettre en pause
          </button>
        )}
        {state === 'paused' && (
          <button className="btn primary" onClick={() => lifecycle('RESUME')}>
            <Play size={15} strokeWidth={2.2} /> Reprendre
          </button>
        )}
        {state === 'completed' && (
          <>
            <span className="dpx-done"><Check size={15} strokeWidth={2.2} /> Journée terminée</span>
            <button className="btn" onClick={() => lifecycle('REOPEN')}>
              <RotateCcw size={14} strokeWidth={2} /> Rouvrir
            </button>
          </>
        )}
        {nextDay != null && (
          <a className="btn ghost dpx-next" href={`/day/${nextDay}`}>Jour suivant <ArrowRight size={14} strokeWidth={2} /></a>
        )}
      </div>

      {error && (
        <p className="cmd-error" role="alert">
          <AlertTriangle size={13} strokeWidth={2} /> {error}
        </p>
      )}

      {/* Espace de travail : un brouillon par activité + un geste « rendre ».
          Les commandes de soumission sont posées DANS le champ (position
          absolue) : elles n'ajoutent aucune hauteur au flux — la Vue Jour ne
          doit pas s'allonger d'un pixel (critère de clôture UX 10). */}
      <div className="dpx-work">
        {hasActivities ? (
          activities.map((a) => {
            const st = stepState(a.id);
            const count = view.steps.find((s) => s.id === a.id)?.submissions ?? 0;
            const canSubmit = state === 'active' || state === 'paused';
            return (
              <div className={`work-item st-${st}`} key={a.id}>
                <label className="work-label" htmlFor={`ans-${a.id}`}>
                  <span className="work-fam" data-family={a.family}>{FAMILY_LABEL[a.family] ?? a.family}</span>
                  {a.label}
                </label>
                <div className="work-field">
                  <textarea
                    id={`ans-${a.id}`}
                    className="work-textarea"
                    value={answers[a.id] ?? ''}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [a.id]: e.target.value }))}
                    placeholder="Ta réponse, ton raisonnement, ton code…"
                  />
                  <div className="work-foot">
                    {count > 0 && (
                      <span className={`work-st st-${st}`}>
                        {st === 'done' ? <Check size={11} strokeWidth={2.4} /> : <CircleDot size={11} strokeWidth={2.2} />}
                        {STEP_LABEL[st]}{count > 1 ? ` · ${count}` : ''}
                      </span>
                    )}
                    <button
                      type="button"
                      className="btn small work-submit"
                      disabled={!canSubmit || busyStep === a.id}
                      title={canSubmit ? 'Enregistrer ce travail comme soumission horodatée' : 'Commence la journée pour rendre un travail'}
                      onClick={() => submitStep(a.id, 'text')}
                    >
                      <Send size={12} strokeWidth={2.2} /> {busyStep === a.id ? '…' : 'Rendre'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="work-item">
            <label className="work-label" htmlFor="ans-global">Ma réponse <span className="muted">(d&apos;abord seul, sans copier-coller l&apos;IA)</span></label>
            <textarea id="ans-global" className="work-textarea" value={legacyAnswer} onChange={(e) => setLegacyAnswer(e.target.value)} placeholder="Ta solution, ton raisonnement, ton code…" />
          </div>
        )}
        <div className="work-item">
          <label className="work-label" htmlFor="day-notes">Notes personnelles</label>
          <textarea id="day-notes" className="work-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ce qui m'a surpris, ce qui m'a bloqué, une question ouverte…" />
        </div>
      </div>

      {/* Clôture de journée — explicite, non aveugle */}
      {state !== 'not_started' && (
        <div className="day-close">
          <p className="dpx-eyebrow">Clôturer la journée</p>
          <div className="dc-summary">
            {activities.length > 0 && <span className="dc-chip">{answeredCount}/{activities.length} activités répondues</span>}
            {view.submissions > 0 && <span className="dc-chip">{view.submissions} soumission(s)</span>}
            <span className="dc-chip">Correction {correctionViewed ? 'consultée' : 'non consultée'}</span>
            {view.evidenceCount > 0 && <span className="dc-chip">{view.evidenceCount} preuve(s)</span>}
            {view.startedAt && (
              <span className="dc-chip">Commencée le {new Date(view.startedAt).toLocaleDateString('fr-FR')}</span>
            )}
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
          {view.canComplete && (
            <div className="dc-actions">
              <button className="btn primary" onClick={() => closeDay('done')}><Check size={15} strokeWidth={2.2} /> Terminer</button>
              <button className="btn" onClick={() => closeDay('review-later')}><AlertTriangle size={14} strokeWidth={2} /> Terminer et revoir plus tard</button>
              <button className="btn ghost" onClick={() => closeDay('keep-open')}>Laisser en cours</button>
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
              <button key={n} className={`btn small ${selfLevel === n ? 'primary' : ''}`} aria-pressed={selfLevel === n}
                onClick={() => chooseLevel(n)}>{n}</button>
            ))}
          </div>
          {checklist.length > 0 && (
            <>
              <label className="field">Checklist de validation</label>
              <ul className="dpx-checklist">
                {checklist.map((item, i) => <li key={String(i)}>{item}</li>)}
              </ul>
              <p className="muted dpx-legacy-note">
                Cette checklist est une grille de relecture issue du corpus. Depuis V64, ce
                qui est enregistré, c&apos;est la soumission de chaque activité — pas une case cochée.
              </p>
            </>
          )}
        </div>
      </details>
    </section>
  );
}
