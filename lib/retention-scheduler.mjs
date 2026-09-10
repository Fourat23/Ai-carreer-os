// V74 · CP4 — SCHEDULER V1. QUOI · QUAND · SOUS QUELLE FORME.
//
// ── CE QUE CE MODULE N'EST PAS, ET C'EST LA PREMIÈRE CHOSE À DIRE ────────
//
// Ce n'est PAS un troisième moteur de répétition espacée. Il ne définit
// aucune échelle : les paliers viennent de `lib/retention.mjs` (V66), qui garde
// la responsabilité de la série de rappels — c'est ce que le §4 du contrat gelé
// lui assigne, et c'est ce que la règle C11 de `v651:check` vérifie.
//
// Ce module ARBITRE : il prend la priorité du CP3, l'échéance du moteur V66, la
// forme disponible pour chaque leçon, et il décide ce qui passe aujourd'hui
// sous une contrainte de temps.
//
// ── POURQUOI PAS SM-2 TEL QUEL ───────────────────────────────────────────
//
// SM-2 a été étudié comme repère, et il est écarté pour trois raisons qui
// tiennent au produit, pas au goût :
//
//   1. son facteur de facilité est un flottant qui dérive, réglé par une
//      auto-évaluation de 0 à 5. Le CP0 a montré que l'auto-déclaration est
//      précisément ce dont ce produit a trop, et le verdict objectif ce dont il
//      manque ;
//   2. il planifie UNE carte, toujours de la même façon. Or une compétence
//      technique demande tantôt un rappel conceptuel, tantôt un diagnostic,
//      tantôt du code, tantôt une décision de conception — le CP0 a mesuré que
//      la forme « rappel libre » n'existe que sur 52 journées sur 365 ;
//   3. il ne connaît ni projet à venir, ni prérequis, ni budget de journée.
//
// Ce qui est GARDÉ de SM-2 : l'idée qu'une réussite espace et qu'un échec
// ramène au début. C'est ce que `INTERVALS` de V66 fait déjà, en entiers
// publiés plutôt qu'en flottant dérivant.
//
// ── DÉTERMINISME (critère bloquant B2) ───────────────────────────────────
//
// Aucune horloge lue, aucun aléa, aucun `Date.now()`. À entrée identique et
// horloge identique, la sortie est strictement identique — y compris l'ordre.
// Le tri final est TOTAL : sans clé de dernier recours, deux exécutions
// pourraient rendre deux ordres.

import { INTERVALS, FORMAT_PROMPT, FORMAT_LABEL, nextFormat } from './retention.mjs';
import { prioriser, statutDe } from './retention-priority.mjs';

const DAY_MS = 86_400_000;

/**
 * Coût en minutes d'une réactivation, par forme. Ce sont des ORDRES DE
 * GRANDEUR déclarés, pas des mesures : aucune donnée d'apprenant réel n'existe
 * pour les calibrer, et le contrat interdit d'inventer un chiffre en le
 * présentant comme mesuré. Ils sont configurables et publiés.
 */
export const MINUTES_PAR_FORME = {
  free: 4,       // réexpliquer sans support
  cued: 3,       // répondre à une question posée
  applied: 8,    // refaire un mini-exercice
  discrim: 4,    // reconnaître et expliquer une erreur
  generate: 5,   // justifier une checklist
};

/** Budget par défaut d'une session de réactivation, en minutes. */
export const BUDGET_DEFAUT = 20;

/**
 * Nombre maximal d'unités proposées en une session, même si le budget le
 * permettrait. Au-delà, une session de rappel devient une liste de tâches —
 * et le brief interdit d'augmenter le nombre de révisions pour faire monter un
 * score (contournement G12).
 */
export const PLAFOND_UNITES = 8;

/**
 * ── L'ÉCHÉANCE ───────────────────────────────────────────────────────────
 *
 * Elle est calculée depuis la DERNIÈRE RÉCUPÉRATION, jamais depuis
 * « maintenant » : c'est ce qui rend la projection rejouable des mois plus
 * tard. Le palier est indexé par le nombre de réussites consécutives, et
 * l'échelle est celle de V66 — ce module ne définit pas la sienne.
 *
 * Une unité jamais récupérée n'a pas d'échéance : elle n'est pas « en retard »,
 * elle n'a jamais commencé. Confondre les deux serait le contournement G9.
 */
export function echeanceDe(fiche) {
  const depuis = fiche.lastRetrievalAt;
  if (!depuis) return null;
  const palier = INTERVALS[Math.min(fiche.consecutiveSuccesses ?? 0, INTERVALS.length - 1)];
  return {
    dueAt: new Date(Date.parse(depuis) + palier * DAY_MS).toISOString(),
    intervalDays: palier,
    basis: (fiche.consecutiveSuccesses ?? 0) === 0
      ? 'reprise à 1 jour après un échec ou une première tentative'
      : `${fiche.consecutiveSuccesses} réussite${fiche.consecutiveSuccesses > 1 ? 's' : ''} consécutive${fiche.consecutiveSuccesses > 1 ? 's' : ''}`,
  };
}

/**
 * ── LA FORME ─────────────────────────────────────────────────────────────
 *
 * Trois règles, dans cet ordre, et l'ordre est la décision :
 *
 *   1. après un ÉCHEC non repris, la forme est la plus SOUTENUE disponible
 *      (`cued` de préférence) : redemander une restitution libre à quelqu'un
 *      qui vient d'échouer, c'est le faire échouer deux fois ;
 *   2. avant un PROJET proche, la forme est la plus APPLIQUÉE disponible :
 *      ce qu'on va devoir faire, c'est ce qu'il faut répéter ;
 *   3. sinon, on VARIE — `nextFormat` de V66 choisit celle qui n'a pas encore
 *      servi, ce qui empêche de mémoriser la question au lieu du concept.
 *
 * `formats` vient de `availableFormats(...)` : les formes que la LEÇON rend
 * réellement possibles. On ne propose jamais une forme que le corpus ne
 * supporte pas — ce serait inventer une activité.
 */
export function formeDe(fiche, formats, recall) {
  const dispo = Array.isArray(formats) ? formats : [];
  if (dispo.length === 0) return null;

  const echecNonRepris = fiche.lastFailureAt
    && (!fiche.lastSuccessAt || fiche.lastSuccessAt < fiche.lastFailureAt);
  if (echecNonRepris) {
    for (const f of ['cued', 'discrim', 'applied', 'generate', 'free']) {
      if (dispo.includes(f)) return { format: f, raison: 'reprise après un échec : forme soutenue' };
    }
  }

  const besoin = fiche.nextCurriculumNeed;
  if (besoin && besoin.inDays != null && besoin.inDays <= 7) {
    for (const f of ['applied', 'generate', 'discrim', 'cued', 'free']) {
      if (dispo.includes(f)) return { format: f, raison: 'un projet va l’exiger : forme appliquée' };
    }
  }

  const f = nextFormat(recall, dispo);
  return f ? { format: f, raison: 'forme non encore utilisée sur cette notion' } : null;
}

/**
 * ── L'ARBITRAGE ──────────────────────────────────────────────────────────
 *
 * @param fiches   fiches du Learner Memory Model (CP2)
 * @param options  { now, budgetMinutes, formatsOf, recallOf, plafond }
 * @returns { date, budgetMinutes, minutesPlanifiees, items[], differes[], raisonArret }
 *
 * `differes` n'est pas un reliquat : c'est une SORTIE. Le brief demande que le
 * moteur puisse différer un rappel non urgent, et savoir ce qui a été écarté —
 * et pourquoi — vaut autant que savoir ce qui a été retenu.
 */
export function planifier(fiches, {
  now,
  budgetMinutes = BUDGET_DEFAUT,
  formatsOf = () => [],
  recallOf = () => null,
  plafond = PLAFOND_UNITES,
} = {}) {
  const echeances = new Map(fiches.map((f) => [f.id, echeanceDe(f)]));
  const priorites = prioriser(fiches, {
    dueAtOf: (id) => echeances.get(id)?.dueAt ?? null,
    now,
  });

  const items = [];
  const differes = [];
  let minutes = 0;
  let raisonArret = 'file épuisée';

  for (const p of priorites) {
    const fiche = fiches.find((f) => f.id === p.id);
    const forme = formeDe(fiche, formatsOf(p.id), recallOf(p.id));

    // Aucune forme possible : la leçon ne porte pas les sections nécessaires.
    // On ne fabrique pas d'activité — on l'écarte en le disant.
    if (!forme) {
      differes.push({ id: p.id, score: p.score, statut: p.statut, motif: 'aucune forme de rappel disponible pour cette leçon' });
      continue;
    }

    const cout = MINUTES_PAR_FORME[forme.format] ?? 5;

    if (items.length >= plafond) {
      differes.push({ id: p.id, score: p.score, statut: p.statut, motif: 'plafond de la session atteint' });
      raisonArret = 'plafond d’unités atteint';
      continue;
    }
    if (minutes + cout > budgetMinutes) {
      differes.push({ id: p.id, score: p.score, statut: p.statut, motif: 'budget de la session atteint' });
      raisonArret = 'budget atteint';
      continue;
    }

    minutes += cout;
    items.push({
      id: p.id,
      score: p.score,
      statut: p.statut,
      dueAt: echeances.get(p.id)?.dueAt ?? null,
      intervalDays: echeances.get(p.id)?.intervalDays ?? null,
      basis: echeances.get(p.id)?.basis ?? 'jamais récupéré',
      format: forme.format,
      formatLabel: FORMAT_LABEL[forme.format] ?? forme.format,
      prompt: FORMAT_PROMPT[forme.format] ?? '',
      raisonForme: forme.raison,
      minutes: cout,
      pourquoi: p.pourquoi,
      pourquoiFacteurs: p.pourquoiFacteurs,
      facteurs: p.facteurs,
    });
  }

  return {
    date: now ?? null,
    budgetMinutes,
    minutesPlanifiees: minutes,
    items,
    differes,
    raisonArret,
  };
}

/**
 * Prochaine échéance après une tentative, pour l'affichage « et ensuite ? ».
 * Purement dérivée : elle applique le palier suivant si la tentative réussit,
 * et revient à un jour si elle échoue.
 */
export function prochaineEcheance(fiche, issue, at) {
  const serie = issue === 'recalled' ? (fiche.consecutiveSuccesses ?? 0) + 1
    : issue === 'failed' ? 0
      : (fiche.consecutiveSuccesses ?? 0);          // 'partial' gèle la série (§1.6)
  const palier = INTERVALS[Math.min(serie, INTERVALS.length - 1)];
  return {
    dueAt: new Date(Date.parse(at) + palier * DAY_MS).toISOString(),
    intervalDays: palier,
  };
}

export { statutDe };
