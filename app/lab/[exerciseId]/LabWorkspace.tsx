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
  AlertTriangle, Info, Lightbulb, Eye,
} from 'lucide-react';
import { usePanelLayout } from './usePanelLayout';
import { describeDiff } from '@/lib/test-diff';
import { hintForDiagnostic } from '@/lib/ts-hints';
import { appendPreviewLog, type PreviewLogEntry } from '@/lib/console-format';

const CodeMirrorEditor = dynamic(() => import('./CodeMirrorEditor'), {
  ssr: false,
  loading: () => <div className="cm-loading">Chargement de l’éditeur…</div>,
});
// Preview web : chargée uniquement sur /lab/[id] (le moteur de preview n'entre
// jamais dans les bundles des autres routes).
const FrontendPreview = dynamic(() => import('./FrontendPreview'), {
  ssr: false,
  loading: () => <div className="cm-loading">Chargement de l’aperçu…</div>,
});
// Preview React : chargée uniquement sur /lab/[id] (React hors des bundles non-lab).
const ReactPreview = dynamic(() => import('./ReactPreview'), {
  ssr: false,
  loading: () => <div className="cm-loading">Chargement de l’aperçu React…</div>,
});
// Terminal borné (CP7) : chargé PARESSEUSEMENT, uniquement dans le Lab.
const TerminalPanel = dynamic(() => import('./TerminalPanel'), {
  ssr: false,
  loading: () => <div className="cm-loading">Chargement du terminal…</div>,
});
type TerminalTaskView = import('./TerminalPanel').TerminalTaskView;

type FileState = { path: string; content: string; readOnly: boolean; editable: boolean; language: string; hidden: boolean; entry: boolean };
type TestMeta = { id: string; name: string };
type ResultItem = { testId: string; name: string; passed: boolean; message: string; expected?: unknown; actual?: unknown; durationMs?: number | null };
type Attempt = { total: number; passed: number; allPassed: boolean; durationMs: number; results: ResultItem[] };
type PrivateSummary = { total: number; passed: number } | null;
type Diagnostic = { category: 'error' | 'warning' | 'suggestion'; code: number | string; message: string; phase: string; file?: string; line?: number; column?: number; endLine?: number; endColumn?: number };
type RightTab = 'preview' | 'tests' | 'diagnostics' | 'console' | 'terminal' | 'help';
type PreviewLog = { level: string; type: string; text: string; line?: number | null; col?: number | null; at: number };

type RuntimeInfo = { id: string; label: string; available: boolean; version: string | null; error: string | null; compiles?: boolean; preview?: boolean; previewKind?: string | null };

// Formatage compact et borné d'une valeur pour l'affichage (attendu/reçu/diff).
function formatVal(v: unknown): string {
  let s: string;
  if (v === undefined) return 'undefined';
  try { s = typeof v === 'string' ? v : JSON.stringify(v); } catch { s = String(v); }
  if (typeof s !== 'string') s = String(s);
  return s.length > 300 ? s.slice(0, 300) + '…' : s;
}
// Vrai si la valeur mérite un diff structuré (objet ou tableau).
function isStructured(v: unknown): boolean {
  return typeof v === 'object' && v !== null;
}

export default function LabWorkspace({
  exercise, initialFiles, initialActive, runtime, terminalTasks = [],
}: {
  exercise: { id: string; title: string; summary: string; tests: TestMeta[]; testCount?: number };
  terminalTasks?: TerminalTaskView[];
  initialFiles: FileState[];
  initialActive: string;
  runtime: RuntimeInfo;
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
  const [runPhase, setRunPhase] = useState<'compiling' | 'testing' | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [privateSummary, setPrivateSummary] = useState<PrivateSummary>(null);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [compileFailed, setCompileFailed] = useState(false);
  const [goto, setGoto] = useState<{ line: number; column: number; nonce: number } | null>(null);
  const [stdout, setStdout] = useState('');
  const [runError, setRunError] = useState('');
  const isReact = !!runtime.preview && runtime.previewKind === 'react';
  const isWeb = !!runtime.preview;                 // web OU react (preview au sens large)
  const onPreviewDiagnostics = useCallback((d: Diagnostic[]) => setDiagnostics(d), []);
  const [previewLogs, setPreviewLogs] = useState<PreviewLogEntry[]>([]);
  const onPreviewLog = useCallback((log: PreviewLog) => setPreviewLogs((l) => appendPreviewLog(l, log)), []);
  // Fichiers passés à la preview : tous les fichiers visibles (HTML/CSS/JS),
  // y compris ceux en lecture seule ; jamais les fichiers de test (absents de `files`).
  const previewFiles = useMemo(() => files.filter((f) => !f.hidden).map((f) => ({ path: f.path, content: f.content })), [files]);
  const entryFile = useMemo(() => files.find((f) => f.entry)?.path ?? 'index.html', [files]);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [rightTab, setRightTab] = useState<RightTab>(runtime.preview ? 'preview' : 'tests');
  const [palette, setPalette] = useState(false);
  const [paletteQ, setPaletteQ] = useState('');
  const [history, setHistory] = useState<{ at: string; passed: number; total: number; allPassed: boolean; durationMs: number }[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const LASTRUN_KEY = `lab:lastrun:${exercise.id}`;
  // Vue étroite (tablette/mobile) : une zone à la fois via une nav segmentée.
  const [narrow, setNarrow] = useState(false);
  const [mv, setMv] = useState<'brief' | 'files' | 'code' | 'preview' | 'tests' | 'console' | 'terminal'>('code');

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

  // Restaure le dernier résultat d'exécution (session précédente) au montage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LASTRUN_KEY);
      if (raw) { const p = JSON.parse(raw); if (p.attempt) { setAttempt(p.attempt); setStdout(typeof p.stdout === 'string' ? p.stdout : ''); setPrivateSummary(p.privateSummary ?? null); } }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (running) return; // empêche les lancements concurrents (double-run)
    if (!runtime.available) { setRightTab('tests'); setRunError(runtime.error || `Runtime « ${runtime.label} » indisponible sur cette machine.`); return; }
    setRunning(true); setRunError(''); setAttempt(null); setPrivateSummary(null); setStdout(''); setDiagnostics([]); setCompileFailed(false); setRightTab('tests');
    // Runtime compilé : la compilation précède l'exécution des tests côté serveur.
    setRunPhase(runtime.compiles ? 'compiling' : 'testing');
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch(`/api/lab/${exercise.id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run', files: editableMap() }), signal: controller.signal,
      });
      const j = await res.json().catch(() => ({ error: 'Réponse illisible.' }));
      const diags: Diagnostic[] = Array.isArray(j.diagnostics) ? j.diagnostics : [];
      const isCompileFail = j.phase === 'compile';
      // Échec de compilation : ce n'est PAS une erreur fatale d'API — on affiche
      // les diagnostics. Une erreur sans tentative (400/500, réponse illisible)
      // ou une erreur d'exécution reste un message dans l'onglet Tests.
      if (j.error && !isCompileFail) { setRunError(j.error); if (j.attempt) setAttempt(j.attempt); return; }
      setDiagnostics(diags);
      setCompileFailed(isCompileFail);
      if (j.attempt) {
        setAttempt(j.attempt);
        setPrivateSummary(j.privateSummary ?? null);
        setHistory((h) => [{ at: new Date().toISOString(), passed: j.attempt.passed, total: j.attempt.total, allPassed: j.attempt.allPassed, durationMs: j.attempt.durationMs }, ...h].slice(0, 5));
        try { localStorage.setItem(LASTRUN_KEY, JSON.stringify({ attempt: j.attempt, stdout: j.stdout ?? '', privateSummary: j.privateSummary ?? null })); } catch { /* best-effort */ }
      }
      setStdout(j.stdout ?? ''); setDirty(new Set()); setSaveState('saved');
      // Échec de compilation → bascule vers l'onglet Diagnostics (distinct des tests).
      if (isCompileFail && diags.length) { setRightTab('diagnostics'); if (narrow) setMv('tests'); }
    } catch (e) {
      if ((e as Error).name === 'AbortError') setRunError('Exécution annulée. (Le bac à sable serveur s’arrête seul par timeout.)');
      else setRunError('Échec de l’exécution.');
    } finally { setRunning(false); setRunPhase(null); abortRef.current = null; }
  }, [exercise.id, editableMap, LASTRUN_KEY, runtime, running, narrow]);

  // Clic sur un diagnostic → ouvre le fichier concerné et révèle la position.
  const openDiagnostic = useCallback((d: Diagnostic) => {
    if (!d.file) return;
    const exists = files.some((f) => f.path === d.file && !f.hidden);
    if (!exists) return;
    openFile(d.file);
    if (d.line) setGoto({ line: d.line, column: d.column ?? 1, nonce: Date.now() });
  }, [files, openFile]);

  const cancelRun = useCallback(() => { abortRef.current?.abort(); }, []);

  async function resetExercise() {
    if (!confirm('Réinitialiser tout l’exercice au code de départ ? Ton code sera perdu.')) return;
    const j = await post('reset');
    if (j.files) { setFiles(j.files); setDirty(new Set()); setAttempt(null); setStdout(''); setRunError(''); setDiagnostics([]); setCompileFailed(false); setSaveState('idle'); setEditorKey((k) => k + 1); }
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

  // Détection viewport étroit (tablette/mobile) → nav segmentée à une zone.
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1199px)');
    const apply = () => setNarrow(mql.matches);
    apply();
    mql.addEventListener('change', apply);
    return () => mql.removeEventListener('change', apply);
  }, []);
  // Sélection d'une zone en vue étroite (synchronise l'onglet droit).
  const selectView = useCallback((v: typeof mv) => {
    setMv(v);
    if (v === 'preview') setRightTab('preview');
    if (v === 'tests') setRightTab('tests');
    if (v === 'console') setRightTab('console');
    if (v === 'terminal') setRightTab('terminal');
  }, []);

  const paletteResults = useMemo(() => {
    const q = paletteQ.trim().toLowerCase();
    return visibleFiles.filter((f) => !q || f.path.toLowerCase().includes(q));
  }, [paletteQ, visibleFiles]);

  const cols = `${layout.layout.leftOpen ? layout.layout.left + 'px' : '0'} ${layout.layout.leftOpen ? '6px' : '0'} minmax(0,1fr) ${layout.layout.rightOpen ? '6px' : '0'} ${layout.layout.rightOpen ? layout.layout.right + 'px' : '0'}`;
  const showLeft = narrow ? (mv === 'brief' || mv === 'files') : layout.layout.leftOpen;
  const showRight = narrow ? (mv === 'tests' || mv === 'console' || mv === 'preview' || mv === 'terminal') : layout.layout.rightOpen;
  const showCenter = narrow ? mv === 'code' : true;
  const termZone = terminalTasks.length > 0 ? ([['terminal', 'Terminal']] as const) : ([] as const);
  const mobileZones = isWeb
    ? ([['brief', 'Énoncé'], ['files', 'Fichiers'], ['code', 'Code'], ['preview', 'Preview'], ['tests', 'Tests'], ['console', 'Console'], ...termZone] as const)
    : ([['brief', 'Énoncé'], ['files', 'Fichiers'], ['code', 'Code'], ['tests', 'Tests'], ['console', 'Console'], ...termZone] as const);

  return (
    <>
    {narrow && (
      <nav className="wb-mobilenav" aria-label="Zones du laboratoire">
        {mobileZones.map(([v, label]) => (
          <button key={v} className={`wb-mvbtn${mv === v ? ' active' : ''}`} aria-pressed={mv === v} onClick={() => selectView(v)}>{label}</button>
        ))}
      </nav>
    )}
    <div className={`wb${narrow ? ' wb-narrow' : ''}`} data-mv={mv} style={narrow ? undefined : { gridTemplateColumns: cols }} ref={rootRef}>
      {/* ── Panneau gauche ── */}
      {showLeft && (
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
      {!narrow && layout.layout.leftOpen && <Separator side="left" layout={layout} />}

      {/* ── Zone centrale ── */}
      {showCenter && (
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
            ? <CodeMirrorEditor key={`${activeFile.path}:${editorKey}`} value={activeFile.content} onChange={onEdit} readOnly={!activeFile.editable} language={activeFile.language} goto={goto && goto.line ? goto : null} />
            : <div className="cm-loading">Aucun fichier ouvert.</div>}
        </div>
        <div className="wb-status">
          <span className="wb-status-file">{activeFile?.path ?? '—'}</span>
          <span className={`wb-runtime${runtime.available ? '' : ' off'}`} title={runtime.available ? (runtime.version ?? '') : (runtime.error ?? 'indisponible')}>
            <span className={`wb-runtime-dot${runtime.available ? ' on' : ''}`} aria-hidden="true" />
            {runtime.label}{runtime.available ? '' : ' · indisponible'}
          </span>
          <span className={`wb-status-state${isDirty ? ' dirty' : ''}`}>{saveState === 'saving' ? 'Enregistrement…' : isDirty ? 'Modifié' : 'Enregistré'}</span>
          <span className="wb-actions">
            <button className="btn small primary" onClick={run} disabled={running || !runtime.available} title={runtime.available ? 'Lancer les tests' : (runtime.error ?? 'Runtime indisponible')}>{running ? <Loader2 size={13} className="spin" /> : <Play size={13} />} Lancer <kbd className="wb-kbd">⌘⏎</kbd></button>{/* web: évaluation branchée en CP6 */}
            <button className="btn small" onClick={save} disabled={saveState === 'saving' || running}>Enregistrer</button>
            {activeFile?.editable && <button className="wb-icon" title="Réinitialiser ce fichier" aria-label="Réinitialiser ce fichier" onClick={resetActiveFile}><Undo2 size={15} /></button>}
            <button className="btn small ghost" onClick={resetExercise} disabled={running}><RotateCcw size={13} /> Reset</button>
            <button className="wb-icon" title="Réinitialiser la disposition" aria-label="Réinitialiser la disposition des panneaux" onClick={layout.reset}><LayoutTemplate size={15} /></button>
          </span>
        </div>
      </section>
      )}

      {/* ── Panneau droit ── */}
      {!narrow && layout.layout.rightOpen && <Separator side="right" layout={layout} />}
      {showRight && (
        <aside className="wb-right" aria-label="Tests, console et aide" ref={resultsRef}>
          <div className="wb-rtabs" role="tablist" aria-label="Panneau de résultats">
            {isWeb && (
              <button role="tab" aria-selected={rightTab === 'preview'} className={`wb-rtab${rightTab === 'preview' ? ' active' : ''}`} onClick={() => setRightTab('preview')}><Eye size={13} /> Preview</button>
            )}
            <button role="tab" aria-selected={rightTab === 'tests'} className={`wb-rtab${rightTab === 'tests' ? ' active' : ''}`} onClick={() => setRightTab('tests')}><FlaskConical size={13} /> Tests{attempt && !compileFailed ? ` (${attempt.passed}/${attempt.total})` : ''}</button>
            {runtime.compiles && (
              <button role="tab" aria-selected={rightTab === 'diagnostics'} className={`wb-rtab${rightTab === 'diagnostics' ? ' active' : ''}${compileFailed ? ' has-errors' : ''}`} onClick={() => setRightTab('diagnostics')}><AlertTriangle size={13} /> Diagnostics{diagnostics.length ? ` (${diagnostics.length})` : ''}</button>
            )}
            <button role="tab" aria-selected={rightTab === 'console'} className={`wb-rtab${rightTab === 'console' ? ' active' : ''}`} onClick={() => setRightTab('console')}><Terminal size={13} /> Console</button>
            {terminalTasks.length > 0 && (
              <button role="tab" aria-selected={rightTab === 'terminal'} className={`wb-rtab${rightTab === 'terminal' ? ' active' : ''}`} onClick={() => setRightTab('terminal')}><Terminal size={13} /> Terminal</button>
            )}
            <button role="tab" aria-selected={rightTab === 'help'} className={`wb-rtab${rightTab === 'help' ? ' active' : ''}`} onClick={() => setRightTab('help')}><HelpCircle size={13} /> Aide</button>
            <button className="wb-icon" style={{ marginLeft: 'auto' }} title="Replier le panneau" aria-label="Replier le panneau droit" onClick={() => layout.toggle('right')}><PanelRightClose size={15} /></button>
          </div>
          <div className="wb-rbody" aria-live="polite">
            {/* Preview web : montée en permanence (reste vivante hors onglet) ;
                masquée quand un autre onglet est actif → continue d'alimenter la Console. */}
            {isReact ? (
              <ReactPreview exerciseId={exercise.id} files={previewFiles} onLog={onPreviewLog} onDiagnostics={onPreviewDiagnostics} hidden={rightTab !== 'preview'} />
            ) : isWeb ? (
              <FrontendPreview files={previewFiles} entry={entryFile} onLog={onPreviewLog} hidden={rightTab !== 'preview'} />
            ) : null}
            {rightTab === 'tests' && (
              <>
                {running && (
                  <div className="wb-running">
                    <span className="lab-hint"><Loader2 size={13} className="spin" /> {runPhase === 'compiling' ? 'Compilation…' : 'Exécution des tests…'}</span>
                    <button className="btn small ghost" onClick={cancelRun}>Annuler</button>
                  </div>
                )}
                {runError && <div className="lab-error">{runError}</div>}
                {!attempt && !runError && !running && <div className="lab-hint">Lance les tests pour voir le détail. {exercise.testCount ?? exercise.tests.length} tests.</div>}
                {compileFailed && !running && (
                  <div className="lab-error" style={{ marginBottom: 'var(--sp-3)' }}>
                    <AlertTriangle size={14} /> Compilation échouée : les tests n’ont pas été exécutés.{' '}
                    <button className="wb-linkbtn" onClick={() => setRightTab('diagnostics')}>Voir les diagnostics ({diagnostics.length})</button>
                  </div>
                )}
                {attempt && !compileFailed && (
                  <>
                    <div className={`lab-verdict ${attempt.allPassed ? 'ok' : 'ko'}`} style={{ marginBottom: 'var(--sp-3)' }}>{attempt.passed}/{attempt.total} tests · {attempt.durationMs} ms</div>
                    <ul className="lab-test-list">
                      {attempt.results.map((r) => {
                        const showDiff = !r.passed && r.expected !== undefined;
                        const structural = showDiff && isStructured(r.expected) && isStructured(r.actual);
                        const diffs = structural ? describeDiff(r.expected, r.actual) : [];
                        return (
                          <li key={r.testId} className={`lab-test ${r.passed ? 'ok' : 'ko'}`}>
                            <span className="lab-test-ico">{r.passed ? <Check size={14} /> : <X size={14} />}</span>
                            <span className="lab-test-body">
                              <span className="lab-test-head">
                                <span className="lab-test-name">{r.name}</span>
                                {typeof r.durationMs === 'number' && <span className="lab-test-dur">{r.durationMs} ms</span>}
                              </span>
                              {!r.passed && (
                                showDiff ? (
                                  <span className="lab-test-diff">
                                    <span className="lab-diff-row"><span className="lab-diff-label ok">attendu</span> <code>{formatVal(r.expected)}</code></span>
                                    <span className="lab-diff-row"><span className="lab-diff-label ko">reçu</span> <code>{formatVal(r.actual)}</code></span>
                                    {diffs.length > 0 && (
                                      <ul className="lab-diff-paths">
                                        {diffs.map((d, i) => (
                                          <li key={i}><code>{d.path || '(racine)'}</code> : {formatVal(d.expected)} → {formatVal(d.actual)}</li>
                                        ))}
                                      </ul>
                                    )}
                                  </span>
                                ) : <span className="lab-test-msg">{r.message}</span>
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    {privateSummary && (
                      <div className={`lab-private ${privateSummary.passed === privateSummary.total ? 'ok' : 'ko'}`}>
                        <FlaskConical size={12} /> Tests privés : {privateSummary.passed}/{privateSummary.total} réussis <span className="lab-private-note">(détails masqués)</span>
                      </div>
                    )}
                  </>
                )}
                {history.length > 1 && (
                  <div className="wb-history">
                    <div className="section-label" style={{ marginBottom: 6 }}>Exécutions récentes</div>
                    <ul>
                      {history.map((h, i) => (
                        <li key={h.at + i} className={h.allPassed ? 'ok' : 'ko'}>
                          <span>{new Date(h.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          <span>{h.passed}/{h.total}</span>
                          <span>{h.durationMs} ms</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
            {rightTab === 'diagnostics' && (
              diagnostics.length === 0
                ? <div className="lab-hint">{running ? 'Compilation…' : compileFailed ? 'Aucun diagnostic exposé.' : 'Aucun diagnostic. Le code compile.'}</div>
                : <ul className="wb-diags">
                    {diagnostics.map((d, i) => {
                      const Icon = d.category === 'error' ? AlertTriangle : d.category === 'warning' ? Info : Lightbulb;
                      const clickable = !!(d.file && files.some((f) => f.path === d.file && !f.hidden));
                      const hint = hintForDiagnostic(d.code);
                      return (
                        <li key={`${d.file ?? ''}:${d.line ?? 0}:${d.column ?? 0}:${d.code}:${i}`} className={`wb-diag ${d.category}`}>
                          <button className="wb-diag-btn" onClick={() => openDiagnostic(d)} disabled={!clickable} title={clickable ? 'Ouvrir à cette position' : undefined}>
                            <span className="wb-diag-ico"><Icon size={14} /></span>
                            <span className="wb-diag-body">
                              <span className="wb-diag-msg">{d.message}</span>
                              <span className="wb-diag-loc">
                                {d.file ? d.file : 'général'}{d.line ? `:${d.line}:${d.column ?? 1}` : ''} · {typeof d.code === 'number' ? `TS${d.code}` : d.code}
                              </span>
                              {hint && <span className="wb-diag-hint"><Lightbulb size={11} /> {hint}</span>}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
            )}
            {rightTab === 'console' && (
              isWeb ? (
                <div className="wb-weblog">
                  <div className="wb-weblog-bar">
                    <span className="lab-hint">{previewLogs.length} message{previewLogs.length > 1 ? 's' : ''}</span>
                    {previewLogs.length > 0 && <button className="btn small ghost" onClick={() => setPreviewLogs([])}>Effacer</button>}
                  </div>
                  {previewLogs.length === 0
                    ? <div className="lab-hint">Aucun message. Utilise <code>console.log</code> dans ton JavaScript ; les erreurs s’affichent ici.</div>
                    : <ul className="wb-weblog-list">
                        {previewLogs.map((l, i) => (
                          <li key={l.at + ':' + i} className={`wb-weblog-item ${l.type === 'error' ? 'error' : l.level}`}>
                            <span className="wb-weblog-lvl">{l.type === 'error' ? 'err' : l.level}</span>
                            <span className="wb-weblog-text">{l.text}{l.line ? ` (l.${l.line})` : ''}</span>
                          </li>
                        ))}
                      </ul>}
                </div>
              ) : (
                stdout ? <pre className="wb-console">{stdout.slice(0, 8000)}</pre> : <div className="lab-hint">Aucune sortie standard. Utilise <code>console.log</code> dans ton code.</div>
              )
            )}
            {rightTab === 'terminal' && terminalTasks.length > 0 && (
              <TerminalPanel tasks={terminalTasks} />
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
    </>
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
