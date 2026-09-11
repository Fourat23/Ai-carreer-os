// V75 · CP7 — PLAN DE RATTRAPAGE MULTI-JOURNÉES. Module PUR, sans I/O.
//
// Contrat gelé : `docs/v75/V75-RECOVERY-CONTRACT-FROZEN.md` §1.3, §1.6, §5.
//
// ── LA PHRASE QUE CE MODULE EXISTE POUR NE JAMAIS ÉCRIRE ─────────────────
//
//   > « Vous avez 91 notions en retard, faites-les toutes. »
//
// Le brief l'interdit nommément, et le CP0 explique pourquoi : chez
// l'apprenant irrégulier, l'arriéré atteint **106 notions**. Lui présenter la
// liste, c'est lui présenter un mur. Mais la cacher serait `R1`. La seule
// sortie honnête est de **borner ce qu'on propose** tout en **montrant ce qui
// reste** — les deux nombres, côte à côte, jamais l'un sans l'autre.
//
// ── CE QUI REND UN PLAN « NON PUNITIF », CONCRÈTEMENT ────────────────────
//
// Ce n'est pas une question de ton. C'est une propriété du **type** :
//
//   **cette fonction ne reçoit AUCUN historique de plan.**
//
// Elle ne peut donc pas savoir qu'un plan précédent a été abandonné, ni
// qu'une journée a été sautée — donc elle ne peut pas le reprocher. Un plan
// qui se souvient d'avoir été manqué finit toujours par le faire payer. Ici
// il n'y a rien à rattraper d'un plan : il n'y a que l'état d'aujourd'hui.
// C'est ce que §1.3 appelle « recalculable chaque jour, abandonnable sans
// pénalité », rendu vérifiable au lieu d'être promis.
//
// ── ET CE QU'IL NE PRÉTEND PAS SAVOIR ───────────────────────────────────
//
// Il ne dit **jamais** « tu seras à jour dans N jours ». Il ne peut pas : le
// CP0 a mesuré qu'à 50 % de réussite l'arriéré croît quoi qu'on fasse, et
// qu'une notion servie revient. Ce qu'il peut dire, et qui est un fait de
// COUVERTURE et non une prédiction de mémoire :
//
//   > « à ce rythme, chaque notion en retard repasse au moins une fois
//   >   d'ici N jours. »
//
// La nuance est exactement celle que `R10` protège : on ne fabrique aucune
// probabilité d'oubli, et on ne déguise pas un débit en promesse de maîtrise.
import { PLAFOND_UNITES } from './retention-scheduler.mjs';

const DAY_MS = 86_400_000;

/**
 * Nombre de journées que le plan PROPOSE. Déclaré, et volontairement court.
 *
 * Une séquence ouverte « jusqu'à ce que ce soit fini » est précisément le
 * rattrapage impossible que `R12` interdit : à 91 notions et 5 par jour, elle
 * annoncerait dix-huit jours de pénitence. Sept jours, c'est une semaine —
 * un horizon qu'on peut se représenter, et au bout duquel le plan est refait
 * avec les faits de ce moment-là.
 */
export const HORIZON_PLAN = 7;

/** Les classes que le plan peut proposer. `PARKED` n'en fait PAS partie. */
export const CLASSES_PLANIFIABLES = Object.freeze(['URGENT', 'IMPORTANT', 'DEFERRABLE']);

const RANG = { URGENT: 0, IMPORTANT: 1, DEFERRABLE: 2 };

/**
 * ── LE PLAN ──────────────────────────────────────────────────────────────
 *
 * @param {object} o
 * @param {object[]} o.notions       notions triées du CP5 (classe, minutes, score)
 * @param {number} o.minutesParJour  minutes de révision que la journée accorde
 * @param {number} o.unitesParJour   plafond d'unités par séance (CP4 de V74)
 * @param {number} o.horizon         journées proposées
 * @param {string} o.now
 *
 * **Aucun paramètre ne décrit un plan antérieur.** C'est la garantie du §1.3.
 */
export function planDeRattrapage({
  notions = [],
  minutesParJour = 20,
  unitesParJour = PLAFOND_UNITES,
  horizon = HORIZON_PLAN,
  now = null,
} = {}) {
  const total = notions.length;
  const garees = notions.filter((n) => n.classe === 'PARKED');
  // Les notions garées ne sont pas planifiables : leur prérequis est en
  // retard. Les inscrire au plan ferait échouer l'apprenant sur la cause.
  // Elles restent COMPTÉES — `total` les inclut — et publiées à part (`I2`).
  const planifiables = notions
    .filter((n) => CLASSES_PLANIFIABLES.includes(n.classe))
    .sort((a, b) => (RANG[a.classe] ?? 9) - (RANG[b.classe] ?? 9)
      || (b.score ?? 0) - (a.score ?? 0) || String(a.id).localeCompare(String(b.id)));

  const minutes = Math.max(0, Math.round(minutesParJour));
  const capUnites = Math.max(0, Math.trunc(unitesParJour));
  const nbJours = Math.max(0, Math.trunc(horizon));

  const jours = [];
  let i = 0;
  for (let rang = 1; rang <= nbJours && i < planifiables.length; rang += 1) {
    const unites = [];
    let m = 0;
    while (i < planifiables.length && unites.length < capUnites) {
      const n = planifiables[i];
      const coutUnite = Math.max(0, n.minutes ?? 0);
      // La PREMIÈRE unité passe même si elle dépasse le budget : sinon une
      // notion coûteuse ne serait jamais proposée, et attendrait
      // indéfiniment derrière des notions moins chères. C'est la famine que le
      // CP8 de V74 avait mesurée, et la place réservée corrigeait déjà.
      if (unites.length > 0 && m + coutUnite > minutes) break;
      unites.push({ id: n.id, minutes: coutUnite, classe: n.classe, raison: n.raison ?? '' });
      m += coutUnite;
      i += 1;
    }
    if (!unites.length) break;
    jours.push({
      rang,
      date: now ? new Date(Date.parse(now) + (rang - 1) * DAY_MS).toISOString().slice(0, 10) : null,
      minutes: m,
      unites,
      pourquoi: pourquoiDuJour(unites),
    });
  }

  const couvertes = jours.reduce((s, j) => s + j.unites.length, 0);
  const restantes = Math.max(0, planifiables.length - couvertes);
  const rythme = jours.length ? Math.round(couvertes / jours.length) : 0;

  return {
    horizon: nbJours,
    jours,
    /** Ce que le plan propose sur l'horizon. */
    couvertes,
    /** Ce qu'il ne propose PAS, et qui reste dû. Jamais tu. */
    restantes,
    /** Bloquées par un prérequis : hors plan, mais comptées. */
    garees: garees.length,
    /** `I2` : rien ne disparaît. */
    total,
    rythme,
    couverture: couvertureDe(planifiables.length, rythme, garees.length),
    /** §1.3 : abandonnable sans pénalité, recalculé chaque jour. */
    abandonnable: true,
    recalculeChaqueJour: true,
  };
}

/**
 * Le « pourquoi » d'une journée : la classe dominante, dite en clair. Pas une
 * liste de sept raisons — le critère `B10` de V74 avait déjà établi qu'au-delà
 * de deux facteurs une explication cesse d'en être une.
 */
function pourquoiDuJour(unites) {
  const n = (c) => unites.filter((u) => u.classe === c).length;
  const urg = n('URGENT');
  const imp = n('IMPORTANT');
  if (urg && imp) return `${urg} notion${urg > 1 ? 's' : ''} dont la suite dépend, et ${imp} reprise${imp > 1 ? 's' : ''} après échec`;
  if (urg) return `${urg} notion${urg > 1 ? 's' : ''} dont la suite du parcours dépend`;
  if (imp) return `${imp} tentative${imp > 1 ? 's' : ''} qui n'${imp > 1 ? 'ont' : 'a'} pas abouti, à reprendre`;
  return `${unites.length} notion${unites.length > 1 ? 's' : ''} à revoir, sans urgence`;
}

/**
 * ── CE QU'ON A LE DROIT DE DIRE SUR LA FIN ───────────────────────────────
 *
 * Un fait de DÉBIT, jamais une promesse de maîtrise. « Chaque notion repasse
 * une fois » ne veut pas dire « tu la sauras » — et le dire autrement
 * fabriquerait une probabilité d'oubli (`R10`).
 *
 * ── LE DÉFAUT QUE LA MESURE DU CP7 A TROUVÉ ICI ─────────────────────────
 *
 * La première version ne comptait que les notions **planifiables**. Pour le
 * profil L, elle annonçait donc « **2 jours** » — alors que cet apprenant a
 * **72 notions en retard**, dont 57 garées derrière un prérequis. Le total
 * était bien affiché ailleurs, rien n'était caché… et pourtant le chiffre
 * rassurant se lisait comme une fin.
 *
 * C'est précisément ce que la règle d'or interdit : *« transformer une absence
 * en réussite »*. Une phrase de couverture qui ignore le garage est fausse par
 * omission. Elle porte donc désormais les deux nombres, **toujours ensemble**.
 *
 * @param planifiables notions que le plan peut proposer
 * @param rythme       notions par journée de travail
 * @param garees       notions bloquées par un prérequis, hors plan
 */
export function couvertureDe(planifiables, rythme, garees = 0) {
  if (planifiables === 0 && garees === 0) {
    return { jours: 0, phrase: 'Rien n’attend : tout ce qui était en retard a déjà sa place.' };
  }
  // Le garage, et rien d'autre : il n'y a aucun rythme à annoncer, seulement
  // une condition à lever. Dire « 0 jour » ici serait triomphal et faux.
  if (planifiables === 0) {
    return {
      jours: null,
      phrase: `Les ${garees} notions encore en retard attendent toutes qu’un prérequis soit repris : il n’y a rien à planifier tant que ces prérequis ne sont pas eux-mêmes revenus.`,
    };
  }
  if (!rythme) {
    return {
      jours: null,
      phrase: 'La journée n’accorde aucune minute de révision aujourd’hui : le plan reprendra dès qu’elle en laissera.',
    };
  }
  const jours = Math.ceil(planifiables / rythme);
  const base = `À ce rythme, les ${planifiables} notions actuellement travaillables repassent au moins une fois d’ici ${jours} jour${jours > 1 ? 's' : ''} de travail. Ce n’est pas une promesse de les savoir — seulement de les avoir reprises.`;
  if (!garees) return { jours, phrase: base };
  // On ne DATE pas le déblocage : il dépend de tentatives qui n'ont pas encore
  // eu lieu. Annoncer un nombre de jours pour les 57 autres serait inventer.
  return {
    jours,
    phrase: `${base} Les ${garees} autres n’y sont pas comptées : elles attendent qu’un prérequis soit repris, et se débloqueront au fur et à mesure — sans date, parce qu’elle dépend de tentatives qui n’ont pas encore eu lieu.`,
  };
}
