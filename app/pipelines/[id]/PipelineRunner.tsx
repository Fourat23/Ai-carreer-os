'use client';
// Détail + exécution d'un pipeline (V21 CP5). Visualisation stages/jobs/DAG,
// déclenchement par ÉVÉNEMENT SIMULÉ, statuts, logs (texte brut, jamais HTML),
// artefacts, diagnostic. Exécution déterministe côté serveur (aucun réseau réel).
// Composant client ; le moteur reste serveur (aucun code moteur dans ce bundle).
import { useCallback, useMemo, useState } from 'react';
import { Play, RotateCcw, Loader2, CheckCircle2, XCircle, MinusCircle, Ban, ShieldAlert, Clock } from 'lucide-react';

interface Job { id: string; name: string; stage: string; needs: string[]; action: string; allowFailure: boolean; artifactsOut: string[]; secrets: string[] }
interface Stage { id: string; name: string; order: number }
interface PipelineView {
  id: string; title: string; description: string; trigger: string[];
  branchFilters: string[]; stages: Stage[]; jobs: Job[];
  environment: { name: string; requiresApproval?: boolean } | null;
  approval: { required: boolean } | null;
}
interface RunResult {
  triggered: boolean; status: string; durationMs: number;
  jobs: Record<string, { status: string; durationMs: number; logs: string[]; artifacts: string[] }>;
  logs: string[]; artifacts: { name: string }[]; diagnostic?: string;
}

const TRIGGER_LABEL: Record<string, string> = { push: 'push', pull_request: 'pull request', tag: 'tag', manual: 'manuel', schedule: 'planifié' };
function StatusIcon({ s }: { s: string }) {
  if (s === 'success') return <CheckCircle2 size={14} className="st-success" />;
  if (s === 'failed') return <XCircle size={14} className="st-failed" />;
  if (s === 'skipped') return <MinusCircle size={14} className="st-skipped" />;
  if (s === 'blocked') return <ShieldAlert size={14} className="st-blocked" />;
  if (s === 'cancelled') return <Ban size={14} className="st-cancelled" />;
  if (s === 'timed-out') return <Clock size={14} className="st-failed" />;
  return <MinusCircle size={14} className="st-skipped" />;
}

export default function PipelineRunner({ pipeline }: { pipeline: PipelineView }) {
  const [kind, setKind] = useState(pipeline.trigger[0] ?? 'manual');
  const [branch, setBranch] = useState(pipeline.branchFilters[0] ?? 'main');
  const [approved, setApproved] = useState(false);
  const [running, setRunning] = useState(false);
  const [run, setRun] = useState<RunResult | null>(null);
  const [note, setNote] = useState('');

  const stages = useMemo(() => [...pipeline.stages].sort((a, b) => a.order - b.order), [pipeline.stages]);
  const jobsByStage = useMemo(() => {
    const m: Record<string, Job[]> = {};
    for (const j of pipeline.jobs) (m[j.stage] ??= []).push(j);
    return m;
  }, [pipeline.jobs]);

  const trigger = useCallback(async () => {
    if (running) return;
    setRunning(true); setNote(''); setRun(null);
    try {
      const res = await fetch(`/api/pipelines/${pipeline.id}`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'run', event: { kind, branch }, approved }),
      });
      const data = await res.json();
      if (data?.run) { setRun(data.run as RunResult); if (!data.run.triggered) setNote('Pipeline non déclenché pour cet événement (voir triggers/filtres de branche).'); }
      else setNote(data?.error ?? 'Échec.');
    } catch { setNote('Erreur réseau locale.'); }
    finally { setRunning(false); }
  }, [pipeline.id, kind, branch, approved, running]);

  const reset = useCallback(() => { setRun(null); setNote(''); }, []);

  return (
    <div className="pl-detail">
      {/* ── Contexte / déclenchement ── */}
      <section className="pl-panel" aria-label="Déclenchement">
        <h2 className="section-label">Déclencher un événement (simulé)</h2>
        <div className="pl-controls">
          <label className="wb-field">
            <span className="section-label">Événement</span>
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              {pipeline.trigger.map((t) => <option key={t} value={t}>{TRIGGER_LABEL[t] ?? t}</option>)}
            </select>
          </label>
          <label className="wb-field">
            <span className="section-label">Branche</span>
            <input value={branch} onChange={(e) => setBranch(e.target.value)} aria-label="Branche" />
          </label>
          {pipeline.approval?.required && (
            <label className="pl-check">
              <input type="checkbox" checked={approved} onChange={(e) => setApproved(e.target.checked)} /> Approbation accordée
            </label>
          )}
          <button className="btn btn-primary" onClick={trigger} disabled={running}>
            {running ? <Loader2 size={13} className="spin" /> : <Play size={13} />} Lancer
          </button>
          <button className="btn" onClick={reset} disabled={running}><RotateCcw size={13} /> Réinitialiser</button>
          {run && <span className={`wb-terminal-status status-${run.status}`} role="status" aria-live="polite">{run.status}{run.triggered ? ` · ${run.durationMs} ms` : ''}</span>}
        </div>
        {pipeline.environment && <p className="muted">Environnement : <strong>{pipeline.environment.name}</strong>{pipeline.approval?.required ? ' · approbation requise' : ''}. Filtres de branche : {pipeline.branchFilters.join(', ') || 'aucun'}.</p>}
      </section>

      {/* ── Visualisation stages/jobs (DAG) ── */}
      <section className="pl-panel" aria-label="Pipeline">
        <h2 className="section-label">Pipeline · {stages.length} stages · {pipeline.jobs.length} jobs</h2>
        <div className="pl-dag" role="list">
          {stages.map((st) => (
            <div className="pl-stage" role="listitem" key={st.id}>
              <div className="pl-stage-head">{st.name}</div>
              <ul className="pl-jobs">
                {(jobsByStage[st.id] ?? []).map((j) => {
                  const r = run?.jobs?.[j.id];
                  return (
                    <li key={j.id} className={`pl-job${r ? ` st-${r.status}` : ''}`}>
                      <span className="pl-job-head">
                        {r ? <StatusIcon s={r.status} /> : <MinusCircle size={14} className="st-skipped" />}
                        <span className="pl-job-name">{j.name}</span>
                        <span className="pl-job-action">{j.action}</span>
                      </span>
                      {j.needs.length > 0 && <span className="pl-job-needs">après : {j.needs.join(', ')}</span>}
                      {j.allowFailure && <span className="wb-badge">tolère l’échec</span>}
                      {r?.logs?.length ? <pre className="pl-job-log">{r.logs.join('\n')}</pre> : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Diagnostic / logs / artefacts ── */}
      <section className="pl-panel" aria-label="Résultat">
        <h2 className="section-label">Diagnostic & sortie</h2>
        {note && <p className="wb-terminal-note">{note}</p>}
        {run?.diagnostic && <p className="lab-error">{run.diagnostic}</p>}
        {run && run.artifacts.length > 0 && (
          <p className="muted">Artefacts (métadonnées locales) : {run.artifacts.map((a) => <span key={a.name} className="wb-badge">{a.name}</span>)}</p>
        )}
        {run?.logs?.length ? <pre className="wb-terminal-pre">{run.logs.join('\n')}</pre> : (!note && <p className="muted">Lance le pipeline pour voir les statuts, logs (texte brut, secrets masqués) et artefacts.</p>)}
      </section>
    </div>
  );
}
