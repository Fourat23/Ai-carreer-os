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
import { getRuntime } from './exercise.mjs';
import { resolveWithinRoot, buildHarness, gradeRun, HARNESS_FILE } from './workspace.mjs';

export const MAX_FILE_BYTES = 200_000;      // 200 Ko / fichier
export const MAX_TOTAL_BYTES = 1_000_000;   // 1 Mo / espace de travail

/** Carte des fichiers du template : path → { content, readOnly }. Sert d'allowlist. */
export function templateFileMap(exercise) {
  const map = new Map();
  for (const f of exercise.workspace.files) map.set(f.path, { content: String(f.content), readOnly: !!f.readOnly });
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
  for (const f of exercise.workspace.files) {
    const content = Object.hasOwn(userFiles, f.path) ? String(userFiles[f.path]) : String(f.content);
    total += writeFileSafe(dir, f.path, content);
    if (total > MAX_TOTAL_BYTES) throw new Error('Espace de travail trop volumineux.');
  }
  writeFileSafe(dir, HARNESS_FILE, buildHarness(exercise));
  return dir;
}

/** Vrai si l'espace de travail existe déjà sur le disque. */
export function workspaceExists(root, exercise) {
  return existsSync(exerciseDir(root, exercise.id));
}

/**
 * Lit l'arborescence de l'exercice : uniquement les fichiers du template (jamais
 * de fichiers arbitraires). Si l'espace n'existe pas encore, renvoie le template
 * tel quel. Le harnais interne n'est jamais exposé.
 * @returns {Array<{path, content, readOnly}>}
 */
export function readWorkspaceTree(root, exercise) {
  const dir = exerciseDir(root, exercise.id);
  const exists = existsSync(dir);
  const out = [];
  for (const [path, meta] of templateFileMap(exercise)) {
    let content = meta.content;
    if (exists) {
      const full = resolveWithinRoot(dir, path);
      if (full && existsSync(full)) content = readFileSync(full, 'utf8');
    }
    out.push({ path, content, readOnly: meta.readOnly });
  }
  return out;
}

/** Lit un fichier autorisé (du template). Erreur si le chemin n'est pas dans l'allowlist. */
export function readWorkspaceFile(root, exercise, path) {
  const meta = templateFileMap(exercise).get(path);
  if (!meta) throw new Error(`Fichier non autorisé : « ${path} ».`);
  const dir = exerciseDir(root, exercise.id);
  const full = resolveWithinRoot(dir, path);
  if (full && existsSync(full)) return readFileSync(full, 'utf8');
  return meta.content;
}

/**
 * Écrit un fichier utilisateur. Refuse : chemin hors allowlist, fichier readOnly,
 * chemin non sûr (path traversal / autre workspace), dépassement de taille.
 * Matérialise l'espace depuis le template au premier accès si nécessaire.
 */
export function writeWorkspaceFile(root, exercise, path, content) {
  const meta = templateFileMap(exercise).get(path);
  if (!meta) throw new Error(`Fichier non autorisé : « ${path} ».`);
  if (meta.readOnly) throw new Error(`Fichier en lecture seule : « ${path} ».`);
  const dir = exerciseDir(root, exercise.id);
  if (!existsSync(dir)) materializeWorkspace(root, exercise);
  writeFileSafe(dir, path, String(content));
}

/** Réinitialise l'espace au template (idempotent). */
export function resetWorkspace(root, exercise) {
  return materializeWorkspace(root, exercise, {});
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
  const runtime = getRuntime(exercise.runtime);
  if (!runtime || runtime.kind !== 'node') throw new Error(`Runtime non exécutable : « ${exercise.runtime} ».`);

  const dir = materializeWorkspace(root, exercise, userFiles);
  const started = Date.now();
  let stdout = '';
  let error = null;
  let timedOut = false;

  try {
    const res = await execFileP(process.execPath, [HARNESS_FILE], {
      cwd: dir,                     // racine dédiée à cet exercice
      shell: false,                 // aucun shell
      timeout: runtime.timeoutMs,   // temps mur
      killSignal: 'SIGKILL',
      maxBuffer: runtime.maxOutputBytes,
      windowsHide: true,
      env: { PATH: '/usr/bin:/bin', NODE_ENV: 'production' }, // env minimal, sans secrets
    });
    stdout = res.stdout ?? '';
  } catch (e) {
    stdout = typeof e.stdout === 'string' ? e.stdout : '';
    if (e.killed || e.signal === 'SIGKILL' || e.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER') {
      timedOut = true;
      error = `Exécution interrompue (délai de ${runtime.timeoutMs} ms dépassé ou sortie trop volumineuse).`;
    } else {
      error = (e.message ?? 'Échec d’exécution').slice(0, 500);
    }
  }

  const durationMs = Date.now() - started;
  const attempt = gradeRun(exercise, stdout, { error, durationMs, at: new Date().toISOString() });
  return { attempt, stdout: stdout.slice(0, runtime.maxOutputBytes), timedOut, error };
}
