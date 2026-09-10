// V74 · CP3 — RETENTION PRIORITY MODEL. Priorité EXPLICABLE, pas score magique.
//
// ── LA RÈGLE QUI COMMANDE CE MODULE ──────────────────────────────────────
//
// Une priorité qu'on ne peut pas expliquer n'a pas le droit d'exister ici.
// Chaque unité proposée porte une TRACE : la liste des facteurs qui ont pesé,
// leur valeur observée, leur poids, et la phrase qui les rend lisibles. C'est
// le critère bloquant B10 du contrat gelé, et il est vérifié en test.
//
// Conséquence de conception : les facteurs sont ADDITIFS et BORNÉS. Pas de
// produit, pas d'exponentielle, pas de facteur de facilité flottant. On doit
// pouvoir dire « 40 points sur 100 viennent de ceci » sans dérouler un calcul.
//
// ── CE QUE CE SCORE N'EST PAS ────────────────────────────────────────────
//
// Ce n'est PAS une probabilité d'oubli. Le CP0 a déclaré cette grandeur
// UNMEASURABLE : aucun apprenant humain n'a jamais suivi ce parcours sous
// mesure. Le nombre produit ici est un ORDRE DE PASSAGE, rien d'autre. Il
// n'est jamais montré à l'apprenant sous forme chiffrée — le §9 du contrat
// l'interdit nommément (« memory score = 0.637 »).
//
// ── LES POIDS ────────────────────────────────────────────────────────────
//
// Ils sont déclarés, entiers, et publiés. Ils n'ont PAS été réglés pour
// produire une distribution agréable : le §6 G11 interdit de déplacer un
// paramètre jusqu'à ce que les statistiques soient jolies. Ils traduisent un
// ordre de grandeur assumé, contestable, et modifiable à une seule condition —
// que la raison soit écrite.
//
// Contrat gelé : docs/v74/V74-RETENTION-CONTRACT-FROZEN.md §2, §6, §7.

const DAY_MS = 86_400_000;

/**
 * Poids maximaux par facteur. La somme fait 100 : le score est donc lisible
 * comme un pourcentage de « ce qui pourrait justifier une réactivation ».
 */
export const POIDS = {
  ancienneteRappel: 30,   // combien de temps depuis le dernier rappel RÉUSSI
  echecRecent: 20,        // un échec non repris est le signal le plus actionnable
  jamaisTente: 15,        // exposé mais jamais mis à l'épreuve
  besoinProche: 15,       // un projet va l'exiger bientôt
  niveauPromis: 10,       // la promesse est haute, l'exigence de solidité l'est aussi
  profondeurPrerequis: 5, // beaucoup d'autres notions reposent dessus
  contactPassif: 5,       // il n'y a eu que de la lecture, jamais de production
};

/** Somme des poids — vérifiée en test pour qu'aucune dérive silencieuse ne passe. */
export const POIDS_TOTAL = Object.values(POIDS).reduce((a, b) => a + b, 0);

/** Fenêtres opérationnelles du §2 du contrat. Gelées. */
export const FENETRE_SOON = 3;
export const TOLERANCE_DUE = 7;

/** Horizon au-delà duquel l'ancienneté ne dit plus rien de plus. */
export const HORIZON_JOURS = 90;

const joursEntre = (a, b) => (!a || !b ? null : Math.floor((Date.parse(b) - Date.parse(a)) / DAY_MS));
const borne = (x, min, max) => Math.max(min, Math.min(max, x));

/**
 * ── LE STATUT (§2) ───────────────────────────────────────────────────────
 *
 * L'ordre d'évaluation EST la règle. Il est explicite ici pour pouvoir être
 * contesté, et il est testé négativement au CP14.
 *
 *   1. UNKNOWN  — jamais exposé, ou exposé sans aucun contact significatif
 *   2. OVERDUE  — échéance dépassée de plus de 7 jours, OU dernier rappel en
 *                 échec sans reprise depuis
 *   3. DUE      — échéance atteinte, dépassée d'au plus 7 jours
 *   4. SOON     — échéance dans les 3 jours
 *   5. HEALTHY  — tout le reste
 *
 * `dueAt` est fourni par le scheduler (CP4). Tant qu'il n'existe pas, une
 * unité jamais tentée est UNKNOWN et une unité tentée est jugée sur son seul
 * dernier échec — jamais sur une échéance devinée.
 */
export function statutDe(fiche, dueAt, now) {
  if (!fiche.lastMeaningfulContactAt) return 'UNKNOWN';
  const echecNonRepris = fiche.lastFailureAt
    && (!fiche.lastSuccessAt || fiche.lastSuccessAt < fiche.lastFailureAt);
  const retard = dueAt ? joursEntre(dueAt, now) : null;
  if (retard !== null && retard > TOLERANCE_DUE) return 'OVERDUE';
  if (echecNonRepris) return 'OVERDUE';
  if (retard !== null && retard >= 0) return 'DUE';
  if (retard !== null && retard >= -FENETRE_SOON) return 'SOON';
  return 'HEALTHY';
}

/**
 * ── LES SEPT FACTEURS ────────────────────────────────────────────────────
 *
 * Chacun rend `{ points, valeur, phrase }`. La `phrase` est écrite au présent
 * et sans jargon : c'est elle que le CP12 montrera à l'apprenant, et elle ne
 * doit jamais contenir de nombre qui prétende décrire sa mémoire.
 */
function facteurAnciennete(f, now) {
  // Ancienneté depuis le dernier rappel RÉUSSI — pas depuis le dernier contact.
  // La distinction est le cœur du sujet : avoir revu une page hier ne dit rien,
  // avoir su la retrouver il y a trois semaines dit quelque chose.
  const depuis = f.lastSuccessAt ?? f.lastRetrievalAt;
  if (!depuis) return null;
  const j = joursEntre(depuis, now);
  if (j === null || j < 0) return null;
  const points = Math.round(POIDS.ancienneteRappel * borne(j / HORIZON_JOURS, 0, 1));
  return {
    id: 'ancienneteRappel', points, valeur: j,
    phrase: f.lastSuccessAt
      ? `tu l'as retrouvé il y a ${j} jour${j > 1 ? 's' : ''}`
      : `ta dernière tentative date d'il y a ${j} jour${j > 1 ? 's' : ''}`,
  };
}

function facteurEchec(f, now) {
  if (!f.lastFailureAt) return null;
  if (f.lastSuccessAt && f.lastSuccessAt > f.lastFailureAt) return null;   // déjà repris
  const j = joursEntre(f.lastFailureAt, now) ?? 0;
  return {
    id: 'echecRecent', points: POIDS.echecRecent, valeur: j,
    phrase: `ta dernière tentative n'a pas abouti, il y a ${j} jour${j > 1 ? 's' : ''}, et tu n'y es pas revenu depuis`,
  };
}

function facteurJamaisTente(f) {
  // Exposé — la question a un sens — mais aucune récupération n'a eu lieu.
  // C'est le cas le plus fréquent au début d'un parcours, et le plus silencieux :
  // rien n'échoue, donc rien n'alerte.
  if (!f.lastExposureAt) return null;
  if (f.retrievalCount > 0) return null;
  return {
    id: 'jamaisTente', points: POIDS.jamaisTente, valeur: 0,
    phrase: 'tu l\'as rencontré, mais tu ne l\'as jamais mis à l\'épreuve',
  };
}

function facteurBesoinProche(f) {
  const n = f.nextCurriculumNeed;
  if (!n || n.inDays == null || n.inDays < 0) return null;
  // Un besoin dans 30 jours ne presse pas ; un besoin dans 3 jours, oui.
  const points = Math.round(POIDS.besoinProche * borne(1 - n.inDays / 30, 0, 1));
  if (points === 0) return null;
  return {
    id: 'besoinProche', points, valeur: n.inDays,
    phrase: `tu en auras besoin dans ${n.inDays} jour${n.inDays > 1 ? 's' : ''}, au jour ${n.day}`,
  };
}

function facteurNiveauPromis(f) {
  const niv = f.currentExpectedLevel;
  if (!niv || niv < 3) return null;   // 1-2 : l'exposition suffit (contrat §7 N-a)
  const points = Math.round(POIDS.niveauPromis * ((niv - 2) / 3));
  return {
    id: 'niveauPromis', points, valeur: niv,
    phrase: `le parcours promet un niveau ${niv} sur 5 pour cette compétence`,
  };
}

function facteurProfondeur(f) {
  const p = f.prereqDepth;
  if (!p || p < 3) return null;
  const points = Math.round(POIDS.profondeurPrerequis * borne((p - 2) / 6, 0, 1));
  if (points === 0) return null;
  return {
    id: 'profondeurPrerequis', points, valeur: p,
    phrase: `d'autres notions s'appuient dessus (chaîne de prérequis de ${p})`,
  };
}

function facteurContactPassif(f) {
  // Il y a eu des contacts significatifs, mais AUCUN n'était une récupération :
  // des soumissions, des preuves, des tentatives avec la correction ouverte.
  if (!f.meaningfulContacts?.length) return null;
  if (f.retrievalCount > 0) return null;
  if (!f.lastExposureAt) return null;
  return {
    id: 'contactPassif', points: POIDS.contactPassif, valeur: f.meaningfulContacts.length,
    phrase: 'tu l\'as travaillé, mais jamais sans avoir la réponse sous les yeux',
  };
}

const FACTEURS = [
  facteurAnciennete, facteurEchec, facteurJamaisTente, facteurBesoinProche,
  facteurNiveauPromis, facteurProfondeur, facteurContactPassif,
];

/**
 * ── LA PRIORITÉ D'UNE UNITÉ ──────────────────────────────────────────────
 *
 * @returns { id, score, statut, facteurs[], pourquoi }
 *
 * `pourquoi` est la phrase que le produit peut afficher telle quelle. Elle
 * cite au plus DEUX facteurs : au-delà, une justification cesse d'être une
 * justification et devient un rapport.
 */
export function prioriteDe(fiche, { dueAt = null, now } = {}) {
  const statut = statutDe(fiche, dueAt, now);
  const facteurs = FACTEURS.map((fn) => fn(fiche, now)).filter(Boolean)
    .sort((a, b) => b.points - a.points);
  const score = facteurs.reduce((a, f) => a + f.points, 0);

  // Une unité jamais exposée n'est pas prioritaire : elle n'est pas encore au
  // programme. La proposer serait proposer de réviser ce qu'on n'a pas vu.
  const eligible = statut !== 'UNKNOWN' || fiche.lastExposureAt != null;

  // Au plus DEUX facteurs sont cités : au-delà, une justification cesse d'en
  // être une et devient un rapport. Les identifiants cités sont exposés à
  // part — découper la phrase ne marcherait pas, puisque certaines phrases
  // contiennent elles-mêmes une virgule et un « et ».
  const cites = facteurs.slice(0, 2);
  return {
    id: fiche.id,
    score: eligible ? score : 0,
    statut,
    eligible,
    facteurs,
    pourquoiFacteurs: cites.map((f) => f.id),
    pourquoi: cites.length ? `${cites.map((f) => f.phrase).join(', et ')}.` : 'aucun signal ne la désigne aujourd\'hui.',
  };
}

/**
 * ── L'ORDRE ──────────────────────────────────────────────────────────────
 *
 * Le tri est TOTAL et déterministe : à score égal, le statut départage ; à
 * statut égal, l'identifiant. Sans cette dernière clé, deux exécutions
 * pourraient rendre deux ordres — et le critère bloquant B2 tomberait.
 */
const RANG_STATUT = { OVERDUE: 0, DUE: 1, SOON: 2, HEALTHY: 3, UNKNOWN: 4 };

export function prioriser(fiches, { dueAtOf = () => null, now, limit = null } = {}) {
  const out = fiches
    .map((f) => prioriteDe(f, { dueAt: dueAtOf(f.id), now }))
    .filter((p) => p.eligible && p.score > 0)
    .sort((a, b) => (
      b.score - a.score
      || RANG_STATUT[a.statut] - RANG_STATUT[b.statut]
      || a.id.localeCompare(b.id)
    ));
  return limit ? out.slice(0, limit) : out;
}

/**
 * Décompte par statut, pour les tableaux de bord. Compte TOUTES les fiches,
 * y compris celles de score nul : un tableau de bord qui n'affiche que ce qui
 * est prioritaire ment par omission.
 */
export function comptesParStatut(fiches, { dueAtOf = () => null, now } = {}) {
  const out = { UNKNOWN: 0, OVERDUE: 0, DUE: 0, SOON: 0, HEALTHY: 0 };
  for (const f of fiches) out[statutDe(f, dueAtOf(f.id), now)] += 1;
  return out;
}
