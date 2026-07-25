'use client';

// Workbench trois zones : (gauche) consigne + explorateur, (centre) onglets +
// éditeur + statut, (droite) Tests / Console / Aide. Séparateurs ajustables
// (souris + clavier), disposition persistée. Aucun terminal shell : seuls
// « Lancer les tests » et « Réinitialiser » agissent, via le bac à sable serveur.
import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Play, RotateCcw, Check, X, Loader2, FileCode, PanelLeftClose, PanelLeftOpen,
  PanelRightClose, PanelRightOpen, LayoutTemplate, FlaskConical, Terminal, HelpCircle,
} from 'lucide-react';
import { usePanelLayout } from './usePanelLayout';

const CodeMirrorEditor = dynamic(() => import('./CodeMirrorEditor'), {
  ssr: false,
  loading: () => <div className="cm-loading">Chargement de l’éditeur…</div>,
});

type FileState = { path: string; content: string; readOnly: boolean; editable: boolean; language: string; hidden: boolean; entry: boolean };
type TestMeta = { id: string; name: string };
type ResultItem = { testId: string; name: string; passed: boolean; message: string; expected?: unknown; actual?: unknown };
type Attempt = { total: number; passed: number; allPassed: boolean; durationMs: number; results: ResultItem[] };
type RightTab = 'tests' | 'console' | 'help';

export default function LabWorkspace({
  exercise, initialFiles, initialActive,
}: {
  exercise: { id: string; title: string; summary: string; tests: TestMeta[] };
  initialFiles: FileState[];
  initialActive: string;
}) {
  const layout = usePanelLayout();
  const visibleFiles = useMemo(() => initialFiles.filter((f) => !f.hidden), [initialFiles]);

  const [files, setFiles] = useState<FileState[]>(initialFiles);
  const [active, setActive] = useState(initialActive || visibleFiles[0]?.path || '');
  const [openTabs, setOpenTabs] = useState<string[]>(() => (initialActive ? [initialActive] : visibleFiles[0] ? [visibleFiles[0].path] : []));
  const [dirty, setDirty] = useState<Set<string>>(() => new Set());
  const [editorKey, setEditorKey] = useState(0);
  const [running, setRunning] = useState(false);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [stdout, setStdout] = useState('');
  const [runError, setRunError] = useState('');
  const [saving, setSaving] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>('tests');

  const activeFile = files.find((f) => f.path === active) ?? files[0];
  const isDirty = dirty.size > 0;

  const editableMap = useCallback(
    () => Object.fromEntries(files.filter((f) => f.editable).map((f) => [f.path, f.content])),
    [files],
  );

  const openFile = useCallback((path: string) => {
    setActive(path);
    setOpenTabs((t) => (t.includes(path) ? t : [...t, path]));
    setEditorKey((k) => k + 1);
  }, []);

  const closeTab = useCallback((path: string) => {
    setOpenTabs((t) => {
      const next = t.filter((p) => p !== path);
      setActive((cur) => (cur === path ? (next[next.length - 1] ?? '') : cur));
      return next;
    });
    setEditorKey((k) => k + 1);
  }, []);

  const onEdit = useCallback((v: string) => {
    setFiles((prev) => prev.map((f) => (f.path === active ? { ...f, content: v } : f)));
    setDirty((d) => new Set(d).add(active));
  }, [active]);

  async function post(action: string) {
    const res = await fetch(`/api/lab/${exercise.id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, files: editableMap() }),
    });
    return res.json().catch(() => ({ error: 'Réponse illisible.' }));
  }

  async function save() {
    setSaving(true);
    try { const j = await post('save'); if (j.ok) setDirty(new Set()); }
    finally { setSaving(false); }
  }

  async function run() {
    setRunning(true); setRunError(''); setAttempt(null); setStdout(''); setRightTab('tests');
    try {
      const j = await post('run');
      if (j.error) { setRunError(j.error); return; }
      setAttempt(j.attempt); setStdout(j.stdout ?? ''); setDirty(new Set());
    } finally { setRunning(false); }
  }

  async function resetExercise() {
    if (!confirm('Réinitialiser cet exercice au code de départ ? Ton code sera perdu.')) return;
    const res = await fetch(`/api/lab/${exercise.id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' }),
    });
    const j = await res.json().catch(() => ({}));
    if (j.files) {
      setFiles(j.files);
      setDirty(new Set());
      setAttempt(null); setStdout(''); setRunError('');
      setEditorKey((k) => k + 1);
    }
  }

  const cols = `${layout.layout.leftOpen ? layout.layout.left + 'px' : '0'} ${layout.layout.leftOpen ? '6px' : '0'} minmax(0,1fr) ${layout.layout.rightOpen ? '6px' : '0'} ${layout.layout.rightOpen ? layout.layout.right + 'px' : '0'}`;

  return (
    <div className="wb" style={{ gridTemplateColumns: cols }}>
      {/* ── Panneau gauche : consigne + explorateur ── */}
      {layout.layout.leftOpen && (
        <aside className="wb-left" aria-label="Consigne et fichiers">
          <div className="wb-panel-head">
            <span className="section-label">Consigne</span>
            <button className="wb-icon" title="Replier le panneau" aria-label="Replier le panneau gauche" onClick={() => layout.toggle('left')}><PanelLeftClose size={15} /></button>
          </div>
          <div className="wb-brief">{exercise.summary}</div>
          <div className="wb-panel-head"><span className="section-label">Fichiers</span></div>
          <ul className="wb-explorer" role="tree" aria-label="Explorateur de fichiers">
            {visibleFiles.map((f) => (
              <li key={f.path} role="treeitem" aria-selected={f.path === active}>
                <button className={`wb-file${f.path === active ? ' active' : ''}`} onClick={() => openFile(f.path)}>
                  <FileCode size={13} /> <span className="wb-file-name">{f.path}</span>
                  {!f.editable && <span className="wb-ro">lecture</span>}
                  {dirty.has(f.path) && <span className="wb-dot" aria-label="modifié">●</span>}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}
      {layout.layout.leftOpen && <Separator side="left" layout={layout} />}

      {/* ── Zone centrale : onglets + éditeur + statut ── */}
      <section className="wb-center" aria-label="Éditeur">
        <div className="wb-tabs" role="tablist" aria-label="Onglets de fichiers">
          {!layout.layout.leftOpen && (
            <button className="wb-icon" title="Afficher le panneau gauche" aria-label="Afficher le panneau gauche" onClick={() => layout.toggle('left')}><PanelLeftOpen size={15} /></button>
          )}
          {openTabs.map((path) => (
            <span key={path} className={`wb-tab${path === active ? ' active' : ''}`}>
              <button className="wb-tab-btn" role="tab" aria-selected={path === active} onClick={() => { setActive(path); setEditorKey((k) => k + 1); }}>
                {path}{dirty.has(path) ? ' ●' : ''}
              </button>
              <button className="wb-tab-x" aria-label={`Fermer ${path}`} onClick={() => closeTab(path)}><X size={12} /></button>
            </span>
          ))}
          {!layout.layout.rightOpen && (
            <button className="wb-icon" style={{ marginLeft: 'auto' }} title="Afficher le panneau droit" aria-label="Afficher le panneau droit" onClick={() => layout.toggle('right')}><PanelRightOpen size={15} /></button>
          )}
        </div>
        <div className="wb-cm">
          {activeFile
            ? <CodeMirrorEditor key={`${activeFile.path}:${editorKey}`} value={activeFile.content} onChange={onEdit} readOnly={!activeFile.editable} />
            : <div className="cm-loading">Aucun fichier ouvert.</div>}
        </div>
        <div className="wb-status">
          <span className="wb-status-file">{activeFile?.path ?? '—'}</span>
          <span className={`wb-status-state${isDirty ? ' dirty' : ''}`}>{isDirty ? 'Modifié — non enregistré' : 'Enregistré'}</span>
          <span className="wb-actions">
            <button className="btn small primary" onClick={run} disabled={running}>{running ? <Loader2 size={13} className="spin" /> : <Play size={13} />} Lancer</button>
            <button className="btn small" onClick={save} disabled={saving || running}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
            <button className="btn small ghost" onClick={resetExercise} disabled={running}><RotateCcw size={13} /> Reset</button>
            <button className="wb-icon" title="Réinitialiser la disposition" aria-label="Réinitialiser la disposition des panneaux" onClick={layout.reset}><LayoutTemplate size={15} /></button>
          </span>
        </div>
      </section>

      {/* ── Panneau droit : Tests / Console / Aide ── */}
      {layout.layout.rightOpen && <Separator side="right" layout={layout} />}
      {layout.layout.rightOpen && (
        <aside className="wb-right" aria-label="Tests, console et aide">
          <div className="wb-rtabs" role="tablist" aria-label="Panneau de résultats">
            <button role="tab" aria-selected={rightTab === 'tests'} className={`wb-rtab${rightTab === 'tests' ? ' active' : ''}`} onClick={() => setRightTab('tests')}><FlaskConical size={13} /> Tests{attempt ? ` (${attempt.passed}/${attempt.total})` : ''}</button>
            <button role="tab" aria-selected={rightTab === 'console'} className={`wb-rtab${rightTab === 'console' ? ' active' : ''}`} onClick={() => setRightTab('console')}><Terminal size={13} /> Console</button>
            <button role="tab" aria-selected={rightTab === 'help'} className={`wb-rtab${rightTab === 'help' ? ' active' : ''}`} onClick={() => setRightTab('help')}><HelpCircle size={13} /> Aide</button>
            <button className="wb-icon" style={{ marginLeft: 'auto' }} title="Replier le panneau" aria-label="Replier le panneau droit" onClick={() => layout.toggle('right')}><PanelRightClose size={15} /></button>
          </div>
          <div className="wb-rbody" aria-live="polite">
            {rightTab === 'tests' && (
              <>
                {running && <div className="lab-hint"><Loader2 size={13} className="spin" /> Exécution en cours…</div>}
                {runError && <div className="lab-error">{runError}</div>}
                {!attempt && !runError && !running && <div className="lab-hint">Lance les tests pour voir le détail. {exercise.tests.length} tests.</div>}
                {attempt && (
                  <>
                    <div className={`lab-verdict ${attempt.allPassed ? 'ok' : 'ko'}`} style={{ marginBottom: 'var(--sp-3)' }}>{attempt.passed}/{attempt.total} tests · {attempt.durationMs} ms</div>
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
                  </>
                )}
              </>
            )}
            {rightTab === 'console' && (
              stdout ? <pre className="wb-console">{stdout.slice(0, 8000)}</pre> : <div className="lab-hint">Aucune sortie standard. Utilise <code>console.log</code> dans ton code.</div>
            )}
            {rightTab === 'help' && (
              <div className="wb-help">
                <p>Écris ton code, puis <strong>Lancer</strong> pour exécuter les tests localement (bac à sable : timeout, sortie bornée, pas d’accès réseau).</p>
                <ul>
                  <li>Les fichiers en <em>lecture</em> ne sont pas modifiables.</li>
                  <li><strong>Enregistrer</strong> sauvegarde ton travail localement ; il est restauré au retour.</li>
                  <li><strong>Reset</strong> restaure le code de départ de l’exercice.</li>
                </ul>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

function Separator({ side, layout }: { side: 'left' | 'right'; layout: ReturnType<typeof usePanelLayout> }) {
  const value = side === 'left' ? layout.layout.left : layout.layout.right;
  return (
    <div
      className="wb-sep"
      role="separator"
      aria-orientation="vertical"
      aria-label={`Redimensionner le panneau ${side === 'left' ? 'gauche' : 'droit'}`}
      aria-valuenow={value}
      aria-valuemin={layout.MIN}
      aria-valuemax={layout.MAX}
      tabIndex={0}
      onPointerDown={layout.dragHandle(side)}
      onKeyDown={layout.keyHandle(side)}
    />
  );
}
