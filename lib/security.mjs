// Modèle de scénario de cybersécurité — PUR, sans I/O, sans réseau (ADR/TSD-024).
//
// Un scénario porte des ARTEFACTS locaux à analyser (config, env, log, manifeste,
// RBAC, lockfile, SBOM, en-têtes, pipeline, Dockerfile), un éventuel état CORRIGÉ
// (comparaison vulnérable↔corrigé), et des liens pédagogiques. Ce module n'exécute
// rien, ne fait aucune I/O réseau, et n'accepte AUCUN secret réel : toute valeur
// sensible doit être FACTICE et reconnaissable. L'analyse vit dans
// lib/security-analysis.mjs (CP3) ; la réponse à incident dans security-incident.mjs.

/** Domaines de sécurité (liste fermée). */
export const DOMAINS = ['secrets', 'supply-chain', 'rbac', 'kubernetes', 'exposure', 'incident', 'deployment'];
/** Types d'artefacts analysables (liste fermée). */
export const ARTIFACT_KINDS = ['config', 'env', 'log', 'manifest', 'rbac', 'lockfile', 'sbom', 'headers', 'pipeline', 'dockerfile'];
/** Incidents simulables (allowlist). */
export const INCIDENTS = ['secret-leak', 'dependency-compromise', 'access-compromise', 'broken-security-deploy', 'critical-regression', 'image-untrusted'];
/** Plafonds durs (budgets pédagogiques). */
export const SECURITY_CAPS = { maxArtifacts: 20, maxDepth: 12, maxContentBytes: 24 * 1024, maxArrayItems: 200, maxSerializedBytes: 256 * 1024 };

const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const isNonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;
const isArr = Array.isArray;
const isObj = (v) => v && typeof v === 'object' && !isArr(v);
const isKebab = (v) => typeof v === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);

// Motifs qui RESSEMBLENT à un secret. Utilisés pour la détection ET pour refuser
// tout secret trop réaliste dans le dépôt.
const SECRET_PATTERNS = [
  { kind: 'openai-key', re: /sk-[A-Za-z0-9]{16,}/g },
  { kind: 'github-pat', re: /ghp_[A-Za-z0-9]{16,}/g },
  { kind: 'aws-akid', re: /AKIA[0-9A-Z]{12,}/g },
  { kind: 'slack-token', re: /xox[baprs]-[A-Za-z0-9-]{10,}/g },
  { kind: 'private-key', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  { kind: 'high-entropy', re: /\b[A-Za-z0-9+/_-]{40,}\b/g },
];
// Marqueurs qui rendent un « secret » explicitement FACTICE (donc autorisé).
// Recherche en SOUS-CHAÎNE (insensible à la casse) : ces marqueurs de démonstration
// sont délibérés et peuvent être accolés (ex. « ghp_FAKEFAKE… »).
const FAKE_MARKERS = /FAKE|EXAMPLE|SAMPLE|DUMMY|PLACEHOLDER|CHANGEME|REDACTED|XXXX|TEST[_-]?ONLY|NOT[_-]?REAL|DO[_-]?NOT[_-]?USE/i;
// Noms de champ qui renforcent la confiance qu'une valeur est un secret.
const SECRET_CONTEXT = /pass|password|passwd|token|secret|apikey|api[_-]?key|private|credential|auth|bearer/i;

/** Entropie de Shannon (approx.) d'une chaîne — heuristique de « ça ressemble à une clé ». */
function entropy(s) {
  const freq = {};
  for (const c of s) freq[c] = (freq[c] || 0) + 1;
  let h = 0;
  for (const c in freq) { const p = freq[c] / s.length; h -= p * Math.log2(p); }
  return h;
}

/**
 * Détecte les candidats-secrets d'un texte. PRUDENT : combine motif + contexte +
 * entropie et renvoie un niveau de confiance. NE classe PAS toute chaîne comme
 * secret. Marque `fake:true` les valeurs explicitement factices. PUR.
 * Limites : faux positifs possibles (hash, UUID, base64 non sensible) → confidence
 * « low » ; ne détecte pas les secrets obfusqués ou hors motifs connus.
 * @returns {Array<{match,index,kind,confidence:'high'|'medium'|'low',fake:boolean}>}
 */
export function detectSecretCandidates(text) {
  const out = [];
  if (typeof text !== 'string' || !text) return out;
  const seen = new Set();
  for (const { kind, re } of SECRET_PATTERNS) {
    for (const m of text.matchAll(re)) {
      const match = m[0];
      const key = `${m.index}:${match}`;
      if (seen.has(key)) continue; seen.add(key);
      const around = text.slice(Math.max(0, m.index - 40), m.index + match.length + 10);
      const fake = FAKE_MARKERS.test(match) || FAKE_MARKERS.test(around);
      let confidence;
      if (kind === 'private-key' || kind === 'openai-key' || kind === 'github-pat' || kind === 'aws-akid' || kind === 'slack-token') {
        confidence = 'high';
      } else {
        // high-entropy : besoin de contexte OU d'une entropie élevée pour monter.
        const ctx = SECRET_CONTEXT.test(around);
        const h = entropy(match);
        confidence = (ctx && h > 3.5) ? 'high' : (ctx || h > 4) ? 'medium' : 'low';
      }
      if (fake) confidence = confidence === 'high' ? 'medium' : 'low';
      out.push({ match, index: m.index, kind, confidence, fake });
    }
  }
  return out.sort((a, b) => a.index - b.index);
}

function walkContent(node, label, errors, depth = 0) {
  if (node == null) return;
  if (depth > SECURITY_CAPS.maxDepth) { errors.push(`${label} : contenu trop profond`); return; }
  if (isArr(node)) {
    if (node.length > SECURITY_CAPS.maxArrayItems) errors.push(`${label} : tableau trop long`);
    for (const v of node) if (isObj(v) || isArr(v)) walkContent(v, label, errors, depth + 1);
    return;
  }
  if (!isObj(node)) return;
  for (const k of Object.keys(node)) {
    if (DANGEROUS_KEYS.has(k)) errors.push(`${label} : clé dangereuse « ${k} »`);
    const v = node[k];
    if (typeof v === 'string' && v.includes('\0')) errors.push(`${label} : octet nul interdit`);
    else if (isObj(v) || isArr(v)) walkContent(v, label, errors, depth + 1);
  }
}

/** Refuse tout secret trop réaliste (non factice) dans un texte. */
function checkNoRealSecret(text, label, errors) {
  for (const c of detectSecretCandidates(text)) {
    if (!c.fake && c.confidence === 'high') {
      errors.push(`${label} : secret trop réaliste « ${c.kind} » — n'utiliser que des valeurs FACTICES (FAKE/EXAMPLE/…)`);
    }
  }
}

/** Sérialise le contenu d'un artefact en texte pour le scan de secret. */
function contentText(content) {
  if (typeof content === 'string') return content;
  try { return JSON.stringify(content); } catch { return ''; }
}

/**
 * Valide un scénario de sécurité contre le contexte réel. PUR.
 * @param {object} scn
 * @param {{ skillIds?:{has}, validDays?:Set<number>, trackIds?:Set<string> }} ctx
 * @returns {{ ok:boolean, errors:string[] }}
 */
export function validateScenario(scn = {}, ctx = {}) {
  const errors = [];
  const skillIds = ctx.skillIds ?? { has: () => true };
  const validDays = ctx.validDays ?? null;
  const trackIds = ctx.trackIds ?? null;

  for (const k of Object.keys(scn)) if (DANGEROUS_KEYS.has(k)) errors.push('clé dangereuse au niveau scénario');
  if (!isKebab(scn.id)) errors.push('id invalide (kebab-case)');
  if (!isNonEmpty(scn.title)) errors.push('titre manquant');
  if (!isNonEmpty(scn.description)) errors.push('description manquante');
  if (!DOMAINS.includes(scn.domain)) errors.push(`domaine inconnu « ${scn.domain} »`);
  if (scn.incident != null && !INCIDENTS.includes(scn.incident)) errors.push(`incident inconnu « ${scn.incident} »`);

  const serialized = (() => { try { return JSON.stringify(scn); } catch { return ''; } })();
  if (!serialized) errors.push('scénario non sérialisable');
  else if (serialized.length > SECURITY_CAPS.maxSerializedBytes) errors.push('scénario trop volumineux');

  const validateArtifacts = (arts, tag) => {
    if (!isArr(arts)) { errors.push(`${tag} : liste attendue`); return; }
    if (arts.length > SECURITY_CAPS.maxArtifacts) errors.push(`${tag} : trop d'artefacts`);
    const ids = new Set();
    for (const a of arts) {
      const label = `${tag} ${a?.id ?? '?'}`;
      if (!isKebab(a?.id)) { errors.push(`${label} : id invalide`); continue; }
      if (ids.has(a.id)) errors.push(`${label} : id dupliqué`);
      ids.add(a.id);
      if (!ARTIFACT_KINDS.includes(a.kind)) errors.push(`${label} : kind inconnu « ${a.kind} »`);
      const txt = contentText(a.content);
      if (txt.length > SECURITY_CAPS.maxContentBytes) errors.push(`${label} : contenu trop volumineux`);
      if (isObj(a.content) || isArr(a.content)) walkContent(a.content, label, errors);
      checkNoRealSecret(txt, label, errors); // refuse les secrets trop réalistes
    }
  };
  if (!isArr(scn.artifacts) || scn.artifacts.length === 0) errors.push('artifacts manquants');
  else validateArtifacts(scn.artifacts, 'artifact');
  if (scn.fixedArtifacts != null) validateArtifacts(scn.fixedArtifacts, 'fixedArtifact');

  // Rattachement pédagogique.
  if (!isArr(scn.skills) || scn.skills.length === 0) errors.push('skills manquantes');
  else for (const s of scn.skills) if (!skillIds.has(s)) errors.push(`compétence inconnue « ${s} »`);
  if (!isArr(scn.dayRefs) || scn.dayRefs.length === 0) errors.push('dayRefs manquantes');
  else if (validDays) for (const d of scn.dayRefs) if (!validDays.has(d)) errors.push(`journée inexistante ${d}`);
  if (scn.trackScope != null) {
    if (!isArr(scn.trackScope)) errors.push('trackScope doit être un tableau');
    else if (trackIds) for (const t of scn.trackScope) if (!trackIds.has(t)) errors.push(`parcours inconnu « ${t} »`);
  }

  return { ok: errors.length === 0, errors };
}

/** Neutralise récursivement toute valeur ressemblant à un secret. PUR. */
function redact(v) {
  if (typeof v === 'string') {
    let out = v;
    for (const c of detectSecretCandidates(v)) if (c.confidence !== 'low') out = out.split(c.match).join('***');
    return out;
  }
  if (isArr(v)) return v.map(redact);
  if (isObj(v)) { const o = {}; for (const k of Object.keys(v)) if (!DANGEROUS_KEYS.has(k)) o[k] = redact(v[k]); return o; }
  return v;
}

/** Vue publique d'un scénario : structure analysable, secrets masqués, sans champ interne. PUR. */
export function publicScenarioView(scn = {}) {
  const pubArts = (arts) => (arts ?? []).map((a) => ({ id: a.id, kind: a.kind, path: a.path ?? null, content: redact(a.content) }));
  return {
    id: scn.id, title: scn.title, description: scn.description, domain: scn.domain,
    difficulty: scn.difficulty ?? null,
    artifacts: pubArts(scn.artifacts),
    fixedArtifacts: scn.fixedArtifacts ? pubArts(scn.fixedArtifacts) : null,
    incident: scn.incident ?? null, playbookRef: scn.playbookRef ?? null,
    skills: scn.skills ?? [], dayRefs: scn.dayRefs ?? [], trackScope: scn.trackScope ?? null,
    exerciseRefs: scn.exerciseRefs ?? [], missionRefs: scn.missionRefs ?? [],
  };
}
