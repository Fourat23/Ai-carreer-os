// Modèle de manifest Kubernetes — PUR, sans I/O, sans réseau (ADR/HSD/TSD-023).
//
// Un « scénario » est un ensemble de ressources DÉCLARATIVES (objets JSON : les
// manifests k8s sont sémantiquement identiques en JSON, YAML en étant un
// sur-ensemble). Ce module ne parle à AUCUN cluster, n'exécute rien, ne
// transforme jamais une configuration en commande, et ne stocke aucun secret
// réel (les Secret sont conceptuels). L'analyse vit dans lib/manifest-analysis.mjs
// (CP3) ; la réconciliation/simulation dans lib/manifest-reconcile.mjs.

/** Ressources reconnues (liste fermée). */
export const KINDS = [
  'Pod', 'ReplicaSet', 'Deployment', 'StatefulSet', 'DaemonSet', 'Job', 'CronJob',
  'Service', 'Ingress', 'ConfigMap', 'Secret', 'Namespace',
  'PersistentVolumeClaim', 'ServiceAccount', 'HorizontalPodAutoscaler',
];
/** Kinds qui produisent des pods (gabarit dans spec.template). */
export const WORKLOAD_KINDS = new Set(['Pod', 'ReplicaSet', 'Deployment', 'StatefulSet', 'DaemonSet', 'Job', 'CronJob']);
export const SERVICE_TYPES = ['ClusterIP', 'NodePort', 'LoadBalancer'];
export const STRATEGIES = ['RollingUpdate', 'Recreate'];

/** Plafonds durs (budgets pédagogiques). */
export const MANIFEST_CAPS = { maxResources: 40, maxContainers: 20, maxDepth: 12, maxLabels: 40, maxSerializedBytes: 128 * 1024 };

const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const isNonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;
const isArr = Array.isArray;
const isObj = (v) => v && typeof v === 'object' && !isArr(v);
// Nom DNS-1123 simplifié (métadonnées k8s) + id de scénario kebab.
const isDnsName = (v) => typeof v === 'string' && /^[a-z0-9]([-a-z0-9.]*[a-z0-9])?$/.test(v) && v.length <= 253;
const isKebab = (v) => typeof v === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);

/** Un motif qui ressemble à un SECRET brut posé en clair (interdit même dans un Secret : conceptuel). */
const SECRET_INLINE = /(sk-[A-Za-z0-9]{8,}|ghp_[A-Za-z0-9]{8,}|AKIA[0-9A-Z]{12,}|xox[baprs]-[A-Za-z0-9-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|[A-Za-z0-9_\-]{40,})/;

/** Clé identifiante d'une ressource (unicité). */
export function resourceKey(r) {
  return `${r?.kind}/${r?.metadata?.namespace ?? 'default'}/${r?.metadata?.name}`;
}

/** Labels d'un gabarit de pod selon le kind (Pod → metadata.labels ; workloads → spec.template.metadata.labels). */
export function podTemplateLabels(r) {
  if (r?.kind === 'Pod') return r?.metadata?.labels ?? {};
  return r?.spec?.template?.metadata?.labels ?? {};
}

/** Un selector (objet clé→valeur, ou {matchLabels}) matche-t-il un jeu de labels ? PUR. */
export function selectorMatches(selector, labels = {}) {
  const sel = selector?.matchLabels ?? selector;
  if (!isObj(sel) || Object.keys(sel).length === 0) return false;
  return Object.entries(sel).every(([k, v]) => labels?.[k] === v);
}

/** Pods (gabarits) qu'un Service atteint via son selector, dans un ensemble. PUR. */
export function serviceEndpoints(service, resources = []) {
  const sel = service?.spec?.selector;
  if (!isObj(sel)) return [];
  return resources.filter((r) => WORKLOAD_KINDS.has(r.kind) && selectorMatches(sel, podTemplateLabels(r)));
}

/** Nombre de pods DÉSIRÉS d'une ressource (déterministe, conceptuel). PUR. */
export function podsOf(r) {
  if (r?.kind === 'Pod') return 1;
  if (r?.kind === 'Deployment' || r?.kind === 'ReplicaSet' || r?.kind === 'StatefulSet') {
    const n = Number(r?.spec?.replicas);
    return Number.isFinite(n) && n >= 0 ? n : 1;
  }
  if (r?.kind === 'DaemonSet') return 1; // 1 par nœud (conceptuel)
  if (r?.kind === 'Job' || r?.kind === 'CronJob') return 1;
  return 0;
}

/** Liste des conteneurs d'une ressource (Pod ou workload). PUR. */
export function containersOf(r) {
  if (r?.kind === 'Pod') return isArr(r?.spec?.containers) ? r.spec.containers : [];
  const c = r?.kind === 'CronJob'
    ? r?.spec?.jobTemplate?.spec?.template?.spec?.containers
    : r?.spec?.template?.spec?.containers;
  return isArr(c) ? c : [];
}

function checkSafety(obj, label, errors, depth = 0) {
  if (obj == null) return;
  if (depth > MANIFEST_CAPS.maxDepth) { errors.push(`${label} : structure trop profonde`); return; }
  if (isArr(obj)) { for (const v of obj) if (isObj(v) || isArr(v)) checkSafety(v, label, errors, depth + 1); return; }
  if (!isObj(obj)) return;
  for (const k of Object.keys(obj)) {
    if (DANGEROUS_KEYS.has(k)) errors.push(`${label} : clé dangereuse « ${k} »`);
    const v = obj[k];
    if (typeof v === 'string') {
      if (v.includes('\0')) errors.push(`${label} : octet nul interdit`);
      if (SECRET_INLINE.test(v)) errors.push(`${label} : secret en clair interdit (les Secret sont conceptuels)`);
    } else if (isObj(v) || isArr(v)) checkSafety(v, label, errors, depth + 1);
  }
}

/**
 * Valide un ensemble de manifests contre le contexte réel. PUR.
 * @param {object} set { id, title, description, resources[], skills?, dayRefs?, trackScope? }
 * @param {{ skillIds?:{has}, validDays?:Set<number>, trackIds?:Set<string> }} ctx
 * @returns {{ ok:boolean, errors:string[] }}
 */
export function validateManifestSet(set = {}, ctx = {}) {
  const errors = [];
  const skillIds = ctx.skillIds ?? { has: () => true };
  const validDays = ctx.validDays ?? null;
  const trackIds = ctx.trackIds ?? null;

  for (const k of Object.keys(set)) if (DANGEROUS_KEYS.has(k)) errors.push('clé dangereuse au niveau scénario');
  if (!isKebab(set.id)) errors.push('id invalide (kebab-case)');
  if (!isNonEmpty(set.title)) errors.push('titre manquant');
  if (!isNonEmpty(set.description)) errors.push('description manquante');

  const serialized = (() => { try { return JSON.stringify(set); } catch { return ''; } })();
  if (!serialized) errors.push('scénario non sérialisable');
  else if (serialized.length > MANIFEST_CAPS.maxSerializedBytes) errors.push('scénario trop volumineux');

  const resources = isArr(set.resources) ? set.resources : [];
  if (!resources.length) errors.push('aucune ressource');
  if (resources.length > MANIFEST_CAPS.maxResources) errors.push('trop de ressources');

  const seen = new Set();
  for (const r of resources) {
    if (!isObj(r)) { errors.push('ressource : objet attendu'); continue; }
    const label = `ressource ${r.kind ?? '?'}/${r.metadata?.name ?? '?'}`;
    if (!KINDS.includes(r.kind)) errors.push(`${label} : kind inconnu « ${r.kind} »`);
    if (!isNonEmpty(r.apiVersion)) errors.push(`${label} : apiVersion manquante`);
    if (!isObj(r.metadata)) errors.push(`${label} : metadata manquante`);
    else {
      if (!isDnsName(r.metadata.name)) errors.push(`${label} : metadata.name invalide`);
      if (r.metadata.namespace != null && !isDnsName(r.metadata.namespace)) errors.push(`${label} : namespace invalide`);
      for (const f of ['labels', 'annotations']) {
        if (r.metadata[f] != null) {
          if (!isObj(r.metadata[f])) errors.push(`${label} : ${f} doit être un objet`);
          else if (Object.keys(r.metadata[f]).length > MANIFEST_CAPS.maxLabels) errors.push(`${label} : trop de ${f}`);
        }
      }
    }
    const key = resourceKey(r);
    if (seen.has(key)) errors.push(`ressource dupliquée « ${key} »`);
    seen.add(key);
    if (containersOf(r).length > MANIFEST_CAPS.maxContainers) errors.push(`${label} : trop de conteneurs`);
    checkSafety(r.spec, label, errors);
    checkSafety(r.metadata, label, errors);
    // Champs numériques cohérents quand présents.
    if (WORKLOAD_KINDS.has(r.kind) && r.spec?.replicas != null && !(Number.isInteger(r.spec.replicas) && r.spec.replicas >= 0)) {
      errors.push(`${label} : replicas doit être un entier ≥ 0`);
    }
    if (r.kind === 'Service' && r.spec?.type != null && !SERVICE_TYPES.includes(r.spec.type)) {
      errors.push(`${label} : type de Service inconnu « ${r.spec.type} »`);
    }
    if (r.kind === 'Deployment' && r.spec?.strategy?.type != null && !STRATEGIES.includes(r.spec.strategy.type)) {
      errors.push(`${label} : stratégie inconnue « ${r.spec.strategy.type} »`);
    }
  }

  // Rattachement pédagogique.
  if (!isArr(set.skills) || set.skills.length === 0) errors.push('skills manquantes');
  else for (const s of set.skills) if (!skillIds.has(s)) errors.push(`compétence inconnue « ${s} »`);
  if (!isArr(set.dayRefs) || set.dayRefs.length === 0) errors.push('dayRefs manquantes');
  else if (validDays) for (const d of set.dayRefs) if (!validDays.has(d)) errors.push(`journée inexistante ${d}`);
  if (set.trackScope != null) {
    if (!isArr(set.trackScope)) errors.push('trackScope doit être un tableau');
    else if (trackIds) for (const t of set.trackScope) if (!trackIds.has(t)) errors.push(`parcours inconnu « ${t} »`);
  }

  return { ok: errors.length === 0, errors };
}

/** Neutralise récursivement toute valeur ressemblant à un secret. PUR. */
function sanitize(v) {
  if (typeof v === 'string') return SECRET_INLINE.test(v) ? '***' : v;
  if (isArr(v)) return v.map(sanitize);
  if (isObj(v)) { const o = {}; for (const k of Object.keys(v)) if (!DANGEROUS_KEYS.has(k)) o[k] = sanitize(v[k]); return o; }
  return v;
}

/** Vue publique d'un scénario : structure analysable, jamais de secret. PUR. */
export function publicManifestView(set = {}) {
  return {
    id: set.id, title: set.title, description: set.description,
    resources: (set.resources ?? []).map((r) => ({
      apiVersion: r.apiVersion, kind: r.kind,
      metadata: sanitize(r.metadata ?? {}), spec: sanitize(r.spec ?? {}),
    })),
    skills: set.skills ?? [], dayRefs: set.dayRefs ?? [], trackScope: set.trackScope ?? null,
    missionRefs: set.missionRefs ?? [],
  };
}
