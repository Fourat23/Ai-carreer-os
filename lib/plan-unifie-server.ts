// V75 · CP11 — READ-MODEL DU PLAN UNIQUE (côté serveur).
//
// Il assemble ce que les checkpoints précédents décident déjà, et **ne décide
// rien de neuf** : la position vient du CP8, le plan de réactivation de V74, le
// triage du CP5, le mode et l'arbitrage du CP6, les défis du CP9.
//
// C'est la même position d'assemblage que `plan-jour-server.ts` : une couche
// qui se met à décider devient un sixième moteur, et deux moteurs finissent par
// se contredire sur une même page — l'audit du CP8 l'a mesuré.
import { readProgress } from './progress-server';
import { getProgram } from './program';
import { getPositionApprenant, getVueArriere } from './backlog-server';
import { getPlanDuJour } from './plan-jour-server';
import { getVueRecuperation } from './recovery-server';
import { planUnifie } from './plan-unifie';
import { BUDGET_JOURNEE } from './daily-plan';
import { listTransferChallenges } from './transfer-challenges-server';
import type { PlanUnifie } from './plan-unifie';
import type { VueRecuperation } from './recovery-server';
import type { VueArriere } from './backlog-server';
import type { PlanDuJour } from './plan-jour-server';
import type { Progress } from './types';

export interface VuePlanUnifie {
  plan: PlanUnifie;
  recuperation: VueRecuperation;
  arriere: VueArriere;
  planJour: PlanDuJour;
  jourCourant: number;
  /** Vrai quand l'apprenant a lui-même suspendu le nouveau contenu (CP7). */
  curriculumEnPause: boolean;
}

/** Minutes déclarées d'un défi de transfert. Ordre de grandeur, publié. */
export const MINUTES_DEFI_TRANSFERT = 12;

/**
 * Le plan unique de la journée.
 *
 * @param now  horloge injectée (jamais lue ici)
 * @param jour journée de curriculum concernée. Par défaut : la position réelle.
 */
export function getPlanUnifie(
  now: string = new Date().toISOString(),
  jour: number | null = null,
): VuePlanUnifie {
  const jourCourant = jour ?? getPositionApprenant(now);
  const planJour = getPlanDuJour(now, jourCourant);
  const arriere = getVueArriere(now, { capaciteActive: planJour.unites.length });
  const recuperation = getVueRecuperation(now, { arriere, plan: planJour });

  const progress = readProgress() as unknown as Progress;
  const curriculumEnPause = progress.curriculumPause?.paused === true;

  const meta = getProgram().days.find((d) => d.day === jourCourant) ?? null;
  const projetAujourdhui = meta?.project != null;

  const plan = planUnifie({
    mode: recuperation.mode,
    chargeHaut: planJour.chargeJour,
    budgetJournee: BUDGET_JOURNEE.haut,
    demande: {
      // Le nouveau contenu demande la charge réelle de la journée.
      NEW: planJour.chargeJour ?? 0,
      // La réactivation demande ce que l'arbitrage du CP6 PROPOSE — c'est la
      // valeur que la page de récupération affiche déjà, et en prendre une
      // autre ferait diverger deux surfaces.
      REVIEW: recuperation.arbitrage.propose.revision,
      REMEDIATION: recuperation.arbitrage.propose.remediation,
      // Un livrable est déclaré par le programme, pas estimé ici. On lui donne
      // la part de la journée que V73 lui attribue déjà via `chargeJour`, donc
      // rien de plus : ajouter une estimation serait inventer du temps.
      PROJECT: 0,
    },
    minutesTransfert: recuperation.arbitrage.transfert === 'propose' ? MINUTES_DEFI_TRANSFERT : 0,
    arriere: {
      total: arriere.total, actif: arriere.actif,
      differe: arriere.differe, gare: arriere.gare,
    },
    pression: arriere.pression,
    projetAujourdhui,
  });

  return { plan, recuperation, arriere, planJour, jourCourant, curriculumEnPause };
}

export { listTransferChallenges };
