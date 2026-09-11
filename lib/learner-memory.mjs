// V74 · CP2 — LEARNER MEMORY MODEL. Projection PURE et déterministe.
//
// ── CE QUE CE MODULE EST, ET CE QU'IL N'EST PAS ──────────────────────────
//
// Ce n'est PAS une seconde source de vérité. Rien n'est écrit ici, rien n'est
// mémorisé entre deux appels. Toutes les données entrent par arguments,
// l'horloge est injectée. Effacer entièrement la sortie et rappeler la
// fonction depuis les seuls FAITS rend un résultat strictement égal — c'est le
// critère bloquant B1 du contrat gelé, et le gate du CP14 le vérifie.
//
// Ce n'est PAS non plus un modèle de mémoire humaine. Le nom dit « memory
// model » parce que c'est le vocabulaire du brief ; ce que le module calcule,
// ce sont des DATES, des COMPTEURS et des CONTACTS. Aucune probabilité de
// souvenir n'est produite ici, ni ailleurs dans V74 : le CP0 a déclaré cette
// grandeur UNMEASURABLE et le contrat l'y laisse.
//
// ── LES DEUX GRAINS, ET POURQUOI LES DEUX ────────────────────────────────
//
// CONCEPT (128 leçons) — le grain du rappel. C'est l'unité qu'on peut poser
// en question, parce qu'elle a un objectif unique, des prérequis et une
// pratique.
//
// COMPÉTENCE (20) — le grain de la PROMESSE. C'est l'unité des
// `expectedScores`, des preuves (`evidence.competencyIds`) et du calendrier.
//
// Le CP0 a mesuré que ces deux grains ne coïncident pas : une preuve porte des
// compétences, jamais un concept. Les fusionner reviendrait à choisir
// arbitrairement, pour 169 exercices sur 376, parmi 3 à 15 leçons candidates.
// Le modèle projette donc les deux, séparément, et ne prétend jamais que l'un
// se déduit de l'autre.
//
// Contrat gelé : docs/v74/V74-RETENTION-CONTRACT-FROZEN.md §1, §3.4, §5.

import { normalizeAttempts } from './retention.mjs';
import { normalizeExerciseAttempts } from './exercise-attempt.mjs';

const DAY_MS = 86_400_000;
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const jour = (iso) => String(iso).slice(0, 10);
const plusRecent = (a, b) => (!a ? b : !b ? a : (a > b ? a : b));

/**
 * Natures de contact significatif, telles que le §1.2 du contrat les gèle.
 * L'ordre est celui de la force du signal, du plus fort au plus faible — il
 * sert à départager quand plusieurs contacts tombent le même jour.
 */
export const CONTACT_KINDS = ['retrieval', 'exercise', 'evidence', 'submission'];

const KIND_RANK = { retrieval: 0, exercise: 1, evidence: 2, submission: 3 };

/**
 * ── RETRIEVAL : les trois conditions du §1.5, appliquées ──────────────────
 *
 * R-a  l'apprenant tente de restituer ou de produire ;
 * R-b  la correction n'a PAS été ouverte avant ;
 * R-c  ce n'est pas une reprise immédiate de la même tâche le même jour.
 *
 * Une `RecallAttempt` satisfait R-a par nature. Pour R-b, on ne dispose de
 * `correctionState` qu'au niveau de la JOURNÉE : une tentative de rappel n'est
 * donc disqualifiée que si la journée qu'elle référence avait sa correction
 * ouverte. En l'absence de référence de journée, la tentative est acceptée —
 * c'est une station de rappel autonome, sans correction à consulter.
 *
 * Une `ExerciseAttempt` satisfait R-a, et R-b se lit directement dans
 * `correctionSeen`, qui vaut `true` par défaut : **le doute joue contre le
 * compteur**.
 */
function estRecuperation(contact, correctionOuverteParJour) {
  if (contact.kind === 'retrieval') {
    const d = contact.dayRef;
    if (d != null && correctionOuverteParJour.has(d)) return false;   // R-b
    return true;                                                      // R-a, R-c traité en amont
  }
  if (contact.kind === 'exercise') {
    if (contact.correctionSeen) return false;                         // R-b
    if (contact.phase !== 'run') return false;                        // §3.4 (4)
    return true;
  }
  return false;
}

/**
 * Construit la liste des CONTACTS SIGNIFICATIFS, tous grains confondus, à
 * partir des seuls faits. C'est l'étage qui applique M1 à M4.
 *
 * R-c est appliqué ICI, et une seule fois : pour un même artefact et un même
 * jour UTC, seule la PREMIÈRE tentative peut valoir récupération. Les
 * suivantes restent des contacts significatifs — elles rafraîchissent
 * l'ancienneté — mais ne comptent pas comme rappel. C'est la différence entre
 * « il a retravaillé » et « il a su retrouver ».
 */
export function collectContacts({ days = {}, recallAttempts = [], exerciseAttempts = [], evidence = [] } = {}) {
  const contacts = [];

  // ── quelles journées avaient leur correction ouverte (pour R-b)
  const correctionOuverteParJour = new Set();
  for (const [k, d] of Object.entries(isObj(days) ? days : {})) {
    if (isObj(d) && (d.correctionState === 'viewed' || d.correctionState === 'acknowledged')) {
      correctionOuverteParJour.add(Number(k));
    }
  }

  // M1 — tentative de rappel, quelle qu'en soit l'issue
  for (const a of normalizeAttempts(recallAttempts)) {
    const m = /(?:^|[^0-9])day-(\d{1,3})/.exec(a.sourceRef ?? '');
    contacts.push({
      kind: 'retrieval', at: a.at, conceptId: a.conceptId, competencyIds: [],
      outcome: a.outcome, dayRef: m ? Number(m[1]) : null, ref: a.sourceRef ?? null,
    });
  }

  // M2 — tentative d'exercice réellement exécutée, réussie OU NON
  for (const a of normalizeExerciseAttempts(exerciseAttempts)) {
    contacts.push({
      kind: 'exercise', at: a.at, conceptId: null, competencyIds: [],
      outcome: a.outcome === 'success' ? 'recalled' : a.outcome === 'partial' ? 'partial' : 'failed',
      exerciseId: a.exerciseId, correctionSeen: a.correctionSeen, phase: a.phase,
      dayRef: a.dayRefs[0] ?? null, ref: a.exerciseId,
    });
  }

  // M3 — preuve validée sur un type qualifiant
  for (const e of Array.isArray(evidence) ? evidence : []) {
    if (!isObj(e) || typeof e.createdAt !== 'string') continue;
    if (e.validation?.status !== 'passed') continue;
    contacts.push({
      kind: 'evidence', at: e.createdAt, conceptId: null,
      competencyIds: Array.isArray(e.competencyIds) ? e.competencyIds : [],
      outcome: 'recalled', dayRef: e.dayId ?? null, ref: e.id ?? null,
      // Le TYPE de la preuve est repris tel quel (V74 · CP11). Sans lui, un
      // défi de transfert réussi serait indiscernable d'un exercice réussi, et
      // le compteur de transferts ne pourrait rien compter d'autre que zéro —
      // y compris le jour où les défis deviendront atteignables.
      sourceType: typeof e.sourceType === 'string' ? e.sourceType : null,
      // V75 · CP3 — D4 payée : la preuve porte enfin ses CONCEPTS.
      //
      // Jusqu'ici un contact de preuve ne pouvait être rattaché à un concept
      // que par sa JOURNÉE — c'est-à-dire à toutes les leçons enseignées ce
      // jour-là, ce qui diluait la preuve sur des notions qu'elle ne
      // démontrait pas. Quand la preuve sait à quels concepts elle se
      // rapporte, on la croit plutôt que de la répartir au jugé.
      conceptIds: Array.isArray(e.conceptIds) ? e.conceptIds.filter((c) => typeof c === 'string') : [],
    });
  }

  // M4 — soumission portant un contenu non vide
  for (const [k, d] of Object.entries(isObj(days) ? days : {})) {
    if (!isObj(d) || !Array.isArray(d.submissions)) continue;
    for (const s of d.submissions) {
      if (!isObj(s) || typeof s.at !== 'string') continue;
      if (typeof s.content !== 'string' || !s.content.trim()) continue;
      contacts.push({
        kind: 'submission', at: s.at, conceptId: null, competencyIds: [],
        outcome: null, dayRef: Number(k), ref: s.stepId ?? null,
      });
    }
  }

  contacts.sort((a, b) => (a.at === b.at ? KIND_RANK[a.kind] - KIND_RANK[b.kind] : a.at.localeCompare(b.at)));

  // ── R-c : première tentative de CET artefact ce jour-là uniquement
  const vus = new Set();
  for (const c of contacts) {
    const cle = `${c.kind}|${c.ref ?? c.conceptId ?? ''}|${jour(c.at)}`;
    c.premiereDuJour = !vus.has(cle);
    vus.add(cle);
    c.estRecuperation = c.premiereDuJour && estRecuperation(c, correctionOuverteParJour);
  }
  return contacts;
}

/**
 * ── La fiche d'une unité — concept ou compétence ──────────────────────────
 *
 * `expositions` est une liste de dates issues du CURRICULUM (journées
 * ouvertes), distincte des contacts significatifs. Le contrat §1.3 le dit :
 * une exposition dit seulement que la question a un sens ; elle ne prouve rien.
 */
function ficheDe(id, contacts, expositions, ctx) {
  const recuperations = contacts.filter((c) => c.estRecuperation);
  const reussites = recuperations.filter((c) => c.outcome === 'recalled');
  const echecs = recuperations.filter((c) => c.outcome === 'failed');
  const preuves = contacts.filter((c) => c.kind === 'evidence');

  // Série de réussites CONSÉCUTIVES, sur les seules récupérations.
  // `partial` GÈLE la série (§1.6) : ni progrès, ni recul.
  let serie = 0;
  const joursDeReussite = new Set();
  for (const c of recuperations) {
    if (c.outcome === 'recalled') { serie += 1; joursDeReussite.add(jour(c.at)); }
    else if (c.outcome === 'failed') serie = 0;
  }

  const applications = contacts.filter((c) => c.dayRef != null && ctx.projectDays?.has(c.dayRef));

  // ── TRANSFERT (V74 · CP11) ──────────────────────────────────────────────
  //
  // `transfers` comptait jusqu'ici les contacts d'une journée dont les leçons
  // portent AU MOINS DEUX compétences. Le CP11 a mesuré ce que vaut ce
  // signal : **269 journées sur 365, soit 74 %, satisfont ce critère.** Un
  // indicateur qui s'allume trois fois sur quatre ne distingue rien — et
  // surtout, il ne mesure pas le transfert : *deux compétences enseignées le
  // même jour ne demandent pas de transposer l'une dans l'autre*. C'est une
  // CO-OCCURRENCE, pas un transfert.
  //
  // Le produit possède pourtant les artefacts du transfert : **25 défis T4/T5
  // validés, tous `crossDomain`, couvrant 18 des 20 compétences**, avec pont
  // conceptuel explicite (`lib/transfer-challenge.mjs`). Ils sont référencés
  // par **0 journée**, exposés par **0 page**, et consommés par ce moteur
  // **pas du tout**.
  //
  // Le compteur dit donc désormais la vérité : un transfert est une PREUVE
  // VALIDÉE issue d'un défi de transfert. Aujourd'hui, cela vaut **0** pour
  // tout le monde — exactement comme le CP0 avait établi que « le système n'a
  // jamais observé un échec ». Un zéro honnête vaut mieux qu'un compteur
  // saturé : le second aurait laissé croire que le transfert est mesuré.
  //
  // La co-occurrence est conservée sous son vrai nom, parce qu'elle reste une
  // information réelle — simplement pas celle qu'on lui faisait dire.
  const transferts = contacts.filter((c) => c.kind === 'evidence' && c.sourceType === 'transfer-challenge');
  const cooccurrences = contacts.filter((c) => c.dayRef != null && ctx.transferDays?.has(c.dayRef));

  const dernierSignificatif = contacts.length ? contacts.at(-1).at : null;
  const dates = [...joursDeReussite].sort();
  const etalementJours = dates.length >= 2
    ? Math.round((Date.parse(dates.at(-1)) - Date.parse(dates[0])) / DAY_MS)
    : 0;

  return {
    id,
    // ── dates
    lastExposureAt: expositions.length ? expositions.at(-1) : null,
    firstExposureAt: expositions.length ? expositions[0] : null,
    lastRetrievalAt: recuperations.length ? recuperations.at(-1).at : null,
    lastSuccessAt: reussites.length ? reussites.at(-1).at : null,
    lastFailureAt: echecs.length ? echecs.at(-1).at : null,
    lastEvidenceAt: preuves.length ? preuves.at(-1).at : null,
    // ── §1.12 : la seule ancre temporelle du moteur
    lastMeaningfulContactAt: dernierSignificatif,
    // ── compteurs
    successfulRetrievalCount: reussites.length,
    failedRetrievalCount: echecs.length,
    retrievalCount: recuperations.length,
    consecutiveSuccesses: serie,
    distinctSuccessDays: joursDeReussite.size,
    successSpanDays: etalementJours,
    applications: applications.length,
    // Preuve validée issue d'un défi de transfert. Vaut 0 tant que les 25 défis
    // ne sont atteignables par personne (dette D10).
    transfers: transferts.length,
    // Contacts sur une journée enseignant ≥ 2 compétences. **Ce n'est PAS du
    // transfert** — 74 % des journées y satisfont. Publié sous son vrai nom.
    cooccurrencesCompetences: cooccurrences.length,
    // Le signal silencieux du CP11 : su, mais jamais hors de son contexte.
    jamaisTransfere: transferts.length === 0 && reussites.length > 0,
    // ── curriculum
    currentExpectedLevel: ctx.expectedLevel?.get(id) ?? null,
    nextCurriculumNeed: null,   // rempli par `projectLearnerMemory`, qui connaît `now`
    prereqDepth: ctx.prereqDepth?.get(id) ?? null,
    // ── traçabilité : ce sur quoi le moteur s'appuiera, lisible
    meaningfulContacts: contacts.map((c) => ({
      at: c.at, kind: c.kind, outcome: c.outcome, ref: c.ref,
      estRecuperation: c.estRecuperation, dayRef: c.dayRef,
    })),
  };
}

/**
 * ── LA PROJECTION ────────────────────────────────────────────────────────
 *
 * @param facts    { days, recallAttempts, exerciseAttempts, evidence }
 * @param context  { conceptDays, conceptSkills, exerciseConcept, projectDays,
 *                   transferDays, expectedLevelBySkill, prereqDepth,
 *                   projectDaysBySkill, startDate }
 * @param now      horloge INJECTÉE — jamais lue depuis l'environnement
 */
export function projectLearnerMemory({ facts = {}, context = {}, now } = {}) {
  const contacts = collectContacts(facts);
  const jours = isObj(facts.days) ? facts.days : {};

  // ── expositions issues du CURRICULUM : la journée a été OUVERTE.
  // Exiger qu'elle soit terminée ferait disparaître les notions de la journée
  // en cours, c'est-à-dire exactement celles qu'il faut réactiver. C'est la
  // règle de `projectExposures` (V66), reprise volontairement à l'identique.
  const dateDeJour = new Map();
  for (const [k, d] of Object.entries(jours)) {
    if (!isObj(d)) continue;
    const at = d.startedAt ?? d.completedAt ?? d.updatedAt ?? null;
    if (typeof at === 'string' && !Number.isNaN(Date.parse(at))) dateDeJour.set(Number(k), at);
  }
  const expositionsDe = (dayList) => (dayList ?? [])
    .map((d) => dateDeJour.get(d)).filter(Boolean).sort();

  // ── rattachement d'un contact à une unité
  const conceptDays = context.conceptDays instanceof Map
    ? context.conceptDays : new Map(Object.entries(context.conceptDays ?? {}));
  const conceptSkills = context.conceptSkills instanceof Map
    ? context.conceptSkills : new Map(Object.entries(context.conceptSkills ?? {}));
  // exercice → concept UNIQUE déclaré (§3.4 condition 1). Absent : pas de
  // rattachement au grain concept. On ne choisit jamais parmi plusieurs.
  const exerciseConcept = context.exerciseConcept instanceof Map
    ? context.exerciseConcept : new Map(Object.entries(context.exerciseConcept ?? {}));
  const exerciseSkills = context.exerciseSkills instanceof Map
    ? context.exerciseSkills : new Map(Object.entries(context.exerciseSkills ?? {}));
  const jourConcepts = context.dayConcepts instanceof Map
    ? context.dayConcepts : new Map(Object.entries(context.dayConcepts ?? {}));

  const parConcept = new Map([...conceptDays.keys()].map((c) => [c, []]));
  const parCompetence = new Map((context.skills ?? []).map((s) => [s, []]));

  for (const c of contacts) {
    // — grain CONCEPT
    const concepts = new Set();
    if (c.conceptId) concepts.add(c.conceptId);
    // V75 · CP3 — une preuve qui DÉCLARE ses concepts est crue sur parole, et
    // passe avant le rattachement par journée. L'ordre compte : sans cette
    // branche, une preuve portant deux concepts précis était diluée sur les
    // trois à quinze leçons de sa journée — elle créditait alors des notions
    // qu'elle ne démontrait pas.
    else if (Array.isArray(c.conceptIds) && c.conceptIds.length) {
      for (const s of c.conceptIds) concepts.add(s);
    } else if (c.kind === 'exercise') {
      const unique = exerciseConcept.get(c.exerciseId);
      if (unique) concepts.add(unique);
    } else if (c.dayRef != null) {
      for (const s of jourConcepts.get(c.dayRef) ?? []) concepts.add(s);
    }
    for (const cid of concepts) parConcept.get(cid)?.push(c);

    // — grain COMPÉTENCE
    const comps = new Set(c.competencyIds ?? []);
    if (c.kind === 'exercise') for (const s of exerciseSkills.get(c.exerciseId) ?? []) comps.add(s);
    for (const cid of concepts) for (const s of conceptSkills.get(cid) ?? []) comps.add(s);
    for (const s of comps) parCompetence.get(s)?.push(c);
  }

  const ctxConcept = {
    projectDays: context.projectDays instanceof Set ? context.projectDays : new Set(context.projectDays ?? []),
    transferDays: context.transferDays instanceof Set ? context.transferDays : new Set(context.transferDays ?? []),
    expectedLevel: new Map(),
    prereqDepth: context.prereqDepth instanceof Map
      ? context.prereqDepth : new Map(Object.entries(context.prereqDepth ?? {})),
  };
  const ctxCompetence = {
    ...ctxConcept,
    expectedLevel: context.expectedLevelBySkill instanceof Map
      ? context.expectedLevelBySkill : new Map(Object.entries(context.expectedLevelBySkill ?? {})),
    prereqDepth: new Map(),
  };

  const concepts = [...parConcept].map(([id, cs]) => ficheDe(id, cs, expositionsDe(conceptDays.get(id)), ctxConcept));
  const competences = [...parCompetence].map(([id, cs]) => {
    const jrs = [...new Set(cs.map((c) => c.dayRef).filter((d) => d != null))].sort((a, b) => a - b);
    return ficheDe(id, cs, expositionsDe(jrs), ctxCompetence);
  });

  // ── H · prochain besoin curriculaire.
  // Le CP0 a publié une anomalie de sonde sur ce point : mesuré comme « le
  // prochain projet après le DERNIER contact », il vaut « aucun » pour les
  // vingt compétences, puisque le dernier contact est souvent proche de j365.
  // La bonne question est RELATIVE À UNE DATE. On la calcule donc depuis la
  // position courante de l'apprenant dans le parcours.
  const jourCourant = positionDuJour(context.startDate, now);
  const projetsParSkill = context.projectDaysBySkill instanceof Map
    ? context.projectDaysBySkill : new Map(Object.entries(context.projectDaysBySkill ?? {}));
  for (const f of competences) {
    const futurs = (projetsParSkill.get(f.id) ?? []).filter((d) => d > jourCourant);
    f.nextCurriculumNeed = futurs.length ? { day: futurs[0], inDays: futurs[0] - jourCourant } : null;
  }

  return {
    generatedFor: now ?? null,
    currentDay: jourCourant,
    concepts: concepts.sort((a, b) => a.id.localeCompare(b.id)),
    competencies: competences.sort((a, b) => a.id.localeCompare(b.id)),
    contactCount: contacts.length,
    retrievalCount: contacts.filter((c) => c.estRecuperation).length,
  };
}

/**
 * Position dans le parcours, en numéro de journée. Sans date de début, on ne
 * peut PAS la deviner : on renvoie 0, ce qui rend tous les projets « futurs ».
 * Inventer une position serait fabriquer de la progression — interdit par le
 * contrat V73 et par le §9 du contrat V74.
 */
export function positionDuJour(startDate, now) {
  if (typeof startDate !== 'string' || Number.isNaN(Date.parse(startDate))) return 0;
  if (typeof now !== 'string' || Number.isNaN(Date.parse(now))) return 0;
  const n = Math.floor((Date.parse(jour(now)) - Date.parse(jour(startDate))) / DAY_MS) + 1;
  return Math.max(0, Math.min(365, n));
}

/** Fiche d'une unité, ou `null`. Utilitaire de lecture, sans effet de bord. */
export function memoryOf(projection, id, grain = 'concepts') {
  return (projection?.[grain] ?? []).find((f) => f.id === id) ?? null;
}

export { plusRecent };
