// Compilateur TypeScript PUR (aucune I/O disque, aucun spawn) — cœur du runtime
// TypeScript V10. Compile les fichiers `.ts` d'un exercice en JavaScript via
// l'API programmatique officielle du package `typescript`, avec un CompilerHost
// EN MÉMOIRE : seuls les fichiers fournis + les .d.ts de la lib TS sont lisibles ;
// AUCUNE résolution de `node_modules`, de réseau, ni du système de fichiers réel
// (hormis la lib TS). Aucune dépendance à ts-node/tsx/esbuild/Babel.
//
// Discipline pédagogique :
//  • imports RELATIFS uniquement entre fichiers du même exercice ; tout package
//    externe / chemin absolu / URL / traversal hors racine est REJETÉ avant
//    compilation (analyse statique pure), avec un diagnostic clair ;
//  • diagnostics NORMALISÉS et ordonnés de façon déterministe ;
//  • `noEmitOnError` : aucune émission de JS si une erreur bloquante subsiste
//    → jamais de processus lancé sur du code invalide ;
//  • chemins de fichiers RELATIFS à l'exercice (aucune fuite de chemin interne).
import ts from 'typescript';

// Fichier d'ambiances injecté (non émis, non exposé) : quelques globals utiles
// pour des exercices Node pédagogiques SANS tirer le DOM ni tout @types/node.
const GLOBALS_FILE = '__lab_globals__.d.ts';
const GLOBALS_DTS = `
interface LabConsole {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
  debug(...args: any[]): void;
}
declare var console: LabConsole;
declare function setTimeout(handler: (...args: any[]) => void, timeout?: number, ...args: any[]): number;
declare function clearTimeout(id?: number): void;
declare function setInterval(handler: (...args: any[]) => void, timeout?: number, ...args: any[]): number;
declare function clearInterval(id?: number): void;
declare function queueMicrotask(callback: () => void): void;
declare function structuredClone<T>(value: T): T;
`;

// Options de compilation (justifiées dans docs/ADR-010).
function compilerOptions() {
  return {
    target: ts.ScriptTarget.ES2022,       // Node 22 supporte pleinement ES2022
    module: ts.ModuleKind.CommonJS,       // JS émis en CJS → chargeable par require()
    strict: true,                         // objectif pédagogique : TS strict
    noEmitOnError: true,                  // pas d'émission si erreur bloquante
    esModuleInterop: false,               // pas d'import de CJS externe
    skipLibCheck: true,                   // perf : ne pas vérifier les .d.ts de la lib
    sourceMap: false,                     // pas de .map (pas de fuite de chemins)
    inlineSourceMap: false,
    declaration: false,
    removeComments: false,
    types: [],                            // aucune résolution de @types externes
    lib: ['lib.es2022.d.ts'],             // ES2022 sans DOM (pas de navigateur)
    moduleResolution: ts.ModuleResolutionKind.Node10,
    forceConsistentCasingInFileNames: true,
    noImplicitAny: true,
    noEmitHelpers: false,
    isolatedModules: false,
  };
}

// ── Analyse statique des imports (pure) ──────────────────────────────────────
function dirnamePosix(p) {
  const i = p.lastIndexOf('/');
  return i < 0 ? '' : p.slice(0, i);
}
function normalizePosix(p) {
  const parts = [];
  for (const seg of p.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') {
      if (parts.length && parts[parts.length - 1] !== '..') parts.pop();
      else parts.push('..');
    } else parts.push(seg);
  }
  return parts.join('/');
}
function posToLineCol(content, pos) {
  let line = 1, col = 1;
  const n = Math.min(pos, content.length);
  for (let i = 0; i < n; i++) {
    if (content[i] === '\n') { line++; col = 1; } else col++;
  }
  return { line, column: col };
}

/**
 * Résout un spécificateur d'import RELATIF vers un fichier fourni.
 * @returns {string|null} chemin résolu (dans l'ensemble fourni) ou null.
 */
function resolveRelative(importerPath, spec, provided) {
  const base = normalizePosix(dirnamePosix(importerPath) + '/' + spec);
  if (base === '' || base.startsWith('..')) return null; // sort de la racine
  const candidates = [base, base + '.ts', base + '.tsx', base + '.d.ts',
    base + '/index.ts', base + '/index.d.ts', base + '.js'];
  for (const c of candidates) if (provided.has(c)) return c;
  return null;
}

/**
 * Analyse les imports d'un fichier .ts et renvoie des diagnostics d'erreur pour
 * tout import interdit (externe, absolu, URL, traversal, introuvable), plus les
 * références triple-slash (interdites). Pur.
 */
function analyzeImports(path, content, provided) {
  const diags = [];
  const pre = ts.preProcessFile(content, true, true);
  const reject = (spec, pos, reason) => {
    const { line, column } = posToLineCol(content, pos);
    diags.push({ category: 'error', code: 'LAB_IMPORT', phase: 'compile', file: path, line, column,
      message: `Import interdit « ${spec} » : ${reason}. Seuls les imports relatifs vers un autre fichier de cet exercice sont autorisés.` });
  };
  for (const imp of pre.importedFiles) {
    const spec = imp.fileName;
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(spec) || spec.startsWith('//')) { reject(spec, imp.pos, 'les URL ne sont pas autorisées'); continue; }
    if (spec.startsWith('/')) { reject(spec, imp.pos, 'les chemins absolus ne sont pas autorisés'); continue; }
    if (!spec.startsWith('./') && !spec.startsWith('../')) { reject(spec, imp.pos, 'les packages externes ne sont pas autorisés'); continue; }
    const resolved = resolveRelative(path, spec, provided);
    if (!resolved) reject(spec, imp.pos, spec.includes('..') && normalizePosix(dirnamePosix(path) + '/' + spec).startsWith('..')
      ? 'il sort du dossier de l’exercice' : 'fichier introuvable dans cet exercice');
  }
  // Références triple-slash (/// <reference path=... /> ou types=...) interdites.
  for (const ref of [...(pre.referencedFiles || []), ...(pre.typeReferenceDirectives || []), ...(pre.libReferenceDirectives || [])]) {
    const { line, column } = posToLineCol(content, ref.pos);
    diags.push({ category: 'error', code: 'LAB_REFERENCE', phase: 'compile', file: path, line, column,
      message: `Directive de référence interdite « ${ref.fileName} » : les directives triple-slash ne sont pas autorisées.` });
  }
  return diags;
}

// ── Normalisation des diagnostics du compilateur ─────────────────────────────
function normalizeTsDiagnostic(d) {
  const category = d.category === ts.DiagnosticCategory.Error ? 'error'
    : d.category === ts.DiagnosticCategory.Warning ? 'warning'
    : d.category === ts.DiagnosticCategory.Suggestion ? 'suggestion' : 'error';
  const message = ts.flattenDiagnosticMessageText(d.messageText, '\n');
  const out = { category, code: d.code, message, phase: 'compile' };
  if (d.file && typeof d.start === 'number') {
    const start = d.file.getLineAndCharacterOfPosition(d.start);
    out.file = d.file.fileName;          // nom RELATIF (racine host = '/')
    out.line = start.line + 1;
    out.column = start.character + 1;
    if (typeof d.length === 'number') {
      const end = d.file.getLineAndCharacterOfPosition(d.start + d.length);
      out.endLine = end.line + 1;
      out.endColumn = end.character + 1;
    }
  }
  return out;
}

// Ordre déterministe : globaux (sans fichier) d'abord, puis par fichier, ligne,
// colonne, code. Stable et reproductible pour l'affichage et les tests.
function sortDiagnostics(diags) {
  return [...diags].sort((a, b) => {
    const fa = a.file ?? '', fb = b.file ?? '';
    if (fa !== fb) return fa < fb ? -1 : 1;
    if ((a.line ?? 0) !== (b.line ?? 0)) return (a.line ?? 0) - (b.line ?? 0);
    if ((a.column ?? 0) !== (b.column ?? 0)) return (a.column ?? 0) - (b.column ?? 0);
    return String(a.code) < String(b.code) ? -1 : String(a.code) > String(b.code) ? 1 : 0;
  });
}

// ── CompilerHost en mémoire ──────────────────────────────────────────────────
// Ne sert QUE les fichiers fournis + les .d.ts de la lib TS (via l'hôte défaut).
// Toute autre lecture/existence renvoie « absent » : aucune résolution FS réelle.
function createMemoryHost(fileMap, options, outputs) {
  const base = ts.createCompilerHost(options);
  const libDir = base.getDefaultLibLocation ? base.getDefaultLibLocation() : '';
  const isLib = (fileName) => (libDir && fileName.startsWith(libDir)) || /(^|\/)lib\.[^/]+\.d\.ts$/.test(fileName);
  const strip = (f) => f.replace(/^\/+/, '');
  const provided = new Set([...fileMap.keys()]);
  // Résolution de modules 100 % en mémoire : uniquement vers les fichiers fournis
  // (imports relatifs déjà validés). Aucune consultation de node_modules/FS réel.
  const resolveOne = (spec, containingFile) => {
    const resolved = resolveRelative(strip(containingFile), spec, provided);
    if (!resolved) return undefined;
    const extension = resolved.endsWith('.d.ts') ? ts.Extension.Dts
      : resolved.endsWith('.tsx') ? ts.Extension.Tsx
      : resolved.endsWith('.ts') ? ts.Extension.Ts : ts.Extension.Js;
    return { resolvedFileName: resolved, extension, isExternalLibraryImport: false };
  };
  return {
    resolveModuleNames(moduleNames, containingFile) {
      return moduleNames.map((name) => resolveOne(name, containingFile));
    },
    resolveModuleNameLiterals(moduleLiterals, containingFile) {
      return moduleLiterals.map((lit) => {
        const resolvedModule = resolveOne(lit.text, containingFile);
        return { resolvedModule };
      });
    },
    getSourceFile(fileName, languageVersion) {
      if (fileMap.has(fileName)) return ts.createSourceFile(fileName, fileMap.get(fileName), languageVersion, true);
      if (isLib(fileName)) {
        const text = base.readFile(fileName);
        return text !== undefined ? ts.createSourceFile(fileName, text, languageVersion, true) : undefined;
      }
      return undefined;
    },
    writeFile(name, text) { outputs[name] = text; },
    getDefaultLibFileName: (o) => base.getDefaultLibFileName(o),
    getDefaultLibLocation: base.getDefaultLibLocation ? base.getDefaultLibLocation.bind(base) : undefined,
    getCurrentDirectory: () => '/',
    getCanonicalFileName: (f) => f,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
    fileExists: (f) => fileMap.has(f) || (isLib(f) && base.fileExists(f)),
    readFile: (f) => (fileMap.has(f) ? fileMap.get(f) : (isLib(f) ? base.readFile(f) : undefined)),
    directoryExists: () => true,
    getDirectories: () => [],
  };
}

const NUL = String.fromCharCode(0);

/**
 * Compile les fichiers `.ts` d'un exercice en JavaScript (CommonJS).
 * @param {Array<{path:string, content:string}>} files fichiers du workspace.
 * @param {{ fileName?: string }} [_opts] réservé (compat).
 * @returns {{ success:boolean, emittedFiles:Record<string,string>,
 *            diagnostics:Array<object>, durationMs:number }}
 */
export function compileExerciseTs(files, _opts = {}) {
  const started = Date.now();
  const list = Array.isArray(files) ? files : [];
  // Fichiers compilables : .ts / .tsx / .d.ts (les autres sont ignorés).
  const tsFiles = list.filter((f) => /\.(ts|tsx)$/.test(String(f.path)) || String(f.path).endsWith('.d.ts'));
  const provided = new Set(tsFiles.map((f) => String(f.path)));

  // Garde-fou binaire (défense en profondeur ; la validation amont l'assure déjà).
  for (const f of tsFiles) {
    if (typeof f.content === 'string' && f.content.indexOf(NUL) !== -1) {
      return { success: false, emittedFiles: {}, diagnostics: [{ category: 'error', code: 'LAB_BINARY', phase: 'compile', file: String(f.path), message: 'Fichier binaire non autorisé.' }], durationMs: Date.now() - started };
    }
  }
  if (tsFiles.length === 0) {
    return { success: false, emittedFiles: {}, diagnostics: [{ category: 'error', code: 'LAB_NO_TS', phase: 'compile', message: 'Aucun fichier TypeScript à compiler.' }], durationMs: Date.now() - started };
  }

  // 1) Analyse statique des imports (avant toute compilation).
  const importDiags = [];
  for (const f of tsFiles) importDiags.push(...analyzeImports(String(f.path), String(f.content ?? ''), provided));
  if (importDiags.length > 0) {
    return { success: false, emittedFiles: {}, diagnostics: sortDiagnostics(importDiags), durationMs: Date.now() - started };
  }

  // 2) Compilation en mémoire.
  const options = compilerOptions();
  const fileMap = new Map();
  for (const f of tsFiles) fileMap.set(String(f.path), String(f.content ?? ''));
  fileMap.set(GLOBALS_FILE, GLOBALS_DTS);
  const outputs = {};
  const host = createMemoryHost(fileMap, options, outputs);
  const rootNames = [...provided, GLOBALS_FILE];
  const program = ts.createProgram(rootNames, options, host);
  const emitResult = program.emit();

  const raw = [
    ...program.getConfigFileParsingDiagnostics(),
    ...program.getOptionsDiagnostics(),
    ...program.getGlobalDiagnostics(),
    ...program.getSyntacticDiagnostics(),
    ...program.getSemanticDiagnostics(),
    ...emitResult.diagnostics,
  ];
  // Ignore les diagnostics pointant sur le fichier d'ambiances interne.
  const diagnostics = sortDiagnostics(
    raw.filter((d) => !(d.file && d.file.fileName === GLOBALS_FILE)).map(normalizeTsDiagnostic),
  );
  const hasError = diagnostics.some((d) => d.category === 'error') || emitResult.emitSkipped;

  // 3) Émission : uniquement les .js (pas le fichier d'ambiances), et seulement
  //    en l'absence d'erreur bloquante (noEmitOnError l'assure aussi).
  const emittedFiles = {};
  if (!hasError) {
    for (const [name, text] of Object.entries(outputs)) {
      if (name === GLOBALS_FILE) continue;
      if (name.endsWith('.js')) emittedFiles[name] = text;
    }
  }
  const success = !hasError && Object.keys(emittedFiles).length > 0;
  return { success, emittedFiles, diagnostics, durationMs: Date.now() - started };
}
