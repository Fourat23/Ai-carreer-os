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
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { getRuntimeAdapter, DEFAULT_RUNTIME_ID } from './runtime.mjs';
import { effectiveLimits } from './exercise.mjs';
import { detectRuntime } from './runtime-detect.mjs';
import { normalizeExerciseFiles } from './exercise-files.mjs';
import { resolveWithinRoot, gradeRun, parseHarnessOutput } from './workspace.mjs';

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
  writeFileSafe(dir, adapter.harnessFile, adapter.buildHarness(exercise));
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

const execFileP = promisify(execFile);

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

  const dir = materializeWorkspace(root, exercise, userFiles);
  const limits = effectiveLimits(exercise); // bornées par le plafond du runtime
  const started = Date.now();
  let stdout = '';
  let error = null;
  let timedOut = false;

  try {
    // Binaire résolu (chemin absolu), arguments figés (harnais), sans shell,
    // env minimal (aucun secret), timeout + SIGKILL, sortie plafonnée.
    const res = await execFileP(det.binary, adapter.buildArgs(adapter.harnessFile), {
      cwd: dir,
      shell: false,
      timeout: limits.timeoutMs,
      killSignal: 'SIGKILL',
      maxBuffer: limits.maxOutputBytes,
      windowsHide: true,
      env: adapter.env(),
    });
    stdout = res.stdout ?? '';
  } catch (e) {
    stdout = typeof e.stdout === 'string' ? e.stdout : '';
    if (e.killed || e.signal === 'SIGKILL' || e.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER') {
      timedOut = true;
      error = `Exécution interrompue (délai de ${limits.timeoutMs} ms dépassé ou sortie trop volumineuse).`;
    } else {
      error = (e.message ?? 'Échec d’exécution').slice(0, 500);
    }
  }

  const durationMs = Date.now() - started;
  const attempt = gradeRun(exercise, stdout, { error, durationMs, at: new Date().toISOString() });
  // Sortie affichée à l'utilisateur = SA sortie capturée (jamais la ligne interne
  // marquée du harnais). En cas de crash sans résultat, on renvoie une chaîne vide.
  const parsed = parseHarnessOutput(stdout);
  const userStdout = typeof parsed?.stdout === 'string' ? parsed.stdout : '';
  return { attempt, stdout: userStdout.slice(0, limits.maxOutputBytes), timedOut, error };
}
