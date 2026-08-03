'use client';
// Panneau Terminal du Workbench (V20 CP7) — chargé PARESSEUSEMENT (aucun code
// terminal sur les routes non-Lab). Interface d'exécution BORNÉE : l'apprenant
// choisit une tâche déclarée et des arguments contraints, jamais une commande
// libre. Sortie rendue en TEXTE BRUT (jamais interprétée comme HTML). Annulation
// via abandon de la requête (AbortController), sans polling.
import { useCallback, useMemo, useRef, useState } from 'react';
import { Play, Square, Eraser, Loader2 } from 'lucide-react';

interface ArgSpec { name: string; kind: string; required?: boolean; values?: string[]; min?: number; max?: number; default?: string }
export interface TerminalTaskView {
  id: string; title: string; description: string; adapter: string; executable: string;
  argumentSchema: ArgSpec[]; timeoutMs: number; skills: string[]; dayRefs: number[];
  hints?: string[]; securityNotes?: string[];
}
interface RunResult {
  status: string; commandPreview: string; exitCode: number | null; durationMs: number;
  stdout: string; stderr: string; truncated: boolean; timedOut: boolean; cancelled: boolean; diagnostic?: string;
}

const STATUS_LABEL: Record<string, string> = {
  idle: 'prêt', running: 'en cours…', success: 'succès', failed: 'échec',
  'timed-out': 'délai dépassé', cancelled: 'annulé', unavailable: 'indisponible',
};

export default function TerminalPanel({ tasks }: { tasks: TerminalTaskView[] }) {
  const [taskId, setTaskId] = useState(tasks[0]?.id ?? '');
  const task = useMemo(() => tasks.find((t) => t.id === taskId) ?? tasks[0], [tasks, taskId]);
  const [args, setArgs] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [note, setNote] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const runIdRef = useRef<string>('');

  const argValue = useCallback((spec: ArgSpec) => args[spec.name] ?? spec.default ?? '', [args]);

  const preview = useMemo(() => {
    if (!task) return '';
    const vals = task.argumentSchema.map((s) => argValue(s)).filter((v) => v !== '');
    return `${task.executable} ${vals.join(' ')}`.trim();
  }, [task, argValue]);

  const run = useCallback(async () => {
    if (!task || running) return;
    setRunning(true); setStatus('running'); setResult(null); setNote('');
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    runIdRef.current = '';
    try {
      const res = await fetch(`/api/terminal/${task.id}`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'run', args }), signal: ctrl.signal,
      });
      if (res.status === 409) { setStatus('idle'); setNote('Une exécution est déjà en cours.'); return; }
      const data = await res.json();
      if (data?.run) { setResult(data.run as RunResult); setStatus((data.run as RunResult).status); }
      else { setStatus('failed'); setNote(data?.error ?? 'Échec.'); }
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') { setStatus('cancelled'); setNote('Exécution annulée.'); }
      else { setStatus('failed'); setNote('Erreur réseau locale.'); }
    } finally {
      setRunning(false); abortRef.current = null;
    }
  }, [task, running, args]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clear = useCallback(() => { setResult(null); setStatus('idle'); setNote(''); }, []);

  if (!task) return <div className="wb-panel-body"><p className="muted">Aucune tâche terminal pour cet exercice.</p></div>;

  return (
    <div className="wb-panel-body wb-terminal" role="region" aria-label="Terminal pédagogique borné">
      <div className="wb-terminal-controls">
        {tasks.length > 1 && (
          <label className="wb-field">
            <span className="section-label">Tâche</span>
            <select value={taskId} onChange={(e) => { setTaskId(e.target.value); setArgs({}); clear(); }}>
              {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </label>
        )}
        <p className="wb-terminal-desc">{task.description}</p>

        {task.argumentSchema.filter((s) => s.kind === 'enum' || s.kind === 'flag').map((s) => (
          <label key={s.name} className="wb-field">
            <span className="section-label">{s.name}</span>
            <select value={argValue(s)} onChange={(e) => setArgs((a) => ({ ...a, [s.name]: e.target.value }))}>
              {(s.values ?? []).map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
        ))}

        <div className="wb-terminal-cmd" aria-label="Commande qui sera exécutée">
          <span className="section-label">Commande bornée</span>
          <code>{preview}</code>
          <span className={`wb-badge wb-badge-${task.adapter}`}>{task.adapter === 'docker' ? 'Docker (si disponible)' : 'local borné'}</span>
        </div>

        <div className="wb-terminal-actions">
          <button className="btn btn-primary" onClick={run} disabled={running}>
            {running ? <Loader2 size={13} className="spin" /> : <Play size={13} />} Exécuter
          </button>
          <button className="btn" onClick={cancel} disabled={!running}><Square size={13} /> Annuler</button>
          <button className="btn" onClick={clear} disabled={running}><Eraser size={13} /> Effacer</button>
          <span className={`wb-terminal-status status-${status}`} role="status" aria-live="polite">{STATUS_LABEL[status] ?? status}</span>
        </div>
        {task.securityNotes?.length ? (
          <p className="wb-terminal-secnote">🔒 {task.securityNotes[0]}</p>
        ) : null}
      </div>

      <div className="wb-terminal-output" aria-label="Sortie du terminal">
        {note && <p className="wb-terminal-note">{note}</p>}
        {result && (
          <>
            <div className="wb-terminal-meta">
              <span>code de sortie : <strong>{result.exitCode ?? '—'}</strong></span>
              <span>durée : {result.durationMs} ms</span>
              {result.truncated && <span className="wb-badge">sortie tronquée</span>}
              {result.timedOut && <span className="wb-badge has-errors">timeout</span>}
              {result.status === 'unavailable' && <span className="wb-badge has-errors">adaptateur indisponible</span>}
            </div>
            {result.stdout && <><span className="section-label">stdout</span><pre className="wb-terminal-pre">{result.stdout}</pre></>}
            {result.stderr && <><span className="section-label">stderr</span><pre className="wb-terminal-pre wb-terminal-err">{result.stderr}</pre></>}
            {result.diagnostic && <p className="wb-terminal-note">{result.diagnostic}</p>}
          </>
        )}
        {!result && !note && <p className="muted">Choisis une tâche et exécute-la. La sortie apparaîtra ici (texte brut, bornée).</p>}
      </div>
    </div>
  );
}
