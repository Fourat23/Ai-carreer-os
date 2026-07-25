'use client';

// Workbench trois zones : (gauche) consigne + explorateur, (centre) onglets +
// éditeur + statut, (droite) Tests / Console / Aide. Séparateurs ajustables,
// disposition + onglets persistés, autosave debouncé avec flush avant navigation,
// raccourcis clavier, palette de fichiers. Aucun terminal shell : seuls
// « Lancer », « Enregistrer » et « Réinitialiser » agissent via le bac à sable.
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Play, RotateCcw, Check, X, Loader2, FileCode, PanelLeftClose, PanelLeftOpen,
  PanelRightClose, PanelRightOpen, LayoutTemplate, FlaskConical, Terminal, HelpCircle, Undo2,
} from 'lucide-react';
import { usePanelLayout } from './usePanelLayout';

const CodeMirrorEditor = dynamic(() => import('./CodeMirrorEditor'), {
  ssr: false,
  loading: () => <div className="cm-loading">Chargement de l’éditeur…</div>,
});

type FileState = { path: string; content: string; readOnly: boolean; editable: boolean; language: string; hidden: boolean; entry: boolean };
type TestMeta = { id: string; name: string };
type ResultItem = { testId: string; name: string; passed: boolean; message: string };
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
  const TABS_KEY = `lab:tabs:${exercise.id}`;

  const [files, setFiles] = useState<FileState[]>(initialFiles);
  const [active, setActive] = useState(initialActive || visibleFiles[0]?.path || '');
  const [openTabs, setOpenTabs] = useState<string[]>(() => (initialActive ? [initialActive] : visibleFiles[0] ? [visibleFiles[0].path] : []));
  const [dirty, setDirty] = useState<Set<string>>(() => new Set());
  const [editorKey, setEditorKey] = useState(0);
  const [running, setRunning] = useState(false);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [stdout, setStdout] = useState('');
  const [runError, setRunError] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [rightTab, setRightTab] = useState<RightTab>('tests');
  const [palette, setPalette] = useState(false);
  const [paletteQ, setPaletteQ] = useState('');

  const rootRef = useRef<HTMLDivElement>(null);
  const explorerRef = useRef<HTMLUListElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const paletteInputRef = useRef<HTMLInputElement>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeFile = files.find((f) => f.path === active) ?? files[0];
  const isDirty = dirty.size > 0;

  const editableMap = useCallback(
    () => Object.fromEntries(files.filter((f) => f.editable).map((f) => [f.path, f.content])),
    [files],
  );
  // Réf toujours à jour pour les flush (unload/visibility) sans recréer les listeners.
  const editableMapRef = useRef(editableMap);
  editableMapRef.current = editableMap;
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  // ── Persistance des onglets/fichier actif (par exercice) ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TABS_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        const valid = (Array.isArray(p.openTabs) ? p.openTabs : []).filter((t: string) => visibleFiles.some((f) => f.path === t));
        if (valid.length) setOpenTabs(valid);
        if (typeof p.active === 'string' && visibleFiles.some((f) => f.path === p.active)) setActive(p.active);
        setEditorKey((k) => k + 1);
      }
    } catch { /* défauts */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try { localStorage.setItem(TABS_KEY, JSON.stringify({ openTabs, active })); } catch { /* best-effort */ }
  }, [openTabs, active, TABS_KEY]);

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
    setSaveState('idle');
  }, [active]);

  const post = useCallback(async (action: string, extra: Record<string, unknown> = {}) => {
    const res = await fetch(`/api/lab/${exercise.id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, files: editableMap(), ...extra }),
    });
    return res.json().catch(() => ({ error: 'Réponse illisible.' }));
  }, [exercise.id, editableMap]);

  const save = useCallback(async () => {
    if (!dirtyRef.current.size) { setSaveState('saved'); return; }
    setSaveState('saving');
    const j = await post('save');
    if (j.ok) { setDirty(new Set()); setSaveState('saved'); } else setSaveState('idle');
  }, [post]);

  const run = useCallback(async () => {
    setRunning(true); setRunError(''); setAttempt(null); setStdout(''); setRightTab('tests');
    try {
      const j = await post('run');
      if (j.error) { setRunError(j.error); return; }
      setAttempt(j.attempt); setStdout(j.stdout ?? ''); setDirty(new Set()); setSaveState('saved');
    } finally { setRunning(false); }
  }, [post]);

  async function resetExercise() {
    if (!confirm('Réinitialiser tout l’exercice au code de départ ? Ton code sera perdu.')) return;
    const j = await post('reset');
    if (j.files) { setFiles(j.files); setDirty(new Set()); setAttempt(null); setStdout(''); setRunError(''); setSaveState('idle'); setEditorKey((k) => k + 1); }
  }

  async function resetActiveFile() {
    if (!activeFile || !activeFile.editable) return;
    if (!confirm(`Réinitialiser « ${activeFile.path} » au code de départ ?`)) return;
    const j = await post('reset-file', { path: activeFile.path });
    if (j.files) {
      setFiles(j.files);
      setDirty((d) => { const n = new Set(d); n.delete(activeFile.path); return n; });
      setEditorKey((k) => k + 1);
    }
  }

  // ── Autosave debouncé (n'agit que si des modifications non enregistrées) ──
  useEffect(() => {
    if (!isDirty) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => { if (!running) save(); }, 1400);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [files, isDirty, running, save]);

  // ── Flush avant fermeture/navigation (sendBeacon fiable) ──
  useEffect(() => {
    const flush = () => {
      if (!dirtyRef.current.size) return;
      try {
        const blob = new Blob([JSON.stringify({ action: 'save', files: editableMapRef.current() })], { type: 'application/json' });
        navigator.sendBeacon(`/api/lab/${exercise.id}`, blob);
      } catch { /* best-effort */ }
    };
    const onVis = () => { if (document.visibilityState === 'hidden') flush(); };
    window.addEventListener('beforeunload', flush);
    document.addEventListener('visibilitychange', onVis);
    return () => { flush(); window.removeEventListener('beforeunload', flush); document.removeEventListener('visibilitychange', onVis); };
  }, [exercise.id]);

  // ── Raccourcis clavier ──
  const focusZone = useCallback((zone: 'explorer' | 'editor' | 'results') => {
    if (zone === 'explorer') (explorerRef.current?.querySelector('button') as HTMLElement | null)?.focus();
    else if (zone === 'editor') (rootRef.current?.querySelector('.cm-content') as HTMLElement | null)?.focus();
    else (resultsRef.current?.querySelector('button, [tabindex]') as HTMLElement | null)?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); save(); }
      else if (mod && e.key === 'Enter') { e.preventDefault(); run(); }
      else if (mod && e.key.toLowerCase() === 'p') { e.preventDefault(); setPalette(true); }
      else if (mod && e.key.toLowerCase() === 'w') { e.preventDefault(); if (active) closeTab(active); }
      else if (e.altKey && e.key === '1') { e.preventDefault(); if (!layout.layout.leftOpen) layout.toggle('left'); focusZone('explorer'); }
      else if (e.altKey && e.key === '2') { e.preventDefault(); focusZone('editor'); }
      else if (e.altKey && e.key === '3') { e.preventDefault(); if (!layout.layout.rightOpen) layout.toggle('right'); focusZone('results'); }
      else if (e.key === 'Escape') { setPalette(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save, run, active, closeTab, focusZone, layout]);

  useEffect(() => { if (palette) paletteInputRef.current?.focus(); }, [palette]);

  const paletteResults = useMemo(() => {
    const q = paletteQ.trim().toLowerCase();
    return visibleFiles.filter((f) => !q || f.path.toLowerCase().includes(q));
  }, [paletteQ, visibleFiles]);

  const cols = `${layout.layout.leftOpen ? layout.layout.left + 'px' : '0'} ${layout.layout.leftOpen ? '6px' : '0'} minmax(0,1fr) ${layout.layout.rightOpen ? '6px' : '0'} ${layout.layout.rightOpen ? layout.layout.right + 'px' : '0'}`;

  return (
    <div className="wb" style={{ gridTemplateColumns: cols }} ref={rootRef}>
      {/* ── Panneau gauche ── */}
      {layout.layout.leftOpen && (
        <aside className="wb-left" aria-label="Consigne et fichiers">
          <div className="wb-panel-head">
            <span className="section-label">Consigne</span>
            <button className="wb-icon" title="Replier le panneau" aria-label="Replier le panneau gauche" onClick={() => layout.toggle('left')}><PanelLeftClose size={15} /></button>
          </div>
          <div className="wb-brief">{exercise.summary}</div>
          <div className="wb-panel-head"><span className="section-label">Fichiers</span></div>
          <ul className="wb-explorer" role="tree" aria-label="Explorateur de fichiers" ref={explorerRef}>
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

      {/* ── Zone centrale ── */}
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
          <span className={`wb-status-state${isDirty ? ' dirty' : ''}`}>{saveState === 'saving' ? 'Enregistrement…' : isDirty ? 'Modifié' : 'Enregistré'}</span>
          <span className="wb-actions">
            <button className="btn small primary" onClick={run} disabled={running}>{running ? <Loader2 size={13} className="spin" /> : <Play size={13} />} Lancer <kbd className="wb-kbd">⌘⏎</kbd></button>
            <button className="btn small" onClick={save} disabled={saveState === 'saving' || running}>Enregistrer</button>
            {activeFile?.editable && <button className="wb-icon" title="Réinitialiser ce fichier" aria-label="Réinitialiser ce fichier" onClick={resetActiveFile}><Undo2 size={15} /></button>}
            <button className="btn small ghost" onClick={resetExercise} disabled={running}><RotateCcw size={13} /> Reset</button>
            <button className="wb-icon" title="Réinitialiser la disposition" aria-label="Réinitialiser la disposition des panneaux" onClick={layout.reset}><LayoutTemplate size={15} /></button>
          </span>
        </div>
      </section>

      {/* ── Panneau droit ── */}
      {layout.layout.rightOpen && <Separator side="right" layout={layout} />}
      {layout.layout.rightOpen && (
        <aside className="wb-right" aria-label="Tests, console et aide" ref={resultsRef}>
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
                  <li>Raccourcis : <kbd>⌘/Ctrl+S</kbd> enregistrer · <kbd>⌘/Ctrl+↵</kbd> lancer · <kbd>⌘/Ctrl+P</kbd> ouvrir un fichier · <kbd>⌘/Ctrl+W</kbd> fermer l’onglet · <kbd>Alt+1/2/3</kbd> panneaux.</li>
                  <li>Les fichiers en <em>lecture</em> ne sont pas modifiables.</li>
                  <li>Ton travail est enregistré automatiquement et restauré au retour.</li>
                </ul>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* ── Palette de fichiers (Ctrl/Cmd+P) ── */}
      {palette && (
        <div className="wb-palette-backdrop" onClick={() => setPalette(false)}>
          <div className="wb-palette" role="dialog" aria-modal="true" aria-label="Ouvrir un fichier" onClick={(e) => e.stopPropagation()}>
            <input
              ref={paletteInputRef} className="wb-palette-input" placeholder="Ouvrir un fichier…"
              value={paletteQ} onChange={(e) => setPaletteQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && paletteResults[0]) { openFile(paletteResults[0].path); setPalette(false); setPaletteQ(''); } }}
            />
            <ul className="wb-palette-list">
              {paletteResults.map((f) => (
                <li key={f.path}>
                  <button onClick={() => { openFile(f.path); setPalette(false); setPaletteQ(''); }}><FileCode size={13} /> {f.path}</button>
                </li>
              ))}
              {paletteResults.length === 0 && <li className="lab-hint" style={{ padding: 8 }}>Aucun fichier.</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function Separator({ side, layout }: { side: 'left' | 'right'; layout: ReturnType<typeof usePanelLayout> }) {
  const value = side === 'left' ? layout.layout.left : layout.layout.right;
  return (
    <div
      className="wb-sep" role="separator" aria-orientation="vertical"
      aria-label={`Redimensionner le panneau ${side === 'left' ? 'gauche' : 'droit'}`}
      aria-valuenow={value} aria-valuemin={layout.MIN} aria-valuemax={layout.MAX}
      tabIndex={0} onPointerDown={layout.dragHandle(side)} onKeyDown={layout.keyHandle(side)}
    />
  );
}
