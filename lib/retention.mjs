// RETENTION ENGINE I — modèle PUR (V66 · CP2-CP7).
//
// Aucune I/O, aucune horloge implicite, aucun aléa. Toutes les données entrent
// par arguments ; l'horloge est injectée. Deux appels identiques rendent une
// sortie strictement identique.
//
// ── LE PRINCIPE, ET IL N'EST PAS NÉGOCIABLE ──────────────────────────────
//
// Un SEUL fait est écrit : la TENTATIVE DE RAPPEL (`RecallAttempt`). Elle dit
// « à cette date, sur ce concept, dans cette forme, l'apprenant a retrouvé /
// retrouvé en partie / n'a pas retrouvé ». C'est un événement observé, daté,
// non révisable.
//
// Tout le reste — l'exposition, l'état de rétention, l'échéance — est une
// PROJECTION recalculée depuis la liste des tentatives. Rien n'est stocké en
// double, donc rien ne peut diverger. Effacer toutes les projections et
// rejouer depuis les seules tentatives rend un résultat strictement égal :
// c'est l'invariant que le gate vérifie, et c'est la même règle que le
// Competency Engine (V65).
//
// Conséquence directe, et voulue : **on ne peut pas fabriquer un état de
// rétention**. Il n'existe aucune commande « marquer ce concept comme retenu ».
// Un concept devient « retenu » parce que des tentatives réussies existent, à
// des dates distinctes, ou il ne le devient pas.
//
// ── POURQUOI UN NOUVEAU MOTEUR À CÔTÉ DE `lib/review.mjs` ────────────────
//
// `lib/review.mjs` existe depuis V19 et fonctionne. Il n'est ni supprimé ni
// remplacé : il planifie la révision d'une JOURNÉE à partir de la
// COMPRÉHENSION DÉCLARÉE par l'apprenant. C'est utile, et c'est une autre
// question.
//
// Ce module planifie la réactivation d'un CONCEPT à partir de TENTATIVES
// RÉELLES. La différence est celle que le brief V66 pointe : « je crois avoir
// compris » n'est pas « j'ai su le retrouver ». Les deux modèles cohabitent
// sans se contredire parce qu'ils ne répondent pas à la même question et
// n'écrivent pas au même endroit.

const DAY_MS = 86_400_000;

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const utcDay = (iso) => String(iso).slice(0, 10);

/**
 * ── L'UNITÉ : LE CONCEPT ────────────────────────────────────────────────
 *
 * Un concept = une LEÇON du programme (128). Ce choix est dérivé du corpus,
 * pas décrété :
 *   — la leçon est la plus petite unité que le corpus traite comme UNE idée
 *     enseignable (elle a un objectif unique, un modèle mental, un vocabulaire) ;
 *   — elle porte déjà un graphe de prérequis (Curriculum Graph, arêtes
 *     REQUIRES) et un rattachement aux compétences (BUILDS_SKILL) ;
 *   — elle est rattachée aux journées par les liens `/doc/lessons/<slug>` que
 *     les journées écrivent elles-mêmes.
 *
 * Alternative écartée : les 711 entrées du glossaire. Elles sont plus fines,
 * mais n'ont ni prérequis, ni journée propriétaire, ni pratique associée : on
 * ne saurait ni quand les exposer, ni comment les tester. Le grain aurait été
 * plus joli et le moteur aurait été creux.
 */

/** Résultats possibles d'une tentative. Fermé : rien d'autre n'est accepté. */
export const RECALL_OUTCOMES = ['recalled', 'partial', 'failed'];

/**
 * Formes de rappel actif. Chacune correspond à une section RÉELLE des leçons —
 * aucune n'est inventée, aucune n'exige d'écrire du contenu nouveau :
 *   free      « Objectif » ................ réexpliquer sans regarder
 *   cued      « Questions d'entretien » ... répondre à une question posée
 *   applied   « Mini-exercice » ........... produire quelque chose
 *   discrim   « Erreurs fréquentes » ...... dire ce qui est faux et pourquoi
 *   generate  « Checklist » ............... se prononcer sur sa propre maîtrise
 * La disponibilité d'une forme sur un concept se MESURE (voir
 * `availableFormats`) ; elle n'est jamais supposée.
 */
export const RECALL_FORMATS = ['free', 'cued', 'applied', 'discrim', 'generate'];

const OUTCOME_SET = new Set(RECALL_OUTCOMES);
const FORMAT_SET = new Set(RECALL_FORMATS);

/** États de rétention, dans l'ordre de progression. Vocabulaire du brief §7. */
export const RETENTION_STATES = ['nouveau', 'fragile', 'en_consolidation', 'retenu', 'a_revoir'];

export const RETENTION_STATE_LABEL = {
  nouveau: 'Nouveau',
  fragile: 'Fragile',
  en_consolidation: 'En consolidation',
  retenu: 'Retenu',
  a_revoir: 'À revoir',
};

/**
 * Paliers d'espacement, en jours, indexés par le nombre de RÉUSSITES
 * CONSÉCUTIVES. Entiers, fixes, publiés : aucun facteur de facilité flottant,
 * aucune dérive, aucun réglage caché.
 *
 * Progression ×2,2 environ, plafonnée à 160 jours — au-delà, un cursus de
 * 365 jours ne reverra plus jamais le concept, et une échéance qu'on ne peut
 * pas honorer est un mensonge.
 */
export const INTERVALS = [1, 3, 7, 16, 35, 75, 160];

/** Nombre de réussites, à dates distinctes, exigé pour « retenu ». */
export const RETAINED_MIN_SUCCESSES = 3;
/** Étalement minimal, en jours, entre la première et la dernière réussite. */
export const RETAINED_MIN_SPAN_DAYS = 21;

// ── Normalisation des faits ───────────────────────────────────────────────

/**
 * Une tentative valide, ou `null`. Refuser franchement vaut mieux que réparer
 * en silence : une tentative mal formée ne doit pas peser sur un état.
 */
export function normalizeAttempt(raw) {
  if (!isObj(raw)) return null;
  const conceptId = typeof raw.conceptId === 'string' ? raw.conceptId.trim() : '';
  if (!conceptId) return null;
  const at = typeof raw.at === 'string' && !Number.isNaN(Date.parse(raw.at)) ? raw.at : null;
  if (!at) return null;
  if (!OUTCOME_SET.has(raw.outcome)) return null;
  const format = FORMAT_SET.has(raw.format) ? raw.format : 'free';
  return {
    conceptId,
    at,
    outcome: raw.outcome,
    format,
    // D'où vient la tentative — journée, exercice, révision. Traçabilité, pas décor.
    sourceRef: typeof raw.sourceRef === 'string' ? raw.sourceRef.slice(0, 120) : null,
  };
}

/**
 * Liste normalisée, triée par date puis par concept. Le tri est ce qui rend la
 * projection indépendante de l'ordre d'insertion — donc rejouable.
 */
export function normalizeAttempts(list) {
  const out = [];
  for (const raw of Array.isArray(list) ? list : []) {
    const a = normalizeAttempt(raw);
    if (a) out.push(a);
  }
  out.sort((x, y) => (x.at === y.at ? x.conceptId.localeCompare(y.conceptId) : x.at.localeCompare(y.at)));
  return out;
}

// ── ConceptExposure — projection, jamais un fait stocké ───────────────────

/**
 * Qu'est-ce que l'apprenant a RENCONTRÉ, et quand pour la première fois.
 *
 * Une exposition n'est pas une tentative et ne vaut aucun crédit : elle dit
 * seulement que le produit a présenté ce concept. C'est ce qui distingue
 * « jamais vu » de « vu, jamais testé » — la distinction que l'ancien modèle
 * ne savait pas faire, et qui fait toute la différence dans ce qu'on propose.
 *
 * @param {Map<string,string[]>|object} conceptDays  concept → journées qui l'enseignent
 * @param {object} days  `progress.days` — sessions réelles
 */
export function projectExposures(conceptDays, days) {
  const map = conceptDays instanceof Map ? conceptDays : new Map(Object.entries(conceptDays ?? {}));
  const prog = isObj(days) ? days : {};
  const out = {};
  for (const [conceptId, dayList] of map) {
    const seen = [];
    for (const day of Array.isArray(dayList) ? dayList : []) {
      const d = prog[String(day)];
      if (!isObj(d)) continue;
      // Une exposition compte dès que la journée a été OUVERTE. Exiger qu'elle
      // soit terminée ferait disparaître les concepts d'une journée en cours,
      // c'est-à-dire exactement ceux qu'il faut réactiver.
      const at = d.startedAt ?? d.completedAt ?? d.updatedAt ?? null;
      if (typeof at === 'string' && !Number.isNaN(Date.parse(at))) seen.push({ day, at });
    }
    seen.sort((a, b) => a.at.localeCompare(b.at));
    out[conceptId] = {
      conceptId,
      exposed: seen.length > 0,
      firstExposedAt: seen.length ? seen[0].at : null,
      lastExposedAt: seen.length ? seen[seen.length - 1].at : null,
      days: seen.map((s) => s.day),
      teachingDays: Array.isArray(map.get(conceptId)) ? map.get(conceptId) : [],
    };
  }
  return out;
}

// ── ConceptRecall — l'historique de rappel d'UN concept ───────────────────

/**
 * Agrège les tentatives d'un concept. `consecutiveSuccesses` est le nombre de réussites
 * CONSÉCUTIVES en fin d'historique : c'est lui qui indexe l'espacement.
 *
 * Règle des trois issues, fixée ici et testée négativement :
 *   recalled → la série avance ;
 *   partial  → la série est GELÉE (ni progrès ni recul : l'apprenant a
 *              retrouvé quelque chose, mais pas assez pour espacer davantage) ;
 *   failed   → la série repart de zéro.
 */
export function projectRecall(conceptId, attempts) {
  const mine = normalizeAttempts(attempts).filter((a) => a.conceptId === conceptId);
  let consecutiveSuccesses = 0;
  const successDates = new Set();
  let successes = 0;
  let failures = 0;
  for (const a of mine) {
    if (a.outcome === 'recalled') {
      consecutiveSuccesses += 1;
      successes += 1;
      successDates.add(utcDay(a.at));
    } else if (a.outcome === 'failed') {
      consecutiveSuccesses = 0;
      failures += 1;
    }
    // 'partial' : rien ne bouge, volontairement.
  }
  const sorted = [...successDates].sort();
  const spanDays = sorted.length >= 2
    ? Math.round((Date.parse(sorted[sorted.length - 1]) - Date.parse(sorted[0])) / DAY_MS)
    : 0;
  return {
    conceptId,
    attempts: mine,
    attemptCount: mine.length,
    successes,
    failures,
    consecutiveSuccesses,
    /** Réussites à des DATES UTC distinctes — trois réussites le même jour ne consolident rien. */
    distinctSuccessDays: successDates.size,
    spanDays,
    lastAttempt: mine.length ? mine[mine.length - 1] : null,
    formatsUsed: [...new Set(mine.map((a) => a.format))].sort(),
  };
}

// ── ReviewSchedule — l'échéance, dérivée des seules tentatives ────────────

/**
 * Prochaine réactivation. Déterministe : mêmes tentatives → même date, à la
 * milliseconde près. Aucune horloge n'intervient ici — l'échéance se calcule
 * depuis la DERNIÈRE TENTATIVE, pas depuis « maintenant ». C'est ce qui rend
 * la projection rejouable des mois plus tard.
 */
export function projectSchedule(recall) {
  if (!recall || !recall.lastAttempt) {
    return { conceptId: recall?.conceptId ?? null, dueAt: null, intervalDays: null, basis: 'jamais tenté' };
  }
  // L'index EST la série. Série 0 (jamais réussi, ou dernier essai raté) → 1 jour.
  // Série 1 → 3 j, 2 → 7 j, 3 → 16 j, 4 → 35 j, 5 → 75 j, 6 et au-delà → 160 j.
  const intervalDays = INTERVALS[Math.min(recall.consecutiveSuccesses, INTERVALS.length - 1)];
  const from = Date.parse(recall.lastAttempt.at);
  return {
    conceptId: recall.conceptId,
    dueAt: new Date(from + intervalDays * DAY_MS).toISOString(),
    intervalDays,
    basis: recall.consecutiveSuccesses === 0
      ? 'reprise à 1 jour après un échec'
      : `${recall.consecutiveSuccesses} réussite${recall.consecutiveSuccesses > 1 ? 's' : ''} consécutive${recall.consecutiveSuccesses > 1 ? 's' : ''}`,
  };
}

// ── RetentionState — l'état, et la règle qui le produit ───────────────────

/**
 * L'état d'un concept. L'ORDRE DES TESTS EST LA RÈGLE : il est explicite ici
 * pour qu'on puisse le contester, et il est testé négativement dans le gate.
 *
 *   1. `nouveau`          — jamais exposé, ou exposé sans aucune tentative.
 *   2. `a_revoir`         — l'échéance est passée. Prime sur tout le reste :
 *                           un concept dû est dû, même s'il était « retenu ».
 *   3. `fragile`          — la dernière tentative a échoué, ou moins de deux
 *                           réussites à des dates distinctes.
 *   4. `retenu`           — au moins 3 réussites, à 3 dates distinctes,
 *                           étalées sur au moins 21 jours, sans échec final.
 *   5. `en_consolidation` — tout le reste : ça tient, ce n'est pas encore
 *                           installé.
 */
export function projectRetentionState(exposure, recall, now) {
  const nowMs = Date.parse(now);
  const schedule = projectSchedule(recall);

  if (!recall || recall.attemptCount === 0) {
    return {
      state: 'nouveau',
      reason: exposure?.exposed
        ? 'Concept rencontré dans une journée, jamais mis à l’épreuve.'
        : 'Concept jamais rencontré.',
      schedule,
    };
  }
  if (schedule.dueAt && Number.isFinite(nowMs) && Date.parse(schedule.dueAt) <= nowMs) {
    return {
      state: 'a_revoir',
      reason: `Échéance dépassée (${schedule.intervalDays} j après la dernière tentative).`,
      schedule,
    };
  }
  if (recall.lastAttempt.outcome === 'failed') {
    return { state: 'fragile', reason: 'La dernière tentative a échoué.', schedule };
  }
  if (recall.distinctSuccessDays < 2) {
    return {
      state: 'fragile',
      reason: recall.successes === 0
        ? 'Aucune réussite : le concept a été tenté, jamais retrouvé.'
        : 'Une seule journée de réussite : rien ne prouve encore que ça tient.',
      schedule,
    };
  }
  if (
    recall.successes >= RETAINED_MIN_SUCCESSES
    && recall.distinctSuccessDays >= RETAINED_MIN_SUCCESSES
    && recall.spanDays >= RETAINED_MIN_SPAN_DAYS
  ) {
    return {
      state: 'retenu',
      reason: `${recall.distinctSuccessDays} réussites sur ${recall.spanDays} jours.`,
      schedule,
    };
  }
  return {
    state: 'en_consolidation',
    reason: `${recall.distinctSuccessDays} réussites à des dates distinctes, étalement ${recall.spanDays} j (il en faut ${RETAINED_MIN_SPAN_DAYS}).`,
    schedule,
  };
}

/** Projection complète, pour tous les concepts connus. */
export function projectRetention({ concepts = [], conceptDays = {}, days = {}, attempts = [], now }) {
  const exposures = projectExposures(conceptDays, days);
  const list = normalizeAttempts(attempts);
  const out = [];
  for (const c of concepts) {
    const id = typeof c === 'string' ? c : c?.id;
    if (!id) continue;
    const recall = projectRecall(id, list);
    const exposure = exposures[id] ?? {
      conceptId: id, exposed: false, firstExposedAt: null, lastExposedAt: null, days: [], teachingDays: [],
    };
    const st = projectRetentionState(exposure, recall, now);
    out.push({
      conceptId: id,
      title: typeof c === 'string' ? id : (c.title ?? id),
      skills: typeof c === 'string' ? [] : (Array.isArray(c.skills) ? c.skills : []),
      exposure,
      recall,
      ...st,
    });
  }
  out.sort((a, b) => a.conceptId.localeCompare(b.conceptId));
  return out;
}

// ── Interleaving — dérivé du Curriculum Graph, pas d'une heuristique ──────

/**
 * Ordonne une file de réactivation en ALTERNANT les familles.
 *
 * Pourquoi : réviser six concepts de RAG à la suite produit une impression de
 * maîtrise (tout est frais, tout se ressemble) sans obliger à DISCRIMINER.
 * L'entrelacement force à repartir du problème à chaque fois. C'est l'un des
 * rares effets de la littérature qui soit à la fois robuste et applicable ici.
 *
 * La famille N'EST PAS devinée : c'est la compétence portée par l'arête
 * BUILDS_SKILL du Curriculum Graph.
 *
 * Un concept SANS compétence forme sa propre famille. Ce choix dégrade
 * légèrement l'alternance — deux orphelins peuvent se suivre — et il est
 * assumé : les fondre reviendrait à affirmer que deux concepts sont apparentés
 * parce que le programme ne leur a attribué aucune compétence. Un entrelacement
 * fondé sur une parenté inventée ne vaut rien.
 *
 * Déterminisme : tri initial par (échéance, identifiant), puis tourniquet
 * stable entre familles. Aucun aléa, donc deux appels rendent le même ordre.
 */
export function interleave(items, { familyOf } = {}) {
  const key = typeof familyOf === 'function'
    ? familyOf
    : (it) => (Array.isArray(it.skills) && it.skills.length ? it.skills[0] : `__${it.conceptId}`);

  const sorted = [...items].sort((a, b) => {
    const da = a.schedule?.dueAt ?? '';
    const db = b.schedule?.dueAt ?? '';
    if (da !== db) return da.localeCompare(db);
    return String(a.conceptId).localeCompare(String(b.conceptId));
  });

  const buckets = new Map();
  for (const it of sorted) {
    const f = key(it);
    if (!buckets.has(f)) buckets.set(f, []);
    buckets.get(f).push(it);
  }
  // Ordre des familles : celle dont le premier élément est le plus en retard
  // passe en tête. Stable, et fidèle à l'urgence réelle.
  const families = [...buckets.keys()].sort((fa, fb) => {
    const a = buckets.get(fa)[0], b = buckets.get(fb)[0];
    const da = a.schedule?.dueAt ?? '', db = b.schedule?.dueAt ?? '';
    if (da !== db) return da.localeCompare(db);
    return String(fa).localeCompare(String(fb));
  });

  const out = [];
  let placed = 0;
  const total = sorted.length;
  let round = 0;
  while (placed < total) {
    let movedThisRound = 0;
    for (const f of families) {
      const q = buckets.get(f);
      if (round < q.length) {
        out.push(q[round]);
        placed += 1;
        movedThisRound += 1;
      }
    }
    if (movedThisRound === 0) break; // garde-fou : jamais de boucle infinie
    round += 1;
  }
  return out;
}

/**
 * La file de réactivation du jour : ce qui est dû, entrelacé, borné.
 *
 * Bornée volontairement (défaut 8). Une file de 60 concepts dus n'est pas une
 * séance de révision, c'est un mur — et un mur ne se franchit pas, il se
 * contourne en fermant l'application.
 */
export function buildReviewQueue(projection, { now, limit = 8 } = {}) {
  const nowMs = Date.parse(now);
  const due = projection.filter((p) => {
    if (p.state === 'a_revoir') return true;
    // Un concept « fragile » jamais réussi n'a pas d'échéance utile : il est dû
    // dès qu'il a été tenté et raté. Ne pas le proposer serait l'abandonner.
    return p.state === 'fragile' && p.recall.attemptCount > 0
      && (!p.schedule.dueAt || Date.parse(p.schedule.dueAt) <= nowMs);
  });
  return interleave(due).slice(0, Math.max(0, limit));
}

// ── Formes disponibles — mesurées sur le corpus, jamais supposées ─────────

/**
 * Quelles formes de rappel une leçon permet RÉELLEMENT, d'après ses propres
 * sections. Si la leçon n'a pas de mini-exercice, la forme `applied` n'est pas
 * proposée : on ne demande pas à l'apprenant de faire quelque chose que le
 * produit ne lui donne pas.
 *
 * @param {string[]} sectionTitles  titres de sections de niveau 2 de la leçon
 */
export function availableFormats(sectionTitles) {
  const titles = (Array.isArray(sectionTitles) ? sectionTitles : []).map((t) => String(t).toLowerCase());
  const has = (re) => titles.some((t) => re.test(t));
  const out = [];
  if (has(/objectif/)) out.push('free');
  if (has(/questions? d.entretien/)) out.push('cued');
  if (has(/mini-exercice|exercice/)) out.push('applied');
  if (has(/erreurs fr|anti-?pattern|contre-exemple/)) out.push('discrim');
  if (has(/checklist/)) out.push('generate');
  return out;
}

/** Libellé de la consigne pour une forme donnée. Aucun contenu inventé : la consigne pointe la section. */
export const FORMAT_PROMPT = {
  free: 'Sans rouvrir la leçon : réexplique le concept et dis à quel problème il répond.',
  cued: 'Réponds à voix haute aux questions d’entretien de la leçon, puis compare.',
  applied: 'Refais le mini-exercice de la leçon, sans regarder la correction.',
  discrim: 'Cite une erreur fréquente de ce concept et explique POURQUOI elle est fausse.',
  generate: 'Reprends la checklist de la leçon et justifie chaque case que tu coches.',
};

export const FORMAT_LABEL = {
  free: 'Restitution libre',
  cued: 'Question posée',
  applied: 'Mise en application',
  discrim: 'Discrimination d’erreur',
  generate: 'Auto-justification',
};

/**
 * Choisit la forme à proposer : celle qui n'a pas encore servi sur ce concept,
 * dans l'ordre `RECALL_FORMATS`. Varier la forme est ce qui empêche de
 * mémoriser la QUESTION au lieu du concept.
 */
export function nextFormat(recall, formats) {
  const avail = (Array.isArray(formats) ? formats : []).filter((f) => FORMAT_SET.has(f));
  if (avail.length === 0) return null;
  const used = new Set(recall?.formatsUsed ?? []);
  const unused = RECALL_FORMATS.filter((f) => avail.includes(f) && !used.has(f));
  if (unused.length) return unused[0];
  // Toutes déjà vues : reprendre celle utilisée le moins récemment.
  const lastUse = new Map();
  for (const a of recall?.attempts ?? []) lastUse.set(a.format, a.at);
  return [...avail].sort((x, y) => (lastUse.get(x) ?? '').localeCompare(lastUse.get(y) ?? ''))[0];
}

// ── Comptage, pour les surfaces ──────────────────────────────────────────

export function retentionCounts(projection) {
  const counts = { nouveau: 0, fragile: 0, en_consolidation: 0, retenu: 0, a_revoir: 0 };
  for (const p of projection) counts[p.state] = (counts[p.state] ?? 0) + 1;
  return counts;
}
