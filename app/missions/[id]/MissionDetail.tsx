'use client';
import { useState } from 'react';
import Link from 'next/link';

type Deliverable = {
  id: string; kind: string; title: string; required: boolean; validation: string;
  hint?: string; exerciseId?: string; requiredSections?: string[];
};
type PublicMission = {
  id: string; title: string; description: string; category: string; difficulty: number;
  estimatedHours: number; skills: string[]; trackRefs: string[]; dayRefs: number[];
  deliverables: Deliverable[]; rubric: { label: string; blocking: boolean }[];
};
type DeliverableState = { status?: string; content?: string };
type MissionState = { status: string; deliverables: Record<string, DeliverableState> };
type Progress = { status: string; requiredTotal: number; requiredDone: number };
type Structure = { ok: boolean; missingSections: string[]; placeholders: boolean; tooShort: boolean; tooLong: boolean; missingMentions: string[] };

const STATUS_LABEL: Record<string, string> = {
  'not-started': 'À commencer', 'in-progress': 'En cours', 'deliverables-incomplete': 'Livrables incomplets',
  'ready-for-review': 'Prêt pour revue', done: 'Terminé',
};
const VALIDATION_LABEL: Record<string, string> = {
  auto: 'Auto-corrigé (exercice)', structural: 'Validé structurellement (document)', review: 'Revue humaine',
};

export default function MissionDetail({ mission, context, prerequisites, commonMistakes, initialState, initialProgress }: {
  mission: PublicMission; context: string; prerequisites: string[]; commonMistakes: string[];
  initialState: MissionState; initialProgress: Progress;
}) {
  const [state, setState] = useState<MissionState>(initialState);
  const [progress, setProgress] = useState<Progress>(initialProgress);
  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    const d: Record<string, string> = {};
    for (const dv of mission.deliverables) d[dv.id] = initialState.deliverables?.[dv.id]?.content ?? '';
    return d;
  });
  const [structures, setStructures] = useState<Record<string, Structure>>({});
  const [busy, setBusy] = useState(false);

  async function call(body: Record<string, unknown>) {
    setBusy(true);
    try {
      const r = await fetch(`/api/missions/${mission.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await r.json();
      if (data.state) setState(data.state);
      if (data.progress) setProgress(data.progress);
      if (data.structure && body.deliverableId) setStructures((s) => ({ ...s, [body.deliverableId as string]: data.structure }));
    } finally { setBusy(false); }
  }
  async function refresh() {
    setBusy(true);
    try {
      const r = await fetch(`/api/missions/${mission.id}`);
      const data = await r.json();
      if (data.state) setState(data.state);
      if (data.progress) setProgress(data.progress);
    } finally { setBusy(false); }
  }

  const started = state.status !== 'not-started';
  const dStatus = (id: string) => state.deliverables?.[id]?.status ?? 'todo';

  return (
    <div className="page mission-detail">
      <header className="page-head">
        <p className="page-eyebrow"><Link href="/missions">Missions</Link> · {mission.category}</p>
        <h1>{mission.title}</h1>
        <p className="page-sub">{mission.description}</p>
        <div className="mission-meta">
          <span className={`badge ${progress.status === 'done' ? 'ok' : progress.status === 'not-started' ? '' : 'review'}`}>{STATUS_LABEL[progress.status] ?? progress.status}</span>
          <span>Difficulté {mission.difficulty}/5</span>
          <span>≈ {mission.estimatedHours} h</span>
          <span>{progress.requiredDone}/{progress.requiredTotal} livrables requis</span>
          <span>Jours {mission.dayRefs.join(', ')}</span>
        </div>
      </header>

      {!started && (
        <button className="btn primary" disabled={busy} onClick={() => call({ action: 'start' })}>Démarrer la mission</button>
      )}

      <section className="card mission-context">
        <h2>Contexte</h2>
        <p>{context}</p>
        {prerequisites.length > 0 && <p className="muted">Prérequis : {prerequisites.join(' · ')}</p>}
      </section>

      <section className="mission-deliverables">
        <h2>Livrables</h2>
        {mission.deliverables.map((d) => {
          const st = dStatus(d.id);
          const done = st === 'validated' || st === 'structure-valid';
          return (
            <div key={d.id} className="card mission-deliverable">
              <div className="mission-deliverable-head">
                <strong>{d.title}</strong>
                <span className="mission-badges">
                  <span className="badge accent">{VALIDATION_LABEL[d.validation] ?? d.validation}</span>
                  {d.required ? <span className="badge">requis</span> : <span className="badge muted">optionnel</span>}
                  {done && <span className="badge ok">✓ {st === 'validated' ? 'validé' : 'structure valide'}</span>}
                </span>
              </div>
              {d.hint && <p className="muted mission-hint">{d.hint}</p>}

              {d.validation === 'auto' && d.exerciseId && (
                <div className="mission-auto">
                  <p>Réussis l'exercice dans le Laboratoire — la preuve remonte ici automatiquement.</p>
                  <Link className="btn" href={`/lab/${d.exerciseId}`}>Ouvrir l'exercice</Link>
                  <button className="btn ghost" disabled={busy} onClick={refresh}>Rafraîchir l'état</button>
                </div>
              )}

              {d.validation === 'structural' && (
                <div className="mission-doc">
                  {d.requiredSections && <p className="muted">Sections attendues : {d.requiredSections.join(' · ')}</p>}
                  <textarea rows={8} value={drafts[d.id] ?? ''} disabled={!started || busy}
                    onChange={(e) => setDrafts((s) => ({ ...s, [d.id]: e.target.value }))}
                    placeholder="Rédige ton document ici (Markdown). La vérification porte sur la STRUCTURE, pas sur le fond." />
                  <button className="btn primary" disabled={!started || busy}
                    onClick={() => call({ action: 'submit-doc', deliverableId: d.id, content: drafts[d.id] ?? '' })}>Vérifier la structure</button>
                  {structures[d.id] && <StructureFeedback s={structures[d.id]} sections={d.requiredSections ?? []} />}
                </div>
              )}

              {d.validation === 'review' && (
                <div className="mission-review">
                  <p className="muted">Aucune correction automatique : c'est ta revue honnête (ou celle d'un pair).</p>
                  <textarea rows={4} value={drafts[d.id] ?? ''} disabled={!started || busy}
                    onChange={(e) => setDrafts((s) => ({ ...s, [d.id]: e.target.value }))}
                    placeholder="Auto-évaluation : ce qui est prouvé, ce qui reste à revoir." />
                  <div className="mission-review-actions">
                    <button className="btn" disabled={!started || busy}
                      onClick={() => call({ action: 'self-assess', deliverableId: d.id, selfAssessment: { notes: drafts[d.id] ?? '' } })}>Enregistrer l'auto-évaluation</button>
                    <button className="btn primary" disabled={!started || busy || st !== 'self-assessed'}
                      onClick={() => call({ action: 'validate-review', deliverableId: d.id })}>Marquer comme relu / validé</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </section>

      <section className="card mission-rubric">
        <h2>Grille d'évaluation</h2>
        <ul>
          {mission.rubric.map((r, i) => <li key={i}>{r.blocking ? '⛔ ' : '• '}{r.label}{r.blocking ? ' (bloquant)' : ''}</li>)}
        </ul>
      </section>

      {commonMistakes.length > 0 && (
        <section className="card mission-mistakes">
          <h2>Erreurs fréquentes</h2>
          <ul>{commonMistakes.map((m, i) => <li key={i}>{m}</li>)}</ul>
        </section>
      )}
    </div>
  );
}

function StructureFeedback({ s, sections }: { s: Structure; sections: string[] }) {
  if (s.ok) return <p className="mission-struct-ok">✓ Structure valide (forme). La qualité du fond reste à faire relire.</p>;
  return (
    <div className="mission-struct-ko">
      <p>Structure incomplète (forme) :</p>
      <ul>
        {s.missingSections.length > 0 && <li>Sections manquantes : {s.missingSections.join(', ')}</li>}
        {s.placeholders && <li>Des placeholders (TODO/à compléter…) subsistent.</li>}
        {s.tooShort && <li>Document trop court pour être exploitable.</li>}
        {s.tooLong && <li>Document trop long.</li>}
        {s.missingMentions.length > 0 && <li>Éléments attendus non mentionnés.</li>}
      </ul>
      {sections.length > 0 && <p className="muted">Rappel des sections : {sections.join(' · ')}</p>}
    </div>
  );
}
