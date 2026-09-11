// V75 · CP6 — MODE DE RÉCUPÉRATION. Module PUR, déterministe, sans I/O.
//
// Contrat gelé : `docs/v75/V75-RECOVERY-CONTRACT-FROZEN.md` §1.1–1.6, §3, §4.
//
// ── CE QUE « MODE » VEUT DIRE ICI, ET CE QUE ÇA NE VEUT PAS DIRE ─────────
//
// §1.2, littéralement : *« un état DÉCLARÉ du plan, pas un état de
// l'apprenant »*. Le mode dit **« aujourd'hui, l'arbitrage penche vers la
// consolidation plutôt que vers l'acquisition »**. Il ne dit rien de ce que la
// personne sait, retient ou vaut. Ce n'est ni un diagnostic, ni un jugement,
// ni une sanction (`R11`).
//
// Conséquence technique directe : **le mode n'est jamais persisté.** Il se
// recalcule intégralement depuis les faits à n'importe quelle date. Le stocker
// en ferait un attribut de la personne — « tu es en récupération » — et il
// survivrait à la situation qui l'a produit.
//
// ── RECOMMANDER, JAMAIS IMPOSER ─────────────────────────────────────────
//
// Le module rend **deux** allocations de la journée :
//
//   · `actuel`  — ce qui se passe si l'apprenant ne change rien ;
//   · `propose` — ce que la récupération suggère.
//
// Rien n'applique la seconde. C'est la règle du CP10 de V74 (« le signal
// propose, il ne décide pas ») portée au grain de la journée entière, et c'est
// la seule forme qui respecte à la fois `R11` (ne pas punir) et `R12` (ne pas
// imposer un rattrapage impossible).
//
// ── LA RÉCUPÉRATION NE CRÉE JAMAIS DE MINUTES ───────────────────────────
//
// `propose.total ≤ actuel.total`, toujours, et c'est testé. Le critère
// BLOQUANT `V12` exige que le budget quotidien soit respecté **y compris par la
// récupération** : consolider davantage se paie en avançant moins, jamais en
// travaillant plus longtemps. Un moteur qui rallonge la journée pour rattraper
// est exactement le « rattrapage impossible » que `R12` interdit.
//
// ── LES SEUILS SONT GELÉS, PAS CALIBRÉS ─────────────────────────────────
//
// Ils viennent du §3 du contrat, écrit **avant** la première mesure. Les
// ajuster maintenant que les chiffres du CP5 sont connus serait `R7` — et
// c'est le piège que V74 avait nommé `G11`.
import { CIBLE_REACTIVATION, BUDGET_JOURNEE } from './daily-plan.mjs';
import { MINUTES_PAR_FORME } from './retention-scheduler.mjs';

/**
 * Coût d'une reprise après échec : celui de la forme SOUTENUE que le scheduler
 * choisit précisément dans ce cas (`cued`, règle 1 de `formeDe`). On lit sa
 * valeur plutôt que d'en déclarer une seconde, qui divergerait.
 */
const MINUTES_REPRISE = MINUTES_PAR_FORME.cued;

/** Les quatre modes, du plus calme au plus tendu. L'ordre est significatif. */
export const MODES = Object.freeze(['NORMAL', 'CATCH_UP', 'RECOVERY', 'CRITICAL']);

/**
 * Seuils d'ENTRÉE, gelés au §3 du contrat.
 *
 * `bloquantes` est le déclencheur principal, **pas le volume**, et la raison
 * est écrite dans le contrat : *60 notions en retard dont aucune n'est exigée
 * avant un mois ne sont pas une difficulté ; 4 notions prérequises de la
 * semaine prochaine, si.* Déclencher sur le volume punirait le premier
 * apprenant et manquerait le second (`R11`).
 */
export const SEUILS = Object.freeze({
  CATCH_UP: { bloquantes: 1, echecsNonRepris: 3 },
  RECOVERY: { bloquantes: 3, facteurMinutes: 3 },
  CRITICAL: { bloquantes: 6, facteurMinutes: 6 },
});

/** `RECOVERY_EXIT`, gelé au §4 **avant toute mesure**. */
export const SORTIE = Object.freeze({
  bloquantes: 0,          // E1
  echecsNonRepris: 2,     // E2
  facteurMinutes: 2,      // E3
  joursActifs: 2,         // E4 — anti-oscillation
});

/**
 * Part de réactivation visée par mode, en multiples de `CIBLE_REACTIVATION`.
 *
 * **Déclarés, pas mesurés** — aucune donnée d'apprenant réel ne permet de les
 * calibrer, exactement comme les minutes du CP4 de V74. Ils sont publiés ici,
 * en un seul endroit, et configurables.
 *
 * `CRITICAL` ne vaut pas l'infini : au-delà de trois séances nominales, une
 * journée de récupération devient une punition, et une punition fait arrêter.
 */
export const PART_REVISION = Object.freeze({
  NORMAL: 1, CATCH_UP: 1.5, RECOVERY: 2, CRITICAL: 3,
});

/** Ce que chaque mode fait des défis de transfert et des projets. */
const POSTURE = Object.freeze({
  NORMAL: { transfert: 'propose', projet: 'inchange' },
  CATCH_UP: { transfert: 'propose', projet: 'inchange' },
  // Le transfert demande des fondations tenues. En proposer à quelqu'un dont
  // trois prérequis sont en retard, c'est organiser un échec de plus.
  RECOVERY: { transfert: 'suspendu', projet: 'inchange' },
  CRITICAL: { transfert: 'suspendu', projet: 'reportable' },
});

const nombre = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

/**
 * Les trois conditions de sortie mesurables à un instant donné (`E1`→`E3`).
 * `E4` est temporel et se vérifie dans `modeDe`.
 */
export function conditionsDeSortie(pression, budget = CIBLE_REACTIVATION) {
  const b = budget > 0 ? budget : CIBLE_REACTIVATION;
  return {
    E1: nombre(pression?.bloquantes) <= SORTIE.bloquantes,
    E2: nombre(pression?.echecsNonRepris) <= SORTIE.echecsNonRepris,
    E3: nombre(pression?.minutesRequises) <= SORTIE.facteurMinutes * b,
  };
}

const toutesTenues = (c) => c.E1 && c.E2 && c.E3;

/**
 * ── LE MODE ──────────────────────────────────────────────────────────────
 *
 * @param {object} pression  les cinq facteurs nommés du CP5
 * @param {object} o
 * @param {number} o.budget  minutes de réactivation de la journée
 * @param {object|null} o.pressionJourActifPrecedent  la même pression au
 *        dernier jour ACTIF précédent. `null` = aucun historique.
 *
 * **`E4` sans stockage.** La condition « tenue 2 jours actifs consécutifs »
 * demande de l'histoire, pas un état : on la vérifie en recalculant la
 * pression au jour actif précédent. Persister un compteur ferait du mode une
 * propriété de la personne, ce que le §1.2 refuse.
 */
export function modeDe(pression, { budget = CIBLE_REACTIVATION, pressionJourActifPrecedent = null } = {}) {
  const b = budget > 0 ? budget : CIBLE_REACTIVATION;
  const bloquantes = nombre(pression?.bloquantes);
  const echecs = nombre(pression?.echecsNonRepris);
  const minutes = nombre(pression?.minutesRequises);

  const facteurs = [];
  let mode = 'NORMAL';
  let regle = 'aucun seuil atteint';

  if (bloquantes >= SEUILS.CRITICAL.bloquantes) {
    mode = 'CRITICAL'; regle = `bloquantes ≥ ${SEUILS.CRITICAL.bloquantes}`;
    facteurs.push({ id: 'bloquantes', valeur: bloquantes });
  } else if (minutes >= SEUILS.CRITICAL.facteurMinutes * b) {
    mode = 'CRITICAL'; regle = `minutes requises ≥ ${SEUILS.CRITICAL.facteurMinutes}× le budget`;
    facteurs.push({ id: 'minutesRequises', valeur: minutes });
  } else if (bloquantes >= SEUILS.RECOVERY.bloquantes) {
    mode = 'RECOVERY'; regle = `bloquantes ≥ ${SEUILS.RECOVERY.bloquantes}`;
    facteurs.push({ id: 'bloquantes', valeur: bloquantes });
  } else if (minutes >= SEUILS.RECOVERY.facteurMinutes * b) {
    mode = 'RECOVERY'; regle = `minutes requises ≥ ${SEUILS.RECOVERY.facteurMinutes}× le budget`;
    facteurs.push({ id: 'minutesRequises', valeur: minutes });
  } else if (bloquantes >= SEUILS.CATCH_UP.bloquantes) {
    mode = 'CATCH_UP'; regle = `bloquantes ≥ ${SEUILS.CATCH_UP.bloquantes}`;
    facteurs.push({ id: 'bloquantes', valeur: bloquantes });
  } else if (echecs >= SEUILS.CATCH_UP.echecsNonRepris) {
    mode = 'CATCH_UP'; regle = `échecs non repris ≥ ${SEUILS.CATCH_UP.echecsNonRepris}`;
    facteurs.push({ id: 'echecsNonRepris', valeur: echecs });
  }

  // Un second facteur n'est cité que s'il est RÉELLEMENT au-dessus de son
  // seuil. Le critère B10 de V74 bornait déjà l'explication à deux facteurs :
  // au-delà, une explication cesse d'en être une.
  if (mode !== 'NORMAL' && facteurs.length === 1) {
    if (facteurs[0].id !== 'echecsNonRepris' && echecs >= SEUILS.CATCH_UP.echecsNonRepris) {
      facteurs.push({ id: 'echecsNonRepris', valeur: echecs });
    } else if (facteurs[0].id !== 'bloquantes' && bloquantes >= SEUILS.CATCH_UP.bloquantes) {
      facteurs.push({ id: 'bloquantes', valeur: bloquantes });
    }
  }

  // ── E4 · ANTI-OSCILLATION ──
  //
  // Sans elle, un apprenant traverserait la frontière chaque jour et le produit
  // lui annoncerait une bonne puis une mauvaise nouvelle en alternance. On ne
  // ANNONCE donc la sortie qu'une fois la condition tenue deux jours actifs.
  const sortieAujourdhui = conditionsDeSortie(pression, b);
  const sortieHier = pressionJourActifPrecedent
    ? conditionsDeSortie(pressionJourActifPrecedent, b) : null;
  // Aucun jour actif précédent : il n'y a rien à confirmer. On ne peut pas
  // échouer à sortir d'un mode où l'on n'est jamais entré.
  const E4 = sortieHier ? toutesTenues(sortieHier) : true;
  const sortieConfirmee = toutesTenues(sortieAujourdhui) && E4;

  // Le maintien par `E4` est un cas À PART, et il doit le rester dans
  // l'explication : aucun seuil n'est franchi aujourd'hui. Dire « plusieurs
  // notions attendent » serait faux — il n'y en a plus. Ce qu'il faut dire,
  // c'est qu'on attend un jour de plus avant de l'annoncer.
  let tenuParE4 = false;
  if (mode === 'NORMAL' && !sortieConfirmee) {
    mode = 'CATCH_UP';
    tenuParE4 = true;
    regle = 'sortie non confirmée : la condition doit tenir 2 jours actifs (E4)';
  }

  return {
    mode,
    regle,
    facteurs,
    tenuParE4,
    /** La phrase du §2 : la décision doit se dire en une phrase. */
    phrase: tenuParE4
      ? 'Ton retard vient d’être résorbé : le produit attend un jour de travail de plus avant de l’annoncer.'
      : phraseDuMode(mode, facteurs),
    sortie: { ...sortieAujourdhui, E4, confirmee: sortieConfirmee },
  };
}

const NOM_FACTEUR = {
  bloquantes: (n) => `${n} notion${n > 1 ? 's' : ''} dont la suite du parcours dépend ${n > 1 ? 'sont' : 'est'} en retard`,
  echecsNonRepris: (n) => `${n} tentative${n > 1 ? 's' : ''} échouée${n > 1 ? 's' : ''} n'${n > 1 ? 'ont' : 'a'} pas été repris${n > 1 ? 'es' : 'e'}`,
  minutesRequises: (n) => `tout reprendre demanderait ${n} minutes`,
};

/**
 * La décision, en une phrase, sans jargon et sans nombre qui prétende décrire
 * une mémoire. Deux facteurs au plus.
 */
export function phraseDuMode(mode, facteurs = []) {
  if (mode === 'NORMAL') return 'Rien ne presse : le parcours avance à son rythme.';
  const causes = facteurs.slice(0, 2).map((f) => NOM_FACTEUR[f.id]?.(f.valeur) ?? f.id);
  const cause = causes.length ? causes.join(', et ') : 'plusieurs notions attendent';
  if (mode === 'CATCH_UP') return `Tu as du retard à reprendre : ${cause}.`;
  if (mode === 'RECOVERY') return `Consolider passe avant avancer aujourd'hui : ${cause}.`;
  return `Le retard s'est installé : ${cause}.`;
}

/**
 * ── L'ARBITRAGE DE LA JOURNÉE ────────────────────────────────────────────
 *
 * Cinq natures de travail : NOUVEAU, RÉVISION, REMÉDIATION, PROJET, TRANSFERT.
 * Ce module en alloue les **minutes**, il ne choisit aucun contenu — c'est le
 * scheduler du CP4 de V74 qui décide *quoi*, et il n'est pas dupliqué ici.
 *
 * @returns {{mode, actuel, propose, ecart, transfert, projet, recommandation}}
 */
export function arbitrerLaJournee({
  mode = 'NORMAL',
  chargeHaut = null,
  minutesReactivation = CIBLE_REACTIVATION,
  pression = null,
  budgetJournee = BUDGET_JOURNEE.haut,
} = {}) {
  const charge = typeof chargeHaut === 'number' && Number.isFinite(chargeHaut)
    ? Math.max(0, chargeHaut) : null;
  const revisionActuelle = Math.max(0, nombre(minutesReactivation));
  // Charge inconnue : on ne l'invente pas. Le nouveau contenu est alors décrit
  // par ce que la journée laisse, et la proposition reste relative.
  const nouveauActuel = charge != null ? charge : Math.max(0, budgetJournee - revisionActuelle);

  const echecs = nombre(pression?.echecsNonRepris);
  const minutesRequises = nombre(pression?.minutesRequises);

  const actuel = {
    nouveau: nouveauActuel,
    revision: revisionActuelle,
    // La remédiation se prend DANS la révision, elle ne s'y ajoute pas : un
    // échec non repris se travaille en le reprenant, pas en travaillant plus.
    remediation: 0,
    total: nouveauActuel + revisionActuelle,
  };

  // ── LA PROPOSITION ──
  //
  // Le total ne monte JAMAIS (`V12`). Ce que la révision gagne, le nouveau
  // contenu le cède — et pas une minute de plus.
  const vise = Math.round(CIBLE_REACTIVATION * (PART_REVISION[mode] ?? 1));
  // On ne propose jamais plus de révision qu'il n'y a de révision à faire :
  // réserver 60 minutes pour 12 minutes d'arriéré fabriquerait du travail.
  const plafondUtile = minutesRequises > 0 ? Math.min(vise, minutesRequises) : revisionActuelle;
  const revisionProposee = mode === 'NORMAL'
    ? revisionActuelle
    : Math.min(Math.max(revisionActuelle, plafondUtile), actuel.total);

  const supplement = Math.max(0, revisionProposee - revisionActuelle);
  const nouveauPropose = mode === 'CRITICAL'
    // `CRITICAL` RECOMMANDE la pause du nouveau contenu (§1.4). Il ne
    // l'applique pas : `PAUSED_CURRICULUM` est un choix de l'apprenant (§1.5).
    ? 0
    : Math.max(0, nouveauActuel - supplement);

  const propose = {
    nouveau: nouveauPropose,
    revision: revisionProposee,
    // La remédiation est un SOUS-ENSEMBLE de la révision, jamais un ajout :
    // un échec non repris se travaille en le reprenant, pas en travaillant
    // plus longtemps. Elle n'entre donc pas dans `total`.
    remediation: echecs > 0 ? Math.min(revisionProposee, echecs * MINUTES_REPRISE) : 0,
    total: nouveauPropose + revisionProposee,
    /** Rien n'est appliqué. L'apprenant reste maître (§1.4, §1.5). */
    applique: false,
  };

  return {
    mode,
    actuel,
    propose,
    ecart: {
      nouveau: propose.nouveau - actuel.nouveau,
      revision: propose.revision - actuel.revision,
      total: propose.total - actuel.total,
    },
    ...(POSTURE[mode] ?? POSTURE.NORMAL),
    recommandation: recommandationDe(mode, { supplement, nouveauPropose, nouveauActuel, echecs }),
  };
}

/**
 * ── CE QU'ON PROPOSE À L'APPRENANT ───────────────────────────────────────
 *
 * Toujours au moins deux choix, dont **« ne rien changer »**, et ce choix n'est
 * jamais présenté comme une erreur. Une recommandation qui n'offre qu'une
 * option est un ordre, et `R12` interdit d'imposer un rattrapage.
 */
export function recommandationDe(mode, { supplement = 0, nouveauPropose = 0, nouveauActuel = 0, echecs = 0 } = {}) {
  const garder = { id: 'garder', libelle: 'Continuer comme prévu', effet: 'Le parcours avance, le retard reste visible.' };

  if (mode === 'NORMAL') {
    return { titre: null, texte: null, choix: [], impose: false };
  }
  if (mode === 'CATCH_UP') {
    return {
      titre: 'Du retard à reprendre',
      texte: echecs > 0
        ? 'La séance du jour commence par ce qui n’a pas abouti la dernière fois. Rien n’est ajouté à ta journée.'
        : 'La séance du jour commence par ce dont la suite du parcours a besoin. Rien n’est ajouté à ta journée.',
      choix: [garder],
      impose: false,
    };
  }
  if (mode === 'RECOVERY') {
    return {
      titre: 'Consolider avant d’avancer',
      texte: `Tu peux donner ${supplement} minutes de plus à la révision aujourd’hui, prises sur le nouveau contenu — pas ajoutées à ta journée. Le programme ne saute rien tout seul.`,
      choix: [
        { id: 'consolider', libelle: `Consolider ${supplement} min de plus`, effet: `Le nouveau contenu passe de ${nouveauActuel} à ${nouveauPropose} minutes aujourd’hui.` },
        garder,
      ],
      impose: false,
    };
  }
  return {
    titre: 'Mettre le nouveau contenu en pause ?',
    texte: 'Le retard s’est installé au point qu’avancer le creuse. Suspendre le nouveau contenu quelques jours le ferait baisser. **C’est ta décision** : le produit ne suspend rien de lui-même, et reprendre ne coûte rien.',
    choix: [
      // Le MÊME libellé que le bouton qui l'exécute. L'audit du CP8 a relevé
      // trois formulations pour une seule action : « Mettre en pause ? » en
      // titre, « Suspendre » en option, « Mettre en pause » sur le bouton.
      { id: 'pause', libelle: 'Mettre le nouveau contenu en pause', effet: 'Les journées suivantes ne proposent que de la consolidation, jusqu’à ce que tu reprennes.' },
      { id: 'consolider', libelle: 'Garder le parcours, consolider davantage', effet: `Le nouveau contenu passe de ${nouveauActuel} à ${Math.max(0, nouveauActuel - supplement)} minutes.` },
      garder,
    ],
    impose: false,
  };
}
