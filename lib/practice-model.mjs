// V77 · CP2 — LA CARTE CANONIQUE DES SURFACES DE PRATIQUE. Module PUR.
//
// ── POURQUOI UN SEUL ENDROIT ────────────────────────────────────────────
//
// Le CP0 a mesuré que la politique d'observation de chaque surface n'existait
// nulle part : elle était **implicite**, dispersée dans huit routes, et
// mutuellement contradictoire. Deux surfaces corrigées de la même façon
// (assessment, capstone) écrivaient des preuves de qualité différente ; quatre
// surfaces capables d'observer n'écrivaient rien ; une mission validée par un
// clic écrivait `passed`.
//
// Une politique implicite est une politique que personne ne peut vérifier. Ce
// fichier est donc **la** carte : le contrat gelé du CP1 y devient une donnée,
// et les routes s'y adossent au lieu de redécider chacune dans leur coin.
//
// ── CE QUE CE MODULE N'EST PAS ──────────────────────────────────────────
//
// Ce n'est pas un moteur. Il ne lit rien, n'écrit rien, ne décide d'aucun
// verdict pédagogique. Il répond à une seule question :
//
//   > pour cette surface, qu'a-t-on le droit d'observer, et jusqu'à quel
//   > niveau de confiance ?
//
// Contrat gelé : `docs/v77/V77-PRACTICE-OBSERVABILITY-CONTRACT-FROZEN.md`.

// ── LES TROIS NIVEAUX DE PREUVE (contrat §2) ────────────────────────────
//
// Ordonnés du plus faible au plus fort. L'ordre est la seule chose qui rende la
// « règle du maillon faible » calculable.
export const NIVEAUX = Object.freeze(['DECLARED', 'OBSERVED', 'VALIDATED']);

/** Rang d'un niveau, ou `-1` s'il est inconnu. */
export function rangDuNiveau(n) {
  return NIVEAUX.indexOf(n);
}

/**
 * ── LA RÈGLE DU MAILLON FAIBLE (contrat §4.5) ────────────────────────────
 *
 * Le niveau d'une preuve composite est celui de sa composante **la plus
 * faible**, jamais la plus forte, jamais une moyenne.
 *
 * C'est ce qui empêche une mission de valoir `VALIDATED` parce qu'un de ses
 * trois livrables l'est, alors que le dernier est un clic de l'apprenant.
 *
 * Une liste vide ne rend pas `DECLARED` — elle rend `null` : « aucune
 * composante » n'est pas « composante la plus faible ».
 */
export function maillonFaible(niveaux) {
  const valides = (Array.isArray(niveaux) ? niveaux : []).filter((n) => rangDuNiveau(n) >= 0);
  if (!valides.length) return null;
  return valides.reduce((a, b) => (rangDuNiveau(b) < rangDuNiveau(a) ? b : a));
}

/**
 * Seul `VALIDATED` compte pour la compétence, la rétention et la récupération
 * (contrat §2.2). La sévérité est délibérée : laisser `OBSERVED` y entrer
 * rouvrirait le défaut mesuré au CP0.
 */
export function compteDansLesMoteurs(niveau) {
  return niveau === 'VALIDATED';
}

// ── LES POLITIQUES DE FAIT (contrat §1.12, §1.13) ───────────────────────
export const POLITIQUES = Object.freeze(['FACT_REQUIRED', 'USAGE_ONLY', 'NO_FACT']);

// ── LES NATURES D'ACTIVITÉ, DÉDUITES DU CP0 ─────────────────────────────
//
// Le brief demandait de ne PAS présupposer les noms et de les tirer du corpus.
// Ceux-ci viennent des mesures : ce que la route accepte, et ce qu'elle calcule.
export const ACTIVITES = Object.freeze([
  // du code est exécuté et confronté à des tests
  'EXECUTABLE',
  // un ensemble de réponses est corrigé contre un corrigé déclaré d'avance
  'ASSESSMENT',
  // l'apprenant remet un artefact qu'il a produit ; le produit l'analyse
  'ARTIFACT_ANALYSIS',
  // l'apprenant remet un document + s'auto-évalue
  'STRUCTURED_SUBMISSION',
  // l'apprenant explore un dispositif fourni, sans rien rédiger
  'SIMULATED_EXPLORATION',
  // une commande bornée, aux arguments choisis dans une liste fermée
  'BOUNDED_DEMONSTRATION',
  // du contenu à lire
  'REFERENCE_CONTENT',
  // un travail réalisé hors du produit
  'EXTERNAL_WORK',
]);

/**
 * ── LA CARTE ─────────────────────────────────────────────────────────────
 *
 * Une entrée par surface de PRATIQUE. Les surfaces de lecture sont traitées
 * collectivement (`SURFACES_DE_LECTURE`) : les énumérer une à une donnerait
 * l'illusion d'une politique par page alors qu'il n'y en a qu'une.
 *
 * `justification` est obligatoire — y compris, et surtout, pour un `NO_FACT` :
 * le contrat exige qu'une absence de fait se défende aussi sérieusement qu'un
 * fait.
 */
export const SURFACES = Object.freeze({
  lab: Object.freeze({
    activite: 'EXECUTABLE',
    observation: 'des tests exécutés en bac à sable, corrigé déclaré d’avance',
    politique: 'FACT_REQUIRED',
    typeFait: 'ExerciseAttempt',
    niveauMax: 'VALIDATED',
    simulation: false,
    concepts: 'RESOLU_SI_NON_AMBIGU',
    competences: 'DECLAREES_PAR_L_EXERCICE',
    existant: true,
    justification: 'Critère objectif, déclaré avant la tentative, rejouable. Existe depuis V74 · CP2.',
  }),
  transfer: Object.freeze({
    activite: 'ASSESSMENT',
    observation: 'correction serveur contre un corrigé, seuil préexistant',
    politique: 'FACT_REQUIRED',
    typeFait: 'TransferAttempt',
    niveauMax: 'VALIDATED',
    simulation: false,
    concepts: 'DECLARES_PAR_LE_DEFI',
    competences: 'DECLAREES_PAR_LE_DEFI',
    existant: true,
    justification: 'Corrigé déclaré d’avance, correction déterministe côté serveur. Existe depuis V75 · CP10.',
  }),
  assessments: Object.freeze({
    activite: 'ASSESSMENT',
    observation: 'correction serveur contre un corrigé, seuil `passThreshold`',
    politique: 'FACT_REQUIRED',
    typeFait: 'AssessmentAttempt',
    niveauMax: 'VALIDATED',
    simulation: false,
    concepts: 'AUCUN_DECLARE',
    competences: 'DECLAREES_PAR_LE_DIAGNOSTIC',
    existant: false,
    justification: 'Plusieurs tentatives humaines ont réellement lieu et le CP0 a mesuré '
      + 'qu’elles étaient fusionnées : cinq échecs ne laissaient qu’une trace. La courbe '
      + 'd’apprentissage est précisément ce qu’un pilote humain doit pouvoir lire.',
  }),
  capstones: Object.freeze({
    activite: 'ASSESSMENT',
    observation: 'correction serveur multi-phases contre un corrigé, seuil `passThreshold`',
    politique: 'FACT_REQUIRED',
    typeFait: 'AssessmentAttempt',
    niveauMax: 'VALIDATED',
    simulation: true,
    concepts: 'AUCUN_DECLARE',
    competences: 'DECLAREES_PAR_LE_CAPSTONE',
    existant: false,
    justification: 'Observationnellement identique à un diagnostic : questionnaire corrigé '
      + 'contre un corrigé déclaré. La différence est pédagogique (scénario d’incident en '
      + 'sept phases) et vit dans le champ `kind` ; l’environnement simulé vit dans `simulation`.',
  }),
  missions: Object.freeze({
    activite: 'STRUCTURED_SUBMISSION',
    observation: 'conformité de FORME d’un document + auto-évaluation validée par l’apprenant',
    politique: 'FACT_REQUIRED',
    typeFait: 'MissionSubmission',
    // ── LE PLAFOND LE PLUS IMPORTANT DE LA CARTE ──
    // Le CP0 a mesuré qu’un document décrivant une conception délibérément
    // mauvaise obtient `structure ok: true`. La validation de forme ne peut pas
    // atteindre la justesse, et le dernier livrable des 42 missions est un clic.
    niveauMax: 'OBSERVED',
    simulation: false,
    concepts: 'AUCUN_DECLARE',
    competences: 'DECLAREES_PAR_LA_MISSION',
    existant: false,
    justification: 'STRUCTURE_VALID + SELF_CONFIRMATION ne peut pas valoir VALIDATED. '
      + 'Règle du maillon faible : la composante la plus faible est une déclaration.',
  }),
  kubernetes: Object.freeze({
    activite: 'ARTIFACT_ANALYSIS',
    observation: 'validation structurelle d’un manifeste rédigé par l’apprenant, puis diagnostics par sévérité',
    politique: 'FACT_REQUIRED',
    typeFait: 'ArtifactAnalysis',
    niveauMax: 'OBSERVED',
    simulation: true,
    concepts: 'AUCUN_DECLARE',
    competences: 'DECLAREES_PAR_LE_SCENARIO',
    existant: false,
    justification: 'L’apprenant remet un artefact qu’il a produit : c’est un travail observable. '
      + 'Mais un compte de diagnostics n’est pas un verdict — zéro diagnostic signifie '
      + '« aucun défaut connu de cet analyseur », jamais « juste ».',
  }),
  'cloud-lab': Object.freeze({
    activite: 'ARTIFACT_ANALYSIS',
    observation: 'validation d’une topologie rédigée par l’apprenant, puis diagnostics et scénarios',
    politique: 'FACT_REQUIRED',
    typeFait: 'ArtifactAnalysis',
    niveauMax: 'OBSERVED',
    simulation: true,
    concepts: 'AUCUN_DECLARE',
    competences: 'DECLAREES_PAR_LA_TOPOLOGIE',
    existant: false,
    justification: 'Même nature que `kubernetes` : artefact remis, analysé, sans verdict.',
  }),
  'cloud-foundations': Object.freeze({
    activite: 'ARTIFACT_ANALYSIS',
    observation: 'validation d’une architecture rédigée par l’apprenant, analyse et coût',
    politique: 'FACT_REQUIRED',
    typeFait: 'ArtifactAnalysis',
    niveauMax: 'OBSERVED',
    simulation: true,
    concepts: 'AUCUN_DECLARE',
    competences: 'DECLAREES_PAR_L_ARCHITECTURE',
    existant: false,
    justification: 'Même nature. Le chiffrage de coût est une analyse, pas une note.',
  }),
  security: Object.freeze({
    activite: 'ARTIFACT_ANALYSIS',
    observation: 'validation d’un scénario durci par l’apprenant, puis diagnostics par domaine',
    politique: 'FACT_REQUIRED',
    typeFait: 'ArtifactAnalysis',
    niveauMax: 'OBSERVED',
    simulation: true,
    concepts: 'AUCUN_DECLARE',
    competences: 'DECLAREES_PAR_LE_SCENARIO',
    existant: false,
    justification: 'Même nature. Les incidents rejoués sont déterministes et déclarés simulés.',
  }),
  pipelines: Object.freeze({
    activite: 'SIMULATED_EXPLORATION',
    observation: 'un pipeline FOURNI PAR LE PRODUIT est exécuté sur un déclencheur choisi',
    // ── LE RENVERSEMENT DU BRIEF ──
    // Le brief demandait de ne pas jeter `success/failed/blocked`. Le verdict
    // est objectif, mais il porte sur la fixture, pas sur l’apprenant : la
    // route n’accepte AUCUN pipeline candidat. Deux apprenants choisissant le
    // même déclencheur obtiennent le même résultat.
    politique: 'NO_FACT',
    typeFait: null,
    niveauMax: null,
    simulation: true,
    concepts: 'SANS_OBJET',
    competences: 'SANS_OBJET',
    existant: false,
    justification: 'L’apprenant ne rédige pas le pipeline : il choisit un déclencheur et une '
      + 'approbation. Le statut du run mesure la fixture, pas la personne. Un `USAGE_EVENT` '
      + 'reste possible (CP7) ; un `PipelineAttempt(success)` ne le sera jamais.',
  }),
  terminal: Object.freeze({
    activite: 'BOUNDED_DEMONSTRATION',
    observation: 'une commande allowlistée s’exécute réellement ; code de sortie observable',
    politique: 'NO_FACT',
    typeFait: null,
    niveauMax: null,
    simulation: false,
    concepts: 'SANS_OBJET',
    competences: 'SANS_OBJET',
    existant: false,
    justification: 'Les trois tâches n’ont aucun critère de réussite pédagogique et leurs '
      + 'arguments sont des énumérations fermées. Leur description dit elle-même '
      + '« démonstration d’exécution bornée ». Un apprenant qui choisit `-la` parmi trois '
      + 'options valides n’a rien démontré.',
  }),
  resources: Object.freeze({
    activite: 'REFERENCE_CONTENT',
    observation: 'aucune : le produit ne sait pas si un playbook a été lu',
    politique: 'NO_FACT',
    typeFait: null,
    niveauMax: null,
    simulation: false,
    concepts: 'SANS_OBJET',
    competences: 'SANS_OBJET',
    existant: false,
    justification: 'Contenu de référence : aucune action, aucune soumission. Lire n’est pas pratiquer.',
  }),
  'external-tasks': Object.freeze({
    activite: 'EXTERNAL_WORK',
    observation: 'aucune : le travail a lieu hors du produit',
    politique: 'NO_FACT',
    typeFait: null,
    // Plafond gelé pour le jour où la surface existera. Aucune route ne
    // l'implémente aujourd'hui, et le niveau est fixé d'avance pour que
    // personne ne la construise en la surclassant.
    niveauMax: 'DECLARED',
    simulation: false,
    concepts: 'SANS_OBJET',
    competences: 'DECLAREES_PAR_LA_TACHE',
    existant: false,
    implemente: false,
    justification: 'Sept tâches `EXTERNAL_ENVIRONMENT_REQUIRED`. Le produit peut enregistrer '
      + 'une déclaration ; il ne peut rien vérifier. `DECLARED` est le plafond, et aucun '
      + 'chemin ne mène de là à `OBSERVED`.',
  }),
});

/**
 * Les surfaces de LECTURE, traitées collectivement. Le contrat les gèle en
 * `NO_FACT` : une page visitée n'est jamais une activité.
 */
export const SURFACES_DE_LECTURE = Object.freeze([
  'accueil', 'calendar', 'career', 'day', 'diagnostics', 'doc', 'glossary', 'guide',
  'history', 'lessons', 'month', 'notes', 'parcours', 'projects', 'retention',
  'reviews', 'revisions', 'settings', 'skills', 'synthese', 'week',
]);

/** Les types de faits que V77 s'autorise à CRÉER. Volontairement deux, pour six surfaces. */
export const FAITS_NOUVEAUX = Object.freeze(['AssessmentAttempt', 'ArtifactAnalysis', 'MissionSubmission']);
/** Les faits qui existaient avant V77 et que ce sprint ne touche pas. */
export const FAITS_EXISTANTS = Object.freeze(['ExerciseAttempt', 'TransferAttempt', 'RecallAttempt']);

// ── LECTURES ────────────────────────────────────────────────────────────

/** La politique d'une surface, ou `null` si elle est inconnue de la carte. */
export function politiqueDe(surfaceId) {
  if (SURFACES_DE_LECTURE.includes(surfaceId)) {
    return Object.freeze({
      activite: 'REFERENCE_CONTENT', politique: 'NO_FACT', typeFait: null, niveauMax: null,
      simulation: false, lecture: true,
      justification: 'Surface de lecture : une page visitée n’est jamais une activité.',
    });
  }
  return SURFACES[surfaceId] ?? null;
}

/** Une surface a-t-elle le droit d'écrire un fait ? */
export function peutEcrireUnFait(surfaceId) {
  return politiqueDe(surfaceId)?.politique === 'FACT_REQUIRED';
}

/**
 * Le niveau maximal qu'une preuve issue de cette surface peut atteindre.
 * `null` quand la surface n'en produit aucune.
 */
export function niveauMaximal(surfaceId) {
  return politiqueDe(surfaceId)?.niveauMax ?? null;
}

/**
 * Un niveau proposé est-il acceptable pour cette surface ?
 *
 * C'est la garde anti-surclassement du contrat §2.3 : une route qui voudrait
 * écrire `VALIDATED` sur une mission doit être refusée **par la carte**, pas par
 * la vigilance de son auteur.
 */
export function niveauAutorise(surfaceId, niveau) {
  const max = niveauMaximal(surfaceId);
  if (max === null || rangDuNiveau(niveau) < 0) return false;
  return rangDuNiveau(niveau) <= rangDuNiveau(max);
}

/** Cette surface décrit-elle un environnement simulé ? */
export function estSimulee(surfaceId) {
  return politiqueDe(surfaceId)?.simulation === true;
}

/** Toutes les surfaces de pratique connues de la carte. */
export function surfacesDePratique() {
  return Object.keys(SURFACES);
}

/**
 * ── COHÉRENCE DE LA CARTE ────────────────────────────────────────────────
 *
 * Rend la liste des incohérences. Une carte qui se contredit serait pire que
 * pas de carte : elle donnerait l'autorité d'un fichier unique à une politique
 * fausse. Exercée par les tests ET par la porte `v77:check`.
 */
export function incoherences() {
  const out = [];
  for (const [id, s] of Object.entries(SURFACES)) {
    if (!ACTIVITES.includes(s.activite)) out.push(`${id} : activité inconnue « ${s.activite} »`);
    if (!POLITIQUES.includes(s.politique)) out.push(`${id} : politique inconnue « ${s.politique} »`);
    if (!s.justification || s.justification.length < 40) out.push(`${id} : justification absente ou trop courte`);

    if (s.politique === 'FACT_REQUIRED') {
      if (!s.typeFait) out.push(`${id} : \`FACT_REQUIRED\` sans type de fait`);
      if (rangDuNiveau(s.niveauMax) < 0) out.push(`${id} : \`FACT_REQUIRED\` sans niveau maximal valide`);
    }
    if (s.politique === 'NO_FACT' && s.typeFait) {
      out.push(`${id} : \`NO_FACT\` mais un type de fait est déclaré`);
    }
    if (s.typeFait && ![...FAITS_NOUVEAUX, ...FAITS_EXISTANTS].includes(s.typeFait)) {
      out.push(`${id} : type de fait hors vocabulaire « ${s.typeFait} »`);
    }
    if (s.niveauMax !== null && rangDuNiveau(s.niveauMax) < 0) {
      out.push(`${id} : niveau maximal inconnu « ${s.niveauMax} »`);
    }
  }
  // Une surface ne peut pas être à la fois de pratique et de lecture.
  for (const id of SURFACES_DE_LECTURE) {
    if (SURFACES[id]) out.push(`${id} : déclarée à la fois de pratique et de lecture`);
  }
  return out;
}
