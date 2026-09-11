// V75 · CP6 — READ-MODEL DU MODE DE RÉCUPÉRATION (côté serveur).
//
// Il fait l'I/O que `lib/recovery-mode.mjs` refuse de faire, et il n'en fait
// qu'une : **relire les faits au jour actif précédent**.
//
// ── POURQUOI CETTE SECONDE LECTURE ──────────────────────────────────────
//
// La condition `E4` du contrat (§4) exige que la sortie de récupération tienne
// **2 jours actifs consécutifs**, pour que le produit n'annonce pas en
// alternance une bonne et une mauvaise nouvelle à qui traverse la frontière
// chaque jour.
//
// Il aurait été plus simple de persister un compteur. C'est refusé, et la
// raison est dans le §1.2 du contrat : le mode est **un état DÉCLARÉ du plan,
// pas un état de l'apprenant**. Stocké, il deviendrait un attribut de la
// personne — « tu es en récupération » — et il survivrait à la situation qui
// l'a produit. Il est donc entièrement RECALCULÉ, à aujourd'hui et à hier.
import { readProgress } from './progress-server';
import { getVueArriere } from './backlog-server';
import { getPlanDuJour } from './plan-jour-server';
import { modeDe, arbitrerLaJournee } from './recovery-mode';
import type { VueArriere } from './backlog-server';
import type { PlanDuJour } from './plan-jour-server';

export interface VueRecuperation {
  mode: 'NORMAL' | 'CATCH_UP' | 'RECOVERY' | 'CRITICAL';
  /** La règle qui a tranché, en clair. */
  regle: string;
  /** La décision en UNE phrase, sans jargon (§2 du contrat). */
  phrase: string;
  facteurs: { id: string; valeur: number }[];
  /** Vrai quand le mode ne tient qu'à `E4` : aucun seuil n'est franchi aujourd'hui. */
  tenuParE4: boolean;
  sortie: { E1: boolean; E2: boolean; E3: boolean; E4: boolean; confirmee: boolean };
  arbitrage: ReturnType<typeof arbitrerLaJournee>;
  arriere: VueArriere;
  plan: PlanDuJour;
  /** Date du jour actif précédent, ou `null` s'il n'y en a pas. */
  jourActifPrecedent: string | null;
}

const jourDe = (iso: unknown): string | null =>
  (typeof iso === 'string' && !Number.isNaN(Date.parse(iso)) ? iso.slice(0, 10) : null);

/**
 * Les DATES où un fait a été enregistré. « Actif » se mesure sur des faits, pas
 * sur une présence déclarée : ouvrir l'application ne consolide rien.
 */
function joursActifs(progress: Record<string, unknown>): string[] {
  const dates = new Set<string>();
  const add = (v: unknown) => { const d = jourDe(v); if (d) dates.add(d); };
  for (const d of Object.values((progress.days ?? {}) as Record<string, Record<string, unknown>>)) {
    if (!d || typeof d !== 'object') continue;
    add(d.completedAt); add(d.updatedAt); add(d.startedAt);
  }
  for (const a of (progress.recallAttempts ?? []) as { at?: string }[]) add(a?.at);
  for (const a of (progress.exerciseAttempts ?? []) as { at?: string }[]) add(a?.at);
  for (const e of (progress.evidence ?? []) as { createdAt?: string }[]) add(e?.createdAt);
  return [...dates].sort();
}

/**
 * Le mode du jour, et ce qu'il propose.
 *
 * @param now horloge injectée (jamais lue ici)
 */
export function getVueRecuperation(
  now: string = new Date().toISOString(),
  // ── POURQUOI CES DEUX INJECTIONS ──
  //
  // La page appelle déjà `getVueArriere` et `getPlanDuJour` — le critère
  // BLOQUANT `B12` de V74 exige d'ailleurs que la surface appelle l'arbitre
  // **elle-même**, et il a raison : une garde qui suit trois indirections ne
  // garde plus grand-chose. Les recalculer ici produirait deux budgets
  // différents sur la même page. On les reçoit donc, au lieu de les refaire.
  { arriere: arriereInjecte, plan: planInjecte }: { arriere?: VueArriere; plan?: PlanDuJour } = {},
): VueRecuperation {
  const arriere = arriereInjecte ?? getVueArriere(now);
  // La POSITION est transmise au plan — c'était le second verrou du défaut P1 :
  // sans elle, la charge de la journée vaut `null` et le budget retombe
  // toujours sur le nominal, quelle que soit la journée réelle.
  const plan = planInjecte ?? getPlanDuJour(now, arriere.jourCourant);
  const budget = plan.minutesAccordees > 0 ? plan.minutesAccordees : plan.budgetJournee;

  // ── E4 · LA PRESSION AU JOUR ACTIF PRÉCÉDENT ──
  const progress = readProgress() as unknown as Record<string, unknown>;
  const actifs = joursActifs(progress);
  const aujourdhui = now.slice(0, 10);
  const precedent = [...actifs].reverse().find((d) => d < aujourdhui) ?? null;
  const pressionHier = precedent
    // Fin de cette journée-là : l'état tel qu'il était au moment où l'apprenant
    // a cessé de travailler, pas à son réveil.
    ? getVueArriere(`${precedent}T23:59:59.000Z`).pression
    : null;

  const m = modeDe(arriere.pression, { budget, pressionJourActifPrecedent: pressionHier });
  const arbitrage = arbitrerLaJournee({
    mode: m.mode,
    chargeHaut: plan.chargeJour,
    minutesReactivation: plan.minutesAccordees,
    pression: arriere.pression,
    budgetJournee: plan.budgetJournee,
  });

  return { ...m, arbitrage, arriere, plan, jourActifPrecedent: precedent };
}
