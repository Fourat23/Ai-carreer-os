// V74 · CP7 — MOTEUR DE REMÉDIATION. QUE FAIRE APRÈS UN ÉCHEC.
//
// ── LA RÈGLE QUI COMMANDE TOUT LE MODULE ─────────────────────────────────
//
// **Ne pas simplement redonner la réponse.** La correction complète existe,
// elle est légitime, et elle est la DERNIÈRE marche — jamais la première.
// Un produit qui répond à chaque échec par la solution n'enseigne pas : il
// transforme un exercice en lecture, et le contrat gelé (§1.4, condition R-b)
// dit précisément qu'une tentative postérieure à l'ouverture de la correction
// ne vaut plus RÉCUPÉRATION. Donner la réponse trop tôt ne se contente pas de
// mal aider : **cela détruit la seule mesure objective du produit**.
//
// ── CE QUE CE MODULE N'EST PAS ───────────────────────────────────────────
//
// Ce n'est ni un quatrième moteur de répétition espacée (il ne définit aucune
// échéance de rappel : il rend un DÉLAI DE REPRISE de séance, ce qui est autre
// chose), ni un second registre de misconceptions — `lib/misconceptions.mjs`
// existe depuis longtemps, porte 57 entrées sur 18 compétences, et ce module
// le CONSOMME au lieu de le doubler.
//
// Il n'écrit AUCUN contenu pédagogique. Comme `lib/retrieval-task.mjs` au CP5,
// il produit une CONSIGNE et un POINTEUR vers une section réelle, un test réel,
// ou un exercice réel. Le savoir reste dans les 128 leçons écrites par un
// humain.
//
// ── SUBSTRAT MESURÉ AVANT D'ÊTRE UTILISÉ (scripts/v74/cp7-…-substrat.mjs) ──
//
//   « Modèle mental »        128/128 leçons        « Erreurs fréquentes » 128/128
//   « Exemple guidé »        128/128 leçons        « Anti-patterns »       51/128
//   « Correction attendue »  127/128 leçons        misconception nommant l'exercice
//   voisin strictement plus simple : 331/376 exercices (médiane 7 candidats)
//                                                   121/376 exercices
//   tests par exercice : médiane 3, min 1, 0 exercice sans test public, 0 test sans nom
//
// Aucune marche n'a été inventée avant d'avoir vérifié qu'elle avait de la
// matière. Les deux marches à couverture partielle (misconception 32 %,
// exercice plus simple 88 %) ont un REPLI explicite, et ce repli ne saute
// jamais à la correction.
//
// ── PURETÉ (critère bloquant B2) ─────────────────────────────────────────
//
// Aucune I/O, aucune horloge lue, aucun aléa. `now` est injecté, les
// ressources sont injectées. À entrée identique, sortie strictement identique.

/** Les sept actions du brief, dans l'ordre CROISSANT d'assistance donnée. */
export const ACTIONS = [
  'SOUS_PROBLEME',
  'MODELE_MENTAL',
  'INDICE',
  'EXEMPLE_ANALOGUE',
  'EXERCICE_PLUS_SIMPLE',
  'CORRECTION_COMPLETE',
  'TENTATIVE_DIFFEREE',
];

/**
 * Coût en minutes de chaque action. ORDRES DE GRANDEUR DÉCLARÉS, pas des
 * mesures — aucune donnée d'apprenant réel n'existe pour les calibrer, et le
 * contrat interdit de présenter un chiffre inventé comme mesuré (G7).
 * Publiés et configurables ; consommés par l'arbitrage de budget du CP10.
 */
export const MINUTES_PAR_ACTION = {
  SOUS_PROBLEME: 5,
  MODELE_MENTAL: 4,
  INDICE: 2,
  EXEMPLE_ANALOGUE: 6,
  EXERCICE_PLUS_SIMPLE: 12,
  CORRECTION_COMPLETE: 8,
  TENTATIVE_DIFFEREE: 0,
};

/** Fenêtre au-delà de laquelle deux échecs ne sont plus « la même séance ». */
export const FENETRE_MASSAGE_MIN = 20;

/** Nombre d'échecs dans la fenêtre à partir duquel on parle de pilonnage. */
export const ECHECS_MASSES = 4;

/**
 * Délai de reprise proposé par `TENTATIVE_DIFFEREE`. 20 heures, c'est-à-dire
 * « demain », pas « dans dix minutes » : reprendre à froid est la seule chose
 * qui distingue une difficulté de mémoire d'une fatigue de séance.
 *
 * Ce délai N'EST PAS une échéance de rappel espacé — celles-là appartiennent à
 * `INTERVALS` de V66 et ce module n'y touche pas (règle C11).
 */
export const DELAI_REPRISE_HEURES = 20;

/** Rang de la correction complète dans l'échelle. Au-delà, on ne monte plus. */
export const NIVEAU_CORRECTION = 5;

const MIN_MS = 60_000;
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const t = (s) => (typeof s === 'string' ? Date.parse(s) : NaN);

/**
 * ── L'ÉTAT DE LA SÉRIE ───────────────────────────────────────────────────
 *
 * Le niveau de l'échelle est le nombre d'échecs PÉDAGOGIQUES consécutifs sur
 * CET exercice, sans succès intercalé. Deux exclusions décident de tout :
 *
 *   1. **une tentative qui n'a pas atteint la phase `run` ne compte pas.**
 *      Un code qui ne compile pas ne dit rien de ce dont l'apprenant se
 *      souvient — le contrat §3.4 l'écrit déjà. Faire monter l'échelle sur une
 *      erreur de syntaxe conduirait à donner la correction complète à
 *      quelqu'un dont le seul tort est un point-virgule manquant ;
 *   2. **un succès remet le compteur à zéro.** L'échelle mesure un blocage en
 *      cours, pas un casier judiciaire.
 *
 * `progression` répond à une question que le seul compteur ne pose pas :
 * l'apprenant fait-il passer PLUS de tests qu'à l'échec précédent ? Quelqu'un
 * qui progresse n'a pas besoin de plus d'aide, il a besoin de continuer.
 */
export function serieEchecs(attempts, exerciseId, { now } = {}) {
  const list = (Array.isArray(attempts) ? attempts : [])
    .filter((a) => isObj(a) && a.exerciseId === exerciseId);

  let niveau = 0;
  let precedentPasses = null;
  let progression = false;
  let dernier = null;
  const horodatages = [];

  for (const a of list) {
    if (a.outcome === 'success') {
      niveau = 0; precedentPasses = null; progression = false; horodatages.length = 0;
      continue;
    }
    if (a.phase !== 'run') continue;            // exclusion 1 : outillage, pas raisonnement
    niveau += 1;
    progression = precedentPasses !== null && (a.passed ?? 0) > precedentPasses;
    precedentPasses = a.passed ?? 0;
    dernier = a;
    horodatages.push(t(a.at));
  }

  // Échecs « massés » : ceux qui tombent dans la fenêtre glissante précédant
  // le dernier point de référence (le dernier échec, ou `now` s'il est fourni).
  const ref = Number.isFinite(t(now)) ? t(now) : horodatages[horodatages.length - 1];
  const masses = Number.isFinite(ref)
    ? horodatages.filter((h) => Number.isFinite(h) && ref - h <= FENETRE_MASSAGE_MIN * MIN_MS && h <= ref).length
    : 0;

  return { niveau, progression, dernier, masses, tentatives: list.length };
}

/**
 * ── LE CHOIX DU VOISIN PLUS SIMPLE ───────────────────────────────────────
 *
 * 331 exercices sur 376 en ont au moins un, avec une MÉDIANE DE 7 candidats.
 * Choisir au hasard parmi sept serait un aléa déguisé en pédagogie ; choisir
 * « le plus facile » enverrait quelqu'un bloqué au niveau 4 vers un exercice
 * de niveau 1, ce qui est décourageant et hors sujet.
 *
 * La règle est donc : **la difficulté la plus HAUTE strictement en dessous**
 * — la marche la plus petite qui descende — puis le plus grand nombre de
 * compétences en commun, puis l'identifiant. Le dernier critère n'est pas
 * cosmétique : sans lui, deux exécutions pourraient rendre deux voisins (B2).
 */
export function plusSimpleParmi(candidats, exercice) {
  const d = Number(exercice?.difficulty) || 0;
  const skills = new Set(exercice?.skills ?? []);
  const ok = (Array.isArray(candidats) ? candidats : []).filter((c) => isObj(c)
    && c.id !== exercice?.id
    && (Number(c.difficulty) || 0) < d
    && (c.skills ?? []).some((s) => skills.has(s)));
  if (!ok.length) return null;
  ok.sort((x, y) => {
    const dx = Number(x.difficulty) || 0; const dy = Number(y.difficulty) || 0;
    if (dx !== dy) return dy - dx;                                     // la plus petite marche
    const cx = (x.skills ?? []).filter((s) => skills.has(s)).length;
    const cy = (y.skills ?? []).filter((s) => skills.has(s)).length;
    if (cx !== cy) return cy - cx;
    return String(x.id).localeCompare(String(y.id));
  });
  return ok[0];
}

// ── Les marches, chacune adossée à une ressource RÉELLE ou refusée ────────
//
// Chaque constructeur rend `null` quand sa matière n'existe pas. `null` n'est
// pas un échec : c'est la réponse honnête, et le repli l'utilise.

const marcheSousProbleme = (testsEchoues) => {
  const nom = (Array.isArray(testsEchoues) ? testsEchoues : []).map((x) => (isObj(x) ? x.name : x))
    .filter((n) => typeof n === 'string' && n.trim())[0];
  if (!nom) return null;
  return {
    action: 'SOUS_PROBLEME',
    consigne: `Oublie les autres tests. Fais passer celui-ci, et seulement celui-ci : « ${nom} ».`,
    pointeur: { kind: 'test', ref: nom },
    note: 'Un échec sur plusieurs fronts se traite un front à la fois.',
  };
};

const marcheModeleMental = (sections) => {
  if (!sections?.modeleMental) return null;
  return {
    action: 'MODELE_MENTAL',
    consigne: 'Ferme l’éditeur. Relis la section « Modèle mental » de la leçon, puis réécris en deux lignes ce que cette fonction doit faire AVANT de retoucher le code.',
    pointeur: { kind: 'section', ref: 'Modèle mental' },
    note: 'Zéro test qui passe ne signale presque jamais un détail : la forme du problème n’est pas tenue.',
  };
};

const marcheIndice = (misconception, sections, diagnostic) => {
  // La misconception est PRÉFÉRÉE quand elle existe : elle nomme ce qui est
  // probablement cru à tort, là où une section renvoie à une liste.
  if (misconception?.right) {
    return {
      action: 'INDICE',
      consigne: `Vérifie une idée précise avant de recoder : ${misconception.right}`,
      pointeur: { kind: 'misconception', ref: misconception.id ?? null },
      note: 'Indice tiré du registre de misconceptions du produit, pas rédigé pour l’occasion.',
    };
  }
  if (typeof diagnostic === 'string' && diagnostic.trim()) {
    return {
      action: 'INDICE',
      consigne: diagnostic.trim(),
      pointeur: { kind: 'diagnostic', ref: null },
      note: 'Indice d’outillage : il porte sur le message du compilateur, pas sur la notion.',
    };
  }
  if (sections?.erreurs) {
    return {
      action: 'INDICE',
      consigne: 'Parcours la section « Erreurs fréquentes » de la leçon et cherche laquelle décrit ton cas. Ne corrige rien avant de l’avoir trouvée.',
      pointeur: { kind: 'section', ref: 'Erreurs fréquentes' },
      note: null,
    };
  }
  if (sections?.antipatterns) {
    return {
      action: 'INDICE',
      consigne: 'Parcours la section « Anti-patterns » de la leçon et cherche lequel décrit ton code.',
      pointeur: { kind: 'section', ref: 'Anti-patterns' },
      note: null,
    };
  }
  return null;
};

const marcheExempleAnalogue = (sections) => {
  const ref = sections?.exempleGuide ? 'Exemple guidé'
    : sections?.exempleApplique ? 'Exemple appliqué' : null;
  if (!ref) return null;
  return {
    action: 'EXEMPLE_ANALOGUE',
    consigne: `Lis la section « ${ref} » de la leçon, puis reviens à l’exercice SANS l’avoir sous les yeux et refais le même raisonnement sur ton cas.`,
    pointeur: { kind: 'section', ref },
    note: 'Un exemple travaillé n’est utile que s’il est refermé avant d’agir.',
  };
};

const marcheExercicePlusSimple = (voisin) => {
  if (!voisin?.id) return null;
  return {
    action: 'EXERCICE_PLUS_SIMPLE',
    consigne: `Mets celui-ci de côté et fais d’abord « ${voisin.title ?? voisin.id} ». Il mobilise la même notion sur un cas plus court.`,
    pointeur: { kind: 'exercise', ref: voisin.id },
    note: 'Le voisin choisi est celui dont la difficulté est immédiatement inférieure — la plus petite marche qui descende.',
  };
};

const marcheCorrection = (sections) => ({
  action: 'CORRECTION_COMPLETE',
  consigne: sections?.correction
    ? 'Ouvre la correction. Puis ferme-la et réécris la solution de mémoire : c’est cette seconde écriture qui apprend, pas la lecture.'
    : 'Ouvre la solution de référence de l’exercice, puis réécris-la de mémoire sans la relire.',
  pointeur: sections?.correction ? { kind: 'section', ref: 'Correction attendue' } : { kind: 'reference', ref: null },
  note: 'Dernière marche. Le contrat §1.4 rappelle qu’une tentative postérieure ne comptera plus comme récupération.',
});

const marcheDifferee = (raison, now) => ({
  action: 'TENTATIVE_DIFFEREE',
  consigne: 'Arrête cet exercice pour aujourd’hui. Reprends-le à froid.',
  pointeur: { kind: 'delai', ref: `${DELAI_REPRISE_HEURES} h` },
  note: raison,
  reprendreApres: Number.isFinite(t(now))
    ? new Date(t(now) + DELAI_REPRISE_HEURES * 3600_000).toISOString()
    : null,
});

/**
 * ── LA DÉCISION ──────────────────────────────────────────────────────────
 *
 * L'échelle nominale, du moins assisté au plus assisté :
 *
 *   niveau 1, des tests passent   → SOUS_PROBLEME       (il avance : on le focalise)
 *   niveau 1, zéro test ne passe  → MODELE_MENTAL       (la forme n'est pas tenue)
 *   niveau 2                      → INDICE              (misconception, sinon « Erreurs fréquentes »)
 *   niveau 3 avec progression     → SOUS_PROBLEME       (le test suivant qui échoue)
 *   niveau 3 sans progression     → EXEMPLE_ANALOGUE
 *   niveau 4                      → EXERCICE_PLUS_SIMPLE
 *   niveau 5 et au-delà           → CORRECTION_COMPLETE
 *
 * Trois DÉROGATIONS s'appliquent avant, et leur ordre EST la décision :
 *
 *   D1. tentative hors phase `run` → INDICE d'outillage, et **le niveau ne
 *       monte pas**. Un point-virgule manquant n'est pas une difficulté
 *       d'apprentissage ;
 *   D2. correction DÉJÀ VUE → TENTATIVE_DIFFEREE. Proposer un indice à
 *       quelqu'un qui a la réponse sous les yeux est du théâtre, et lui
 *       reproposer la correction ne lui apprend rien. Seule une reprise
 *       espacée peut encore produire un signal ;
 *   D3. PILONNAGE (≥ 4 échecs en 20 min) et échelle pas encore au bout →
 *       TENTATIVE_DIFFEREE. Passé un point, répéter dans la même séance n'est
 *       plus de l'apprentissage. **La dérogation s'arrête au niveau de la
 *       correction** : le report existe pour empêcher de donner la réponse à
 *       quelqu'un qui pilonne, il ne doit pas devenir un moyen de ne jamais la
 *       donner.
 *
 * REPLI : si la marche nominale n'a pas de matière (pas de misconception, pas
 * de voisin plus simple, pas de section), on descend vers la marche disponible
 * la plus proche — **jamais vers la correction**, qui reste réservée au
 * niveau 5. Une marche sans matière ne doit pas devenir un raccourci vers la
 * réponse.
 *
 * @returns { action, niveau, consigne, pointeur, minutes, raison, prochaine, note, reprendreApres }
 */
export function remedier({
  attempts = [],
  exerciseId,
  now = null,
  sections = {},
  misconception = null,
  voisinPlusSimple = null,
  testsEchoues = [],
  diagnostic = null,
  correctionVue = false,
} = {}) {
  const serie = serieEchecs(attempts, exerciseId, { now });
  const dernier = serie.dernier;

  const rendre = (marche, raison, niveau) => (marche ? {
    ...marche,
    niveau,
    minutes: MINUTES_PAR_ACTION[marche.action] ?? 0,
    raison,
    prochaine: niveau >= NIVEAU_CORRECTION ? null : prochaineMarche(niveau),
    reprendreApres: marche.reprendreApres ?? null,
  } : null);

  // Aucune tentative en phase `run` : rien à remédier. Ce n'est pas « tout va
  // bien », c'est « le moteur n'a rien observé » — la distinction est le G9.
  const derniereBrute = (Array.isArray(attempts) ? attempts : [])
    .filter((a) => isObj(a) && a.exerciseId === exerciseId).slice(-1)[0] ?? null;

  // ── D1 · outillage avant raisonnement ──
  if (derniereBrute && derniereBrute.phase !== 'run') {
    const m = marcheIndice(null, sections, diagnostic)
      ?? { action: 'INDICE', consigne: 'Le code n’a pas pu s’exécuter. Corrige d’abord l’erreur signalée par l’outil, avant toute question de fond.', pointeur: { kind: 'diagnostic', ref: null }, note: null };
    return rendre(m, `la tentative n’a pas atteint l’exécution (${derniereBrute.phase}) : l’échec ne dit rien de la notion, et il ne fait pas monter l’échelle`, serie.niveau);
  }

  if (!dernier || serie.niveau === 0) return null;

  // ── D2 · la correction est déjà connue ──
  const vue = correctionVue || dernier.correctionSeen === true;
  if (vue) {
    return rendre(
      marcheDifferee('La correction a déjà été ouverte : une aide de plus ne prouverait rien. Seule une reprise à froid le peut.', now),
      'correction déjà vue : l’échelle d’aide est fermée (condition R-b du contrat gelé)',
      serie.niveau,
    );
  }

  // ── D3 · pilonnage ──
  if (serie.masses >= ECHECS_MASSES && serie.niveau < NIVEAU_CORRECTION) {
    return rendre(
      marcheDifferee(`${serie.masses} échecs en moins de ${FENETRE_MASSAGE_MIN} minutes : ce qui manque n’est plus une explication.`, now),
      'échecs massés dans une seule séance : reprendre à froid vaut mieux qu’une aide de plus',
      serie.niveau,
    );
  }

  const n = serie.niveau;
  const aucunTestPasse = (dernier.passed ?? 0) === 0;

  // Marches disponibles, dans l'ordre de repli (la correction en est exclue).
  const dispo = [
    marcheSousProbleme(testsEchoues),
    marcheModeleMental(sections),
    marcheIndice(misconception, sections, diagnostic),
    marcheExempleAnalogue(sections),
    marcheExercicePlusSimple(voisinPlusSimple),
  ];
  const parAction = new Map(dispo.filter(Boolean).map((m) => [m.action, m]));
  const replier = (voulue, raison) => {
    if (parAction.has(voulue)) return rendre(parAction.get(voulue), raison, n);
    const m = dispo.find(Boolean);
    if (!m) return rendre(marcheDifferee('Aucune ressource de remédiation n’est disponible pour cet exercice.', now), 'aucune marche n’a de matière : on ne fabrique pas d’aide, et on ne saute pas à la réponse', n);
    return rendre(m, `${raison} — repli : la marche prévue n’a pas de matière sur cet exercice`, n);
  };

  if (n >= NIVEAU_CORRECTION) {
    return rendre(marcheCorrection(sections), `${n} échecs successifs : la réponse est due, et elle arrive en dernier`, n);
  }
  if (n === 1) {
    return aucunTestPasse
      ? replier('MODELE_MENTAL', 'premier échec, aucun test ne passe : c’est la forme du problème qui manque, pas un détail')
      : replier('SOUS_PROBLEME', `premier échec, ${dernier.passed}/${dernier.total} tests passent : il avance, on le focalise plutôt que de l’aider`);
  }
  if (n === 2) {
    return replier('INDICE', misconception?.right
      ? 'deuxième échec, et une idée fausse est enregistrée sur cet exercice : on la nomme'
      : 'deuxième échec : un indice ciblé, pas encore un exemple');
  }
  if (n === 3) {
    return serie.progression
      ? replier('SOUS_PROBLEME', `troisième échec mais ${dernier.passed}/${dernier.total} tests passent désormais : il progresse, on ne redescend pas l’échelle`)
      : replier('EXEMPLE_ANALOGUE', 'troisième échec sans progression : un raisonnement travaillé de bout en bout, sur un cas voisin');
  }
  return replier('EXERCICE_PLUS_SIMPLE', 'quatrième échec : la marche est trop haute, on en prend une plus basse sur la même notion');
}

/**
 * ── QUELLE LEÇON EST « LA » LEÇON D'UN EXERCICE ? ────────────────────────
 *
 * La règle vit ICI, dans le module pur, et non dans le module serveur, pour
 * une raison de méthode : elle doit être MESURABLE. Le CP0 de V73 a produit
 * l'anomalie n° 21 — une sonde qui mesurait une chose et concluait sur une
 * autre — précisément parce que la sonde réimplémentait la règle du produit.
 * Ici la sonde et le produit appellent la MÊME fonction ; seule la lecture des
 * fichiers diffère.
 *
 * Deux chemins, dans cet ordre, et le second est un repli assumé :
 *   1. la leçon qui DÉCLARE l'exercice, si elle est unique. C'est la règle
 *      §3.4 du contrat gelé, celle du CP2 : un exercice déclaré par plusieurs
 *      leçons n'est rattaché à AUCUNE, parce que choisir fabriquerait de la
 *      donnée (le CP1 a mesuré 3 candidates en médiane, jusqu'à 15) ;
 *   2. à défaut, la leçon enseignée par les journées qui portent l'exercice,
 *      à la même condition d'unicité.
 *
 * L'ordre n'est pas arbitraire : un rattachement par déclaration est une
 * INTENTION D'AUTEUR, un rattachement par journée est une COÏNCIDENCE DE
 * CALENDRIER. La seconde ne doit jamais l'emporter sur la première.
 */
export function leconUnique(slugsDeclarants, slugsParJournee) {
  const d = [...new Set((slugsDeclarants ?? []).filter((s) => typeof s === 'string'))];
  if (d.length === 1) return { slug: d[0], via: 'declaration' };
  const j = [...new Set((slugsParJournee ?? []).filter((s) => typeof s === 'string'))];
  if (j.length === 1) return { slug: j[0], via: 'journee' };
  return null;
}

/** Ce qui suivrait si la marche courante ne suffisait pas. Sert au CP12. */
export function prochaineMarche(niveau) {
  const n = Number(niveau) || 0;
  if (n <= 0) return 'SOUS_PROBLEME';
  if (n === 1) return 'INDICE';
  if (n === 2) return 'EXEMPLE_ANALOGUE';
  if (n === 3) return 'EXERCICE_PLUS_SIMPLE';
  return 'CORRECTION_COMPLETE';
}
