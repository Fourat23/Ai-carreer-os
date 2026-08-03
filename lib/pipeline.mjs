// Modèle de pipeline CI/CD — PUR, sans I/O, sans réseau (ADR/TSD-021).
//
// Un pipeline est DÉCLARATIF : des stages, des jobs (avec dépendances `needs`),
// et des ACTIONS INTERNES allowlistées et déterministes. Ce module ne stocke
// aucun secret réel, n'exécute rien, et ne transforme JAMAIS une configuration
// en commande système. L'orchestration vit dans lib/pipeline-engine.mjs (CP3).

export const TRIGGER_KINDS = ['push', 'pull_request', 'tag', 'manual', 'schedule'];
export const JOB_STATUSES = ['pending', 'running', 'success', 'failed', 'skipped', 'cancelled', 'blocked'];
export const ACTION_KINDS = [
  'validate-config', 'lint', 'test', 'build', 'artifact-check',
  'cache-check', 'branch-policy', 'approval', 'secret-scan', 'status-aggregate',
];
/** Plafonds durs (budgets de ressources pédagogiques). */
export const PIPELINE_CAPS = { maxStages: 12, maxJobs: 40, maxSteps: 200, timeoutMs: 30000, maxLogBytes: 64 * 1024 };

const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const isKebab = (v) => typeof v === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
const isNonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;
const isArr = Array.isArray;

/** Un motif qui ressemble à un SECRET brut posé en clair (à référencer, jamais inliner). */
const SECRET_INLINE = /(sk-[A-Za-z0-9]{8,}|ghp_[A-Za-z0-9]{8,}|AKIA[0-9A-Z]{12,}|xox[baprs]-[A-Za-z0-9-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|[A-Za-z0-9_\-]{40,})/;

/**
 * Détecte un cycle dans le DAG des jobs (par `needs`). PUR.
 * @returns {string[]|null} un chemin de cycle, ou null si acyclique.
 */
export function findCycle(jobs = []) {
  const byId = new Map(jobs.map((j) => [j.id, j]));
  const state = new Map(); // id -> 0 en cours, 1 fini
  const stack = [];
  function dfs(id) {
    if (!byId.has(id)) return null; // dépendance absente : traitée ailleurs
    if (state.get(id) === 1) return null;
    if (state.get(id) === 0) return [...stack.slice(stack.indexOf(id)), id];
    state.set(id, 0); stack.push(id);
    for (const dep of byId.get(id).needs ?? []) { const c = dfs(dep); if (c) return c; }
    stack.pop(); state.set(id, 1);
    return null;
  }
  for (const j of jobs) { const c = dfs(j.id); if (c) return c; }
  return null;
}

/** Ordre topologique (jobs valides, acycliques). PUR. Stable (ordre déclaré à rang égal). */
export function topoOrder(jobs = []) {
  const byId = new Map(jobs.map((j) => [j.id, j]));
  const indeg = new Map(jobs.map((j) => [j.id, 0]));
  for (const j of jobs) for (const d of j.needs ?? []) if (byId.has(d)) indeg.set(j.id, indeg.get(j.id) + 1);
  const order = [];
  const ready = jobs.filter((j) => indeg.get(j.id) === 0).map((j) => j.id);
  const seen = new Set();
  while (ready.length) {
    const id = ready.shift();
    if (seen.has(id)) continue;
    seen.add(id); order.push(id);
    for (const j of jobs) if ((j.needs ?? []).includes(id)) {
      indeg.set(j.id, indeg.get(j.id) - 1);
      if (indeg.get(j.id) === 0) ready.push(j.id);
    }
  }
  return order.length === jobs.length ? { order } : { cycle: findCycle(jobs) ?? [] };
}

function checkWithSafety(withObj, label, errors) {
  if (withObj == null) return;
  if (typeof withObj !== 'object' || isArr(withObj)) { errors.push(`${label} : « with » doit être un objet`); return; }
  const json = (() => { try { return JSON.stringify(withObj); } catch { return ''; } })();
  if (json.length > 8192) errors.push(`${label} : « with » trop volumineux`);
  const walk = (o, depth) => {
    if (depth > 6) { errors.push(`${label} : « with » trop profond`); return; }
    for (const k of Object.keys(o)) {
      if (DANGEROUS_KEYS.has(k)) errors.push(`${label} : clé dangereuse « ${k} »`);
      const v = o[k];
      if (typeof v === 'string') {
        if (v.includes('\0')) errors.push(`${label} : octet nul interdit`);
        if (/(^|\/)\.\.(\/|$)/.test(v) || v.startsWith('/')) errors.push(`${label} : chemin non borné « ${k} »`);
        if (SECRET_INLINE.test(v)) errors.push(`${label} : secret en clair interdit (référence par nom via « secrets »)`);
      } else if (v && typeof v === 'object' && !isArr(v)) walk(v, depth + 1);
    }
  };
  walk(withObj, 0);
}

/**
 * Valide une définition de pipeline contre le contexte réel. PUR.
 * @param {object} pipeline
 * @param {{ skillIds?:{has}, validDays?:Set<number>, trackIds?:Set<string> }} ctx
 * @returns {{ ok:boolean, errors:string[] }}
 */
export function validatePipeline(pipeline = {}, ctx = {}) {
  const errors = [];
  const skillIds = ctx.skillIds ?? { has: () => true };
  const validDays = ctx.validDays ?? null;
  const trackIds = ctx.trackIds ?? null;

  for (const k of Object.keys(pipeline)) if (DANGEROUS_KEYS.has(k)) errors.push('clé dangereuse au niveau pipeline');
  if (!isKebab(pipeline.id)) errors.push('id invalide (kebab-case)');
  if (!isNonEmpty(pipeline.title)) errors.push('titre manquant');
  if (!isNonEmpty(pipeline.description)) errors.push('description manquante');
  if (!isNonEmpty(pipeline.version)) errors.push('version manquante');

  if (!isArr(pipeline.trigger) || pipeline.trigger.length === 0) errors.push('trigger manquant');
  else for (const t of pipeline.trigger) if (!TRIGGER_KINDS.includes(t)) errors.push(`trigger invalide « ${t} »`);

  // Stages.
  const stages = isArr(pipeline.stages) ? pipeline.stages : [];
  if (!stages.length) errors.push('aucun stage');
  if (stages.length > PIPELINE_CAPS.maxStages) errors.push('trop de stages');
  const stageIds = new Set();
  for (const s of stages) {
    if (!isKebab(s?.id)) errors.push('stage : id invalide');
    else if (stageIds.has(s.id)) errors.push(`stage : id dupliqué « ${s.id} »`);
    stageIds.add(s?.id);
    if (!isNonEmpty(s?.name)) errors.push(`stage ${s?.id} : nom manquant`);
  }

  // Jobs.
  const jobs = isArr(pipeline.jobs) ? pipeline.jobs : [];
  if (!jobs.length) errors.push('aucun job');
  if (jobs.length > PIPELINE_CAPS.maxJobs) errors.push('trop de jobs');
  const jobIds = new Set();
  let stepCount = 0;
  for (const j of jobs) {
    const label = `job ${j?.id}`;
    if (!isKebab(j?.id)) { errors.push('job : id invalide'); continue; }
    if (jobIds.has(j.id)) errors.push(`job : id dupliqué « ${j.id} »`);
    jobIds.add(j.id);
    if (!isNonEmpty(j.name)) errors.push(`${label} : nom manquant`);
    if (!stageIds.has(j.stage)) errors.push(`${label} : stage inconnu « ${j.stage} »`);
    if (!ACTION_KINDS.includes(j.action)) errors.push(`${label} : action inconnue « ${j.action} »`);
    if (!(Number.isInteger(j.timeoutMs) && j.timeoutMs > 0 && j.timeoutMs <= PIPELINE_CAPS.timeoutMs)) errors.push(`${label} : timeoutMs hors bornes`);
    if (j.allowFailure != null && typeof j.allowFailure !== 'boolean') errors.push(`${label} : allowFailure booléen`);
    for (const dep of j.needs ?? []) {
      if (dep === j.id) errors.push(`${label} : dépend de lui-même`);
    }
    if (j.condition != null && (typeof j.condition !== 'object' || isArr(j.condition))) errors.push(`${label} : condition invalide`);
    if (isArr(j.secrets)) for (const s of j.secrets) if (!isNonEmpty(s)) errors.push(`${label} : nom de secret invalide`);
    checkWithSafety(j.with, label, errors);
    stepCount += 1 + (isArr(j.artifactsOut) ? j.artifactsOut.length : 0);
  }
  if (stepCount > PIPELINE_CAPS.maxSteps) errors.push('trop de steps');

  // Dépendances résolues + DAG acyclique.
  for (const j of jobs) for (const dep of j.needs ?? []) if (!jobIds.has(dep)) errors.push(`job ${j.id} : dépendance absente « ${dep} »`);
  const cycle = findCycle(jobs);
  if (cycle) errors.push(`cycle de dépendances : ${cycle.join(' → ')}`);

  // Environnement / approbation.
  if (pipeline.environment != null) {
    if (typeof pipeline.environment !== 'object' || !isNonEmpty(pipeline.environment.name)) errors.push('environment invalide');
  }
  if (pipeline.approval != null && typeof pipeline.approval.required !== 'boolean') errors.push('approval.required booléen requis');

  // Rattachement pédagogique.
  if (!isArr(pipeline.skills) || pipeline.skills.length === 0) errors.push('skills manquantes');
  else for (const s of pipeline.skills) if (!skillIds.has(s)) errors.push(`compétence inconnue « ${s} »`);
  if (!isArr(pipeline.dayRefs) || pipeline.dayRefs.length === 0) errors.push('dayRefs manquantes');
  else if (validDays) for (const d of pipeline.dayRefs) if (!validDays.has(d)) errors.push(`journée inexistante ${d}`);
  if (trackIds && isArr(pipeline.trackScope)) for (const t of pipeline.trackScope) if (!trackIds.has(t)) errors.push(`parcours inconnu « ${t} »`);

  return { ok: errors.length === 0, errors };
}

/** Vue publique d'un pipeline : jamais de fixture `with`, jamais de secret. */
export function publicPipelineView(pipeline = {}) {
  return {
    id: pipeline.id, title: pipeline.title, description: pipeline.description, version: pipeline.version,
    trigger: pipeline.trigger ?? [], branchFilters: pipeline.branchFilters ?? [], tagFilters: pipeline.tagFilters ?? [],
    stages: (pipeline.stages ?? []).map((s) => ({ id: s.id, name: s.name, order: s.order })),
    jobs: (pipeline.jobs ?? []).map((j) => ({
      id: j.id, name: j.name, stage: j.stage, needs: j.needs ?? [], action: j.action,
      condition: j.condition ?? null, allowFailure: !!j.allowFailure,
      artifactsOut: j.artifactsOut ?? [], cacheKey: j.cacheKey ?? null,
      secrets: (j.secrets ?? []).map(() => '***'), // noms masqués
    })),
    environment: pipeline.environment ?? null,
    approval: pipeline.approval ?? null,
    skills: pipeline.skills ?? [], dayRefs: pipeline.dayRefs ?? [], trackScope: pipeline.trackScope ?? null,
    missionRefs: pipeline.missionRefs ?? [],
  };
}

/** Masque, dans une ligne de log, toute valeur listée comme secret. PUR. */
export function maskSecrets(line, secretValues = []) {
  let out = String(line ?? '');
  for (const v of secretValues) if (v) out = out.split(String(v)).join('***');
  return out;
}
