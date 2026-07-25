'use client';

// Poste de travail du laboratoire : arborescence + onglets, éditeur de code réel
// (chargé dynamiquement), exécution des tests via l'API sécurisée, résultats et
// réinitialisation. Aucun terminal shell libre : seuls « Lancer les tests » et
// « Réinitialiser » agissent, tous deux passant par le bac à sable serveur.
import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Play, RotateCcw, Check, X, Loader2, FileCode } from 'lucide-react';

// L'éditeur (CodeMirror) n'est chargé QUE côté client, sur cette route.
const CodeMirrorEditor = dynamic(() => import('./CodeMirrorEditor'), {
  ssr: false,
  loading: () => <div className="cm-loading">Chargement de l’éditeur…</div>,
});

type FileState = { path: string; content: string; readOnly: boolean };
type TestMeta = { id: string; name: string };
type ResultItem = { testId: string; name: string; passed: boolean; message: string };
type Attempt = { total: number; passed: number; allPassed: boolean; durationMs: number; results: ResultItem[] };

export default function LabWorkspace({
  exercise, initialFiles,
}: { exercise: { id: string; title: string; tests: TestMeta[] }; initialFiles: FileState[] }) {
  const [files, setFiles] = useState<FileState[]>(initialFiles);
  const [active, setActive] = useState(initialFiles[0]?.path ?? '');
  const [editorKey, setEditorKey] = useState(0);   // force le remontage (switch/reset)
  const [running, setRunning] = useState(false);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [stdout, setStdout] = useState('');
  const [runError, setRunError] = useState('');
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved'>('idle');

  const activeFile = files.find((f) => f.path === active) ?? files[0];

  const filesMap = useCallback(
    () => Object.fromEntries(files.filter((f) => !f.readOnly).map((f) => [f.path, f.content])),
    [files],
  );

  const onEdit = useCallback((v: string) => {
    setFiles((prev) => prev.map((f) => (f.path === active ? { ...f, content: v } : f)));
    setSaved('idle');
  }, [active]);

  async function post(action: string) {
    const res = await fetch(`/api/lab/${exercise.id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, files: filesMap() }),
    });
    return res.json().catch(() => ({ error: 'Réponse illisible.' }));
  }

  async function run() {
    setRunning(true); setRunError(''); setAttempt(null); setStdout('');
    try {
      const j = await post('run');
      if (j.error) { setRunError(j.error); return; }
      setAttempt(j.attempt); setStdout(j.stdout ?? ''); setSaved('saved');
    } finally { setRunning(false); }
  }

  async function save() {
    setSaved('saving');
    const j = await post('save');
    setSaved(j.ok ? 'saved' : 'idle');
  }

  async function reset() {
    if (!confirm('Réinitialiser cet exercice au code de départ ? Ton code sera perdu.')) return;
    const res = await fetch(`/api/lab/${exercise.id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' }),
    });
    const j = await res.json().catch(() => ({}));
    if (j.files) {
      setFiles(j.files);
      setActive(j.files[0]?.path ?? '');
      setEditorKey((k) => k + 1);
      setAttempt(null); setStdout(''); setRunError(''); setSaved('idle');
    }
  }

  return (
    <div className="lab">
      <div className="lab-editor">
        <div className="lab-tabs" role="tablist" aria-label="Fichiers">
          {files.map((f) => (
            <button
              key={f.path} role="tab" aria-selected={f.path === active}
              className={`lab-tab${f.path === active ? ' active' : ''}`}
              onClick={() => { setActive(f.path); setEditorKey((k) => k + 1); }}
            >
              <FileCode size={13} /> {f.path}{f.readOnly ? ' (lecture seule)' : ''}
            </button>
          ))}
        </div>
        <div className="lab-cm">
          {activeFile && (
            <CodeMirrorEditor
              key={`${activeFile.path}:${editorKey}`}
              value={activeFile.content}
              onChange={onEdit}
              readOnly={activeFile.readOnly}
            />
          )}
        </div>
        <div className="lab-actions">
          <button className="btn primary" onClick={run} disabled={running}>
            {running ? <Loader2 size={14} className="spin" /> : <Play size={14} />} Lancer les tests
          </button>
          <button className="btn" onClick={save} disabled={running || saved === 'saving'}>
            {saved === 'saved' ? 'Enregistré' : saved === 'saving' ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <button className="btn ghost" onClick={reset} disabled={running}><RotateCcw size={14} /> Réinitialiser</button>
        </div>
      </div>

      <aside className="lab-results" aria-label="Résultats">
        <div className="lab-results-head">
          <span className="section-label">Résultats</span>
          {attempt && (
            <span className={`lab-verdict ${attempt.allPassed ? 'ok' : 'ko'}`}>
              {attempt.passed}/{attempt.total} tests · {attempt.durationMs} ms
            </span>
          )}
        </div>

        {runError && <div className="lab-error">{runError}</div>}

        {!attempt && !runError && (
          <div className="lab-hint">
            Lance les tests pour voir le détail. {exercise.tests.length} tests couvrent cet exercice.
          </div>
        )}

        {attempt && (
          <ul className="lab-test-list">
            {attempt.results.map((r) => (
              <li key={r.testId} className={`lab-test ${r.passed ? 'ok' : 'ko'}`}>
                <span className="lab-test-ico">{r.passed ? <Check size={14} /> : <X size={14} />}</span>
                <span className="lab-test-body">
                  <span className="lab-test-name">{r.name}</span>
                  {!r.passed && <span className="lab-test-msg">{r.message}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}

        {stdout && (
          <div className="lab-stdout">
            <div className="section-label">Sortie standard</div>
            <pre>{stdout.slice(0, 4000)}</pre>
          </div>
        )}
      </aside>
    </div>
  );
}
