// Compilateur TSX/JSX PUR pour le runtime React (côté serveur uniquement).
// Réutilise le compilateur TypeScript (API programmatique) avec le runtime JSX
// automatique. Type-check RÉEL (React + @types/react résolus localement) sans
// jamais autoriser d'import npm arbitraire : l'analyse statique n'accepte que les
// imports RELATIFS entre fichiers de l'exercice + une allowlist React explicite.
// Voir docs/ADR-012. Le code utilisateur n'est jamais EXÉCUTÉ ici (transpilation).
import ts from 'typescript';
import { join } from 'node:path';

// Modules externes autorisés (fournis localement, sans CDN ni réseau).
export const REACT_ALLOWLIST = new Set([
  'react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime',
]);

const GLOBALS_FILE = '__lab_react_globals__.d.ts';
// Ambient : permet `import './x.css'` (module CSS → side-effect) et console.
const GLOBALS_DTS = `
declare module '*.css';
declare module '*.json';
`;

function compilerOptions() {
  return {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,          // runtime JSX automatique (react/jsx-runtime)
    esModuleInterop: true,
    strict: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    sourceMap: false,
    declaration: false,
    noEmitOnError: true,
    allowJs: true,
    resolveJsonModule: true,
  };
}

// ── Helpers purs ─────────────────────────────────────────────────────────────
function posToLineCol(content, pos) {
  let line = 1, col = 1;
  const n = Math.min(pos, content.length);
  for (let i = 0; i < n; i++) { if (content[i] === '\n') { line++; col = 1; } else col++; }
  return { line, column: col };
}
function dirnamePosix(p) { const i = p.lastIndexOf('/'); return i < 0 ? '' : p.slice(0, i); }
function normalizePosix(p) {
  const parts = [];
  for (const seg of p.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') { if (parts.length && parts[parts.length - 1] !== '..') parts.pop(); else parts.push('..'); }
    else parts.push(seg);
  }
  return parts.join('/');
}
function resolveRelative(importerPath, spec, provided) {
  const base = normalizePosix(dirnamePosix(importerPath) + '/' + spec);
  if (base === '' || base.startsWith('..')) return null;
  const cands = [base, base + '.tsx', base + '.ts', base + '.jsx', base + '.js', base + '/index.tsx', base + '/index.ts'];
  for (const c of cands) if (provided.has(c)) return c;
  return null;
}

function analyzeImports(path, content, provided) {
  const diags = [];
  const pre = ts.preProcessFile(content, true, true);
  const reject = (spec, pos, reason) => {
    const { line, column } = posToLineCol(content, pos);
    diags.push({ category: 'error', code: 'LAB_IMPORT', phase: 'compile', file: path, line, column,
      message: `Import interdit « ${spec} » : ${reason}. Seuls les imports relatifs de l'exercice et React (react, react-dom, react-dom/client, react/jsx-runtime) sont autorisés.` });
  };
  for (const imp of pre.importedFiles) {
    const spec = imp.fileName;
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(spec) || spec.startsWith('//')) { reject(spec, imp.pos, 'les URL ne sont pas autorisées'); continue; }
    if (spec.startsWith('/')) { reject(spec, imp.pos, 'les chemins absolus ne sont pas autorisés'); continue; }
    if (spec.startsWith('./') || spec.startsWith('../')) {
      if (/\.(css|json)$/i.test(spec)) continue;                       // ressource (side-effect)
      if (!resolveRelative(path, spec, provided)) reject(spec, imp.pos, 'fichier introuvable dans cet exercice');
      continue;
    }
    if (!REACT_ALLOWLIST.has(spec)) reject(spec, imp.pos, 'ce package externe n’est pas autorisé');
  }
  for (const ref of [...(pre.referencedFiles || []), ...(pre.typeReferenceDirectives || []), ...(pre.libReferenceDirectives || [])]) {
    const { line, column } = posToLineCol(content, ref.pos);
    diags.push({ category: 'error', code: 'LAB_REFERENCE', phase: 'compile', file: path, line, column,
      message: `Directive de référence interdite « ${ref.fileName} ».` });
  }
  return diags;
}

function normalizeTsDiagnostic(d, vdir) {
  const category = d.category === ts.DiagnosticCategory.Error ? 'error'
    : d.category === ts.DiagnosticCategory.Warning ? 'warning'
    : d.category === ts.DiagnosticCategory.Suggestion ? 'suggestion' : 'error';
  const message = ts.flattenDiagnosticMessageText(d.messageText, '\n');
  const out = { category, code: d.code, message, phase: 'compile' };
  if (d.file && typeof d.start === 'number') {
    const start = d.file.getLineAndCharacterOfPosition(d.start);
    out.file = d.file.fileName.startsWith(vdir + '/') ? d.file.fileName.slice(vdir.length + 1) : d.file.fileName;
    out.line = start.line + 1;
    out.column = start.character + 1;
    if (typeof d.length === 'number') {
      const end = d.file.getLineAndCharacterOfPosition(d.start + d.length);
      out.endLine = end.line + 1; out.endColumn = end.character + 1;
    }
  }
  return out;
}

function sortDiagnostics(diags) {
  return [...diags].sort((a, b) => {
    const fa = a.file ?? '', fb = b.file ?? '';
    if (fa !== fb) return fa < fb ? -1 : 1;
    if ((a.line ?? 0) !== (b.line ?? 0)) return (a.line ?? 0) - (b.line ?? 0);
    if ((a.column ?? 0) !== (b.column ?? 0)) return (a.column ?? 0) - (b.column ?? 0);
    return String(a.code) < String(b.code) ? -1 : String(a.code) > String(b.code) ? 1 : 0;
  });
}

const NUL = String.fromCharCode(0);

/**
 * Compile les fichiers `.tsx/.jsx/.ts/.js` d'un exercice React en JavaScript
 * (CommonJS). Type-check réel. Les `.css` sont collectés (non compilés).
 * @param {Array<{path:string, content:string}>} files
 * @returns {{ success, emittedFiles:Record<string,string>, cssFiles:string[], diagnostics:Array<object>, durationMs:number }}
 */
export function compileReactExercise(files, _opts = {}) {
  const started = Date.now();
  const list = Array.isArray(files) ? files : [];
  const codeFiles = list.filter((f) => /\.(tsx|ts|jsx|js)$/i.test(String(f.path)));
  const cssFiles = list.filter((f) => /\.css$/i.test(String(f.path))).map((f) => String(f.path));
  const provided = new Set(codeFiles.map((f) => String(f.path)));

  for (const f of codeFiles) {
    if (typeof f.content === 'string' && f.content.indexOf(NUL) !== -1) {
      return { success: false, emittedFiles: {}, cssFiles, diagnostics: [{ category: 'error', code: 'LAB_BINARY', phase: 'compile', file: String(f.path), message: 'Fichier binaire non autorisé.' }], durationMs: Date.now() - started };
    }
  }
  if (codeFiles.length === 0) {
    return { success: false, emittedFiles: {}, cssFiles, diagnostics: [{ category: 'error', code: 'LAB_NO_TSX', phase: 'compile', message: 'Aucun composant React à compiler.' }], durationMs: Date.now() - started };
  }

  // 1) Analyse statique des imports.
  const importDiags = [];
  for (const f of codeFiles) importDiags.push(...analyzeImports(String(f.path), String(f.content ?? ''), provided));
  if (importDiags.length > 0) {
    return { success: false, emittedFiles: {}, cssFiles, diagnostics: sortDiagnostics(importDiags), durationMs: Date.now() - started };
  }

  // 2) Programme TS (host délégant : fichiers utilisateur EN MÉMOIRE sous un
  //    répertoire virtuel dans le projet → node_modules React/@types résolus).
  const options = compilerOptions();
  const ROOT = process.cwd();
  const VDIR = join(ROOT, '__lab_react__').replace(/\\/g, '/');
  const fileMap = new Map();
  for (const f of codeFiles) fileMap.set(`${VDIR}/${f.path}`, String(f.content ?? ''));
  fileMap.set(`${VDIR}/${GLOBALS_FILE}`, GLOBALS_DTS);

  const base = ts.createCompilerHost(options);
  const outputs = {};
  // Le répertoire virtuel « existe » pour la résolution Node10 (fichiers en
  // mémoire) ; le reste (node_modules réel, lib TS) est délégué à l'hôte de base.
  const inV = (d) => d === VDIR || d.startsWith(VDIR + '/') || VDIR.startsWith(d + '/') || d === ROOT;
  const host = {
    ...base,
    getSourceFile(fileName, lv) {
      if (fileMap.has(fileName)) return ts.createSourceFile(fileName, fileMap.get(fileName), lv, true);
      const t = base.readFile(fileName);
      return t !== undefined ? ts.createSourceFile(fileName, t, lv, true) : undefined;
    },
    writeFile(name, text) { outputs[name] = text; },
    fileExists(f) { return fileMap.has(f) || base.fileExists(f); },
    readFile(f) { return fileMap.has(f) ? fileMap.get(f) : base.readFile(f); },
    directoryExists(d) { return d.startsWith(VDIR) || inV(d) || base.directoryExists(d); },
    realpath(p) { return p.startsWith(VDIR) ? p : (base.realpath ? base.realpath(p) : p); },
    getCurrentDirectory() { return ROOT; },
  };
  const rootNames = [...fileMap.keys()];
  const program = ts.createProgram(rootNames, options, host);
  const emitResult = program.emit();
  const raw = [
    ...program.getOptionsDiagnostics(),
    ...program.getGlobalDiagnostics(),
    ...program.getSyntacticDiagnostics(),
    ...program.getSemanticDiagnostics(),
    ...emitResult.diagnostics,
  ];
  const diagnostics = sortDiagnostics(
    raw.filter((d) => !(d.file && d.file.fileName.endsWith(GLOBALS_FILE))).map((d) => normalizeTsDiagnostic(d, VDIR)),
  );
  const hasError = diagnostics.some((d) => d.category === 'error') || emitResult.emitSkipped;

  const emittedFiles = {};
  if (!hasError) {
    for (const [name, text] of Object.entries(outputs)) {
      if (name.endsWith(GLOBALS_FILE)) continue;
      if (name.endsWith('.js') && name.startsWith(VDIR + '/')) emittedFiles[name.slice(VDIR.length + 1)] = text;
    }
  }
  const success = !hasError && Object.keys(emittedFiles).length > 0;
  return { success, emittedFiles, cssFiles, diagnostics, durationMs: Date.now() - started };
}
