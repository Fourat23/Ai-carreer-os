// Gestionnaire d'espace de travail sécurisé — opérations DISQUE + EXÉCUTION.
// Paramétré par `root` (injection) pour rester testable contre un répertoire
// temporaire. Le liant applicatif (workspace-server.ts) fixe la racine dédiée
// data/lab-workspaces/. Toute la validation pure (chemins, allowlist) vient de
// workspace.mjs. Contraintes de sûreté appliquées ici :
//  • racine dédiée par exercice ; aucun accès hors racine (resolveWithinRoot) ;
//  • seuls les fichiers du template sont lisibles/écrivables (allowlist) ;
//  • fichiers marqués readOnly non modifiables ;
//  • taille par fichier et taille totale bornées ;
//  • exécution : execFile sans shell, binaire = ce Node, args = [harnais],
//    timeout + SIGKILL, sortie plafonnée, environnement minimal (aucun secret) ;
//  • isolation entre exercices (répertoires distincts, évasion impossible).
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { getRuntimeAdapter, DEFAULT_RUNTIME_ID } from './runtime.mjs';
import { effectiveLimits, buildAttemptResult } from './exercise.mjs';
import { detectRuntime } from './runtime-detect.mjs';
import { normalizeExerciseFiles } from './exercise-files.mjs';
import { resolveWithinRoot, gradeRun, parseHarnessOutput } from './workspace.mjs';
import { compileExerciseTs } from './typescript-compile.mjs';
import { buildWebHarness, DOM_MODULE } from './frontend-grade.mjs';
import { compileReactExercise } from './react-compile.mjs';
import { buildReactPreviewDoc } from './react-preview.mjs';
import { buildReactHarness } from './react-grade.mjs';
import { choisirFrontiere, ligneDeCommande, messageIndisponible } from './sandbox.mjs';
import { capacitesDIsolation, bibliothequesPython } from './sandbox-detect.mjs';

// Rassemble les fichiers CODE + CSS d'un exercice React (non-test, non-hidden),
// en appliquant les overrides utilisateur sur les fichiers éditables.
function reactSourceFiles(exercise, userFiles) {
  const out = [];
  for (const [path, meta] of templateFileMap(exercise)) {
    if (meta.test || meta.hidden) continue;
    if (!/\.(tsx|ts|jsx|js|css)$/i.test(path)) continue;
    const override = meta.editable && Object.hasOwn(userFiles, path) ? String(userFiles[path]) : String(meta.content);
    out.push({ path, content: override });
  }
  return out;
}

/**
 * Construit le document de PREVIEW React (compile TSX/JSX puis srcDoc React).
 * PUR côté données (aucune écriture disque). Ne note aucun test.
 * @returns {{ ok:boolean, srcDoc?:string, channel?:string, diagnostics:Array<object> }}
 */
export function buildReactPreview(exercise, userFiles = {}) {
  const files = reactSourceFiles(exercise, userFiles);
  const compiled = compileReactExercise(files);
  if (!compiled.success) return { ok: false, diagnostics: compiled.diagnostics };
  const entryJs = String(exercise.workspace.entry).replace(/\.(tsx|ts|jsx)$/i, '.js');
  const css = files.filter((f) => /\.css$/i.test(f.path)).map((f) => f.content).join('\n');
  const { srcDoc, channel } = buildReactPreviewDoc({ modules: compiled.emittedFiles, entryJs, css });
  return { ok: true, srcDoc, channel, diagnostics: [] };
}

// Source du modèle DOM (copié dans le workspace pour le harnais web). Lue
// PARESSEUSEMENT (au 1er run web), jamais au chargement du module ni au build.
let _frontendDomSrc = null;
function frontendDomSrc() {
  if (_frontendDomSrc == null) _frontendDomSrc = readFileSync(join(process.cwd(), 'lib', 'frontend-dom.mjs'), 'utf8');
  return _frontendDomSrc;
}

const execFileP = promisify(execFile);

/**
 * ── OÙ SE TROUVE L'AIDE D'ENTRÉE EN RACINE MINIMALE ─────────────────────
 *
 * Fichier du dépôt, figé et relu tel quel. Le chemin est cherché parmi plusieurs
 * candidats plutôt que déduit de `process.cwd()` : **le serveur de production de
 * Next ne tourne pas nécessairement depuis la racine du dépôt**, et une sonde
 * qui ne trouve pas son aide échoue en déclarant « aucune racine montable »
 * alors que le noyau, lui, sait parfaitement en monter une.
 *
 * Le CP5 a perdu plusieurs itérations sur ce seul point : la sonde disait vrai
 * (« indisponible ») pour une raison fausse.
 */
const AIDE_RACINE = (() => {
  const candidats = [
    join(process.cwd(), 'scripts', 'sandbox', 'enter-root.sh'),
    join(process.cwd(), '..', 'scripts', 'sandbox', 'enter-root.sh'),
  ];
  try {
    const ici = dirname(new URL(import.meta.url).pathname);
    candidats.push(join(ici, '..', 'scripts', 'sandbox', 'enter-root.sh'));
  } catch { /* contexte sans import.meta exploitable */ }
  return candidats.find((c) => existsSync(c)) ?? candidats[0];
})();

/**
 * ── LES SEULES LECTURES AUTORISÉES HORS DE L'ESPACE DE TRAVAIL ───────────
 *
 * Du CODE DE BIBLIOTHÈQUE, et rien d'autre. Le harnais React importe `react` et
 * `react-dom/server` ; sans ces deux chemins, les 15 exercices `react-tsx`
 * cessent de fonctionner — une isolation qui casse le produit n'est pas une
 * réussite.
 *
 * **Ce que cette liste ne contient PAS, et ne doit jamais contenir** :
 * `data/exercises` (les corrections — `SEC5`), la progression de l'apprenant,
 * la racine du dépôt. Un test le vérifie explicitement : une allowlist qu'on
 * peut élargir en silence n'en est pas une.
 *
 * L'ÉCRITURE, elle, n'a aucune exception : elle reste bornée à l'espace de
 * travail de l'exercice.
 */
const LECTURES_BIBLIOTHEQUES = Object.freeze([
  join(process.cwd(), 'node_modules'),
  dirname(process.execPath),
]);

/**
 * ── V76 · CP5 — TOUT SPAWN PASSE PAR ICI ─────────────────────────────────
 *
 * Le CP0 avait mesuré cinq évasions (`T12`–`T16`) contre le produit en marche :
 * lecture de `/etc/passwd`, lecture de la CORRECTION d'un autre exercice,
 * écriture dans le dépôt, `execSync('id')` en `uid=0(root)`, et SSRF vers
 * `/api/progress`. La cause n'était pas un mauvais réglage : `cwd`, `shell:
 * false`, `env` filtré, `timeout` et `maxBuffer` sont tous corrects, et **aucun
 * n'isole**. `cwd` est un dossier de DÉPART, pas une RACINE.
 *
 * Cette fonction est désormais le SEUL point d'exécution du code d'apprenant.
 * Elle choisit une frontière réelle, ou **refuse d'exécuter** :
 *
 *   > Contrat gelé §3.4 — si une frontière n'est pas disponible, le runtime est
 *   > déclaré indisponible. Il n'y a **jamais** de repli silencieux vers l'hôte.
 *
 * @throws {Error} avec `code = 'RUNTIME_NON_ISOLABLE'` si aucune frontière n'existe.
 */
async function execIsole({ runtimeId, binaire, argsRuntime, dir, limits, env }) {
  const capacites = capacitesDIsolation({ aide: AIDE_RACINE });
  const choix = choisirFrontiere(runtimeId, capacites);
  if (!choix.ok) {
    const e = new Error(messageIndisponible(runtimeId, choix.raison, capacites.raisons?.chroot ?? capacites.raisons?.netns ?? ''));
    e.code = 'RUNTIME_NON_ISOLABLE';
    throw e;
  }
  // ── L'INTERPRÉTEUR DOIT ÊTRE UN CHEMIN RÉEL, PAS UN LIEN ──
  //
  // `/usr/bin/python3` est, sur Debian et ses dérivées, un lien vers
  // `/etc/alternatives/python3`. Or `/etc` n'est PAS monté dans la racine
  // minimale — c'est précisément ce qui bloque `/etc/passwd` (`SEC1`). Passer le
  // lien produirait donc un « No such file or directory » incompréhensible, sur
  // une frontière qui fonctionne parfaitement.
  //
  // On résout le lien AVANT d'entrer dans la racine. Résoudre à l'intérieur
  // exigerait d'y monter `/etc`, c'est-à-dire de rouvrir `SEC1` pour une
  // commodité.
  let binaireReel = binaire;
  let envEffectif = env;
  if (choix.mode === 'NAMESPACE_CHROOT') {
    // ── DEUX PIÈGES DE CHEMIN, ET ILS SE CONTREDISENT ──
    //
    // 1) `/usr/bin/python3` est un lien vers `/etc/alternatives/python3`, et
    //    `/etc` n'est PAS monté — c'est ce qui bloque `/etc/passwd` (`SEC1`).
    //    Il faut donc RÉSOUDRE le lien avant d'entrer dans la racine.
    //
    // 2) Mais `python-ds` tourne dans un ENVIRONNEMENT VIRTUEL
    //    (`.venv-ds/bin/python`), lui aussi un lien vers l'interpréteur système.
    //    Le résoudre fait SORTIR de l'environnement virtuel : Python perd son
    //    `sys.path`, et `pandas` ne trouve plus `dateutil`. C'est exactement le
    //    symptôme qui a fait rougir deux tests d'exécution réelle.
    //
    // La règle correcte distingue les deux : on ne résout un lien que s'il ne
    // s'agit PAS d'un environnement virtuel. Sinon on garde le chemin d'origine
    // et on monte l'environnement virtuel avec les autres bibliothèques.
    // L'interpréteur est TOUJOURS résolu : un lien non résolu ne s'exécute pas
    // dans la racine minimale, faute de `/etc`. Mais résoudre un interpréteur
    // d'environnement virtuel le fait SORTIR de cet environnement — Python perd
    // son `sys.path`, et `pandas` ne trouve plus `dateutil`. C'est le symptôme
    // qui a fait rougir deux tests d'exécution réelle au CP5.
    //
    // On rend donc explicitement, par `PYTHONPATH`, ce que la résolution retire :
    // les paquets de l'environnement virtuel. Le résultat est équivalent et il
    // ne dépend plus d'un lien que la racine minimale ne peut pas suivre.
    try { binaireReel = realpathSync(binaire); } catch { /* garde le chemin fourni */ }
    const racineVenv = venvDe(binaire);
    const paquetsVenv = racineVenv
      ? [join(racineVenv, 'lib', 'python3.11', 'site-packages')].filter((d) => existsSync(d))
      : [];
    const libs = [...bibliothequesPython(binaire), ...paquetsVenv];
    // `PYTHONPATH` reprend TOUS les répertoires montés, pas seulement ceux de
    // l'environnement virtuel. Raison : le répertoire de paquets « utilisateur »
    // (`~/.local/lib/...`, où vit `dateutil`) est déduit par Python de `$HOME`,
    // que l'environnement minimal ne transmet pas — et il ne le transmettra pas,
    // parce que `$HOME` est précisément ce que la racine minimale cache.
    // On le nomme donc explicitement plutôt que de le laisser deviner.
    // UNE seule affectation : deux affectations successives partant toutes deux
    // de `env` s'écrasent l'une l'autre — c'est la dernière erreur du CP5, et
    // elle a coûté une demi-heure parce que le symptôme (`dateutil` introuvable)
    // désignait le montage alors que la faute était dans l'environnement.
    if (libs.length) {
      const chemins = [...new Set(libs)];
      envEffectif = {
        ...env,
        // Montés en lecture seule dans la racine minimale, par l'aide d'entrée.
        AICOS_LIBS: chemins.join(':'),
        // ET nommés explicitement à Python : le répertoire « utilisateur » se
        // déduit de `$HOME`, que la racine minimale cache volontairement.
        PYTHONPATH: [...chemins, env?.PYTHONPATH].filter(Boolean).join(':'),
      };
    }
  }
  const { file, args } = ligneDeCommande({
    mode: choix.mode, binaire: binaireReel, argsRuntime, dir,
    aide: AIDE_RACINE, racine: capacites.racine,
    lectures: LECTURES_BIBLIOTHEQUES,
  });
  return execFileP(file, args, {
    cwd: dir,
    shell: false,
    timeout: limits.timeoutMs,
    killSignal: 'SIGKILL',
    maxBuffer: limits.maxOutputBytes,
    windowsHide: true,
    env: envEffectif,
  });
}

/**
 * La racine d'un environnement virtuel Python contenant ce binaire, ou `null`.
 *
 * Un environnement virtuel se reconnaît à son `pyvenv.cfg`, placé à côté de
 * `bin/`. C'est la seule marque fiable : le binaire lui-même est un lien vers
 * l'interpréteur système, donc indiscernable par son seul chemin réel.
 */
function venvDe(binaire) {
  try {
    const racine = dirname(dirname(binaire));
    return existsSync(join(racine, 'pyvenv.cfg')) ? racine : null;
  } catch { return null; }
}

/** Ce que cette installation isole réellement — publié pour les surfaces et les portes. */
export function etatDIsolation() {
  const capacites = capacitesDIsolation({ aide: AIDE_RACINE });
  const parRuntime = {};
  for (const rt of ['node-js', 'typescript', 'react-tsx', 'web', 'python3', 'python-ds']) {
    parRuntime[rt] = choisirFrontiere(rt, capacites);
  }
  return { capacites, parRuntime };
}

/**
 * Notation d'un exercice WEB : réutilise l'exécuteur Node existant (processus
 * cloisonné) pour exécuter le JS de l'apprenant contre le modèle DOM minimal,
 * puis évalue les assertions (publiques ET privées) CÔTÉ SERVEUR. Les tests ne
 * quittent jamais le serveur (jamais dans le srcDoc). Ne lève pas pour du code
 * utilisateur invalide : renvoie des tests échoués avec message.
 */
async function runWebExercise(root, exercise, userFiles) {
  const dir = materializeWorkspace(root, exercise, userFiles);
  // Copie du modèle DOM (serveur uniquement, jamais exposé au client) + harnais.
  writeFileSafe(dir, DOM_MODULE, frontendDomSrc());
  const jsPaths = [...templateFileMap(exercise).keys()].filter((p) => /\.js$/i.test(p));
  writeFileSafe(dir, '__web_harness__.mjs', buildWebHarness(exercise, jsPaths));

  const limits = effectiveLimits(exercise);
  const started = Date.now();
  let stdout = '';
  let error = null;
  let timedOut = false;
  try {
    const res = await execIsole({
      runtimeId: 'web', binaire: process.execPath, argsRuntime: ['__web_harness__.mjs'],
      dir, limits, env: { PATH: '/usr/bin:/bin', NODE_ENV: 'production' },
    });
    stdout = res.stdout ?? '';
  } catch (e) {
    stdout = typeof e.stdout === 'string' ? e.stdout : '';
    if (e.code === 'RUNTIME_NON_ISOLABLE') {
      // Le contrat gelé interdit le repli vers l'hôte : on refuse d'exécuter et
      // on le DIT, plutôt que de lancer le code sans protection.
      error = e.message;
    } else if (e.killed || e.signal === 'SIGKILL' || e.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER') {
      timedOut = true;
      error = `Exécution interrompue (délai de ${limits.timeoutMs} ms dépassé ou sortie trop volumineuse).`;
    } else {
      error = neutralizePaths((e.message ?? 'Échec d’exécution').slice(0, 500), dir);
    }
  }
  const durationMs = Date.now() - started;
  const parsed = parseHarnessOutput(stdout);
  const observed = (parsed && parsed.observed) || {};
  const results = exercise.tests.map((t) => {
    const r = observed[t.id];
    if (r && typeof r === 'object') return { testId: t.id, name: t.name, passed: !!r.passed, expected: r.expected ?? null, actual: r.actual ?? null, message: typeof r.message === 'string' ? r.message : (r.passed ? 'OK' : 'Échec') };
    return { testId: t.id, name: t.name, passed: false, expected: null, actual: null, message: error || 'Aucun résultat (l’évaluation a échoué).' };
  });
  const attempt = buildAttemptResult(exercise.id, results, { at: new Date().toISOString(), durationMs });
  const userStdout = typeof parsed?.stdout === 'string' ? parsed.stdout : '';
  return { attempt, stdout: neutralizePaths(userStdout.slice(0, limits.maxOutputBytes), dir), timedOut, error, phase: 'test', diagnostics: [] };
}

/**
 * Notation d'un exercice REACT : compile TSX/JSX (aucune exécution du code
 * utilisateur), écrit le JS compilé + le modèle DOM + le harnais dans le
 * workspace, puis rend chaque composant via react-dom/server (processus Node
 * cloisonné existant) et évalue les assertions CÔTÉ SERVEUR. Sur échec de
 * compilation : aucun processus lancé, diagnostics renvoyés (phase 'compile').
 */
async function runReactExercise(root, exercise, userFiles) {
  const files = reactSourceFiles(exercise, userFiles);
  const compiled = compileReactExercise(files);
  const map = templateFileMap(exercise);
  const privatePaths = new Set([...map].filter(([, m]) => m.test).map(([p]) => p));
  if (!compiled.success) {
    const diagnostics = compiled.diagnostics.filter((d) => !d.file || !privatePaths.has(d.file));
    const attempt = gradeRun(exercise, '', { error: 'La compilation TSX/JSX a échoué : corrige les erreurs signalées.', durationMs: compiled.durationMs, at: new Date().toISOString() });
    return { attempt, stdout: '', timedOut: false, error: 'La compilation TSX/JSX a échoué.', phase: 'compile', diagnostics };
  }
  const dir = materializeWorkspace(root, exercise, userFiles);
  for (const [name, content] of Object.entries(compiled.emittedFiles)) writeFileSafe(dir, name, content);
  writeFileSafe(dir, DOM_MODULE, frontendDomSrc());
  const entryJs = String(exercise.workspace.entry).replace(/\.(tsx|ts|jsx)$/i, '.js');
  writeFileSafe(dir, '__react_harness__.mjs', buildReactHarness(exercise, entryJs));

  const limits = effectiveLimits(exercise);
  const started = Date.now();
  let stdout = '';
  let error = null;
  let timedOut = false;
  try {
    const res = await execIsole({
      runtimeId: 'react-tsx', binaire: process.execPath, argsRuntime: ['__react_harness__.mjs'],
      dir, limits, env: { PATH: '/usr/bin:/bin', NODE_ENV: 'production' },
    });
    stdout = res.stdout ?? '';
  } catch (e) {
    stdout = typeof e.stdout === 'string' ? e.stdout : '';
    if (e.code === 'RUNTIME_NON_ISOLABLE') {
      // Le contrat gelé interdit le repli vers l'hôte : on refuse d'exécuter et
      // on le DIT, plutôt que de lancer le code sans protection.
      error = e.message;
    } else if (e.killed || e.signal === 'SIGKILL' || e.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER') {
      timedOut = true;
      error = `Exécution interrompue (délai de ${limits.timeoutMs} ms dépassé ou sortie trop volumineuse).`;
    } else {
      error = neutralizePaths((e.message ?? 'Échec d’exécution').slice(0, 500), dir);
    }
  }
  const durationMs = Date.now() - started;
  const parsed = parseHarnessOutput(stdout);
  const observed = (parsed && parsed.observed) || {};
  const results = exercise.tests.map((t) => {
    const r = observed[t.id];
    if (r && typeof r === 'object') return { testId: t.id, name: t.name, passed: !!r.passed, expected: r.expected ?? null, actual: r.actual ?? null, message: typeof r.message === 'string' ? r.message : (r.passed ? 'OK' : 'Échec') };
    return { testId: t.id, name: t.name, passed: false, expected: null, actual: null, message: error || 'Aucun résultat (l’évaluation a échoué).' };
  });
  const attempt = buildAttemptResult(exercise.id, results, { at: new Date().toISOString(), durationMs });
  const userStdout = typeof parsed?.stdout === 'string' ? parsed.stdout : '';
  return { attempt, stdout: neutralizePaths(userStdout.slice(0, limits.maxOutputBytes), dir), timedOut, error, phase: 'test', diagnostics: [] };
}

const COMPILE_FAILURE_MSG = 'La compilation TypeScript a échoué : corrige les erreurs signalées avant d’exécuter les tests.';

// Remplace toute occurrence du chemin absolu du workspace par un chemin relatif
// à l'exercice (aucune fuite de chemin interne dans les messages/sorties).
function neutralizePaths(text, dir) {
  if (typeof text !== 'string' || !text) return text;
  return text.split(dir + '/').join('./').split(dir).join('.');
}

/**
 * Phase de COMPILATION pour les runtimes qui l'exigent (TypeScript). Lit les
 * sources `.ts` matérialisées (overrides utilisateur inclus), compile en mémoire,
 * puis écrit le JS émis dans le workspace. Aucun fichier de test privé n'est
 * exposé : les diagnostics pointant sur un fichier privé sont retirés.
 * @returns {{ ok: true } | { ok: false, diagnostics: Array<object> }}
 */
function compilePhase(dir, exercise) {
  const map = templateFileMap(exercise);
  const privatePaths = new Set([...map].filter(([, m]) => m.test).map(([p]) => p));
  const inputs = [];
  for (const [path] of map) {
    if (/\.(ts|tsx)$/.test(path) || path.endsWith('.d.ts')) {
      const full = resolveWithinRoot(dir, path);
      if (full && existsSync(full)) inputs.push({ path, content: readFileSync(full, 'utf8') });
    }
  }
  const compiled = compileExerciseTs(inputs);
  if (!compiled.success) {
    // Les diagnostics référençant un fichier de test privé ne sont jamais exposés.
    const diagnostics = compiled.diagnostics.filter((d) => !d.file || !privatePaths.has(d.file));
    return { ok: false, diagnostics };
  }
  for (const [name, content] of Object.entries(compiled.emittedFiles)) writeFileSafe(dir, name, content);
  return { ok: true };
}

// Adaptateur de runtime d'un exercice (défaut Node pour les fixtures sans champ).
function adapterFor(exercise) {
  return getRuntimeAdapter(exercise?.runtime) ?? getRuntimeAdapter(DEFAULT_RUNTIME_ID);
}

export const MAX_FILE_BYTES = 200_000;      // 200 Ko / fichier
export const MAX_TOTAL_BYTES = 1_000_000;   // 1 Mo / espace de travail

/**
 * Carte allowlist des fichiers de l'exercice (modèle normalisé multi-fichiers) :
 * path → { content, editable, test, hidden, language }. Couvre workspace.files ET
 * les testFiles privés. Sert de référence unique pour lecture/écriture.
 */
export function templateFileMap(exercise) {
  const map = new Map();
  for (const f of normalizeExerciseFiles(exercise)) {
    map.set(f.path, { content: f.content, editable: f.editable, test: f.test, hidden: f.hidden, language: f.language, entry: f.entry });
  }
  return map;
}

function exerciseDir(root, exerciseId) {
  const dir = resolveWithinRoot(root, exerciseId);
  if (!dir) throw new Error('Identifiant d’exercice non sûr.');
  return dir;
}

function writeFileSafe(dir, rel, content) {
  const full = resolveWithinRoot(dir, rel);
  if (!full) throw new Error(`Chemin de fichier non sûr : « ${rel} ».`);
  const bytes = Buffer.byteLength(content, 'utf8');
  if (bytes > MAX_FILE_BYTES) throw new Error(`Fichier « ${rel} » trop volumineux (max ${MAX_FILE_BYTES} octets).`);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
  return bytes;
}

/**
 * (Re)crée l'espace de travail d'un exercice depuis son template (répertoire
 * nettoyé au préalable). Les contenus fournis par l'utilisateur remplacent le
 * template. Écrit aussi le harnais. Renvoie le répertoire absolu.
 */
export function materializeWorkspace(root, exercise, userFiles = {}) {
  const dir = exerciseDir(root, exercise.id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  let total = 0;
  for (const [path, meta] of templateFileMap(exercise)) {
    // Les contenus utilisateur ne remplacent QUE les fichiers éditables non-test.
    const override = (meta.editable && !meta.test && Object.hasOwn(userFiles, path));
    const content = override ? String(userFiles[path]) : String(meta.content);
    total += writeFileSafe(dir, path, content);
    if (total > MAX_TOTAL_BYTES) throw new Error('Espace de travail trop volumineux.');
  }
  const adapter = adapterFor(exercise);
  // Runtimes de preview (web) : pas de harnais serveur à matérialiser.
  if (typeof adapter.buildHarness === 'function' && adapter.harnessFile) {
    writeFileSafe(dir, adapter.harnessFile, adapter.buildHarness(exercise));
  }
  return dir;
}

/** Vrai si l'espace de travail existe déjà sur le disque. */
export function workspaceExists(root, exercise) {
  return existsSync(exerciseDir(root, exercise.id));
}

/**
 * Lit l'arborescence CLIENT de l'exercice : uniquement les fichiers non-test
 * (les fichiers de test privés ne sont JAMAIS exposés), jamais le harnais. Si
 * l'espace n'existe pas encore, renvoie le contenu du template.
 * @returns {Array<{path, content, readOnly, editable, hidden, language, entry}>}
 */
export function readWorkspaceTree(root, exercise) {
  const dir = exerciseDir(root, exercise.id);
  const exists = existsSync(dir);
  const out = [];
  for (const [path, meta] of templateFileMap(exercise)) {
    if (meta.test) continue; // fichier de test privé : jamais exposé
    let content = meta.content;
    if (exists) {
      const full = resolveWithinRoot(dir, path);
      if (full && existsSync(full)) content = readFileSync(full, 'utf8');
    }
    out.push({ path, content, readOnly: !meta.editable, editable: meta.editable, hidden: meta.hidden, language: meta.language, entry: meta.entry });
  }
  return out;
}

/** Lit un fichier autorisé (non-test). Erreur si hors allowlist ou fichier de test privé. */
export function readWorkspaceFile(root, exercise, path) {
  const meta = templateFileMap(exercise).get(path);
  if (!meta || meta.test) throw new Error(`Fichier non autorisé : « ${path} ».`);
  const dir = exerciseDir(root, exercise.id);
  const full = resolveWithinRoot(dir, path);
  if (full && existsSync(full)) return readFileSync(full, 'utf8');
  return meta.content;
}

/**
 * Écrit un fichier utilisateur. Refuse : chemin hors allowlist, fichier de test
 * privé, fichier non éditable (readOnly), chemin non sûr (traversal / autre
 * workspace), dépassement de taille. Matérialise l'espace au premier accès.
 */
export function writeWorkspaceFile(root, exercise, path, content) {
  const meta = templateFileMap(exercise).get(path);
  if (!meta || meta.test) throw new Error(`Fichier non autorisé : « ${path} ».`);
  if (!meta.editable) throw new Error(`Fichier en lecture seule : « ${path} ».`);
  const dir = exerciseDir(root, exercise.id);
  if (!existsSync(dir)) materializeWorkspace(root, exercise);
  writeFileSafe(dir, path, String(content));
}

/** Réinitialise l'espace au template (idempotent). */
export function resetWorkspace(root, exercise) {
  return materializeWorkspace(root, exercise, {});
}

/** Réinitialise UN fichier éditable à son contenu de template. */
export function resetWorkspaceFile(root, exercise, path) {
  const meta = templateFileMap(exercise).get(path);
  if (!meta || meta.test) throw new Error(`Fichier non autorisé : « ${path} ».`);
  if (!meta.editable) throw new Error(`Fichier en lecture seule : « ${path} ».`);
  const dir = exerciseDir(root, exercise.id);
  if (!existsSync(dir)) materializeWorkspace(root, exercise);
  writeFileSafe(dir, path, meta.content);
}

/** Supprime le répertoire de travail d'un exercice (nettoyage). */
export function clearWorkspace(root, exerciseId) {
  rmSync(exerciseDir(root, exerciseId), { recursive: true, force: true });
}

/** Ensemble des chemins ÉDITABLES (non-test) d'un exercice — allowlist d'import. */
export function editableAllowSet(exercise) {
  const set = new Set();
  for (const [path, meta] of templateFileMap(exercise)) if (meta.editable && !meta.test) set.add(path);
  return set;
}

/** Exporte les fichiers éditables actuels d'un workspace existant, ou null. */
export function exportWorkspace(root, exercise) {
  if (!workspaceExists(root, exercise)) return null;
  /** @type {Record<string, string>} */
  const files = {};
  for (const f of readWorkspaceTree(root, exercise)) if (f.editable) files[f.path] = f.content;
  return Object.keys(files).length ? { files } : null;
}

/**
 * Exécute l'exercice de façon cloisonnée puis note le résultat. Ne lève jamais
 * pour une erreur de code utilisateur : timeouts/crashs → tests échoués avec
 * message. Lève seulement si le runtime n'est pas exécutable (allowlist).
 * @returns {Promise<{attempt, stdout, timedOut, error}>}
 */
export async function runExercise(root, exercise, userFiles = {}) {
  // runtime absent → défaut Node (compat V7/V8) ; présent mais inconnu → rejet.
  const adapter = getRuntimeAdapter(exercise.runtime ?? DEFAULT_RUNTIME_ID);
  if (!adapter) throw new Error(`Runtime non exécutable : « ${exercise.runtime} ».`);
  const det = detectRuntime(adapter.id);
  if (!det.available) throw new Error(det.error || `Runtime indisponible : « ${adapter.id} ».`);

  // Runtime de PREVIEW web : notation par le modèle DOM + exécuteur Node.
  if (adapter.kind === 'web') {
    return runWebExercise(root, exercise, userFiles);
  }
  // Runtime de PREVIEW React/TSX : notation par rendu serveur (react-dom/server).
  if (adapter.kind === 'react') {
    return runReactExercise(root, exercise, userFiles);
  }

  const dir = materializeWorkspace(root, exercise, userFiles);
  const limits = effectiveLimits(exercise); // bornées par le plafond du runtime
  const started = Date.now();
  let stdout = '';
  let error = null;
  let timedOut = false;

  // Phase de COMPILATION (runtimes à compilation, ex. TypeScript). En cas
  // d'échec : AUCUN processus n'est lancé ; on renvoie l'échec avec diagnostics.
  if (adapter.compile) {
    const c = compilePhase(dir, exercise);
    if (!c.ok) {
      const durationMs = Date.now() - started;
      const attempt = gradeRun(exercise, '', { error: COMPILE_FAILURE_MSG, durationMs, at: new Date().toISOString() });
      return { attempt, stdout: '', timedOut: false, error: COMPILE_FAILURE_MSG, phase: 'compile', diagnostics: c.diagnostics };
    }
  }

  try {
    // Binaire résolu (chemin absolu), arguments figés (harnais), sans shell,
    // env minimal (aucun secret), timeout + SIGKILL, sortie plafonnée — et
    // depuis le CP5 de V76, une FRONTIÈRE D'EXÉCUTION réelle par-dessus.
    const res = await execIsole({
      runtimeId: adapter.id, binaire: det.binary,
      argsRuntime: adapter.buildArgs(adapter.harnessFile),
      dir, limits, env: adapter.env(),
    });
    stdout = res.stdout ?? '';
  } catch (e) {
    stdout = typeof e.stdout === 'string' ? e.stdout : '';
    if (e.code === 'RUNTIME_NON_ISOLABLE') {
      // Le contrat gelé interdit le repli vers l'hôte : on refuse d'exécuter et
      // on le DIT, plutôt que de lancer le code sans protection.
      error = e.message;
    } else if (e.killed || e.signal === 'SIGKILL' || e.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER') {
      timedOut = true;
      error = `Exécution interrompue (délai de ${limits.timeoutMs} ms dépassé ou sortie trop volumineuse).`;
    } else {
      error = neutralizePaths((e.message ?? 'Échec d’exécution').slice(0, 500), dir);
    }
  }

  const durationMs = Date.now() - started;
  const attempt = gradeRun(exercise, stdout, { error, durationMs, at: new Date().toISOString() });
  // Sortie affichée à l'utilisateur = SA sortie capturée (jamais la ligne interne
  // marquée du harnais). En cas de crash sans résultat, on renvoie une chaîne vide.
  const parsed = parseHarnessOutput(stdout);
  const userStdout = typeof parsed?.stdout === 'string' ? parsed.stdout : '';
  return {
    attempt,
    stdout: neutralizePaths(userStdout.slice(0, limits.maxOutputBytes), dir),
    timedOut,
    error,
    phase: error ? 'run' : 'test',
    diagnostics: [],
  };
}
