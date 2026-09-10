// V74 · CP5 — RETRIEVAL TASK GENERATOR. Douze archétypes, zéro invention.
//
// ── LA RÈGLE ABSOLUE DE CE MODULE ────────────────────────────────────────
//
// **Une tâche de rappel cite une section RÉELLE de la leçon, ou elle n'existe
// pas.** Le brief est explicite : « la génération doit s'appuyer sur les leçons
// existantes, pas fabriquer arbitrairement une nouvelle connaissance ».
//
// Conséquence directe et voulue : un archétype n'est PAS disponible partout.
// Une leçon sans « Questions d'entretien » ne produira jamais de question
// conceptuelle. On préfère un archétype absent à un archétype inventé — et le
// compte réel de disponibilité est publié, jamais arrondi vers le haut.
//
// ── CE QUE CE MODULE NE FAIT PAS ─────────────────────────────────────────
//
// Il ne rédige pas de contenu pédagogique. Il produit une CONSIGNE et un
// POINTEUR : « fais ceci, puis compare avec cette section ». Le savoir reste
// dans les 128 leçons, écrites par un humain ; le générateur ne fait que
// choisir quoi demander et où vérifier.
//
// Aucune I/O, aucune horloge, aucun aléa : les sections disponibles entrent par
// argument. Deux appels identiques rendent une sortie identique (B2).
//
// ── LE PONT AVEC LES CINQ FORMES DE V66 ──────────────────────────────────
//
// V66 planifie en cinq formes (`free/cued/applied/discrim/generate`) : c'est le
// vocabulaire de PLANIFICATION, et le contrat §4 lui en laisse la
// responsabilité. Les douze archétypes ci-dessous en sont les RÉALISATIONS
// concrètes. Chacun déclare la forme qu'il sert.
//
// Contrat gelé : docs/v74/V74-RETENTION-CONTRACT-FROZEN.md §1.5, §4, §6.

/**
 * Reconnaissance d'une section, par son TITRE tel que le corpus l'écrit.
 *
 * ANOMALIE DE SONDE n° 6 DE V74, PUBLIÉE ET CORRIGÉE ICI. Deux motifs étaient
 * ANCRÉS EN DÉBUT DE CHAÎNE — `/^objectif/i` et `/^correction/i`. Or les titres
 * du corpus commencent par un émoji : le titre réel est « 🎯 Objectif », pas
 * « Objectif ». L'archétype FEYNMAN, qui exige `vocabulaire` ET `objectif`,
 * sortait donc **disponible sur 0 leçon sur 128** alors que ses deux sections
 * existent sur les 128. Un archétype à zéro aurait pu passer pour un constat de
 * corpus ; c'était un défaut de motif.
 *
 * Les motifs ne sont donc plus ancrés, et l'émoji est retiré avant comparaison.
 * Un motif de reconnaissance de section ne doit rien supposer de la décoration
 * du titre.
 */
const SECTION = {
  probleme: /probl[eè]me d.abord/i,
  objectif: /objectif/i,
  modeleMental: /mod[eè]le mental/i,
  prerequis: /pr[eé]requis/i,
  aRetenir: /[àa] retenir/i,
  vocabulaire: /vocabulaire/i,
  liens: /liens avec le programme/i,
  explication: /explication compl|explication progressive/i,
  erreurs: /erreurs fr[eé]quentes/i,
  antipatterns: /anti-?patterns/i,
  entretien: /questions? d.entretien/i,
  miniExercice: /mini-?exercice/i,
  exerciceDur: /exercice plus difficile/i,
  checklist: /checklist/i,
  exempleGuide: /exemple guid/i,
  exempleApplique: /exemple appliqu/i,
  casMetier: /cas m[eé]tier|cas professionnel/i,
  correction: /correction/i,
  verification: /v[eé]rification de compr[eé]hension/i,
};

// L'émoji de tête est retiré avant comparaison : il décore le titre, il ne le
// définit pas.
const nu = (t) => String(t).replace(/^[^\p{L}]+/u, '').trim();
const a = (titres, cle) => titres.some((t) => SECTION[cle].test(nu(t)));

/**
 * ── LES DOUZE ARCHÉTYPES ─────────────────────────────────────────────────
 *
 * Chacun déclare :
 *   `forme`      — la forme V66 qu'il réalise ;
 *   `exige`      — les sections SANS lesquelles il n'existe pas ;
 *   `exigeCode`  — la leçon doit porter au moins un bloc de code ;
 *   `minutes`    — ordre de grandeur DÉCLARÉ (aucune donnée ne le calibre) ;
 *   `consigne`   — ce que l'apprenant doit faire, au présent, sans jargon ;
 *   `verifier`   — où il va comparer, une fois qu'il a produit sa réponse.
 *
 * L'ordre de la liste est l'ordre de préférence à forme égale. Il n'est pas
 * arbitraire : il va du plus exigeant en récupération au plus soutenu.
 */
export const ARCHETYPES = [
  {
    id: 'FREE_RECALL', forme: 'free', minutes: 4,
    exige: ['probleme', 'modeleMental'], exigeCode: false,
    titre: 'Rappel libre',
    consigne: 'Sans rouvrir la leçon : écris en trois lignes le modèle mental de cette notion, et le problème auquel elle répond.',
    verifier: 'modeleMental',
    note: 'La restitution sans support est la seule opération dont on tire un signal de rétention. Elle est en tête parce qu\'elle est la plus exigeante.',
  },
  {
    id: 'FEYNMAN', forme: 'free', minutes: 5,
    exige: ['vocabulaire', 'objectif'], exigeCode: false,
    titre: 'Explication Feynman',
    consigne: 'Explique cette notion à quelqu\'un qui n\'est pas développeur, en cinq phrases, SANS employer les mots de la section Vocabulaire.',
    verifier: 'vocabulaire',
    note: 'S\'interdire le vocabulaire technique force à posséder l\'idée plutôt que la formule.',
  },
  {
    id: 'CONCEPTUAL_QUESTION', forme: 'cued', minutes: 3,
    exige: ['entretien'], exigeCode: false,
    titre: 'Question conceptuelle',
    consigne: 'Réponds à voix haute aux questions d\'entretien de la leçon, sans les relire d\'abord.',
    verifier: 'entretien',
  },
  {
    id: 'PREREQUISITE_CHAIN', forme: 'cued', minutes: 3,
    exige: ['prerequis', 'liens'], exigeCode: false,
    titre: 'Chaîne de prérequis',
    consigne: 'Cite la notion antérieure sans laquelle celle-ci ne tiendrait pas, et dis ce qui casserait si tu l\'avais oubliée.',
    verifier: 'prerequis',
    note: 'Un prérequis oublié ne se manifeste pas comme un oubli : il se manifeste comme une incompréhension du sujet actuel.',
  },
  {
    id: 'PREDICT_BEFORE_RUN', forme: 'applied', minutes: 6,
    exige: ['explication'], exigeCode: true,
    titre: 'Prédiction avant exécution',
    consigne: 'Prends le premier bloc de code de la leçon. AVANT de l\'exécuter, écris ce qu\'il produit — sortie exacte, ou erreur attendue. Exécute ensuite.',
    verifier: 'explication',
    note: 'Prédire puis vérifier crée un écart mesurable par l\'apprenant lui-même. Exécuter d\'abord ne le crée pas.',
  },
  {
    id: 'MINI_IMPLEMENTATION', forme: 'applied', minutes: 8,
    exige: ['miniExercice'], exigeCode: false,
    titre: 'Mini-implémentation',
    consigne: 'Refais le mini-exercice de la leçon, sans regarder la correction.',
    verifier: 'correction',
  },
  {
    id: 'HARDER_IMPLEMENTATION', forme: 'applied', minutes: 12,
    exige: ['exerciceDur'], exigeCode: false,
    titre: 'Version difficile',
    consigne: 'Attaque l\'exercice plus difficile de la leçon. Si tu bloques plus de dix minutes, note où exactement — c\'est cette ligne qui compte.',
    verifier: 'correction',
  },
  {
    id: 'DEBUG', forme: 'discrim', minutes: 5,
    exige: ['erreurs'], exigeCode: false,
    titre: 'Diagnostic d\'erreur',
    consigne: 'Prends une erreur fréquente de la leçon. Explique ce qui la produit, à quel symptôme tu la reconnais, et ce que tu regardes en premier.',
    verifier: 'erreurs',
  },
  {
    id: 'SOLUTION_COMPARISON', forme: 'discrim', minutes: 6,
    exige: ['antipatterns'], exigeCode: false,
    titre: 'Comparaison de solutions',
    consigne: 'Compare un anti-pattern de la leçon avec la bonne approche, et nomme la seule différence qui compte vraiment.',
    verifier: 'antipatterns',
    note: 'Distinguer deux solutions proches est plus exigeant que de reconnaître la bonne isolée.',
  },
  {
    id: 'TECHNICAL_DECISION', forme: 'generate', minutes: 6,
    exige: ['casMetier'], exigeCode: false,
    titre: 'Décision technique',
    consigne: 'Reprends le cas métier de la leçon. Choisis une option, écris les deux raisons qui te décident, et la condition qui te ferait changer d\'avis.',
    verifier: 'casMetier',
    note: 'La condition de changement d\'avis est ce qui distingue une décision d\'une préférence.',
  },
  {
    id: 'PARTIAL_RECONSTRUCTION', forme: 'generate', minutes: 5,
    exige: ['checklist'], exigeCode: false,
    titre: 'Reconstruction de la checklist',
    consigne: 'Reconstitue de mémoire la checklist « quand suis-je prêt ? » de la leçon, puis compare. Ce que tu as oublié est ce que tu ne vérifies jamais.',
    verifier: 'checklist',
  },
  {
    id: 'BUSINESS_TRANSFER', forme: 'generate', minutes: 7,
    exige: ['liens', 'aRetenir'], exigeCode: false,
    titre: 'Transfert métier',
    consigne: 'Décris une situation de TON projet en cours où cette notion s\'applique, et ce qu\'elle t\'y ferait faire différemment.',
    verifier: 'liens',
    note: 'Transférer hors du contexte d\'origine est le seul test qui distingue une notion apprise d\'une notion récitée.',
  },
];

/** Libellé lisible d'une section, pour l'endroit où l'apprenant va comparer. */
export const SECTION_LABEL = {
  probleme: 'Le problème d\'abord', objectif: 'Objectif', modeleMental: 'Modèle mental',
  prerequis: 'Prérequis', aRetenir: 'À retenir', vocabulaire: 'Vocabulaire',
  liens: 'Liens avec le programme', explication: 'Explication complète',
  erreurs: 'Erreurs fréquentes', antipatterns: 'Anti-patterns',
  entretien: 'Questions d\'entretien', miniExercice: 'Mini-exercice',
  exerciceDur: 'Exercice plus difficile', checklist: 'Checklist',
  exempleGuide: 'Exemple guidé', exempleApplique: 'Exemple appliqué',
  casMetier: 'Cas métier', correction: 'Correction attendue',
  verification: 'Vérification de compréhension',
};

/**
 * Archétypes RÉELLEMENT disponibles pour une leçon.
 *
 * @param titres  titres de sections `##` de la leçon, tels quels
 * @param aDuCode la leçon porte-t-elle au moins un bloc de code
 *
 * Une leçon qui ne porte pas la section exigée ne produit pas l'archétype.
 * C'est la règle du module, et c'est ce qui l'empêche d'inventer.
 */
export function archetypesDisponibles(titres, aDuCode = false) {
  const t = Array.isArray(titres) ? titres.map(String) : [];
  return ARCHETYPES.filter((arch) => {
    if (arch.exigeCode && !aDuCode) return false;
    return arch.exige.every((cle) => a(t, cle));
  });
}

/**
 * La TÂCHE à poser, pour une forme demandée par le scheduler.
 *
 * @returns { archetype, titre, consigne, verifier, minutes, forme } ou `null`
 *
 * `null` n'est pas un échec : c'est la réponse honnête quand la leçon ne porte
 * pas de quoi poser une question de cette forme. Le scheduler l'écarte alors
 * en le disant, plutôt que de fabriquer une consigne creuse.
 */
export function tachePour(forme, titres, aDuCode = false, { exclure = [] } = {}) {
  const dispo = archetypesDisponibles(titres, aDuCode)
    .filter((arch) => arch.forme === forme && !exclure.includes(arch.id));
  const arch = dispo[0] ?? null;
  if (!arch) return null;
  return {
    archetype: arch.id,
    forme: arch.forme,
    titre: arch.titre,
    consigne: arch.consigne,
    verifier: SECTION_LABEL[arch.verifier] ?? arch.verifier,
    minutes: arch.minutes,
    note: arch.note ?? null,
  };
}

/**
 * Couverture RÉELLE des archétypes sur un corpus. Publiée telle quelle : un
 * archétype disponible sur 39 leçons sur 128 est écrit 39, jamais « la
 * majorité ».
 *
 * @param lecons  [{ id, titres, aDuCode }]
 */
export function couverture(lecons) {
  const out = ARCHETYPES.map((arch) => ({ id: arch.id, forme: arch.forme, lecons: 0, minutes: arch.minutes }));
  const index = new Map(out.map((o) => [o.id, o]));
  let sansAucun = 0;
  for (const l of lecons) {
    const d = archetypesDisponibles(l.titres, l.aDuCode);
    if (d.length === 0) sansAucun += 1;
    for (const arch of d) index.get(arch.id).lecons += 1;
  }
  return {
    total: lecons.length,
    archetypes: out.sort((x, y) => y.lecons - x.lecons),
    leconsSansAucunArchetype: sansAucun,
    formesCouvertes: [...new Set(out.filter((o) => o.lecons > 0).map((o) => o.forme))].sort(),
  };
}
