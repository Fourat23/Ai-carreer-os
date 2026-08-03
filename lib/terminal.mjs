// Modèle de terminal pédagogique BORNÉ — PUR, sans I/O, sans spawn (ADR/TSD-020).
//
// Ce module ne lance RIEN : il valide des tâches et des arguments, construit un
// aperçu de commande lisible, borne les sorties et pilote la machine à états.
// L'exécution réelle (execFile, shell:false) vit dans les adaptateurs serveur
// (CP5 local, CP6 Docker), au-dessus de ce socle.
//
// Invariants de sécurité garantis ici : binaire ∈ allowlist ; argv validé
// élément par élément contre un schéma ; jamais de chaîne concaténée vers un
// shell ; chemins bornés au workspace (pas d'absolu, pas de « .. », pas de
// backslash, pas d'octet nul) ; sortie plafonnée ; timeouts et annulation
// explicites dans les statuts.

/** Statuts d'une exécution (machine à états stricte). */
export const TERMINAL_STATUSES = [
  'idle', 'preparing', 'running', 'success', 'failed',
  'timed-out', 'cancelled', 'cleanup-failed', 'unavailable',
];
/** Types d'arguments déclarables dans un schéma de tâche. */
export const ARGUMENT_KINDS = ['enum', 'int', 'path', 'flag', 'literal'];
/** Adaptateurs d'exécution connus. */
export const TERMINAL_ADAPTERS = ['local', 'docker'];

/** Plafonds durs (un adaptateur peut être plus strict, jamais plus permissif). */
export const TERMINAL_CAPS = { timeoutMs: 30000, maxBytes: 256 * 1024 };

const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const isKebab = (v) => typeof v === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
const isNonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;

// ── Validation des chemins (format pur ; le realpath se fait à l'exécution) ──
/**
 * Un chemin d'argument doit rester RELATIF et sous le workspace : pas d'absolu,
 * pas de « .. », pas de backslash, pas d'octet nul, pas de « ~ ». PUR.
 * @returns {{ ok:boolean, reason?:string }}
 */
export function validateWorkspacePath(rel) {
  if (typeof rel !== 'string' || rel.trim() === '') return { ok: false, reason: 'chemin vide' };
  if (rel.includes('\0')) return { ok: false, reason: 'octet nul' };
  if (rel.startsWith('/')) return { ok: false, reason: 'chemin absolu interdit' };
  if (rel.startsWith('~')) return { ok: false, reason: 'expansion ~ interdite' };
  if (rel.includes('\\')) return { ok: false, reason: 'backslash interdit' };
  if (/(^|\/)\.\.(\/|$)/.test(rel)) return { ok: false, reason: 'remontée « .. » interdite' };
  return { ok: true };
}

export function isAllowedExecutable(allowlist, exe) {
  const set = allowlist instanceof Set ? allowlist : new Set(allowlist ?? []);
  return typeof exe === 'string' && set.has(exe);
}

// ── Validation d'une valeur d'argument contre sa spec ────────────────────────
export function validateArgValue(spec, value) {
  if (!spec || typeof spec !== 'object') return { ok: false, reason: 'spec invalide' };
  switch (spec.kind) {
    case 'enum':
      return (spec.values ?? []).includes(value) ? { ok: true } : { ok: false, reason: `valeur hors de l'énumération` };
    case 'flag':
      return (spec.values ?? []).includes(value) ? { ok: true } : { ok: false, reason: 'drapeau non autorisé' };
    case 'literal':
      return value === spec.default ? { ok: true } : { ok: false, reason: 'littéral non modifiable' };
    case 'int': {
      if (typeof value !== 'string' || !/^-?\d+$/.test(value)) return { ok: false, reason: 'entier attendu' };
      const n = Number(value);
      if (spec.min != null && n < spec.min) return { ok: false, reason: `< min ${spec.min}` };
      if (spec.max != null && n > spec.max) return { ok: false, reason: `> max ${spec.max}` };
      return { ok: true };
    }
    case 'path':
      return validateWorkspacePath(value);
    default:
      return { ok: false, reason: `kind inconnu « ${spec.kind} »` };
  }
}

/**
 * Valide les arguments bruts d'un apprenant contre le schéma de la tâche et
 * construit l'argv FINAL (jamais une chaîne). Chaque argument est vérifié ;
 * les arguments manquants requis échouent ; les valeurs par défaut comblent
 * les optionnels absents.
 * @param {object} task
 * @param {Record<string,string>} raw  valeurs par nom d'argument
 * @returns {{ ok:boolean, argv:string[], errors:string[] }}
 */
export function validateArguments(task, raw = {}) {
  const errors = [];
  const argv = [];
  const schema = Array.isArray(task?.argumentSchema) ? task.argumentSchema : [];
  for (const spec of schema) {
    const name = spec?.name;
    if (!isNonEmpty(name)) { errors.push('argument sans nom dans le schéma'); continue; }
    const provided = Object.prototype.hasOwnProperty.call(raw, name) && !DANGEROUS_KEYS.has(name);
    let value = provided ? raw[name] : (spec.default ?? null);
    if (value == null) {
      if (spec.required) errors.push(`argument requis manquant « ${name} »`);
      continue;
    }
    value = String(value);
    const v = validateArgValue(spec, value);
    if (!v.ok) { errors.push(`argument « ${name} » : ${v.reason}`); continue; }
    argv.push(value);
  }
  return { ok: errors.length === 0, argv, errors };
}

/**
 * Aperçu LISIBLE de la commande (affichage uniquement, jamais exécuté tel quel).
 * Les valeurs contenant des espaces ou métacaractères sont entre guillemets pour
 * la lecture — ce n'est PAS un échappement shell (on n'exécute pas via un shell).
 */
export function buildCommandPreview(task, argv = []) {
  const parts = [String(task?.executable ?? '')].concat(argv.map((a) => (
    /[\s"'`$&|;<>()*?]/.test(a) ? `"${String(a).replace(/"/g, '\\"')}"` : String(a)
  )));
  return parts.join(' ').trim();
}

/** Borne une sortie à maxBytes (UTF-8), en signalant la troncature. PUR. */
export function boundOutput(text, maxBytes = TERMINAL_CAPS.maxBytes) {
  const s = typeof text === 'string' ? text : '';
  const cap = Math.max(0, Math.min(maxBytes ?? 0, TERMINAL_CAPS.maxBytes));
  const buf = Buffer.from(s, 'utf8');
  if (buf.length <= cap) return { text: s, truncated: false };
  // Coupe proprement sur une frontière de caractère.
  let out = buf.subarray(0, cap).toString('utf8');
  if (out.endsWith('�')) out = out.slice(0, -1);
  return { text: out, truncated: true };
}

// ── Machine à états ──────────────────────────────────────────────────────────
const TRANSITIONS = {
  idle: { prepare: 'preparing', unavailable: 'unavailable' },
  preparing: { start: 'running', unavailable: 'unavailable', cancel: 'cancelled', fail: 'failed' },
  running: { exit0: 'success', exitN: 'failed', timeout: 'timed-out', cancel: 'cancelled', fail: 'failed' },
  // états terminaux : seule une passe de nettoyage peut les faire basculer en cleanup-failed
  success: { 'cleanup-fail': 'cleanup-failed' },
  failed: { 'cleanup-fail': 'cleanup-failed' },
  'timed-out': { 'cleanup-fail': 'cleanup-failed' },
  cancelled: { 'cleanup-fail': 'cleanup-failed' },
  'cleanup-failed': {},
  unavailable: {},
};
export const TERMINAL_EVENTS = ['prepare', 'start', 'exit0', 'exitN', 'timeout', 'cancel', 'fail', 'unavailable', 'cleanup-fail'];

/** Transition stricte ; renvoie le même statut si la transition est invalide. */
export function nextStatus(current, event) {
  const row = TRANSITIONS[current];
  if (!row || !(event in row)) return current;
  return row[event];
}

export function isTerminalStatus(status) {
  return ['success', 'failed', 'timed-out', 'cancelled', 'cleanup-failed', 'unavailable'].includes(status);
}

/**
 * Déduit le statut final d'un résultat d'exécution selon les critères de succès.
 * @param {object} task
 * @param {{ exitCode:number|null, timedOut?:boolean, cancelled?:boolean }} result
 */
export function classifyRun(task, result = {}) {
  if (result.cancelled) return 'cancelled';
  if (result.timedOut) return 'timed-out';
  const expected = Array.isArray(task?.expectedExitCodes) && task.expectedExitCodes.length
    ? task.expectedExitCodes : [0];
  const crit = task?.successCriteria ?? {};
  const codeOk = expected.includes(result.exitCode) && (crit.exitCode ? crit.exitCode.includes(result.exitCode) : true);
  return codeOk ? 'success' : 'failed';
}

// ── Validation d'une définition de tâche ─────────────────────────────────────
/**
 * Valide une TerminalTask contre le contexte de son adaptateur.
 * @param {object} task
 * @param {{ allowlist?:Set<string>|string[], skillIds?:{has:(s:string)=>boolean}, validDays?:Set<number> }} ctx
 * @returns {{ ok:boolean, errors:string[] }}
 */
export function validateTerminalTask(task = {}, ctx = {}) {
  const errors = [];
  const allow = ctx.allowlist instanceof Set ? ctx.allowlist : new Set(ctx.allowlist ?? []);
  if (!isKebab(task.id)) errors.push('id invalide (kebab-case)');
  if (!isNonEmpty(task.title)) errors.push('titre manquant');
  if (!isNonEmpty(task.description)) errors.push('description manquante');
  if (!TERMINAL_ADAPTERS.includes(task.adapter)) errors.push(`adaptateur invalide « ${task.adapter} »`);
  if (!isNonEmpty(task.executable)) errors.push('exécutable manquant');
  else if (allow.size && !allow.has(task.executable)) errors.push(`exécutable hors allowlist « ${task.executable} »`);
  if (task.cwdPolicy !== 'workspace') errors.push('cwdPolicy doit être « workspace »');
  if (task.environmentPolicy !== 'minimal') errors.push('environmentPolicy doit être « minimal »');
  if (!(Number.isInteger(task.timeoutMs) && task.timeoutMs > 0 && task.timeoutMs <= TERMINAL_CAPS.timeoutMs)) errors.push(`timeoutMs hors bornes (1..${TERMINAL_CAPS.timeoutMs})`);
  for (const k of ['maxStdoutBytes', 'maxStderrBytes', 'maxCombinedBytes']) {
    if (!(Number.isInteger(task[k]) && task[k] > 0 && task[k] <= TERMINAL_CAPS.maxBytes)) errors.push(`${k} hors bornes (1..${TERMINAL_CAPS.maxBytes})`);
  }
  if (task.cleanupPolicy !== 'always') errors.push('cleanupPolicy doit être « always »');
  if (!Array.isArray(task.expectedExitCodes) || task.expectedExitCodes.some((c) => !Number.isInteger(c))) errors.push('expectedExitCodes invalides');
  const schema = Array.isArray(task.argumentSchema) ? task.argumentSchema : null;
  if (!schema) errors.push('argumentSchema manquant (tableau)');
  else {
    const seen = new Set();
    for (const spec of schema) {
      if (!isNonEmpty(spec?.name) || DANGEROUS_KEYS.has(spec.name)) errors.push('argument : nom invalide');
      else if (seen.has(spec.name)) errors.push(`argument : nom dupliqué « ${spec.name} »`);
      seen.add(spec?.name);
      if (!ARGUMENT_KINDS.includes(spec?.kind)) errors.push(`argument « ${spec?.name} » : kind invalide`);
      if ((spec?.kind === 'enum' || spec?.kind === 'flag') && !(Array.isArray(spec.values) && spec.values.length)) errors.push(`argument « ${spec?.name} » : values requis`);
    }
  }
  if (!Array.isArray(task.skills) || task.skills.length === 0) errors.push('skills manquantes');
  else if (ctx.skillIds) for (const s of task.skills) if (!ctx.skillIds.has(s)) errors.push(`compétence inconnue « ${s} »`);
  if (!Array.isArray(task.dayRefs) || task.dayRefs.length === 0) errors.push('dayRefs manquantes');
  else if (ctx.validDays) for (const d of task.dayRefs) if (!ctx.validDays.has(d)) errors.push(`journée inexistante ${d}`);
  return { ok: errors.length === 0, errors };
}

/** Vue publique d'une tâche (jamais de chemin hôte, jamais d'env réel). */
export function publicTaskView(task = {}) {
  return {
    id: task.id, title: task.title, description: task.description,
    adapter: task.adapter, executable: task.executable,
    argumentSchema: (task.argumentSchema ?? []).map((s) => ({ name: s.name, kind: s.kind, required: !!s.required, values: s.values, min: s.min, max: s.max, default: s.default })),
    timeoutMs: task.timeoutMs, skills: task.skills ?? [], dayRefs: task.dayRefs ?? [],
    trackScope: task.trackScope ?? null, hints: task.hints ?? [], securityNotes: task.securityNotes ?? [],
  };
}
