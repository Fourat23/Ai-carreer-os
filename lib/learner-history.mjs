// HISTORIQUE DE L'APPRENANT (V65) — PUR, aucune I/O.
//
// Architecture choisie : **PROJECTION**, pas journal d'événements canonique.
//
// Justification (brief CP9 « choisis une architecture et justifie-la ») :
// les faits sont DÉJÀ persistés et horodatés — `session.startedAt`,
// `session.completedAt`, `submission.submittedAt`, `evidence.createdAt`,
// `review.lastReviewedAt`. Ajouter un journal séparé créerait une seconde base
// mutable, susceptible de diverger de ce qu'elle est censée raconter — et le
// principe P7 comme l'invariant « aucune seconde source de vérité » l'interdisent.
//
// Conséquence assumée : l'historique a la granularité de ce que le produit
// enregistre réellement. Il ne montrera jamais un fait qui n'a pas laissé de
// trace — c'est exactement la garantie recherchée.
//
// AUCUN événement de navigation. Ouvrir une page n'est pas un fait de travail.

import { normalizeDay } from './learning.mjs';
import { isQualifying } from './evidence.mjs';
import { normalizeAssessmentAttempts } from './assessment-attempt.mjs';
import { normalizeMissionSubmissions } from './mission-submission.mjs';
import { normalizeArtifactAnalyses } from './artifact-analysis.mjs';
import { normalizeUsageEvents } from './usage-event.mjs';

// ── V77 · CP11 — LES FAITS DES CP3→CP7 DEVIENNENT LISIBLES ──────────────
//
// Ils étaient écrits, persistés, exportés… et **aucune surface ne les lisait**.
// Un fait que personne ne peut lire n'est pas encore une observation : c'est du
// stockage. C'est le cinquième sprint d'affilée où la chose à brancher existe
// déjà, débranchée.
//
// **Aucun nouveau moteur.** L'historique est une PROJECTION des faits déjà
// persistés — l'architecture choisie en V65 et justifiée ci-dessus. Ces
// quatre-là s'y ajoutent exactement comme les cinq autres : rien n'est
// recalculé, rien n'est stocké en double.
export const HISTORY_EVENT_TYPES = [
  'DAY_STARTED',
  'SUBMISSION_CREATED',
  'EVIDENCE_CREATED',
  'DAY_COMPLETED',
  'REVIEW_COMPLETED',
  // V77 · CP4 — la soumission d'un diagnostic (ou d'un capstone, via `kind`).
  'ASSESSMENT_SUBMITTED',
  // V77 · CP5 — un livrable de mission rendu, avec son MODE de constat.
  'MISSION_DELIVERABLE',
  // V77 · CP7 — un artefact rédigé par l'apprenant, analysé.
  'ARTIFACT_ANALYZED',
  // V77 · CP3 — un USAGE. Le seul type qui ne dit PAS un travail évalué.
  'SURFACE_USED',
];

export const HISTORY_EVENT_LABEL = {
  DAY_STARTED: 'Journée commencée',
  SUBMISSION_CREATED: 'Travail rendu',
  EVIDENCE_CREATED: 'Preuve créée',
  DAY_COMPLETED: 'Journée terminée',
  REVIEW_COMPLETED: 'Révision effectuée',
  ASSESSMENT_SUBMITTED: 'Diagnostic soumis',
  MISSION_DELIVERABLE: 'Livrable rendu',
  ARTIFACT_ANALYZED: 'Artefact analysé',
  SURFACE_USED: 'Surface utilisée',
};

/**
 * Les types qui ne disent PAS un travail évalué. Exporté pour que les
 * consommateurs puissent les distinguer sans les deviner — et pour qu'un
 * compteur ne les additionne pas au reste par inadvertance.
 */
export const HISTORY_USAGE_TYPES = ['SURFACE_USED'];

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

/**
 * Construit l'historique depuis les faits déjà persistés.
 * Déterministe : mêmes données → même liste, dans le même ordre.
 *
 * @param {object} progress  progression plate (days + evidence)
 * @param {(day:number)=>string} dayTitle  titre d'une journée, depuis le corpus
 */
export function buildHistory(progress, dayTitle = () => '') {
  const events = [];
  const days = isObj(progress?.days) ? progress.days : {};

  for (const key of Object.keys(days)) {
    if (!/^\d+$/.test(key)) continue;
    const dayNum = Number(key);
    const d = normalizeDay(days[key]);
    const title = dayTitle(dayNum) || '';

    if (d.session.startedAt) {
      events.push({
        type: 'DAY_STARTED', at: d.session.startedAt, dayId: dayNum,
        label: `Journée ${dayNum} commencée`, detail: title,
      });
    }
    for (const s of d.submissions) {
      if (!s.submittedAt) continue;
      events.push({
        type: 'SUBMISSION_CREATED', at: s.submittedAt, dayId: dayNum,
        label: 'Travail rendu', detail: s.stepId,
        validation: s.validation?.status ?? null,
      });
    }
    if (d.session.state === 'completed' && d.session.completedAt) {
      events.push({
        type: 'DAY_COMPLETED', at: d.session.completedAt, dayId: dayNum,
        label: `Journée ${dayNum} terminée`, detail: title,
      });
    }
    // Une révision n'est un fait que si elle a RÉELLEMENT eu lieu.
    if (d.review?.lastReviewedAt) {
      events.push({
        type: 'REVIEW_COMPLETED', at: d.review.lastReviewedAt, dayId: dayNum,
        label: 'Révision effectuée', detail: d.review.reason || title,
      });
    }
  }

  for (const e of progress?.evidence ?? []) {
    if (!e?.createdAt) continue;
    events.push({
      type: 'EVIDENCE_CREATED', at: e.createdAt, dayId: e.dayId,
      label: isQualifying(e) ? 'Preuve créée' : 'Trace enregistrée',
      detail: e.title || e.sourceId,
      evidenceId: e.id,
      competencyIds: e.competencyIds,
      qualifying: isQualifying(e),
    });
  }

  // ── V77 · CP4 — LES SOUMISSIONS DE DIAGNOSTIC ──
  //
  // C'est ici que la courbe `0/5 → 1/5 → 4/5` devient lisible. Avant le CP4 elle
  // n'existait pas ; depuis le CP11 elle se voit.
  for (const a of normalizeAssessmentAttempts(progress?.assessmentAttempts)) {
    events.push({
      type: 'ASSESSMENT_SUBMITTED', at: a.at, dayId: null,
      label: a.kind === 'capstone' ? 'Capstone soumis' : 'Diagnostic soumis',
      detail: `${a.assessmentId} — ${a.passed}/${a.total}`,
      competencyIds: a.competencyIds,
      // Le seuil DÉCLARÉ est atteint, ou non. Ce n'est pas un niveau de maîtrise,
      // et le champ ne s'appelle pas autrement.
      seuilAtteint: a.reussiteGlobale,
      simulation: a.simulation,
    });
  }

  // ── V77 · CP5 — LES LIVRABLES DE MISSION ──
  //
  // Le détail dit par quel MODE le livrable a été constaté. Une revue signée par
  // l'apprenant reste une déclaration, et la ligne d'historique le dit plutôt que
  // de la présenter comme une validation.
  for (const m of normalizeMissionSubmissions(progress?.missionSubmissions)) {
    events.push({
      type: 'MISSION_DELIVERABLE', at: m.at, dayId: null,
      label: 'Livrable rendu',
      detail: `${m.missionId} · ${m.deliverableId} — ${
        m.mode === 'review' ? 'validé par l’apprenant' : m.mode === 'structural' ? 'structure vérifiée' : 'auto-vérifié'}`,
      niveau: m.niveau,
      structureOk: m.structureOk,
    });
  }

  // ── V77 · CP7 — LES ARTEFACTS ANALYSÉS ──
  //
  // Un compte de diagnostics, et rien d'autre. La ligne ne dit pas si
  // l'artefact est bon : le produit ne le sait pas.
  for (const a of normalizeArtifactAnalyses(progress?.artifactAnalyses)) {
    events.push({
      type: 'ARTIFACT_ANALYZED', at: a.at, dayId: null,
      label: 'Artefact analysé',
      detail: `${a.surface} · ${a.artifactId} — ${a.diagnostics} diagnostic${a.diagnostics > 1 ? 's' : ''}`,
      niveau: a.niveau,
      simulation: a.simulation,
    });
  }

  // ── V77 · CP3 — L'USAGE, ET SA MISE À DISTANCE ──
  //
  // Le contrat gelé interdit à ce fait d'entrer dans un moteur ; l'historique
  // n'en est pas un, c'est une projection factuelle. Mais il serait trop facile
  // de le confondre avec du travail, alors la ligne le dit **dans son texte**,
  // et `usage: true` permet à tout consommateur de le distinguer sans deviner.
  for (const u of normalizeUsageEvents(progress?.usageEvents)) {
    events.push({
      type: 'SURFACE_USED', at: u.at, dayId: null,
      label: 'Surface utilisée',
      detail: `${u.surface} · ${u.ref} — usage constaté, aucune réussite mesurée`,
      usage: true,
    });
  }

  // Ordre déterministe : chronologique décroissant, puis type, puis journée.
  return events.sort((a, b) => {
    if (a.at !== b.at) return a.at < b.at ? 1 : -1;
    if (a.type !== b.type) return a.type < b.type ? -1 : 1;
    return (a.dayId ?? 0) - (b.dayId ?? 0);
  });
}

/** Regroupe par date locale (AAAA-MM-JJ), en conservant l'ordre. */
export function groupHistoryByDate(events) {
  const out = [];
  const index = new Map();
  for (const e of events ?? []) {
    const date = String(e.at).slice(0, 10);
    if (!index.has(date)) { index.set(date, { date, events: [] }); out.push(index.get(date)); }
    index.get(date).events.push(e);
  }
  return out;
}

/** Compteurs factuels — aucun score, aucune moyenne inventée. */
export function historySummary(events) {
  const list = events ?? [];
  const byType = {};
  for (const t of HISTORY_EVENT_TYPES) byType[t] = 0;
  for (const e of list) if (byType[e.type] !== undefined) byType[e.type] += 1;
  // ── V77 · CP11 — LE TOTAL NE MÉLANGE PAS USAGE ET TRAVAIL ──
  //
  // `total` a toujours compté « des événements », et un lecteur pressé y lit
  // « du travail ». Ajouter l'usage au même compteur aurait fait grimper le
  // chiffre sans qu'un seul exercice de plus ait été résolu — le genre
  // d'amélioration qui ne mesure rien.
  const usage = list.filter((e) => HISTORY_USAGE_TYPES.includes(e.type)).length;
  return {
    total: list.length,
    /** Événements qui décrivent un travail, usage exclu. */
    travail: list.length - usage,
    /** Usages observés. Séparés, et nommés. */
    usage,
    byType,
    firstAt: list.length ? list[list.length - 1].at : null,
    lastAt: list.length ? list[0].at : null,
    activeDays: new Set(list.map((e) => String(e.at).slice(0, 10))).size,
  };
}
