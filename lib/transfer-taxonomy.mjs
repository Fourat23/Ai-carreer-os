// Taxonomie de DISTANCE de transfert (T0–T5) — PUR. Complémentaire de la taxonomie
// de Bloom d'assessment.mjs (RECALL→TRANSFER) : elle mesure à quel point une tâche
// EXIGE de transposer un modèle mental dans un contexte nouveau, pas seulement le
// niveau cognitif. Le classifieur est volontairement CONSERVATEUR : il ne prétend
// JAMAIS « T5 » sans preuve structurelle (pont conceptuel + changement de domaine +
// raisonnement multi-étapes). Aucun I/O, aucune « IA ». Un score reste un PROXY.

export const TRANSFER_LEVELS = ['T0', 'T1', 'T2', 'T3', 'T4', 'T5'];

export const TRANSFER_LABEL = {
  T0: 'Recall', T1: 'Understanding', T2: 'Application proche',
  T3: 'Diagnostic', T4: 'Near transfer', T5: 'Deep / Far transfer',
};

// Mapping documenté depuis la taxonomie de Bloom d'assessment.mjs. TRANSFER (Bloom)
// vaut AU MOINS T4 ; il faut des preuves supplémentaires (pont + cross-domain) pour T5.
export const BLOOM_TO_TRANSFER = {
  RECALL: 'T0', UNDERSTANDING: 'T1', APPLICATION: 'T2', DIAGNOSIS: 'T3', TRANSFER: 'T4',
};

// Rubrique d'audit humain : 10 critères notés 0..3. La présence d'une section ne vaut
// jamais automatiquement un bon score — on juge le CONTENU.
export const TRANSFER_RUBRIC = [
  'conceptual-recognition', 'contextual-novelty', 'distractor-quality', 'hypothesis-competition',
  'reasoning-depth', 'justification-requirement', 'ambiguity-control', 'professional-authenticity',
  'feedback-quality', 'remediability',
];

const isStr = (v) => typeof v === 'string';
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

export function isTransferLevel(x) {
  return TRANSFER_LEVELS.includes(x);
}

const rank = (t) => TRANSFER_LEVELS.indexOf(t);
/** Renvoie le niveau le plus élevé des deux (par rang). */
export function maxLevel(a, b) {
  const ra = rank(a), rb = rank(b);
  if (ra < 0) return isTransferLevel(b) ? b : 'T0';
  if (rb < 0) return a;
  return ra >= rb ? a : b;
}

/**
 * Classifieur CONSERVATEUR d'une question. Renvoie un niveau PLANCHER prudent, les
 * raisons, et si un niveau T5 est structurellement défendable. Ne « promeut » jamais
 * en T5 sans pont conceptuel ET changement de domaine.
 * @param {{kind,taxonomy?,options?}} question
 * @param {{bridge?:string, crossDomain?:boolean, steps?:number}} [meta]
 * @returns {{ level:string, reasons:string[], canBeT5:boolean }}
 */
export function suggestTransferLevel(question, meta = {}) {
  const q = isObj(question) ? question : {};
  const m = isObj(meta) ? meta : {};
  const reasons = [];

  // Point de départ : le niveau de Bloom déclaré, mappé en distance de transfert.
  let level = BLOOM_TO_TRANSFER[q.taxonomy] ?? 'T2';
  reasons.push(`base Bloom « ${q.taxonomy ?? 'APPLICATION'} » → ${level}`);

  const hasBridge = isStr(m.bridge) && m.bridge.trim().length >= 8;
  const crossDomain = m.crossDomain === true;
  const steps = Number.isFinite(m.steps) ? m.steps : (q.kind === 'multi' ? 2 : 1);
  const nOptions = Array.isArray(q.options) ? q.options.length : 0;
  const discriminating = q.kind === 'multi' || q.kind === 'predict' || nOptions >= 4;

  // Un simple mcq à faible discrimination et sans pont reste borné (≤ T3).
  if (q.kind === 'mcq' && !discriminating && !hasBridge) {
    level = maxLevel('T2', level === 'T4' ? 'T3' : level);
    reasons.push('mcq peu discriminant, sans pont explicite → borné à ≤ T3');
  }

  // Near transfer (T4) : pont OU changement de domaine + discrimination + ≥ 2 étapes.
  if ((hasBridge || crossDomain) && discriminating && steps >= 2) {
    level = maxLevel(level, 'T4');
    reasons.push('pont/cross-domain + discrimination + multi-étapes → au moins T4');
  }

  // Deep transfer (T5) : EXIGE pont ET changement de domaine ET ≥ 2 étapes ET forte discrimination.
  const canBeT5 = hasBridge && crossDomain && steps >= 2 && (q.kind !== 'mcq' || nOptions >= 3);
  if (canBeT5) {
    level = maxLevel(level, 'T5');
    reasons.push('pont conceptuel + changement de domaine + raisonnement multi-étapes → T5 défendable');
  } else {
    reasons.push('T5 refusé : ' + [!hasBridge && 'pont manquant', !crossDomain && 'même domaine', steps < 2 && 'mono-étape'].filter(Boolean).join(', '));
  }

  return { level, reasons, canBeT5 };
}

/** Résumé d'un ensemble de niveaux : { [level]: count }. PUR. */
export function transferLevelSummary(levels) {
  const out = {};
  for (const l of TRANSFER_LEVELS) out[l] = 0;
  for (const l of Array.isArray(levels) ? levels : []) if (isTransferLevel(l)) out[l] += 1;
  return out;
}
