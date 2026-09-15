// Runner d'exercices — partie PURE et testable (aucun I/O, aucun spawn).
// Résolution de chemin cloisonnée, génération du harnais d'exécution, analyse de
// sa sortie et notation via le modèle pur. L'exécution réelle (écriture disque +
// child_process) vit dans workspace-server.ts et s'appuie sur ces fonctions.
import { resolve, sep } from 'node:path';
import { isSafeRelPath, checkTest, buildAttemptResult } from './exercise.mjs';
import { LAB_RESULT_MARKER, getRuntimeAdapter } from './runtime.mjs';

export { LAB_RESULT_MARKER };
// Compat : nom du harnais Node (les consommateurs génériques utilisent
// désormais adapter.harnessFile ; conservé pour les tests historiques Node).
export const HARNESS_FILE = getRuntimeAdapter('node-js').harnessFile;

/**
 * Résout `rel` À L'INTÉRIEUR de `root` (défense en profondeur par-dessus
 * isSafeRelPath) : renvoie le chemin absolu, ou null s'il s'échapperait de la
 * racine. Aucun symlink n'est suivi ici — le serveur écrit dans un répertoire
 * qu'il a lui-même créé.
 */
export function resolveWithinRoot(root, rel) {
  if (typeof root !== 'string' || !root) return null;
  if (!isSafeRelPath(rel)) return null;
  const base = resolve(root);
  const full = resolve(base, rel);
  if (full !== base && !full.startsWith(base + sep)) return null;
  return full;
}

// La génération du harnais est désormais fournie par l'adaptateur de runtime
// (lib/runtime.mjs : buildHarness par langage). workspace.mjs ne conserve que la
// résolution de chemin et la notation, communes à tous les runtimes.

/** Extrait la charge JSON produite par le harnais (dernière ligne marquée). Null si absente. */
export function parseHarnessOutput(stdout) {
  if (typeof stdout !== 'string') return null;
  const idx = stdout.lastIndexOf(LAB_RESULT_MARKER);
  if (idx < 0) return null;
  const line = stdout.slice(idx + LAB_RESULT_MARKER.length).split('\n')[0];
  try { return JSON.parse(line); } catch { return null; }
}

/**
 * Note une exécution : combine l'exercice, la sortie brute du harnais et une
 * éventuelle erreur d'exécution (timeout, crash) → AttemptResult PUR.
 * @param {object} exercise
 * @param {string} rawStdout  sortie standard complète du processus
 * @param {{error?:string|null, durationMs?:number, at?:string|null}} [ctx]
 */
export function gradeRun(exercise, rawStdout, { error = null, durationMs = 0, at = null } = {}) {
  const tests = exercise?.tests ?? [];
  const parsed = parseHarnessOutput(rawStdout);
  const results = tests.map((t) => {
    if (error && !parsed) return checkTest(t, {}, error);          // process tué / crash avant résultat
    const obs = (parsed && parsed.observed && parsed.observed[t.id]) || {};
    return checkTest(t, obs, obs.error ?? (parsed?.fatal ?? null));
  });
  return buildAttemptResult(exercise?.id ?? '', results, { at, durationMs });
}

/**
 * ── V76 · CP9 — FAUT-IL REFUSER CETTE SAUVEGARDE ? ───────────────────────
 *
 * PURE, donc testable sans serveur ni disque — même raison qu'au CP5 pour la
 * frontière d'exécution : une décision qu'on ne peut vérifier qu'en lançant un
 * processus n'est vérifiée par personne.
 *
 * Trois mutations ont survécu au premier passage du CP9 parce que les tests
 * cherchaient du TEXTE dans la route (`conflitsDeRevision(`, `status: 409`) au
 * lieu d'exercer la décision. Neutraliser la condition (`if (false && …)`)
 * laissait ces tests verts. Le texte prouvait qu'un appel existait, jamais qu'il
 * servait à quelque chose.
 *
 * @param revsAttendues  ce que le client croit avoir comme base, par chemin
 * @param revsActuelles  ce que le serveur a réellement, par chemin
 * @returns {{refuse:boolean, conflits:Array<{path,revAttendue,revActuelle}>}}
 */
export function decisionDeSauvegarde(revsAttendues, revsActuelles) {
  // Sans révisions annoncées, on ne refuse rien : un client qui ne les connaît
  // pas perd la protection, il ne perd pas sa sauvegarde.
  if (!revsAttendues || typeof revsAttendues !== 'object') return { refuse: false, conflits: [] };
  const conflits = [];
  for (const [path, revAttendue] of Object.entries(revsAttendues)) {
    if (typeof revAttendue !== 'string' || !revAttendue) continue;
    const revActuelle = revsActuelles?.[path];
    // Un fichier inconnu du serveur n'est pas un conflit : c'est une création.
    if (typeof revActuelle !== 'string' || !revActuelle) continue;
    if (revActuelle !== revAttendue) conflits.push({ path, revAttendue, revActuelle });
  }
  return { refuse: conflits.length > 0, conflits };
}

// La LECTURE de ce refus, côté surface, vit dans `lib/workspace-conflit.mjs` :
// ce module-ci importe `node:path`, et la surface est un composant client.
