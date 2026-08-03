// Modèle d'audit de qualité pédagogique — PUR, sans I/O, sans réseau (ADR-020).
//
// Principe directeur : une occurrence de mot-clé n'est JAMAIS une preuve
// d'enseignement, et une longueur minimale ne vaut pas une qualité. Ce module
// sépare donc TROIS choses qui ne doivent pas être confondues :
//
//   1. La RUBRIQUE (16 dimensions, échelle 0-4, seuils, règles bloquantes) —
//      la référence contre laquelle une note HUMAINE est portée.
//   2. Les SIGNAUX STRUCTURELS (présence/absence de composants pédagogiques) —
//      ils INFORMENT l'auditeur mais n'attribuent PAS de note de qualité.
//   3. Les SIGNAUX DE DANGER (erreurs factuelles/commandes destructives non
//      signalées, promesses de sécurité trompeuses, code tronqué) — ils sont
//      BLOQUANTS quelle que soit la moyenne.
//
// Le gate v20:pedagogy-check combine : validation du registre de notes humaines
// contre les seuils + scan de danger réel sur le contenu source.

/** Échelle : 0 absent/dangereux · 1 très insuffisant · 2 superficiel · 3 bon · 4 excellent. */
export const AUDIT_SCALE = [0, 1, 2, 3, 4];

/**
 * Les 16 dimensions obligatoires. `min` = note plancher pour un contenu déclaré
 * exploitable ; `critical` = une note < min sur cette dimension est BLOQUANTE.
 */
export const DIMENSIONS = [
  { id: 'technical-accuracy', label: 'Exactitude technique', min: 3, critical: true },
  { id: 'objective', label: 'Objectif pédagogique', min: 3, critical: false },
  { id: 'prerequisites', label: 'Prérequis', min: 2, critical: false },
  { id: 'mental-model', label: 'Modèle mental', min: 2, critical: false },
  { id: 'depth', label: 'Profondeur', min: 2, critical: false },
  { id: 'progression', label: 'Progression', min: 3, critical: false },
  { id: 'guided-example', label: 'Exemple guidé', min: 2, critical: false },
  { id: 'autonomous-practice', label: 'Pratique autonome', min: 3, critical: false },
  { id: 'feedback', label: 'Feedback et correction', min: 2, critical: false },
  { id: 'common-mistakes', label: 'Erreurs fréquentes', min: 2, critical: false },
  { id: 'professional-relevance', label: 'Pertinence professionnelle', min: 2, critical: false },
  { id: 'evaluation', label: 'Évaluation', min: 2, critical: false },
  { id: 'cognitive-load', label: 'Charge cognitive', min: 2, critical: false },
  { id: 'accessibility', label: 'Accessibilité et lisibilité', min: 2, critical: false },
  { id: 'retention', label: 'Rétention', min: 2, critical: false },
  { id: 'track-coherence', label: 'Cohérence avec le parcours', min: 2, critical: false },
];
export const DIMENSION_IDS = new Set(DIMENSIONS.map((d) => d.id));

/** Seuils de sortie (CP1). `recentAvgMin` s'applique aux ajouts V17→V19. */
export const THRESHOLDS = {
  noDimBelow: 2, // aucune dimension à 0 ou 1 pour un contenu exploitable
  globalAvgMin: 3.0,
  recentAvgMin: 3.25,
  hardMinDims: ['technical-accuracy', 'objective', 'progression', 'autonomous-practice'], // ≥3 obligatoire
  securityDim: 'technical-accuracy', // l'exactitude porte aussi la véracité sécurité
};

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Évalue un jeu de notes humaines (0-4 par dimension) contre les seuils.
 * @param {Record<string,number>} scores  { 'technical-accuracy': 4, ... }
 * @param {{recent?:boolean}} opt          recent = ajout V17→V19 (seuil relevé)
 * @returns {{ ok:boolean, avg:number, failures:string[], missing:string[] }}
 */
export function evaluateScores(scores = {}, opt = {}) {
  const failures = [];
  const missing = [];
  const vals = [];
  for (const d of DIMENSIONS) {
    const v = scores[d.id];
    if (!Number.isInteger(v) || v < 0 || v > 4) { missing.push(d.id); continue; }
    vals.push(v);
    if (v < THRESHOLDS.noDimBelow) failures.push(`${d.id} = ${v} (< ${THRESHOLDS.noDimBelow} : contenu non exploitable)`);
    if (d.critical && v < d.min) failures.push(`${d.id} = ${v} (dimension CRITIQUE, minimum ${d.min})`);
  }
  for (const id of THRESHOLDS.hardMinDims) {
    const v = scores[id];
    if (Number.isInteger(v) && v < 3) failures.push(`${id} = ${v} (minimum obligatoire 3)`);
  }
  const avg = vals.length ? round2(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  const floor = opt.recent ? THRESHOLDS.recentAvgMin : THRESHOLDS.globalAvgMin;
  if (missing.length) failures.push(`notes manquantes : ${missing.join(', ')}`);
  else if (avg < floor) failures.push(`moyenne ${avg} < seuil ${floor}${opt.recent ? ' (contenu récent V17→V19)' : ''}`);
  return { ok: failures.length === 0, avg, failures, missing };
}

// ── Signaux de DANGER (bloquants) — scan pur, factuel, non exhaustif ─────────
// Chaque motif vise une erreur pédagogiquement grave : commande destructive ou
// privilégiée présentée sans avertissement, promesse de sécurité trompeuse,
// raccourci factuellement faux, ou code manifestement tronqué.
const CAUTION_NEAR = /(anti-?pattern|évit|jamais|danger|dangereux|attention|pruden|ne\s+(?:jamais|pas|surtout)|risqu|moindre privilège|au lieu|faille|ouvre\s+tout|tous\s+les\s+droits|à\s+tous)/i;

function nearby(text, index, radius = 160) {
  return text.slice(Math.max(0, index - radius), Math.min(text.length, index + radius));
}

/**
 * Détecte les signaux de danger d'un contenu. Retourne une liste vide si sain.
 * @param {string} text
 * @returns {Array<{code:string, severity:'blocking'|'warn', excerpt:string}>}
 */
export function detectDangerSignals(text) {
  const out = [];
  if (typeof text !== 'string' || !text) return out;

  // 1. chmod 777 présenté sans mise en garde à proximité → bloquant.
  for (const m of text.matchAll(/chmod\s+(?:-R\s+)?777/gi)) {
    if (!CAUTION_NEAR.test(nearby(text, m.index))) out.push({ code: 'chmod-777-unwarned', severity: 'blocking', excerpt: nearby(text, m.index, 60).trim() });
  }
  // 2. rm -rf destructif racine/home sans étiquette de danger → bloquant.
  for (const m of text.matchAll(/rm\s+-rf\s+(?:~|\$HOME|\/\*|\/(?![a-zA-Z0-9_.]))/gi)) {
    if (!CAUTION_NEAR.test(nearby(text, m.index))) out.push({ code: 'rm-rf-destructive', severity: 'blocking', excerpt: nearby(text, m.index, 60).trim() });
  }
  // 3. Promesse d'isolation OS / sécurité absolue → bloquant (sauf si niée).
  for (const m of text.matchAll(/isolation\s+(?:os|complète|totale|absolue|parfaite|garantie)/gi)) {
    const ctx = nearby(text, m.index, 90);
    if (!/(pas\s+d['e]|aucune|ne\s+(?:constitue|prétend|garantit|fournit)\s+(?:pas|jamais)|n['e]est\s+pas|sans\s+garantir)/i.test(ctx)) {
      out.push({ code: 'os-isolation-overclaim', severity: 'blocking', excerpt: ctx.trim() });
    }
  }
  // On ne flague une « sécurité/protection absolue » QUE si une entité prétend la
  //  FOURNIR (verbe de fourniture juste avant). Cela écarte l'idiome légitime
  //  « règle de sécurité absolue » (= règle cardinale), qui n'est pas une promesse.
  for (const m of text.matchAll(/(?:sécurité|protection)\s+(?:absolue|totale|parfaite|garantie)/gi)) {
    const before = text.slice(Math.max(0, m.index - 40), m.index);
    if (/(offr|fourni|garanti|assur|procur|apport|donne|constitu|permet|=)\w*\s+(?:une\s+|d['e]\s*une\s+|la\s+|de\s+la\s+)?$/i.test(before)) {
      out.push({ code: 'absolute-security-claim', severity: 'blocking', excerpt: nearby(text, m.index, 70).trim() });
    }
  }
  // 4. « ping prouve que le réseau fonctionne » → raccourci trompeur (warn).
  for (const m of text.matchAll(/ping[^.]{0,80}(?:réseau|network)[^.]{0,30}(?:fonctionne|marche|ok\b|va bien)/gi)) {
    out.push({ code: 'ping-overclaim', severity: 'warn', excerpt: nearby(text, m.index, 80).trim() });
  }
  // 5. Bloc de code non fermé (nombre impair de barrières ```) → bloquant.
  const fences = (text.match(/```/g) || []).length;
  if (fences % 2 !== 0) out.push({ code: 'unclosed-code-fence', severity: 'blocking', excerpt: `${fences} barrières \`\`\`` });
  // 6. Placeholders d'AUTEUR résiduels → warn. On ne retient que des marqueurs de
  //    rédaction inachevée SANS ambiguïté : on exclut TODO/FIXME/XXX (jetons de
  //    code, ex. `grep TODO` ou un starter `// TODO`), l'attribut HTML
  //    `placeholder="…"`, et « à compléter » (souvent une consigne à l'apprenant).
  for (const m of text.matchAll(/(lorem ipsum|\blipsum\b|contenu\s+à\s+venir|à\s+rédiger\b|\[\s*à\s+remplir\s*\]|\bTBD\b)/gi)) {
    out.push({ code: 'placeholder', severity: 'warn', excerpt: nearby(text, m.index, 50).trim() });
  }
  return out;
}

export function blockingSignals(text) {
  return detectDangerSignals(text).filter((s) => s.severity === 'blocking');
}

// ── Signaux STRUCTURELS (informatifs, jamais une note de qualité) ────────────
/** Composants pédagogiques recherchés dans une journée (par ancre de section). */
export const DAY_COMPONENTS = [
  { id: 'objective', re: /##\s*🎯|##\s*Objectif/i },
  { id: 'course', re: /##\s*📖|##\s*Cours/i },
  { id: 'mental-model', re: /mod[èe]le\s+mental/i },
  { id: 'guided-example', re: /##\s*🧭|Exemple\s+guidé/i },
  { id: 'autonomous-practice', re: /##\s*✍️|Pratique\s+autonome/i },
  { id: 'quiz', re: /##\s*❓|Mini-?quiz/i },
  { id: 'common-mistakes', re: /##\s*⚠️|Erreurs\s+fréquentes/i },
  { id: 'validation', re: /##\s*✅|Critères\s+de\s+validation/i },
  { id: 'professional', re: /##\s*🏢|##\s*🎤|Cas\s+métier|Question\s+d['e]entretien/i },
  { id: 'synthesis', re: /##\s*🧠|À\s+retenir/i },
];

/**
 * Présence/absence des composants pédagogiques d'une journée. INFORMATIF.
 * @param {string} text
 * @returns {{ present:string[], missing:string[], completeness:number }}
 */
export function structuralSignals(text) {
  const present = [];
  const missing = [];
  for (const c of DAY_COMPONENTS) (c.re.test(text || '') ? present : missing).push(c.id);
  return { present, missing, completeness: round2(present.length / DAY_COMPONENTS.length) };
}

// ── Registre d'audit : validation d'une entrée + du registre complet ─────────
export const AUDIT_KINDS = ['day', 'exercise', 'mission', 'glossary', 'content'];

/**
 * Valide une entrée de registre d'audit (notes humaines + métadonnées).
 * @param {object} item { id, kind, recent?, scores, sourcePath?, notes? }
 * @returns {{ ok:boolean, errors:string[], evaluation:object|null }}
 */
export function validateAuditItem(item = {}) {
  const errors = [];
  if (!item.id || typeof item.id !== 'string') errors.push('entrée sans id');
  if (!AUDIT_KINDS.includes(item.kind)) errors.push(`kind invalide « ${item.kind} »`);
  if (item.scores == null || typeof item.scores !== 'object') { errors.push(`${item.id} : scores manquants`); return { ok: false, errors, evaluation: null }; }
  for (const k of Object.keys(item.scores)) if (!DIMENSION_IDS.has(k)) errors.push(`${item.id} : dimension inconnue « ${k} »`);
  const evaluation = evaluateScores(item.scores, { recent: !!item.recent });
  for (const f of evaluation.failures) errors.push(`${item.id} : ${f}`);
  return { ok: errors.length === 0, errors, evaluation };
}

/**
 * Valide un registre complet. `loadSource(item)->string|null` fournit le
 * contenu réel pour le scan de danger (facultatif ; si fourni, un signal
 * BLOQUANT échoue l'entrée).
 * @returns {{ ok:boolean, errors:string[], warnings:string[], summary:object }}
 */
export function validateAuditLedger(ledger = {}, loadSource = null) {
  const errors = [];
  const warnings = [];
  const items = Array.isArray(ledger.items) ? ledger.items : [];
  const seen = new Set();
  let recentCount = 0;
  for (const item of items) {
    if (seen.has(item.id)) errors.push(`id dupliqué « ${item.id} »`);
    seen.add(item.id);
    if (item.recent) recentCount += 1;
    const v = validateAuditItem(item);
    errors.push(...v.errors);
    if (typeof loadSource === 'function') {
      const src = loadSource(item);
      if (typeof src === 'string') {
        for (const s of detectDangerSignals(src)) {
          const msg = `${item.id} : signal ${s.severity} « ${s.code} » — ${s.excerpt}`;
          if (s.severity === 'blocking') errors.push(msg); else warnings.push(msg);
        }
      }
    }
  }
  return { ok: errors.length === 0, errors, warnings, summary: { items: items.length, recent: recentCount } };
}
