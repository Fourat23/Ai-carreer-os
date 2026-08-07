// Modèle d'architecture cloud provider-aware — PUR, sans I/O, sans réseau
// (ADR/HSD/TSD-025). Une CloudArchitecture est un document DÉCLARATIF : provider,
// région, zones, ressources (composants), arêtes (flux typés), identités (IAM),
// réseau (CIDR/subnets/security-groups), indices de coût et contraintes.
//
// Ce module NE stocke aucun secret/credential réel, n'exécute rien, ne provisionne
// rien, ne contacte JAMAIS AWS/Azure. Il RÉUTILISE le graphe de topologie V22
// (lib/topology.mjs) comme graphe de dépendances sous-jacent via toTopology(), pour
// que l'analyse de disponibilité (SPOF/cycles) réemploie analyzeTopology sans
// dupliquer de moteur. L'analyse cloud vit dans lib/cloud-analysis.mjs ;
// l'estimation de coût (factice) dans lib/cloud-cost.mjs.
import { NODE_KINDS, EDGE_KINDS, validateTopology } from './topology.mjs';

/** Fournisseurs reconnus (liste fermée). `generic` = provider-indépendant. */
export const PROVIDERS = ['aws', 'azure', 'generic'];

/** Domaines d'analyse cloud (liste fermée). */
export const CLOUD_DOMAINS = ['iam', 'network', 'compute', 'storage', 'database', 'observability', 'resilience', 'finops'];

/** Types de ressources cloud = vocabulaire graphe V22 + kinds cloud spécifiques. */
export const CLOUD_RESOURCE_KINDS = [
  ...NODE_KINDS,
  'vm', 'serverless', 'container', 'managed-db', 'identity', 'security-group',
];

/** Types d'identité IAM (liste fermée). */
export const IDENTITY_TYPES = ['user', 'role', 'service-principal', 'managed-identity', 'group'];

/** Correspondance kind cloud → kind graphe V22 (pour toTopology / analyzeTopology). */
const KIND_TO_NODE = {
  vm: 'backend', serverless: 'backend', container: 'backend',
  'managed-db': 'relational-db', identity: 'secret-store', 'security-group': 'firewall',
};

/** Plafonds durs (budgets de ressources pédagogiques). */
export const CLOUD_CAPS = { maxResources: 60, maxIdentities: 40, maxSubnets: 24, maxPolicies: 80, maxSerializedBytes: 128 * 1024 };

const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const isKebab = (v) => typeof v === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
const isNonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;
const isArr = Array.isArray;

/** Marqueurs FACTICES explicites (sous-chaîne, insensible à la casse). */
const FAKE_MARKERS = /FAKE|EXAMPLE|SAMPLE|DUMMY|PLACEHOLDER|CHANGEME|REDACTED|XXXX|TEST[_-]?ONLY|NOT[_-]?REAL|DO[_-]?NOT[_-]?USE|000000000000/i;
/** Motif ressemblant à un credential cloud brut (à référencer, jamais inliner). */
const SECRET_LIKE = /(AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|aws_secret_access_key\s*[=:]\s*[A-Za-z0-9/+]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{16,})/;

/** Format CIDR IPv4 valide (ex. 10.0.0.0/16). PUR. */
export function isCidr(v) {
  if (typeof v !== 'string') return false;
  const m = v.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
  if (!m) return false;
  const octets = [m[1], m[2], m[3], m[4]].map(Number);
  if (octets.some((o) => o > 255)) return false;
  const prefix = Number(m[5]);
  return prefix >= 0 && prefix <= 32;
}

/** Convertit une IPv4 en entier non signé 32 bits. PUR. */
function ipToInt(ip) {
  return ip.split('.').reduce((acc, o) => (acc * 256 + Number(o)) >>> 0, 0);
}

/** Plage [début, fin] (uint32) couverte par un CIDR. PUR. */
export function cidrRange(cidr) {
  const [ip, prefixStr] = cidr.split('/');
  const prefix = Number(prefixStr);
  const base = ipToInt(ip) >>> 0;
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const start = (base & mask) >>> 0;
  const size = prefix === 32 ? 1 : (2 ** (32 - prefix));
  const end = (start + size - 1) >>> 0;
  return { start, end };
}

/** Deux CIDR se chevauchent-ils ? PUR, déterministe (aucune I/O réseau). */
export function cidrsOverlap(a, b) {
  if (!isCidr(a) || !isCidr(b)) return false;
  const ra = cidrRange(a); const rb = cidrRange(b);
  return ra.start <= rb.end && rb.start <= ra.end;
}

/** Détecte un credential/secret réaliste inliné. `fake` si marqueur factice présent. PUR. */
export function detectCloudSecretLike(text) {
  const out = [];
  const s = String(text ?? '');
  const re = new RegExp(SECRET_LIKE, 'g');
  let m;
  while ((m = re.exec(s)) !== null) {
    const around = s.slice(Math.max(0, m.index - 24), m.index + m[0].length + 24);
    out.push({ match: m[0], index: m.index, fake: FAKE_MARKERS.test(m[0]) || FAKE_MARKERS.test(around) });
  }
  return out;
}

function checkPropsSafety(props, label, errors) {
  if (props == null) return;
  if (typeof props !== 'object' || isArr(props)) { errors.push(`${label} : props doit être un objet`); return; }
  for (const k of Object.keys(props)) {
    if (DANGEROUS_KEYS.has(k)) { errors.push(`${label} : clé dangereuse dans props`); continue; }
    const v = props[k];
    if (typeof v === 'string') {
      for (const c of detectCloudSecretLike(v)) if (!c.fake) errors.push(`${label} : credential réaliste inliné (référencer, ne pas inliner)`);
    } else if (v && typeof v === 'object' && !isArr(v)) checkPropsSafety(v, label, errors);
  }
}

/**
 * Convertit une CloudArchitecture en topologie V22 (pour réutiliser analyzeTopology).
 * PUR. Les identités et le réseau ne sont pas des nœuds : ils sont analysés à part.
 * @returns {{ id, title, description, zones, nodes, edges, objectives, skills, dayRefs }}
 */
export function toTopology(arch = {}) {
  const zones = (arch.zones ?? []).map((z, i) => (typeof z === 'string'
    ? { id: isKebab(z) ? z : `zone-${i + 1}`, label: z }
    : { id: z.id, label: z.label ?? z.id }));
  const nodes = (arch.resources ?? [])
    .filter((r) => r && r.kind !== 'identity' && r.kind !== 'security-group')
    .map((r) => ({
      id: r.id,
      kind: KIND_TO_NODE[r.kind] ?? r.kind,
      label: r.label ?? r.id,
      zone: r.zone ?? null,
      environment: r.environment ?? null,
      props: r.props ?? {},
    }));
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = (arch.edges ?? []).filter((e) => nodeIds.has(e.from) && nodeIds.has(e.to));
  return {
    id: arch.id, title: arch.title, description: arch.description,
    zones, nodes, edges,
    objectives: arch.objectives ?? [],
    skills: arch.skills ?? [], dayRefs: arch.dayRefs ?? [],
  };
}

/**
 * Validation stricte d'une CloudArchitecture. Retourne { ok, errors }. PURE.
 * Réutilise validateTopology sur la projection graphe (via toTopology) pour la
 * cohérence du graphe, puis ajoute les contrôles cloud (provider, IAM, réseau).
 */
export function validateCloudArchitecture(arch = {}, ctx = {}) {
  const errors = [];
  const skillIds = ctx.skillIds ?? { has: () => true };
  const validDays = ctx.validDays ?? null;
  const trackIds = ctx.trackIds ?? null;

  for (const k of Object.keys(arch)) if (DANGEROUS_KEYS.has(k)) errors.push('clé dangereuse au niveau architecture');
  if (!isKebab(arch.id)) errors.push('id invalide (kebab-case)');
  if (!isNonEmpty(arch.title)) errors.push('titre manquant');
  if (!isNonEmpty(arch.description)) errors.push('description manquante');
  if (!PROVIDERS.includes(arch.provider)) errors.push(`provider inconnu « ${arch.provider} »`);
  if (!isNonEmpty(arch.region)) errors.push('région manquante');

  const serialized = (() => { try { return JSON.stringify(arch); } catch { return ''; } })();
  if (!serialized) errors.push('architecture non sérialisable');
  else if (serialized.length > CLOUD_CAPS.maxSerializedBytes) errors.push('architecture trop volumineuse');

  // Ressources.
  const resources = isArr(arch.resources) ? arch.resources : [];
  if (!resources.length) errors.push('aucune ressource');
  if (resources.length > CLOUD_CAPS.maxResources) errors.push('trop de ressources');
  const resIds = new Set();
  const zoneSet = new Set((arch.zones ?? []).map((z) => (typeof z === 'string' ? z : z.id)));
  for (const r of resources) {
    const label = `ressource ${r?.id}`;
    if (!isKebab(r?.id)) { errors.push('ressource : id invalide'); continue; }
    if (resIds.has(r.id)) errors.push(`ressource : id dupliqué « ${r.id} »`);
    resIds.add(r.id);
    if (!CLOUD_RESOURCE_KINDS.includes(r.kind)) errors.push(`${label} : kind inconnu « ${r.kind} »`);
    if (!isNonEmpty(r.label)) errors.push(`${label} : label manquant`);
    if (r.zone != null && !zoneSet.has(r.zone)) errors.push(`${label} : zone inconnue « ${r.zone} »`);
    checkPropsSafety(r.props, label, errors);
  }

  // Arêtes (référencent des ressources existantes).
  for (const e of isArr(arch.edges) ? arch.edges : []) {
    const label = `arête ${e?.id}`;
    if (!isKebab(e?.id)) { errors.push('arête : id invalide'); continue; }
    if (!EDGE_KINDS.includes(e.kind)) errors.push(`${label} : kind inconnu « ${e.kind} »`);
    if (!resIds.has(e.from)) errors.push(`${label} : source inconnue « ${e.from} »`);
    if (!resIds.has(e.to)) errors.push(`${label} : cible inconnue « ${e.to} »`);
  }

  // Identités IAM.
  const identities = isArr(arch.identities) ? arch.identities : [];
  if (identities.length > CLOUD_CAPS.maxIdentities) errors.push('trop d\'identités');
  const idIds = new Set();
  let policyCount = 0;
  for (const idn of identities) {
    const label = `identité ${idn?.id}`;
    if (!isKebab(idn?.id)) { errors.push('identité : id invalide'); continue; }
    if (idIds.has(idn.id)) errors.push(`identité : id dupliqué « ${idn.id} »`);
    idIds.add(idn.id);
    if (!IDENTITY_TYPES.includes(idn.type)) errors.push(`${label} : type inconnu « ${idn.type} »`);
    for (const p of isArr(idn.policies) ? idn.policies : []) {
      policyCount += 1;
      if (!isArr(p.actions) || p.actions.length === 0) errors.push(`${label} : policy sans actions`);
      if (p.effect != null && p.effect !== 'allow' && p.effect !== 'deny') errors.push(`${label} : effect invalide « ${p.effect} »`);
    }
  }
  if (policyCount > CLOUD_CAPS.maxPolicies) errors.push('trop de policies');

  // Réseau.
  const net = arch.network;
  if (net != null) {
    if (typeof net !== 'object' || isArr(net)) errors.push('network doit être un objet');
    else {
      if (net.cidr != null && !isCidr(net.cidr)) errors.push(`network : CIDR invalide « ${net.cidr} »`);
      const subnets = isArr(net.subnets) ? net.subnets : [];
      if (subnets.length > CLOUD_CAPS.maxSubnets) errors.push('trop de subnets');
      const subIds = new Set();
      for (const s of subnets) {
        if (!isKebab(s?.id)) errors.push('subnet : id invalide');
        else if (subIds.has(s.id)) errors.push(`subnet : id dupliqué « ${s.id} »`);
        subIds.add(s?.id);
        if (!isCidr(s?.cidr)) errors.push(`subnet ${s?.id} : CIDR invalide`);
      }
    }
  }

  // costHints (facultatif) : référencent des ressources existantes.
  for (const c of isArr(arch.costHints) ? arch.costHints : []) {
    if (c?.resourceId != null && !resIds.has(c.resourceId)) errors.push(`costHints : ressource inconnue « ${c.resourceId} »`);
  }

  // Rattachement pédagogique.
  if (!isArr(arch.skills) || arch.skills.length === 0) errors.push('skills manquantes');
  else for (const s of arch.skills) if (!skillIds.has(s)) errors.push(`compétence inconnue « ${s} »`);
  if (!isArr(arch.dayRefs) || arch.dayRefs.length === 0) errors.push('dayRefs manquantes');
  else if (validDays) for (const d of arch.dayRefs) if (!validDays.has(d)) errors.push(`journée inexistante ${d}`);
  if (arch.trackScope != null) {
    if (!isArr(arch.trackScope)) errors.push('trackScope doit être un tableau');
    else if (trackIds) for (const t of arch.trackScope) if (!trackIds.has(t)) errors.push(`parcours inconnu « ${t} »`);
  }

  // Cohérence du graphe sous-jacent (réutilise V22 sur la projection).
  if (resIds.size > 0 && errors.length === 0) {
    const topo = toTopology(arch);
    const tv = validateTopology(topo, ctx);
    if (!tv.ok) for (const e of tv.errors) errors.push(`graphe : ${e}`);
  }

  return { ok: errors.length === 0, errors };
}

/** Assainit récursivement des props (masque les valeurs secret-like). PUR. */
function sanitizeProps(props) {
  if (props == null || typeof props !== 'object' || isArr(props)) return {};
  const out = {};
  for (const k of Object.keys(props)) {
    if (DANGEROUS_KEYS.has(k)) continue;
    const v = props[k];
    if (typeof v === 'string') out[k] = detectCloudSecretLike(v).some((c) => !c.fake) ? '***' : v.replace(SECRET_LIKE, '***');
    else if (typeof v === 'number' || typeof v === 'boolean') out[k] = v;
    else if (v && typeof v === 'object' && !isArr(v)) out[k] = sanitizeProps(v);
  }
  return out;
}

/**
 * Vue publique d'une architecture : structure analysable, jamais de credential ni
 * de policy détaillée sensible. Les identités sont résumées (type + nb de policies +
 * présence de wildcard) sans exposer les actions/ressources exactes. PUR.
 */
export function publicCloudView(arch = {}) {
  return {
    id: arch.id, title: arch.title, description: arch.description,
    provider: arch.provider, region: arch.region,
    zones: (arch.zones ?? []).map((z) => (typeof z === 'string' ? z : z.id)),
    need: arch.need ?? null,
    constraints: isArr(arch.constraints) ? arch.constraints : [],
    resources: (arch.resources ?? []).map((r) => ({
      id: r.id, kind: r.kind, label: r.label ?? r.id, service: r.service ?? null,
      zone: r.zone ?? null, public: r.public === true, props: sanitizeProps(r.props),
    })),
    edges: (arch.edges ?? []).map((e) => ({ id: e.id, from: e.from, to: e.to, kind: e.kind })),
    identities: (arch.identities ?? []).map((idn) => ({
      id: idn.id, type: idn.type,
      policyCount: isArr(idn.policies) ? idn.policies.length : 0,
      hasWildcard: isArr(idn.policies) && idn.policies.some((p) => (p.actions ?? []).includes('*') || (p.resources ?? []).includes('*')),
    })),
    network: arch.network ? {
      cidr: arch.network.cidr ?? null,
      subnets: (arch.network.subnets ?? []).map((s) => ({ id: s.id, cidr: s.cidr, public: s.public === true })),
    } : null,
    observability: arch.observability ?? null,
    skills: arch.skills ?? [], dayRefs: arch.dayRefs ?? [], trackScope: arch.trackScope ?? null,
  };
}
