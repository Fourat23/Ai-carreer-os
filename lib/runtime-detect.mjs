// Détection serveur des runtimes : chemin absolu du binaire + version, mis en
// cache par process. Node est toujours disponible (process.execPath). Python est
// détecté parmi plusieurs candidats, sans jamais supposer que « python » = 3.
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { getRuntimeAdapter } from './runtime.mjs';

const cache = new Map();
const requireFromHere = createRequire(import.meta.url);

// TypeScript s'exécute via Node (JS compilé) : disponible ssi Node est présent
// ET le package `typescript` est résoluble côté serveur (dépendance directe).
function detectTypeScript() {
  try {
    const pkgPath = requireFromHere.resolve('typescript/package.json');
    const version = requireFromHere(pkgPath)?.version ?? null;
    return { available: true, binary: process.execPath, version: version ? `TypeScript ${version} (Node ${process.version})` : null };
  } catch {
    return { available: false, binary: null, version: null, error: 'Package « typescript » introuvable côté serveur.' };
  }
}

function detectPython() {
  const candidates = ['python3', 'python', 'py'];
  for (const c of candidates) {
    try {
      // sys.executable => chemin ABSOLU de l'interpréteur (portable, utilisable
      // pour un spawn avec env minimal). Rejette si ce n'est pas Python 3.
      const out = execFileSync(c, ['-c', 'import sys; print(sys.version_info[0]); print(sys.executable)'],
        { timeout: 4000, encoding: 'utf8' });
      const [major, exe] = out.trim().split('\n');
      if (major === '3' && exe) {
        const version = execFileSync(exe, ['--version'], { timeout: 4000, encoding: 'utf8' }).trim();
        return { available: true, binary: exe, version };
      }
    } catch { /* candidat suivant */ }
  }
  return { available: false, binary: null, version: null, error: 'Python 3 introuvable sur cette machine.' };
}

function detect(id) {
  const adapter = getRuntimeAdapter(id);
  if (!adapter) return { available: false, binary: null, version: null, error: `Runtime inconnu : « ${id} ».` };
  if (adapter.kind === 'node') {
    return { available: true, binary: process.execPath, version: process.version };
  }
  if (adapter.kind === 'python') {
    return detectPython();
  }
  if (adapter.kind === 'typescript') {
    return detectTypeScript();
  }
  if (adapter.kind === 'web') {
    // Runtime de preview : rendu par le navigateur local, aucun binaire requis.
    return { available: true, binary: null, version: 'Aperçu navigateur (local)' };
  }
  return { available: false, binary: null, version: null, error: `Runtime non exécutable : « ${id} ».` };
}

/** Détecte (et met en cache) la disponibilité d'un runtime. */
export function detectRuntime(id) {
  if (!cache.has(id)) cache.set(id, detect(id));
  return cache.get(id);
}

/** Réinitialise le cache (tests). */
export function _resetDetectionCache() { cache.clear(); }

/** Métadonnées de disponibilité pour l'UI (sans le chemin binaire). */
export function runtimeStatus(id) {
  const d = detectRuntime(id);
  return { id, available: d.available, version: d.version ?? null, error: d.error ?? null };
}
