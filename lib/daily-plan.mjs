// V74 · CP10 — PLAN DE JOURNÉE : arbitrer entre APPRENDRE et CONSOLIDER.
//
// ── LA QUESTION DU CHECKPOINT ────────────────────────────────────────────
//
// Le CP4 sait quoi réactiver et en combien de minutes. Il ne sait pas une
// chose : **combien de minutes la journée peut réellement lui donner.** Une
// journée de curriculum qui dépasse déjà son budget ne peut pas recevoir
// 20 minutes de réactivation en plus — et les lui ajouter quand même serait
// la façon la plus simple de faire monter un compteur de révisions sans que
// personne ne révise (contournement **G12**).
//
// ── CE QUE CE MODULE N'EST PAS ───────────────────────────────────────────
//
// Ce n'est pas un cinquième moteur. Il ne définit ni échéance, ni priorité, ni
// forme, ni échelle d'espacement : il **alloue des minutes** et délègue au
// scheduler du CP4. C'est la même position d'arbitre-au-dessus que le §4 du
// contrat gelé assigne, et la règle C11 reste satisfaite.
//
// Il ne **modifie jamais le curriculum**. Il ne supprime pas une journée, n'en
// déplace aucune, ne retire aucune compétence difficile — le brief l'interdit
// nommément. Quand une semaine est trop chargée, il le **dit** ; il ne
// réécrit pas le programme pour que la mesure devienne jolie.
//
// ── CE QUE LA MESURE A IMPOSÉ À LA CONCEPTION ────────────────────────────
//
// Trois faits mesurés (`scripts/v74/cp10-charge.mjs`), et chacun a éliminé une
// solution qui paraissait évidente :
//
//   1. **44 journées sur 365 dépassent déjà le budget** (borne haute 302 à
//      341 min contre un plafond de 300). Elles se groupent en **six séries de
//      six journées consécutives** — pendant six semaines de l'année, *chaque*
//      journée de travail est au-dessus ;
//   2. **la journée de revue ne peut PAS servir de réservoir.** C'était mon
//      hypothèse de départ, et elle est fausse : les revues qui suivent ces
//      séries pèsent **293 et 295 minutes**, soit **5 à 7 minutes de marge**.
//      La marge minimale sur les 52 revues est de **5 minutes** ;
//   3. **mais au grain de la SEMAINE, seules 3 semaines sur 52 dépassent** le
//      plafond hebdomadaire (7 × 300 = 2100) : S32 (+181), S33 (+125),
//      S34 (+98). **La semaine médiane dispose de 693 minutes de marge.**
//
// Conclusion qui commande tout le module : **41 des 44 journées surchargées
// appartiennent à des semaines globalement tenables.** Le problème n'est donc
// pas un excès de programme mais une RÉPARTITION inégale à l'intérieur de la
// semaine — et cela, un arbitre peut le corriger sans toucher au curriculum.
// Les 3 semaines réellement excédentaires, elles, sont déclarées telles quelles.

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

/** Budget d'une journée, en minutes. Repris de V73, non renégocié. */
export const BUDGET_JOURNEE = { bas: 240, haut: 300 };

/** Plafond hebdomadaire, dérivé — jamais un second chiffre déclaré. */
export const BUDGET_SEMAINE = BUDGET_JOURNEE.haut * 7;

/**
 * Minutes de réactivation visées une journée ordinaire. C'est le
 * `BUDGET_DEFAUT` du CP4 ; il est répété ici comme CIBLE, pas comme seconde
 * source de vérité — le scheduler reste seul à décider ce qui tient dedans.
 */
export const CIBLE_REACTIVATION = 20;

/**
 * Plancher absolu. Une journée surchargée reçoit **zéro** minute de
 * réactivation, et c'est délibéré : le brief interdit d'augmenter le nombre de
 * révisions pour faire monter un score, et une journée déjà à 331 minutes n'a
 * pas 20 minutes cachées quelque part.
 */
export const PLANCHER_JOURNEE_CHARGEE = 0;

/**
 * Plafond de ce qu'une journée peut ABSORBER en report. Sans lui, une journée
 * légère suivant six journées surchargées recevrait 120 minutes de rappel —
 * ce qui ne serait plus une séance de réactivation mais une punition.
 */
export const REPORT_MAX_PAR_JOUR = 20;

/**
 * Arriéré à partir duquel le plan émet un SIGNAL DE RALENTISSEMENT.
 *
 * Ce seuil est **déclaré**, comme tous les paramètres de ce sprint : aucune
 * donnée d'apprenant réel ne permet de le calibrer. Il vaut 25 parce que la
 * simulation du CP8 a montré qu'un apprenant qui retient (90 %) reste sous 11
 * en permanence, tandis qu'un apprenant en difficulté (50 %) franchit 25 vers
 * le jour 90 et ne redescend plus. C'est un ordre de grandeur, pas une mesure.
 */
export const SEUIL_ALERTE_ARRIERE = 25;

/**
 * ── COMBIEN DE MINUTES LA JOURNÉE PEUT-ELLE DONNER ? ─────────────────────
 *
 * On raisonne sur la borne HAUTE de la charge, jamais sur la basse. Un budget
 * calculé sur l'hypothèse optimiste déborderait une fois sur deux, et un
 * apprenant qui déborde systématiquement cesse de faire ses rappels — ce qui
 * détruirait la rétention bien plus sûrement qu'une séance sautée.
 *
 * @param chargeHaut  borne haute de la charge de curriculum du jour, en minutes
 * @param report      minutes en attente, venues de journées surchargées
 */
export function budgetReactivationDe(chargeHaut, { report = 0, cible = CIBLE_REACTIVATION } = {}) {
  if (!isNum(chargeHaut)) return { minutes: cible, reste: 0, motif: 'charge inconnue : budget nominal' };

  const disponible = BUDGET_JOURNEE.haut - chargeHaut;

  if (disponible <= 0) {
    return {
      minutes: PLANCHER_JOURNEE_CHARGEE,
      // Le report ACCUMULE : `report + cible`, et non `cible`.
      //
      // La première version écrivait `reste: cible`, ce qui écrasait le report
      // entrant. Deux conséquences, l'une bénigne et l'autre grave :
      //   · `REPORT_MAX_PAR_JOUR` ne pouvait JAMAIS s'appliquer, puisque le
      //     report ne dépassait jamais la cible — un plafond mort ;
      //   · surtout, une semaine de six journées surchargées ne déclarait que
      //     **20 minutes non placées au lieu de 120**. La mesure minimisait sa
      //     propre perte d'un facteur six.
      // Accumuler est ce qui rend `minutesNonPlacees` honnête.
      reste: report + cible,
      motif: `la journée pèse déjà ${Math.round(chargeHaut)} min sur un budget de ${BUDGET_JOURNEE.haut} : aucune réactivation aujourd’hui`,
    };
  }

  const rattrapage = Math.min(report, REPORT_MAX_PAR_JOUR);
  const voulu = cible + rattrapage;
  const minutes = Math.min(voulu, disponible);
  return {
    minutes,
    // Ce qui n'a pas été rattrapé aujourd'hui reste dû : le report non consommé
    // (`report − rattrapage`) s'ajoute à ce que la journée n'a pas pu prendre.
    // Sans ce terme, un plafond de rattrapage effacerait silencieusement les
    // minutes qu'il refuse — un plafond doit borner le service, pas la dette.
    reste: Math.max(0, voulu - minutes) + (report - rattrapage),
    motif: minutes < voulu
      ? `la journée laisse ${Math.round(disponible)} min disponibles`
      : (report > 0 ? `${Math.round(Math.min(report, REPORT_MAX_PAR_JOUR))} min reportées d’une journée chargée` : 'journée ordinaire'),
  };
}

/**
 * ── LE REPORT DANS LA SEMAINE ────────────────────────────────────────────
 *
 * Ce qu'une journée surchargée ne peut pas prendre n'est ni perdu ni empilé
 * indéfiniment : il est proposé aux journées de la même semaine qui ont de la
 * marge. **Le report ne traverse pas la semaine** — au-delà, ce ne serait plus
 * un rattrapage mais une dette qui grossit, et le CP8 a déjà montré ce que
 * produit une dette qui grossit.
 *
 * @param charges  [{ jour, chargeHaut }] pour les 7 journées d'une semaine
 * @returns { jours: [{ jour, minutes, report, motif }], semaine }
 */
export function repartirLaSemaine(charges) {
  const liste = (Array.isArray(charges) ? charges : []).slice(0, 7);
  const total = liste.reduce((n, c) => n + (isNum(c.chargeHaut) ? c.chargeHaut : 0), 0);
  const excedent = Math.max(0, total - BUDGET_SEMAINE);

  const jours = [];
  let report = 0;
  for (const c of liste) {
    const b = budgetReactivationDe(c.chargeHaut, { report });
    report = b.reste;                       // ce qui n'a pas tenu part au jour suivant
    jours.push({ jour: c.jour, minutes: b.minutes, motif: b.motif });
  }

  return {
    jours,
    semaine: {
      chargeHaute: Math.round(total),
      plafond: BUDGET_SEMAINE,
      excedent: Math.round(excedent),
      // Une semaine excédentaire n'est PAS corrigée ici. Elle est signalée.
      // Le corriger voudrait dire retirer du curriculum, ce que le brief
      // interdit et ce que V73 a explicitement choisi de ne pas faire.
      surchargee: excedent > 0,
      minutesNonPlacees: Math.round(report),
    },
  };
}

/**
 * ── LE SIGNAL DE RALENTISSEMENT ──────────────────────────────────────────
 *
 * Le CP8 a établi que chez un apprenant qui échoue une fois sur deux,
 * l'arriéré croît **linéairement** et que **tripler le budget ne le divise pas
 * par trois** (63 → 53 → 43 → 48) : à 50 % d'échec, chaque notion servie
 * revient le lendemain, donc servir plus crée mécaniquement plus de retours.
 * Aucune règle d'ordonnancement ne corrige cela.
 *
 * La seule réponse honnête est d'agir sur l'ENTRÉE. Mais **ce module ne décide
 * pas à la place de l'apprenant** : il ne saute aucune journée, n'en reporte
 * aucune. Il DIT ce qu'il observe et propose. Sauter une journée de programme
 * est une décision qui appartient à la personne, pas au planificateur.
 */
export function signalDeCharge({ arriere = 0, tendance = null } = {}) {
  if (arriere < SEUIL_ALERTE_ARRIERE) {
    return { niveau: 'ok', message: null, proposition: null };
  }
  const croit = tendance != null && tendance > 0;
  return {
    niveau: croit ? 'ralentir' : 'vigilance',
    message: croit
      ? `${arriere} notions attendent d’être revues, et ce nombre augmente. Tu avances plus vite que tu ne consolides.`
      : `${arriere} notions attendent d’être revues.`,
    proposition: croit
      ? 'Consacrer une journée à consolider plutôt qu’à avancer ferait baisser ce nombre. C’est toi qui décides — le programme ne saute rien tout seul.'
      : 'Rien à changer pour l’instant ; le nombre ne monte plus.',
  };
}

/**
 * ── LE PLAN DE LA JOURNÉE ────────────────────────────────────────────────
 *
 * Assemble le tout : combien de minutes pour la réactivation, ce que le
 * scheduler en fait, et ce que l'apprenant doit savoir de sa charge.
 *
 * `planifierAvec` est injecté (c'est `planifier` du CP4) : ce module ne
 * réimplémente pas l'ordonnancement, il le budgète.
 */
export function planDuJour({
  fiches = [],
  chargeHaut = null,
  report = 0,
  arriere = 0,
  tendance = null,
  now,
  planifierAvec,
  optionsScheduler = {},
} = {}) {
  const budget = budgetReactivationDe(chargeHaut, { report });
  const signal = signalDeCharge({ arriere, tendance });

  // Zéro minute : on ne convoque pas le scheduler pour qu'il rende une liste
  // vide, et surtout on ne propose PAS « une petite révision quand même ».
  const seance = budget.minutes > 0 && typeof planifierAvec === 'function'
    ? planifierAvec(fiches, { ...optionsScheduler, now, budgetMinutes: budget.minutes })
    : { date: now ?? null, budgetMinutes: budget.minutes, minutesPlanifiees: 0, items: [], differes: [], raisonArret: 'aucune minute disponible' };

  return {
    date: now ?? null,
    charge: {
      curriculumHaut: isNum(chargeHaut) ? Math.round(chargeHaut) : null,
      budgetJournee: BUDGET_JOURNEE.haut,
      depassement: isNum(chargeHaut) ? Math.max(0, Math.round(chargeHaut - BUDGET_JOURNEE.haut)) : 0,
    },
    reactivation: {
      minutesAccordees: budget.minutes,
      minutesReportees: budget.reste,
      motif: budget.motif,
    },
    seance,
    signal,
  };
}
