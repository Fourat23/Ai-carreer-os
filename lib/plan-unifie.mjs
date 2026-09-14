// V75 · CP11 — LE PLAN UNIQUE. Module PUR, déterministe, sans I/O.
//
// ── CE QUE CE MODULE RÉSOUT ──────────────────────────────────────────────
//
// Le produit sait, depuis V74 et les checkpoints précédents de V75, répondre à
// cinq questions séparément :
//
//   NEW          la journée de curriculum ;
//   REVIEW       la réactivation (CP4 de V74) ;
//   REMEDIATION  la reprise après échec (CP7 de V74) ;
//   TRANSFER     les défis T4/T5 (CP9) ;
//   PROJECT      le livrable de la journée.
//
// Il ne sait pas encore répondre à **la seule question qui compte pour
// l'apprenant** : *« qu'est-ce que je fais aujourd'hui, et pourquoi comme ça ? »*
//
// ── LA RÈGLE QUI INTERDIT LA SOLUTION FACILE ────────────────────────────
//
// Le brief est explicite : **« sans simplement concaténer les cinq »**. Les
// mettre bout à bout produirait une journée de 400 minutes et un apprenant qui
// abandonne. Les cinq natures **se disputent un seul budget**, dans un ordre
// qui dépend du mode — et ce qui ne rentre pas est **réduit, différé ou
// suspendu**, avec une phrase qui le dit.
//
// ── LA CONTRAINTE QUI NE SE NÉGOCIE PAS ─────────────────────────────────
//
// **`total ≤ budget de la journée`, toujours.** Le CP10 de V74 avait mesuré
// 44 journées sur 365 déjà au-dessus du plafond ; §11.2 en tire la règle : une
// journée déjà pleine ne reçoit **pas** trente minutes de réactivation cachées.
//
// > Le moteur de récupération peut différer, réduire, proposer, recommander.
// > **Il ne peut pas créer du temps.**
//
// ── ET CE QU'IL NE FAIT PAS ─────────────────────────────────────────────
//
// Il ne VERROUILLE rien (§11.3). `CRITICAL` recommande de suspendre le nouveau
// contenu ; seule la commande `SET_CURRICULUM_PAUSE` (CP7), déclenchée par
// l'apprenant, le suspend réellement.
import { BUDGET_JOURNEE } from './daily-plan.mjs';

/** Les cinq natures de travail. L'ordre déclaratif, pas l'ordre d'arbitrage. */
export const NATURES = Object.freeze(['NEW', 'REVIEW', 'REMEDIATION', 'TRANSFER', 'PROJECT']);

/** Ce qu'un bloc peut devenir quand le budget ne suit pas. */
export const STATUTS_BLOC = Object.freeze(['inclus', 'reduit', 'differe', 'suspendu', 'recommande-pause']);

/**
 * ── L'ORDRE D'ARBITRAGE, PAR MODE ────────────────────────────────────────
 *
 * **C'est la décision du checkpoint**, et elle est déclarée ici en un seul
 * endroit. Servir dans cet ordre, c'est arbitrer ; les additionner, ce serait
 * concaténer.
 *
 * Pourquoi `REMEDIATION` passe devant tout dès `CATCH_UP` : le CP3 de V74 avait
 * établi qu'un échec non repris est **le signal le plus actionnable du
 * produit**. Reprendre ce qui vient d'échouer coûte quelques minutes et
 * débloque le reste ; avancer par-dessus creuse.
 *
 * Pourquoi `PROJECT` passe en premier en `NORMAL` : un livrable a une date, et
 * le reporter coûte plus cher que de reporter une révision.
 */
export const ORDRE = Object.freeze({
  NORMAL: ['PROJECT', 'NEW', 'REVIEW', 'REMEDIATION', 'TRANSFER'],
  CATCH_UP: ['REMEDIATION', 'REVIEW', 'PROJECT', 'NEW', 'TRANSFER'],
  RECOVERY: ['REMEDIATION', 'REVIEW', 'PROJECT', 'NEW', 'TRANSFER'],
  CRITICAL: ['REMEDIATION', 'REVIEW', 'NEW', 'PROJECT', 'TRANSFER'],
});

/** Natures que le mode met de côté. Repris de la posture du CP6, non redécidé. */
const SUSPENDU = Object.freeze({
  NORMAL: [], CATCH_UP: [], RECOVERY: ['TRANSFER'], CRITICAL: ['TRANSFER'],
});

const LIBELLE = Object.freeze({
  NEW: 'Nouveau contenu',
  REVIEW: 'Réactivation',
  REMEDIATION: 'Reprise après échec',
  TRANSFER: 'Défi de transfert',
  PROJECT: 'Projet du jour',
});

const nb = (v) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.round(v)) : 0);

/**
 * ── LE PLAN ──────────────────────────────────────────────────────────────
 *
 * @param {object} o
 * @param {string} o.mode             mode du CP6
 * @param {number|null} o.chargeHaut  charge de curriculum de la journée
 * @param {number} o.budgetJournee    plafond, repris de V73 — jamais renégocié
 * @param {object} o.demande          minutes DEMANDÉES par nature
 * @param {object} o.arriere          `{ total, actif, differe, gare }` — §11.4
 * @param {object} o.pression         les cinq facteurs nommés du CP5
 * @param {boolean} o.projetAujourdhui
 */
export function planUnifie({
  mode = 'NORMAL',
  chargeHaut = null,
  budgetJournee = BUDGET_JOURNEE.haut,
  demande = {},
  arriere = { total: 0, actif: 0, differe: 0, gare: 0 },
  pression = {},
  projetAujourdhui = false,
  minutesTransfert = 0,
} = {}) {
  const plafond = nb(budgetJournee) || BUDGET_JOURNEE.haut;
  const charge = typeof chargeHaut === 'number' && Number.isFinite(chargeHaut) ? nb(chargeHaut) : null;
  const ordre = ORDRE[mode] ?? ORDRE.NORMAL;
  const suspendus = new Set(SUSPENDU[mode] ?? []);

  // Ce que chaque nature DEMANDERAIT si elle était seule. C'est la somme de ces
  // demandes que le budget refuse — et c'est là que l'arbitrage commence.
  const demandes = {
    NEW: charge != null ? charge : nb(demande.NEW),
    REVIEW: nb(demande.REVIEW),
    REMEDIATION: nb(demande.REMEDIATION),
    TRANSFER: suspendus.has('TRANSFER') ? 0 : nb(minutesTransfert || demande.TRANSFER),
    PROJECT: projetAujourdhui ? nb(demande.PROJECT) : 0,
  };
  const totalDemande = NATURES.reduce((n, k) => n + demandes[k], 0);

  // ── §11.2 · LA JOURNÉE LOURDE ──
  //
  // Quand le curriculum consomme déjà tout le budget, il ne reste rien. Le
  // produit le DIT au lieu d'ajouter une séance par-dessus. C'est la règle du
  // CP10 de V74 (`PLANCHER_JOURNEE_CHARGEE = 0`), portée au plan entier.
  const journeeLourde = charge != null && charge >= plafond;

  const blocs = [];
  let restant = plafond;

  for (const nature of ordre) {
    const veut = demandes[nature];
    if (suspendus.has(nature)) {
      blocs.push({
        nature, libelle: LIBELLE[nature], minutes: 0, demande: nb(minutesTransfert || demande[nature]),
        statut: 'suspendu',
        pourquoi: 'les prérequis en retard passent d’abord : transposer une notion fragile organise un échec de plus',
      });
      continue;
    }
    if (veut === 0) continue;

    // `CRITICAL` RECOMMANDE la pause du nouveau contenu. Il ne l'applique pas :
    // `PAUSED_CURRICULUM` est un choix de l'apprenant (§1.5, §11.3).
    if (nature === 'NEW' && mode === 'CRITICAL') {
      // Le bloc est BORNÉ par le budget comme tous les autres. Recommander une
      // pause ne dispense pas de la contrainte : une première version laissait
      // ce bloc passer à sa demande entière et le total montait à 320 min sur
      // un plafond de 300. La recommandation porte sur ce qu'on FAIT, jamais
      // sur le temps dont on dispose.
      const accordeNew = Math.min(veut, restant);
      blocs.push({
        nature, libelle: LIBELLE[nature], minutes: accordeNew, demande: veut,
        statut: 'recommande-pause',
        pourquoi: 'le retard s’est installé au point qu’avancer le creuse — le produit te propose de suspendre, il ne le fait pas à ta place',
      });
      restant = Math.max(0, restant - accordeNew);
      continue;
    }

    const accorde = Math.min(veut, restant);
    blocs.push({
      nature, libelle: LIBELLE[nature], minutes: accorde, demande: veut,
      statut: accorde === veut ? 'inclus' : accorde > 0 ? 'reduit' : 'differe',
      pourquoi: pourquoiDuBloc(nature, mode, accorde, veut, pression),
    });
    restant = Math.max(0, restant - accorde);
  }

  const total = blocs.reduce((n, b) => n + b.minutes, 0);

  return {
    mode,
    budget: {
      journee: plafond,
      curriculum: charge,
      /** Ce que les cinq natures demanderaient ensemble. */
      demande: totalDemande,
      /** Ce que le plan accorde. **Jamais plus que le plafond.** */
      accorde: total,
      restant,
      journeeLourde,
      /** Minutes que la journée ne peut PAS donner. Publiées, pas effacées. */
      nonPlacees: Math.max(0, totalDemande - total),
    },
    blocs,
    // §11.4 — les trois nombres restent DISTINCTS, et traversent le plan sans
    // être agrégés. `PARKED` n'est jamais `DONE`, `MASTERED`, `FORGOTTEN` ni
    // `DELETED` — seulement « pas planifié maintenant ».
    arriere: {
      total: nb(arriere.total), actif: nb(arriere.actif),
      differe: nb(arriere.differe), gare: nb(arriere.gare),
    },
    ordre,
    explications: explicationsDe({ mode, blocs, pression, journeeLourde, charge, plafond }),
    /** Vrai si le mode a réellement changé quelque chose au plan nominal. */
    modifie: blocs.some((b) => b.statut !== 'inclus'),
  };
}

function pourquoiDuBloc(nature, mode, accorde, veut, pression) {
  const b = pression?.bloquantes ?? 0;
  const e = pression?.echecsNonRepris ?? 0;
  if (accorde === 0) {
    return 'la journée n’a plus de minutes à donner : ce bloc revient demain, il n’est pas annulé';
  }
  if (accorde < veut) {
    return `réduit de ${veut - accorde} min : le budget de la journée passe avant`;
  }
  if (nature === 'REMEDIATION' && e > 0) {
    return `${e} tentative${e > 1 ? 's' : ''} n’${e > 1 ? 'ont' : 'a'} pas abouti et attend${e > 1 ? 'ent' : ''} d’être repris${e > 1 ? 'es' : 'e'}`;
  }
  if (nature === 'REVIEW' && b > 0) {
    return `${b} notion${b > 1 ? 's' : ''} dont la suite du parcours dépend ${b > 1 ? 'sont' : 'est'} en retard`;
  }
  if (nature === 'NEW') return 'le parcours avance à son rythme';
  if (nature === 'PROJECT') return 'un livrable a une date : le reporter coûte plus cher qu’une révision';
  if (nature === 'TRANSFER') return 'reconnaître une notion ailleurs est ce qui la rend utilisable';
  return 'prévu par le programme';
}

/**
 * ── §11.5 · L'EXPLICATION, EN LANGAGE HUMAIN ─────────────────────────────
 *
 * Le brief donne l'exemple attendu :
 *
 *   > « Tu as trois notions bloquantes avant le projet de cette semaine. Le
 *   >   nouveau contenu est réduit aujourd'hui pour laisser 35 minutes à leur
 *   >   réactivation. »
 *
 * Et l'interdit :
 *
 *   > « recoveryPressure=0.82 »
 *
 * Chaque modification du plan produit donc UNE phrase, qui nomme la cause et
 * l'effet. Un plan modifié sans explication est un plan qu'on ne peut pas
 * contester.
 */
export function explicationsDe({ mode, blocs, pression = {}, journeeLourde = false, charge = null, plafond = 0 }) {
  const out = [];
  const b = pression.bloquantes ?? 0;
  const e = pression.echecsNonRepris ?? 0;

  if (journeeLourde) {
    out.push(`Cette journée de programme pèse déjà ${charge} minutes sur un budget de ${plafond} : le produit n’ajoute aucune révision par-dessus. Ce qui n’est pas fait aujourd’hui n’est pas perdu.`);
  }

  const revision = blocs.find((x) => x.nature === 'REVIEW');
  const nouveau = blocs.find((x) => x.nature === 'NEW');
  if (mode !== 'NORMAL' && revision && revision.minutes > 0 && nouveau) {
    const cause = b > 0
      ? `Tu as ${b} notion${b > 1 ? 's' : ''} en retard dont la suite du parcours dépend`
      : `Tu as ${e} tentative${e > 1 ? 's' : ''} qui n’${e > 1 ? 'ont' : 'a'} pas abouti`;
    if (nouveau.statut === 'recommande-pause') {
      out.push(`${cause}. Le produit te propose de suspendre le nouveau contenu et de garder ${revision.minutes} minutes pour les reprendre — c’est une proposition, pas une décision prise à ta place.`);
    } else if (nouveau.statut === 'reduit' || nouveau.minutes < nouveau.demande) {
      out.push(`${cause}. Le nouveau contenu est réduit aujourd’hui pour laisser ${revision.minutes} minutes à leur réactivation.`);
    } else {
      out.push(`${cause}. La séance du jour commence par là, sans rien ajouter à ta journée.`);
    }
  }

  for (const x of blocs) {
    if (x.statut === 'differe') {
      out.push(`« ${x.libelle} » est reporté : la journée n’avait plus de minutes à lui donner. Il revient demain.`);
    }
    if (x.statut === 'suspendu') {
      out.push(`« ${x.libelle} » est mis de côté tant que des prérequis sont en retard — les proposer maintenant organiserait un échec de plus.`);
    }
  }

  return out;
}
