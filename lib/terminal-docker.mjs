// Adaptateur d'exécution DOCKER OPTIONNEL (CP6) — serveur + partie PURE testable.
//
// Docker n'est JAMAIS installé automatiquement. On détecte séparément : CLI
// présent, daemon disponible, capacité réelle à lancer un conteneur autorisé.
// Le produit reste pleinement fonctionnel sans Docker (les exercices concernés
// basculent en mode déterministe). La CONSTRUCTION de la commande est pure et
// testable SANS Docker ; les exécutions réelles n'ont lieu que si `available`.
//
// Durcissement par défaut : --network none, --read-only, --tmpfs, --pids-limit,
// --memory, --cpus, --security-opt no-new-privileges, --cap-drop ALL, user
// non-root, montage borné au seul workspace, --rm, nom aléatoire. Jamais de
// --privileged, de device hôte, de montage du socket Docker, ni de montage de /.

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { boundOutput, validateArguments, isAllowedExecutable, classifyRun } from './terminal.mjs';

const execFileP = promisify(execFile);

/** Images pédagogiques autorisées — versions FIXÉES (jamais « latest »). */
export const DOCKER_IMAGE_ALLOWLIST = new Set(['alpine:3.20', 'node:20-alpine', 'python:3.12-alpine', 'busybox:1.36']);
/** Exécutables autorisés DANS le conteneur (sur l'image). */
export const DOCKER_EXEC_ALLOWLIST = new Set(['sh', 'ls', 'cat', 'echo', 'node', 'python3', 'wc', 'head']);
const SAFE_CONTAINER_WORKDIR = '/workspace';

/** Défaut durci d'une config de conteneur pédagogique. */
export function hardenedDefaults(image) {
  return {
    image, network: 'none', readOnly: true, tmpfs: ['/tmp'],
    pidsLimit: 128, memory: '256m', cpus: '1.0',
    securityOpt: ['no-new-privileges'], capDrop: ['ALL'],
    user: '1000:1000', removeAfter: true, nameStrategy: 'random',
    workspaceMount: null, timeoutMs: 8000,
  };
}

/**
 * Valide une config de conteneur. Refuse tout ce qui affaiblit l'isolation.
 * @returns {{ ok:boolean, errors:string[] }}
 */
export function validateDockerConfig(config = {}) {
  const e = [];
  if (!DOCKER_IMAGE_ALLOWLIST.has(config.image)) e.push(`E_IMAGE_NOT_ALLOWED : « ${config.image} »`);
  if (config.network !== 'none') e.push('réseau refusé : seul --network none est autorisé par défaut');
  if (config.readOnly !== true) e.push('système de fichiers doit être --read-only');
  if (!Array.isArray(config.capDrop) || !config.capDrop.includes('ALL')) e.push('--cap-drop ALL requis');
  if (!Array.isArray(config.securityOpt) || !config.securityOpt.includes('no-new-privileges')) e.push('--security-opt no-new-privileges requis');
  if (config.privileged) e.push('mode --privileged interdit');
  if (Array.isArray(config.devices) && config.devices.length) e.push('device hôte interdit');
  const user = String(config.user ?? '');
  if (!user || user === 'root' || /^0(:|$)/.test(user)) e.push('utilisateur non-root requis');
  if (!config.pidsLimit || config.pidsLimit > 1024) e.push('--pids-limit requis et borné (≤ 1024)');
  if (!config.memory || !/^\d+[mg]$/i.test(String(config.memory))) e.push('--memory requis et borné');
  if (!config.cpus || Number(config.cpus) <= 0 || Number(config.cpus) > 2) e.push('--cpus requis et borné (≤ 2)');
  const m = config.workspaceMount;
  if (m) {
    if (/docker\.sock/.test(m.hostPath ?? '')) e.push('montage du socket Docker interdit');
    if ((m.hostPath ?? '') === '/' || (m.containerPath ?? '') === '/') e.push('montage de / interdit');
    if (m.containerPath && m.containerPath !== SAFE_CONTAINER_WORKDIR) e.push(`point de montage doit être ${SAFE_CONTAINER_WORKDIR}`);
    try { if (m.hostPath && !realpathSync(m.hostPath).startsWith(realpathSync(tmpdir()))) e.push('montage hôte hors zone temporaire interdit'); }
    catch { e.push('chemin de montage hôte irrésolu'); }
  }
  return { ok: e.length === 0, errors: e };
}

/**
 * Construit les arguments de `docker run` durcis — PUR (aucun Docker requis).
 * @returns {{ ok:boolean, argv:string[], name:string|null, errors:string[] }}
 */
export function buildDockerArgs(config, task, argv = []) {
  const v = validateDockerConfig(config);
  if (!v.ok) return { ok: false, argv: [], name: null, errors: v.errors };
  if (!isAllowedExecutable(DOCKER_EXEC_ALLOWLIST, task?.executable)) {
    return { ok: false, argv: [], name: null, errors: [`E_BINARY_NOT_ALLOWED (conteneur) : « ${task?.executable} »`] };
  }
  const name = `pedago-${randomUUID().slice(0, 12)}`;
  const out = ['run', '--rm', '--name', name,
    '--network', config.network,
    '--read-only',
    '--pids-limit', String(config.pidsLimit),
    '--memory', String(config.memory),
    '--cpus', String(config.cpus),
    '--security-opt', 'no-new-privileges',
    '--cap-drop', 'ALL',
    '--user', String(config.user),
  ];
  for (const t of config.tmpfs ?? []) out.push('--tmpfs', t);
  if (config.workspaceMount) {
    const ro = config.workspaceMount.readOnly === false ? '' : ':ro';
    out.push('-v', `${config.workspaceMount.hostPath}:${config.workspaceMount.containerPath}${ro}`, '-w', config.workspaceMount.containerPath);
  }
  const ref = config.digest ? `${config.image}@${config.digest}` : config.image;
  out.push(ref, task.executable, ...argv);
  return { ok: true, argv: out, name, errors: [] };
}

/** Analyse la sortie de `docker version` (pur). */
export function parseDockerState(cliOk, serverOk, versionText) {
  if (!cliOk) return { state: 'absent', reason: 'CLI Docker introuvable' };
  if (!serverOk) return { state: 'cli-only', reason: 'daemon Docker indisponible', version: versionText || null };
  return { state: 'available', version: versionText || null };
}

/** Détection RÉELLE (I/O) : CLI + daemon. Ne lève jamais ; renvoie un état honnête. */
export async function detectDocker() {
  let cliOk = false, serverOk = false, versionText = null;
  try {
    const r = await execFileP('docker', ['version', '--format', '{{.Server.Version}}'], { timeout: 4000, windowsHide: true });
    cliOk = true; serverOk = true; versionText = (r.stdout ?? '').trim() || null;
  } catch (err) {
    // Le CLI existe si l'erreur n'est pas ENOENT ; le daemon est down sinon.
    if (err && err.code !== 'ENOENT') { cliOk = true; serverOk = false; }
    else { cliOk = false; }
  }
  return parseDockerState(cliOk, serverOk, versionText);
}

/** Nettoyage idempotent d'un conteneur (même déjà absent). */
export async function cleanupContainer(name) {
  if (!name) return { cleaned: true };
  try { await execFileP('docker', ['rm', '-f', name], { timeout: 4000, windowsHide: true }); return { cleaned: true }; }
  catch (err) { return { cleaned: err?.code === 'ENOENT' ? false : true }; } // « No such container » = déjà propre
}

/**
 * Exécute une tâche Docker si le daemon est disponible ; sinon renvoie un
 * TerminalRun « unavailable » (le produit doit gérer ce cas sans erreur).
 */
export async function execute(task, rawArgs, config, sess = {}) {
  const runId = sess.runId ?? randomUUID();
  const startedAt = new Date().toISOString();
  const started = Date.now();
  const base = {
    id: runId, taskId: task?.id ?? null, adapter: 'docker', startedAt, endedAt: null,
    durationMs: 0, exitCode: null, signal: null, stdout: '', stderr: '',
    truncated: false, cancelled: false, timedOut: false, cleaned: false,
  };
  const done = (over) => ({ ...base, endedAt: new Date().toISOString(), durationMs: Date.now() - started, ...over });

  const det = await detectDocker();
  if (det.state !== 'available') {
    return done({ status: 'unavailable', commandPreview: 'docker run …', diagnostic: `E_DOCKER_UNAVAILABLE : ${det.reason}` });
  }
  const av = validateArguments(task, rawArgs);
  if (!av.ok) return done({ status: 'failed', commandPreview: 'docker run …', diagnostic: `E_ARG_INVALID : ${av.errors.join(' ; ')}` });
  const built = buildDockerArgs(config, task, av.argv);
  if (!built.ok) return done({ status: 'failed', commandPreview: 'docker run …', diagnostic: built.errors.join(' ; ') });

  const timeout = Math.min(config.timeoutMs ?? 8000, 30000);
  try {
    const r = await execFileP('docker', built.argv, { timeout, killSignal: 'SIGKILL', maxBuffer: 262144, windowsHide: true });
    const so = boundOutput(r.stdout ?? '', task.maxStdoutBytes);
    const se = boundOutput(r.stderr ?? '', task.maxStderrBytes);
    return done({ status: classifyRun(task, { exitCode: 0 }), commandPreview: `docker run … ${task.executable}`, exitCode: 0, stdout: so.text, stderr: se.text, truncated: so.truncated || se.truncated });
  } catch (err) {
    const killed = err.killed || err.signal === 'SIGKILL' || err.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER';
    const so = boundOutput(err.stdout ?? '', task.maxStdoutBytes);
    const se = boundOutput(err.stderr ?? '', task.maxStderrBytes);
    const over = killed
      ? { status: 'timed-out', timedOut: true, diagnostic: `délai ${timeout} ms dépassé` }
      : { status: typeof err.code === 'number' ? classifyRun(task, { exitCode: err.code }) : 'failed', exitCode: typeof err.code === 'number' ? err.code : null };
    await cleanupContainer(built.name);
    return done({ ...over, commandPreview: `docker run … ${task.executable}`, stdout: so.text, stderr: se.text, truncated: so.truncated || se.truncated });
  }
}
