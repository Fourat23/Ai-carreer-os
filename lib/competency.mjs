// Registre de preuves + PROJECTION de compétence (V65).
// PUR : aucune I/O, aucun DOM, aucune horloge propre.
//
// Contrat : docs/V65-COMPETENCY-EVIDENCE-CONTRACT.md
//
//     Evidence[]  ──projection pure──▶  CompetencyState
//
// L'état d'une compétence n'est JAMAIS persisté comme vérité mutable. Il se
// recalcule intégralement depuis les preuves — c'est le critère architectural
// du §11 du brief : effacer tout champ dérivé du disque et rejouer la projection
// doit rendre exactement le même état learner-facing.

import { isQualifying, normalizeLedger } from './evidence.mjs';

export const COMPETENCY_STATES = ['unassessed', 'practiced', 'demonstrated', 'reinforced'];

export const COMPETENCY_STATE_LABEL = {
  unassessed: 'Non évaluée',
  practiced: 'Pratiquée',
  demonstrated: 'Démontrée',
  reinforced: 'Consolidée',
};

/** Ordre d'affichage : ce qui demande une action d'abord. */
export const COMPETENCY_DISPLAY_ORDER = ['reinforced', 'demonstrated', 'practiced', 'unassessed'];

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const dayOf = (iso) => (typeof iso === 'string' ? iso.slice(0, 10) : '');

// ── LEDGER — un read-model d'accès, pas une seconde vérité ─────────────────
// Les preuves canoniques restent l'unique source. Le ledger construit les index
// UNE fois pour que chaque surface cesse de re-balayer toute la progression et
// de réimplémenter le sien (trois index concurrents existaient avant V65).

export function createLedger(evidenceList) {
  const all = normalizeLedger(evidenceList);
  const byId = new Map();
  const bySkill = new Map();
  const bySession = new Map();
  const byDay = new Map();
  const bySource = new Map();

  for (const e of all) {
    byId.set(e.id, e);
    for (const c of e.competencyIds) {
      if (!bySkill.has(c)) bySkill.set(c, []);
      bySkill.get(c).push(e);
    }
    if (e.sessionId) {
      if (!bySession.has(e.sessionId)) bySession.set(e.sessionId, []);
      bySession.get(e.sessionId).push(e);
    }
    if (e.dayId != null) {
      if (!byDay.has(e.dayId)) byDay.set(e.dayId, []);
      byDay.get(e.dayId).push(e);
    }
    const sk = `${e.sourceType}:${e.sourceId}`;
    if (!bySource.has(sk)) bySource.set(sk, []);
    bySource.get(sk).push(e);
  }

  return {
    all: () => all,
    size: all.length,
    getEvidenceById: (id) => byId.get(id) ?? null,
    getEvidenceBySkill: (skillId) => bySkill.get(skillId) ?? [],
    getEvidenceBySession: (sessionId) => bySession.get(sessionId) ?? [],
    getEvidenceByDay: (dayId) => byDay.get(Number(dayId)) ?? [],
    getEvidenceBySource: (sourceType, sourceId) => bySource.get(`${sourceType}:${sourceId}`) ?? [],
    /** Chronologie décroissante (la plus récente d'abord), bornée. */
    getEvidenceTimeline: (limit = 100) => all.slice(-Math.max(0, limit)).reverse(),
  };
}

// ── PROJECTION ────────────────────────────────────────────────────────────

/**
 * Règle d'état — EXHAUSTIVE, gelée au CP1.
 *
 *   unassessed   0 preuve
 *   practiced    ≥1 preuve NON qualifiante, 0 qualifiante
 *   demonstrated ≥1 preuve qualifiante
 *   reinforced   ≥2 qualifiantes, sourceId DISTINCTS **et** dates UTC DISTINCTES
 *
 * La règle de consolidation est délibérément sévère : deux réussites le même
 * jour sont une séance, pas un réancrage. Sous-déclarer une maîtrise est moins
 * grave que la sur-déclarer.
 */
export function competencyStateFrom({ qualifying = [], nonQualifying = [] } = {}) {
  if (qualifying.length === 0 && nonQualifying.length === 0) return 'unassessed';
  if (qualifying.length === 0) return 'practiced';
  if (qualifying.length >= 2) {
    const sources = new Set(qualifying.map((e) => `${e.sourceType}:${e.sourceId}`));
    const dates = new Set(qualifying.map((e) => dayOf(e.createdAt)));
    if (sources.size >= 2 && dates.size >= 2) return 'reinforced';
  }
  return 'demonstrated';
}

/**
 * Signaux de révision — orthogonaux à l'état (contrat §5).
 * Aucun n'est inventé : les trois existent déjà dans le modèle.
 * @param {object} ctx { dueDays:Set<number>, reviewFlaggedDays:Set<number> }
 */
function reviewSignals(evidence, ctx = {}) {
  const reasons = [];
  const dueDays = ctx.dueDays instanceof Set ? ctx.dueDays : new Set();
  const flagged = ctx.reviewFlaggedDays instanceof Set ? ctx.reviewFlaggedDays : new Set();

  for (const e of evidence) {
    if (e.dayId != null && dueDays.has(e.dayId)) { reasons.push(`Révision due sur la journée ${e.dayId}`); break; }
  }
  for (const e of evidence) {
    if (e.dayId != null && flagged.has(e.dayId)) { reasons.push(`Journée ${e.dayId} marquée « à revoir »`); break; }
  }
  // Dernière validation en échec : on regarde la plus récente qui en porte une.
  const withValidation = evidence.filter((e) => e.validation);
  const last = withValidation[withValidation.length - 1];
  if (last && last.validation.status === 'failed') {
    reasons.push(`Dernière validation en échec (${last.sourceType} ${last.sourceId})`);
  }
  return reasons;
}

/**
 * Projette l'état d'UNE compétence depuis ses preuves.
 * Pure et déterministe : mêmes preuves → même résultat, toujours.
 */
export function projectCompetency(competencyId, evidenceForSkill, ctx = {}) {
  const list = [...(evidenceForSkill ?? [])].sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0));
  const qualifying = list.filter(isQualifying);
  const nonQualifying = list.filter((e) => !isQualifying(e));
  const state = competencyStateFrom({ qualifying, nonQualifying });
  const reasons = reviewSignals(list, ctx);

  return {
    competencyId,
    state,
    evidenceCount: list.length,
    qualifyingEvidenceCount: qualifying.length,
    lastEvidenceAt: list.length ? list[list.length - 1].createdAt : null,
    lastQualifiedEvidenceAt: qualifying.length ? qualifying[qualifying.length - 1].createdAt : null,
    distinctSourceCount: new Set(qualifying.map((e) => `${e.sourceType}:${e.sourceId}`)).size,
    distinctDateCount: new Set(qualifying.map((e) => dayOf(e.createdAt))).size,
    needsReview: reasons.length > 0,
    needsReviewReasons: reasons,
    supportingEvidenceIds: qualifying.map((e) => e.id),
    allEvidenceIds: list.map((e) => e.id),
  };
}

/**
 * Projette TOUTES les compétences du programme. Une compétence sans preuve
 * existe et vaut `unassessed` — le produit sait dire « je ne sais pas ».
 */
export function projectCompetencies(programSkillList, ledger, ctx = {}) {
  const skills = Array.isArray(programSkillList) ? programSkillList : [];
  return skills.map((s) => {
    const id = isObj(s) ? s.id : String(s);
    const name = isObj(s) ? s.name : String(s);
    return { ...projectCompetency(id, ledger.getEvidenceBySkill(id), ctx), name };
  });
}

// ── EXPLICABILITÉ (CP6) ───────────────────────────────────────────────────

const STATE_RULE = {
  unassessed: 'Aucune preuve enregistrée pour cette compétence.',
  practiced: 'Au moins une preuve existe, mais aucune ne porte de validation réussie par un validateur du produit.',
  demonstrated: 'Au moins une preuve qualifiante : une validation réussie produite par un validateur déterministe.',
  reinforced: 'Au moins deux preuves qualifiantes, issues de sources différentes et obtenues à des dates différentes.',
};

const SOURCE_LABEL = {
  exercise: 'Exercice de laboratoire',
  assessment: 'Diagnostic',
  mission: "Mission d'ingénierie",
  capstone: 'Capstone',
  submission: 'Travail rendu',
  declared: 'Preuve déclarée',
  review: 'Révision',
};

/**
 * Explique un état de compétence. C'est CE mécanisme que l'UI consomme —
 * aucun texte explicatif n'est écrit en dur dans une route (brief CP6).
 */
export function whyCompetencyState(projection, ledger) {
  if (!isObj(projection)) return null;
  const evidence = (projection.allEvidenceIds ?? [])
    .map((id) => ledger.getEvidenceById(id))
    .filter(Boolean);
  const qualifying = evidence.filter(isQualifying);

  const facts = [];
  if (projection.evidenceCount === 0) {
    facts.push('Aucune preuve — le produit ne se prononce pas.');
  } else {
    facts.push(`${projection.evidenceCount} preuve${projection.evidenceCount > 1 ? 's' : ''} enregistrée${projection.evidenceCount > 1 ? 's' : ''}, dont ${projection.qualifyingEvidenceCount} qualifiante${projection.qualifyingEvidenceCount > 1 ? 's' : ''}.`);
    if (projection.state === 'demonstrated' && projection.qualifyingEvidenceCount >= 2) {
      facts.push(
        projection.distinctSourceCount < 2
          ? 'Pas encore consolidée : les preuves viennent de la même source.'
          : 'Pas encore consolidée : les preuves datent du même jour.',
      );
    }
  }

  return {
    competencyId: projection.competencyId,
    state: projection.state,
    stateLabel: COMPETENCY_STATE_LABEL[projection.state],
    rule: STATE_RULE[projection.state],
    facts,
    evidence: (qualifying.length ? qualifying : evidence).slice(-5).reverse().map((e) => ({
      id: e.id,
      sourceLabel: SOURCE_LABEL[e.sourceType] ?? e.sourceType,
      sourceId: e.sourceId,
      title: e.title,
      createdAt: e.createdAt,
      qualifying: isQualifying(e),
      validationDetail: e.validation?.detail ?? '',
      dayId: e.dayId,
      artifactRef: e.artifactRef,
    })),
    needsReview: projection.needsReview,
    needsReviewReasons: projection.needsReviewReasons,
  };
}

export { SOURCE_LABEL as EVIDENCE_SOURCE_LABEL };

// ── PRÉSENTATION — source unique (V65.1 · CP2) ────────────────────────────
// Le ton sémantique d'un état vit ICI, à côté de l'état lui-même. Il vivait
// dans `lib/skill-vocabulary.mjs`, adossé à un second modèle à cinq états
// (`not-started/discovered/practiced/demonstrated/to-consolidate`) dont les
// libellés français chevauchaient les nôtres en disant autre chose :
// « Pratiquée » y voulait dire « trois journées terminées », ici « des traces
// existent, aucune validation réussie ». Deux surfaces affichaient donc le
// même mot pour deux faits différents.
//
// La couleur n'est jamais seule porteuse d'information : chaque état a un
// libellé, et l'UI doit pouvoir l'expliquer (`whyCompetencyState`).
export const COMPETENCY_STATE_TONE = {
  unassessed: 'neutral',
  practiced: 'accent',
  demonstrated: 'positive',
  reinforced: 'positive',
};

/**
 * Descripteur de présentation d'un état de compétence. PUR.
 * @returns {{state, label, tone, requiresExplanation: true}}
 */
export function competencyStatusToken(state) {
  const s = COMPETENCY_STATES.includes(state) ? state : 'unassessed';
  return {
    state: s,
    label: COMPETENCY_STATE_LABEL[s],
    tone: COMPETENCY_STATE_TONE[s],
    requiresExplanation: true,
  };
}

/** Tous les tokens de statut (légende, filtres). PUR. */
export function allCompetencyStatusTokens() {
  return COMPETENCY_STATES.map(competencyStatusToken);
}

// ── PROCHAINE ACTION RÉELLE (V65.1 · CP2) ─────────────────────────────────
// Elle se déduit de l'ÉTAT PROJETÉ, jamais d'un compteur de journées. La
// version précédente (`explainSkillState` dans learning-experience.mjs)
// s'appuyait sur l'ancien modèle : elle a proposé « Démontrer JavaScript /
// TypeScript — pratiquée mais jamais démontrée » pour une compétence portant
// huit preuves qualifiantes et affichée « Consolidée » deux clics plus loin
// (CP0, capture `dashboard-1440.png`).
//
// Chaque action renvoie vers une surface QUI EXISTE et nomme la preuve
// attendue. Aucune action n'est proposée quand le produit n'a rien à
// proposer : `null` est une réponse honnête.

// `cta` est le LIBELLÉ DU BOUTON : il dit ce qui se passe au clic, pas
// pourquoi on clique. Vu à l'œil sur la capture 1440 du détail : le bouton
// portait `goal` — « réactiver un acquis avant qu'il ne retombe » — une phrase
// d'intention là où l'apprenant attend une destination.
const NEXT_ACTION_BY_STATE = {
  unassessed: {
    verb: 'Produire une première preuve sur',
    reason: 'aucune trace enregistrée pour cette compétence',
    goal: 'sortir de l’absence d’évaluation',
    expectedEvidence: 'un exercice validé ou un diagnostic réussi',
    href: '/lab',
    cta: 'Ouvrir le laboratoire',
  },
  practiced: {
    verb: 'Faire valider',
    reason: 'des traces existent, mais aucune validation réussie',
    goal: 'obtenir une première preuve qualifiante',
    expectedEvidence: 'un exercice dont tous les tests passent, ou un diagnostic réussi',
    href: '/lab',
    cta: 'Ouvrir le laboratoire',
  },
  demonstrated: {
    verb: 'Consolider',
    reason: 'démontrée une fois, pas encore consolidée',
    goal: 'obtenir une seconde preuve, d’une autre source et un autre jour',
    expectedEvidence: 'une preuve qualifiante de source et de date différentes',
    href: '/diagnostics',
    cta: 'Passer un diagnostic',
  },
};

/**
 * Prochaine action pour UNE compétence, ou `null` s'il n'y a rien à proposer.
 * `reinforced` ne produit aucune action : une compétence consolidée n'a pas
 * besoin qu'on invente une tâche pour elle.
 * PUR.
 */
export function nextActionForCompetency(projection) {
  if (!isObj(projection)) return null;

  // Une révision due prime sur tout le reste : c'est un fait daté, pas une
  // suggestion. Elle vaut pour TOUS les états, `reinforced` compris.
  if (projection.needsReview && projection.needsReviewReasons.length > 0) {
    return {
      competencyId: projection.competencyId,
      action: `Réviser ${projection.name ?? projection.competencyId}`,
      reason: projection.needsReviewReasons[0],
      goal: 'réactiver un acquis avant qu’il ne retombe',
      expectedEvidence: 'révision honorée (prochaine échéance recalculée)',
      href: '/revisions',
      cta: 'Ouvrir les révisions',
    };
  }

  const def = NEXT_ACTION_BY_STATE[projection.state];
  if (!def) return null;

  // Nuance mesurée, pas inventée : si la compétence est démontrée mais que ses
  // preuves viennent toutes de la même source, on dit LAQUELLE des deux
  // conditions manque.
  let reason = def.reason;
  if (projection.state === 'demonstrated' && projection.qualifyingEvidenceCount >= 2) {
    reason = projection.distinctSourceCount < 2
      ? 'plusieurs preuves, mais toutes de la même source'
      : 'plusieurs preuves, mais toutes du même jour';
  }

  return {
    competencyId: projection.competencyId,
    action: `${def.verb} ${projection.name ?? projection.competencyId}`,
    reason,
    goal: def.goal,
    expectedEvidence: def.expectedEvidence,
    href: def.href,
    cta: def.cta,
  };
}
