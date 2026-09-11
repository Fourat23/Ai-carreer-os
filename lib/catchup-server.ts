// V75 · CP7 — READ-MODEL DU PLAN DE RATTRAPAGE (côté serveur).
//
// Il fait l'I/O que `lib/catchup-plan.mjs` refuse de faire, et rien d'autre :
// aucun seuil, aucune décision. Les minutes viennent de l'arbitrage du CP6,
// les notions du triage du CP5, le plafond d'unités du scheduler de V74.
//
// ── LA PAUSE, ET CE QU'ELLE NE FAIT PAS ─────────────────────────────────
//
// `curriculumPause` est lu ici pour être AFFICHÉ. Il ne modifie ni l'arriéré,
// ni les échéances, ni le plan de rattrapage : suspendre le nouveau contenu ne
// rend aucune notion moins due. Une pause qui allégerait la dette serait `R2`
// — supprimer artificiellement des notions dues — rendue confortable.
import { readProgress } from './progress-server';
import { planDeRattrapage, HORIZON_PLAN } from './catchup-plan';
import { PLAFOND_UNITES } from './retention-scheduler';
import type { PlanRattrapage } from './catchup-plan';
import type { VueRecuperation } from './recovery-server';
import type { Progress } from './types';

export { HORIZON_PLAN };

export interface Pause {
  paused: boolean;
  since: string | null;
  raison: string;
  /** Jours écoulés depuis le début de la pause en cours, ou `null`. */
  depuisJours: number | null;
}

/** Une journée du plan, enrichie des TITRES — le module pur ne lit pas le corpus. */
export type JourAffichable = PlanRattrapage['jours'][number] & { titres: string[] };

export interface VueRattrapage {
  plan: Omit<PlanRattrapage, 'jours'> & { jours: JourAffichable[] };
  pause: Pause;
}

/**
 * Le plan de rattrapage, prêt à afficher.
 *
 * @param recuperation la vue du CP6 — le plan consomme ses minutes et son
 *        triage plutôt que de les recalculer : deux sources donneraient deux
 *        plans sur la même page.
 */
export function getVueRattrapage(
  recuperation: VueRecuperation,
  now: string = new Date().toISOString(),
): VueRattrapage {
  const titreDe = new Map(recuperation.arriere.notions.map((n) => [n.id, n.titre]));

  const brut = planDeRattrapage({
    notions: recuperation.arriere.notions,
    // Les minutes PROPOSÉES, pas les minutes actuelles : le plan montre à quoi
    // ressemblerait la suite si l'apprenant suivait la recommandation. Il ne
    // l'applique pas pour autant — c'est une projection, affichée comme telle.
    minutesParJour: recuperation.arbitrage.propose.revision,
    unitesParJour: PLAFOND_UNITES,
    horizon: HORIZON_PLAN,
    now,
  });

  const progress = readProgress() as unknown as Progress;
  const p = progress.curriculumPause;
  const depuisJours = p?.paused && p.since
    ? Math.max(0, Math.floor((Date.parse(now) - Date.parse(p.since)) / 86_400_000))
    : null;

  return {
    plan: {
      ...brut,
      jours: brut.jours.map((j) => ({
        ...j,
        titres: j.unites.map((u) => titreDe.get(u.id) ?? u.id),
      })),
    },
    pause: {
      paused: Boolean(p?.paused),
      since: p?.since ?? null,
      raison: p?.raison ?? '',
      depuisJours,
    },
  };
}
