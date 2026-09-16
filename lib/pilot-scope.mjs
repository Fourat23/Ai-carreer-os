// V77.1 · CP3 — LE SCOPE DU PILOTE, GELÉ ET VÉRIFIABLE. Module PUR.
//
// La fixture `data/pilot/v78-pilot-1.json` déclare ce que le pilote traverse.
// Une fixture qui référencerait une leçon inexistante, un exercice supprimé ou
// un défi de transfert renommé ne se verrait qu'au moment où un humain est
// devant l'écran — c'est-à-dire trop tard. Ce module rend ces incohérences
// visibles depuis un test.
//
// Le corpus est INJECTÉ : le module ne lit pas le disque, et le liant
// `pilot-scope-server.ts` lui fournit leçons, exercices et transferts réels.

/** Les étapes du protocole, dans l'ordre gelé au CP1 (§7.3). */
export const ETAPES_DU_PROTOCOLE = Object.freeze([
  'PRETEST', 'LESSON', 'EXERCISE_ATTEMPT_FAIL', 'HINT_VIEW', 'EXERCISE_ATTEMPT_RETRY',
  'EXERCISE_ATTEMPT_SUCCESS', 'IMMEDIATE_RETRIEVAL', 'DELAYED_RETRIEVAL', 'TRANSFER',
  'CONFUSION_REPORT', 'SESSION_EXPORT',
]);

/** Le rôle qu'un concept joue dans le protocole. Vocabulaire FERMÉ. */
export const STAGES_DE_CONCEPT = Object.freeze([
  'PRETEST_PREREQUISITE', 'FOCAL', 'TRANSFER_TARGET', 'TRANSFER_TARGET_SECOURS',
]);

/** Les faits que le protocole attend. Sous-ensemble des 9 faits du produit. */
export const FAITS_ATTENDUS = Object.freeze([
  'recallAttempts', 'exerciseAttempts', 'hintViews', 'evidence', 'transferAttempts',
]);

/** Les rôles possibles d'un exercice dans le scope. */
export const ROLES_EXERCICE = Object.freeze(['PRINCIPAL', 'SECOURS']);

const liste = (v) => (Array.isArray(v) ? v : []);

/**
 * Les incohérences du scope. Liste VIDE = le scope tient.
 *
 * @param {object} fixture le contenu de `data/pilot/v78-pilot-1.json`
 * @param {object} corpus
 * @param {Set<string>} corpus.lecons        slugs de leçon existants
 * @param {Set<string>} corpus.exercices     identifiants d'exercice existants
 * @param {Set<string>} corpus.transferts    identifiants de défi existants
 * @param {(id:string)=>string[]} corpus.declarantsDe  leçons déclarant un exercice
 * @param {(slug:string)=>string[]} corpus.formatsDe   formes de rappel d'une leçon
 * @param {string} protocolVersionAttendue
 */
export function incoherencesDuScope(fixture, corpus, protocolVersionAttendue) {
  const v = [];
  const f = fixture && typeof fixture === 'object' ? fixture : {};

  if (f.protocolVersion !== protocolVersionAttendue) {
    v.push(`protocolVersion « ${f.protocolVersion} » ≠ « ${protocolVersionAttendue} »`);
  }
  if (typeof f.scopeId !== 'string' || !f.scopeId) v.push('scopeId manquant');

  const concepts = liste(f.concepts);
  if (concepts.length < 3 || concepts.length > 6) {
    v.push(`${concepts.length} concepts : le contrat en exige 3 à 6`);
  }

  const focaux = concepts.filter((c) => c.stage === 'FOCAL');
  if (focaux.length !== 1) v.push(`${focaux.length} concept(s) FOCAL — il en faut exactement 1`);

  const idsConcepts = new Set();
  for (const c of concepts) {
    const id = c?.conceptId;
    if (typeof id !== 'string' || !id) { v.push('un concept sans conceptId'); continue; }
    if (idsConcepts.has(id)) v.push(`concept « ${id} » déclaré deux fois`);
    idsConcepts.add(id);

    if (!corpus.lecons.has(id)) v.push(`concept « ${id} » : aucune leçon de ce slug`);
    if (!STAGES_DE_CONCEPT.includes(c.stage)) v.push(`concept « ${id} » : stage « ${c.stage} » hors vocabulaire`);
    if (typeof c.justification !== 'string' || c.justification.trim().length < 40) {
      v.push(`concept « ${id} » : justification absente ou trop courte`);
    }
    if (c.lesson?.slug !== id) v.push(`concept « ${id} » : lesson.slug incohérent`);

    for (const p of liste(c.prerequisites)) {
      if (!corpus.lecons.has(p)) v.push(`concept « ${id} » : prérequis « ${p} » inconnu`);
    }

    // ── LA RÈGLE CENTRALE DU CP3 ──
    // Un exercice du pilote doit se résoudre en UN SEUL concept. Un exercice
    // multi-déclarants n'est pas « mal rangé » : il est multi-concept par choix
    // d'auteur. Mais sa trace ne dirait pas lequel a été pratiqué.
    for (const e of liste(c.exercises)) {
      const eid = e?.exerciseId;
      if (!corpus.exercices.has(eid)) { v.push(`concept « ${id} » : exercice « ${eid} » inexistant`); continue; }
      if (!ROLES_EXERCICE.includes(e.role)) v.push(`exercice « ${eid} » : rôle « ${e.role} » hors vocabulaire`);
      const d = corpus.declarantsDe(eid);
      if (d.length !== 1) v.push(`exercice « ${eid} » : ${d.length} déclarants — AMBIGU pour ce protocole`);
      else if (d[0] !== id) v.push(`exercice « ${eid} » : déclaré par « ${d[0] }», pas par « ${id} »`);
      if (JSON.stringify([...liste(e.declarants)].sort()) !== JSON.stringify([...d].sort())) {
        v.push(`exercice « ${eid} » : la fixture annonce ${JSON.stringify(e.declarants)}, le corpus dit ${JSON.stringify(d)}`);
      }
      if (typeof e.justification !== 'string' || e.justification.trim().length < 40) {
        v.push(`exercice « ${eid} » : justification absente ou trop courte`);
      }
    }

    if (c.retrieval) {
      const dispo = corpus.formatsDe(id);
      for (const fmt of liste(c.retrieval.formats)) {
        if (!dispo.includes(fmt)) v.push(`concept « ${id} » : forme de rappel « ${fmt} » indisponible (le corpus offre ${JSON.stringify(dispo)})`);
      }
    }

    if (c.transfer != null && !corpus.transferts.has(c.transfer)) {
      v.push(`concept « ${id} » : transfert « ${c.transfer} » inexistant`);
    }
  }

  // ── les transferts déclarés ──
  const transferts = liste(f.transfers);
  if (!transferts.some((t) => t.role === 'PRINCIPAL')) v.push('aucun transfert PRINCIPAL');
  for (const t of transferts) {
    if (!corpus.transferts.has(t.id)) { v.push(`transfert « ${t.id} » inexistant`); continue; }
    for (const r of liste(t.lessonRefs)) {
      if (!corpus.lecons.has(r)) v.push(`transfert « ${t.id} » : lessonRef « ${r} » inconnue`);
      if (!idsConcepts.has(r)) v.push(`transfert « ${t.id} » : lessonRef « ${r} » hors du scope`);
    }
  }

  // ── les étapes ──
  const etapes = liste(f.steps);
  const idsEtapes = new Set(etapes.map((e) => e.id));
  for (const attendue of ETAPES_DU_PROTOCOLE) {
    if (![...idsEtapes].some((id) => id === attendue || id.startsWith(`${attendue}_`))) {
      v.push(`étape « ${attendue} » absente de la fixture`);
    }
  }
  let precedent = 0;
  for (const e of etapes) {
    if (typeof e.n !== 'number' || e.n < precedent) v.push(`étape « ${e.id} » : numéro hors ordre`);
    precedent = typeof e.n === 'number' ? e.n : precedent;
    if (e.concept != null && !idsConcepts.has(e.concept)) v.push(`étape « ${e.id} » : concept « ${e.concept} » hors du scope`);
    if (e.fait != null && !FAITS_ATTENDUS.includes(e.fait)) v.push(`étape « ${e.id} » : fait « ${e.fait} » hors vocabulaire`);
  }

  // ── les exercices écartés : nommés, avec leur raison ──
  for (const x of liste(f.excludedExercises)) {
    if (!corpus.exercices.has(x.exerciseId)) { v.push(`exercice écarté « ${x.exerciseId} » inexistant`); continue; }
    const d = corpus.declarantsDe(x.exerciseId);
    if (d.length === 1) v.push(`exercice « ${x.exerciseId} » écarté alors qu'il n'a qu'un déclarant`);
    if (typeof x.raison !== 'string' || !x.raison.trim()) v.push(`exercice écarté « ${x.exerciseId} » sans raison`);
  }

  return v;
}

/** Les exercices réellement praticables pendant le pilote, dans l'ordre déclaré. */
export function exercicesDuPilote(fixture) {
  return liste(fixture?.concepts).flatMap((c) => liste(c.exercises).map((e) => ({ ...e, conceptId: c.conceptId })));
}

/** L'étape du protocole portant cet identifiant, ou `null`. */
export function etapeDuProtocole(fixture, id) {
  return liste(fixture?.steps).find((e) => e.id === id) ?? null;
}
