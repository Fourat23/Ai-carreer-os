// Adaptateur local BORNÉ du Pipeline Lab (V21 CP4) — OPTIONNEL et plus restrictif
// que le terminal V20. Il n'exécute qu'un très petit ensemble de vérifications
// RÉELLES et sûres sur des fixtures SCELLÉES (choisies par la tâche, jamais une
// saisie libre), avec un exécutable FIXÉ et des arguments FIXÉS.
//
// Sûreté : `node --check` PARSE un fichier (vérification de SYNTAXE) sans
// l'EXÉCUTER — aucune exécution de code arbitraire, aucun réseau, aucun secret,
// aucune mutation de data/. Workspace temporaire, timeout + SIGKILL, sortie
// plafonnée, nettoyage garanti. Docker reste optionnel et honnêtement détecté.

import { execFile } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { detectDocker } from './terminal-docker.mjs';

const TIMEOUT_MS = 4000;
const MAX_OUTPUT = 32 * 1024;

/** Disponibilité honnête : local toujours prêt ; Docker détecté séparément. */
export async function availability() {
  return { local: 'available', node: process.version, docker: await detectDocker() };
}

export function prepare() {
  const dir = mkdtempSync(join(tmpdir(), 'pipe-local-'));
  return { runToken: dir, workspaceDir: dir };
}

export function cleanup(runToken) {
  try { if (runToken && existsSync(runToken)) rmSync(runToken, { recursive: true, force: true }); return { cleaned: true }; }
  catch { return { cleaned: false }; }
}

function neutralize(msg, dir) { return String(msg ?? '').split(dir).join('<workspace>'); }
function bound(s) { const b = Buffer.from(String(s ?? ''), 'utf8'); return b.length <= MAX_OUTPUT ? String(s ?? '') : b.subarray(0, MAX_OUTPUT).toString('utf8') + '\n…(tronqué)'; }

/**
 * Vérification RÉELLE de SYNTAXE d'un code JavaScript SCELLÉ (fixture), via
 * `node --check` (parse seul, aucune exécution). Exécutable et arguments FIXÉS.
 * @param {string} workspaceDir
 * @param {string} code  contenu de fixture (scellé par la tâche, pas une saisie libre)
 * @returns {Promise<{ status:'success'|'failed'|'timed-out', logs:string[], cleaned:boolean }>}
 */
export function runRealSyntaxCheck(workspaceDir, code) {
  if (!workspaceDir || !existsSync(workspaceDir)) return Promise.resolve({ status: 'failed', logs: ['E_ADAPTER_UNAVAILABLE : workspace absent'], cleaned: false });
  const file = join(workspaceDir, 'fixture.mjs');
  try { writeFileSync(file, String(code ?? '').slice(0, MAX_OUTPUT)); }
  catch { return Promise.resolve({ status: 'failed', logs: ['E_WRITE : fixture non écrite'], cleaned: false }); }

  return new Promise((resolve) => {
    // Exécutable FIXÉ (ce Node), arguments FIXÉS (--check + fixture), sans shell,
    // env minimal sans secret, cwd = workspace, timeout + SIGKILL, sortie plafonnée.
    execFile(process.execPath, ['--check', file], {
      cwd: workspaceDir, shell: false, timeout: TIMEOUT_MS, killSignal: 'SIGKILL',
      maxBuffer: MAX_OUTPUT, windowsHide: true,
      env: { PATH: '/usr/local/bin:/usr/bin:/bin', NODE_ENV: 'production', LANG: 'C' },
    }, (err, _stdout, stderr) => {
      if (!err) return resolve({ status: 'success', logs: ['syntaxe valide (node --check)'], cleaned: false });
      const killed = err.killed || err.signal === 'SIGKILL' || err.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER';
      if (killed) return resolve({ status: 'timed-out', logs: [`interrompu (délai ${TIMEOUT_MS} ms)`], cleaned: false });
      const msg = bound(neutralize(stderr || err.message || 'erreur de syntaxe', workspaceDir));
      resolve({ status: 'failed', logs: ['erreur de syntaxe :', ...msg.split('\n').slice(0, 10)], cleaned: false });
    });
  });
}
