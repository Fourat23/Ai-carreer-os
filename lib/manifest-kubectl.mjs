// Adaptateur de disponibilité kubectl — I/O bornée, HONNÊTE (ADR/TSD-023).
//
// N'exécute JAMAIS un manifest. Détecte seulement, sans jamais lever, si `kubectl`
// est présent et si un cluster est joignable, pour que l'UI dise la vérité :
//   - absent    : pas de CLI kubectl
//   - cli-only  : CLI présente, aucun cluster joignable
//   - cluster   : cluster joignable (l'exécution réelle reste désactivée par défaut)
//   - denied    : cluster présent mais accès refusé
// Aucun argument utilisateur, exécutables/args FIXÉS, shell:false, timeout borné.

import { execFile } from 'node:child_process';

function run(cmd, args) {
  return new Promise((resolve) => {
    execFile(cmd, args, { shell: false, timeout: 3500, windowsHide: true, maxBuffer: 32 * 1024 }, (err, stdout, stderr) => {
      resolve({ err, stdout: String(stdout ?? ''), stderr: String(stderr ?? '') });
    });
  });
}

/** Interprète les sondes (pur) en un état honnête. */
export function parseKubectlState(cliOk, clusterOk, denied, versionText) {
  if (!cliOk) return { state: 'absent', reason: 'CLI kubectl introuvable', canExecute: false, version: null };
  if (denied) return { state: 'denied', reason: 'accès au cluster refusé', canExecute: false, version: versionText || null };
  if (!clusterOk) return { state: 'cli-only', reason: 'aucun cluster joignable', canExecute: false, version: versionText || null };
  // Même cluster joignable : l'exécution réelle reste désactivée par défaut (sûreté).
  return { state: 'cluster', reason: 'cluster joignable (exécution réelle désactivée par défaut)', canExecute: false, version: versionText || null };
}

/** Détection RÉELLE (I/O bornée). Ne lève jamais ; renvoie un état honnête. */
export async function kubectlAvailability() {
  let cliOk = false; let versionText = null;
  const v = await run('kubectl', ['version', '--client', '-o', 'json']);
  if (v.err && v.err.code === 'ENOENT') return parseKubectlState(false, false, false, null);
  cliOk = true;
  try {
    const j = JSON.parse(v.stdout);
    versionText = j?.clientVersion?.gitVersion ?? null;
  } catch { versionText = v.stdout.trim().slice(0, 40) || null; }

  const c = await run('kubectl', ['cluster-info']);
  const out = `${c.stdout}\n${c.stderr}`.toLowerCase();
  const denied = /forbidden|unauthorized|denied/.test(out);
  const clusterOk = !c.err && /is running|control plane/.test(out);
  return parseKubectlState(cliOk, clusterOk, denied, versionText);
}
