// Adaptateur d'exécution LOCAL borné (CP5) — serveur. Réutilise le motif éprouvé
// de lib/workspace-fs.mjs : execFile sans shell, binaire ∈ allowlist, argv figé,
// cwd = workspace temporaire, timeout + SIGKILL, sortie plafonnée, environnement
// minimal (aucun secret), nettoyage idempotent. N'exécute JAMAIS une chaîne
// passée à un shell. Ne sert que des TerminalTask pédagogiques déclarées.

import { execFile } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { classifyRun, boundOutput, isAllowedExecutable, validateArguments } from './terminal.mjs';

/**
 * Allowlist d'exécutables du poste — STRICTE. Tout le reste (rm, sudo, chmod,
 * chown, curl, wget, ssh, nc, bash, sh, powershell, cmd, docker brut, gestionnaires
 * de paquets) est refusé. Les notions dangereuses s'enseignent par simulation.
 */
export const LOCAL_ALLOWLIST = new Set(['pwd', 'ls', 'cat', 'head', 'wc', 'echo', 'node', 'python3', 'git']);

// Résolution du binaire réel. `node` pointe sur CE Node ; les autres sont
// résolus par un PATH minimal contrôlé (jamais une valeur fournie par l'apprenant).
function resolveBinary(exe) {
  if (exe === 'node') return process.execPath;
  return exe; // execFile cherchera dans le PATH minimal ci-dessous
}

/** Environnement minimal : PATH contrôlé, HOME = workspace, aucun secret hérité. */
function minimalEnv(workspaceDir) {
  return { PATH: '/usr/local/bin:/usr/bin:/bin', HOME: workspaceDir, LANG: 'C', TERM: 'dumb', GIT_TERMINAL_PROMPT: '0' };
}

/** Retire toute trace du chemin de workspace d'un message (anti-fuite). */
function neutralize(msg, dir) {
  return String(msg ?? '').split(dir).join('<workspace>');
}

const RUNNING = new Map(); // runId -> child process (pour l'annulation)

/** Disponibilité de l'adaptateur local : toujours prêt (binaires du poste). */
export function availability() {
  return { state: 'available', version: process.version };
}

/** Prépare un workspace temporaire borné pour une exécution. */
export function prepare() {
  const dir = mkdtempSync(join(tmpdir(), 'term-local-'));
  return { runToken: dir, workspaceDir: dir };
}

/** Nettoyage idempotent : supprime le workspace même déjà absent. */
export function cleanup(runToken) {
  try {
    if (runToken && existsSync(runToken)) rmSync(runToken, { recursive: true, force: true });
    return { cleaned: true };
  } catch {
    return { cleaned: false };
  }
}

/** Annulation : SIGTERM puis SIGKILL borné. Idempotente. */
export function cancel(runId) {
  const child = RUNNING.get(runId);
  if (!child) return { cancelled: false };
  try { child.kill('SIGTERM'); } catch { /* déjà mort */ }
  setTimeout(() => { try { child.kill('SIGKILL'); } catch { /* déjà mort */ } }, 200).unref?.();
  return { cancelled: true };
}

/**
 * Exécute une TerminalTask avec des arguments BRUTS (revalidés ici en défense en
 * profondeur). Retourne un TerminalRun borné. N'utilise jamais de shell.
 * @param {object} task
 * @param {Record<string,string>} rawArgs
 * @param {{ runToken:string, runId?:string }} sess
 * @returns {Promise<object>} TerminalRun
 */
export function execute(task, rawArgs, sess = {}) {
  const runId = sess.runId ?? randomUUID();
  const workspaceDir = sess.runToken;
  const startedAt = new Date().toISOString();
  const started = Date.now();
  const base = {
    id: runId, taskId: task?.id ?? null, adapter: 'local', startedAt, endedAt: null,
    durationMs: 0, exitCode: null, signal: null, stdout: '', stderr: '',
    truncated: false, cancelled: false, timedOut: false, cleaned: false,
  };
  const fail = (status, diagnostic) => ({ ...base, status, commandPreview: `${task?.executable ?? '?'} …`, endedAt: new Date().toISOString(), durationMs: Date.now() - started, diagnostic });

  // Défense en profondeur : workspace, allowlist, arguments.
  if (!workspaceDir || !existsSync(workspaceDir)) return Promise.resolve(fail('failed', 'E_ADAPTER_UNAVAILABLE : workspace absent'));
  if (!isAllowedExecutable(LOCAL_ALLOWLIST, task?.executable)) return Promise.resolve(fail('failed', `E_BINARY_NOT_ALLOWED : « ${task?.executable} »`));
  const av = validateArguments(task, rawArgs);
  if (!av.ok) return Promise.resolve(fail('failed', `E_ARG_INVALID : ${av.errors.join(' ; ')}`));

  // Vérifie que le workspace ne s'échappe pas via un symlink (realpath).
  let cwd;
  try { cwd = realpathSync(workspaceDir); } catch { return Promise.resolve(fail('failed', 'E_PATH_ESCAPE : workspace irrésolu')); }
  if (!cwd.startsWith(realpathSync(tmpdir()))) return Promise.resolve(fail('failed', 'E_PATH_ESCAPE : hors zone temporaire'));

  const commandPreview = `${task.executable} ${av.argv.join(' ')}`.trim();
  const timeout = Math.min(task.timeoutMs ?? 5000, 30000);
  const maxBuffer = Math.min(task.maxCombinedBytes ?? 65536, 262144);

  return new Promise((resolve) => {
    const child = execFile(resolveBinary(task.executable), av.argv, {
      cwd, shell: false, timeout, killSignal: 'SIGKILL', maxBuffer,
      windowsHide: true, env: minimalEnv(cwd),
    }, (err, stdout, stderr) => {
      RUNNING.delete(runId);
      const durationMs = Date.now() - started;
      const so = boundOutput(neutralize(stdout ?? (err?.stdout ?? ''), cwd), task.maxStdoutBytes);
      const se = boundOutput(neutralize(stderr ?? (err?.stderr ?? ''), cwd), task.maxStderrBytes);
      let status, exitCode = null, signal = null, timedOut = false, cancelled = false, diagnostic;
      if (err) {
        signal = err.signal ?? null;
        const killed = err.killed || err.signal === 'SIGKILL' || err.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER';
        if (err.signal === 'SIGTERM') { cancelled = true; status = 'cancelled'; }
        else if (killed) { timedOut = true; status = 'timed-out'; diagnostic = `délai ${timeout} ms dépassé ou sortie trop volumineuse`; }
        else if (typeof err.code === 'number') { exitCode = err.code; status = classifyRun(task, { exitCode }); }
        else { status = 'failed'; diagnostic = neutralize((err.message ?? 'échec').slice(0, 300), cwd); }
      } else {
        exitCode = 0; status = classifyRun(task, { exitCode: 0 });
      }
      resolve({
        ...base, status, commandPreview, endedAt: new Date().toISOString(), durationMs,
        exitCode, signal, stdout: so.text, stderr: se.text, truncated: so.truncated || se.truncated,
        cancelled, timedOut, cleaned: false, ...(diagnostic ? { diagnostic } : {}),
      });
    });
    RUNNING.set(runId, child);
  });
}

/** Nombre d'exécutions en cours (diagnostic ; borné, ne fuit rien). */
export function runningCount() { return RUNNING.size; }
