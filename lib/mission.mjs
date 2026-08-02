// Modèle PUR des missions d'ingénierie (V18) — sans I/O, sans réseau.
//
// Une mission est un scénario long, multi-livrables, relié aux journées, aux
// parcours, aux compétences et au système de preuves EXISTANT (cf. ADR-018).
// Ce module ne porte que les DÉFINITIONS (contenu public) et leur validation ;
// l'état de l'apprenant vit dans la progression v3 (lib/mission-state.mjs).

import { isSafeRelPath } from './exercise.mjs';

export const MISSION_CATEGORIES = ['debt-maintenance', 'performance', 'documentation', 'incident'];
export const DELIVERABLE_KINDS = ['code', 'document', 'metrics', 'decision', 'plan', 'report'];
/** auto = vérifiable par tests ; structural = sections/champs ; review = humain. */
export const VALIDATION_MODES = ['auto', 'structural', 'review'];
export const MISSION_DEF_STATUSES = ['draft', 'published'];

const KNOWN_KEYS = new Set([
  'id', 'title', 'description', 'category', 'difficulty', 'estimatedHours',
  'context', 'prerequisites', 'skills', 'trackRefs', 'dayRefs', 'starterFiles',
  'deliverables', 'exerciseRefs', 'rubric', 'commonMistakes', 'dependsOn',
  'status', 'version',
]);
const KNOWN_DELIVERABLE_KEYS = new Set([
  'id', 'kind', 'title', 'required', 'validation', 'exerciseRef', 'docSpec', 'hint',
]);

const MAX = { title: 160, description: 2000, context: 6000, deliverables: 20, skills: 12, days: 40, rubric: 30 };
const DANGEROUS = new Set(['__proto__', 'prototype', 'constructor']);

const isStr = (v) => typeof v === 'string';
const isNonEmpty = (v) => isStr(v) && v.trim().length > 0;
const isArr = (v) => Array.isArray(v);
const isKebab = (v) => isStr(v) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);

/**
 * Valide une définition de mission contre le contexte réel.
 * @param {object} m
 * @param {object} ctx { validDays:Set<number>, trackIds:Set<string>, skillIds:{has(id):boolean}|Set, exerciseIds:Set<string> }
 * @returns {{ ok:boolean, errors:string[] }}
 */
export function validateMission(m = {}, ctx = {}) {
  const errors = [];
  const validDays = ctx.validDays ?? new Set();
  const trackIds = ctx.trackIds ?? new Set();
  const skillIds = ctx.skillIds ?? new Set();
  const exerciseIds = ctx.exerciseIds ?? new Set();
  const has = (set, k) => (typeof set.has === 'function' ? set.has(k) : false);

  // Champs inconnus critiques → refus.
  for (const k of Object.keys(m)) {
    if (!KNOWN_KEYS.has(k)) errors.push(`champ inconnu « ${k} »`);
    if (DANGEROUS.has(k)) errors.push('clé dangereuse détectée');
  }

  if (!isKebab(m.id)) errors.push('id invalide (kebab-case requis)');
  if (!isNonEmpty(m.title) || m.title.length > MAX.title) errors.push('titre manquant ou trop long');
  if (!isNonEmpty(m.description) || m.description.length > MAX.description) errors.push('description manquante ou trop longue');
  if (!isNonEmpty(m.context) || m.context.length > MAX.context) errors.push('contexte manquant ou trop long');
  if (!MISSION_CATEGORIES.includes(m.category)) errors.push(`catégorie invalide « ${m.category} »`);
  if (!Number.isInteger(m.difficulty) || m.difficulty < 1 || m.difficulty > 5) errors.push('difficulté hors bornes (1..5)');
  if (!(typeof m.estimatedHours === 'number' && m.estimatedHours > 0 && m.estimatedHours <= 200)) errors.push('estimatedHours hors bornes');
  if (!MISSION_DEF_STATUSES.includes(m.status)) errors.push('statut de définition invalide (draft|published)');
  if (!isNonEmpty(m.version)) errors.push('version manquante');

  // Compétences.
  if (!isArr(m.skills) || m.skills.length === 0 || m.skills.length > MAX.skills) errors.push('skills manquantes ou hors bornes');
  else for (const s of m.skills) if (!has(skillIds, s)) errors.push(`compétence inconnue « ${s} »`);

  // Parcours (indice d'affichage) + journées (source de l'atteignabilité).
  for (const t of m.trackRefs ?? []) if (!trackIds.has(t)) errors.push(`parcours inconnu « ${t} »`);
  if (!isArr(m.dayRefs) || m.dayRefs.length === 0 || m.dayRefs.length > MAX.days) errors.push('dayRefs manquantes ou hors bornes');
  else for (const d of m.dayRefs) if (!validDays.has(d)) errors.push(`journée inexistante ${d}`);

  // Exercices liés (publics, existants).
  for (const ex of m.exerciseRefs ?? []) if (!exerciseIds.has(ex)) errors.push(`exercice lié inexistant « ${ex} »`);

  // Fichiers de départ éventuels : chemins sûrs.
  for (const f of m.starterFiles ?? []) {
    if (!isSafeRelPath(f?.path)) errors.push(`chemin de fichier de départ non sûr « ${f?.path} »`);
  }

  // Livrables.
  if (!isArr(m.deliverables) || m.deliverables.length === 0 || m.deliverables.length > MAX.deliverables) {
    errors.push('deliverables manquants ou hors bornes');
  } else {
    const seen = new Set();
    for (const d of m.deliverables) {
      for (const k of Object.keys(d ?? {})) if (!KNOWN_DELIVERABLE_KEYS.has(k)) errors.push(`livrable : champ inconnu « ${k} »`);
      if (!isKebab(d?.id)) errors.push(`livrable : id invalide « ${d?.id} »`);
      else if (seen.has(d.id)) errors.push(`livrable : id en doublon « ${d.id} »`);
      seen.add(d?.id);
      if (!isNonEmpty(d?.title)) errors.push(`livrable ${d?.id} : titre manquant`);
      if (!DELIVERABLE_KINDS.includes(d?.kind)) errors.push(`livrable ${d?.id} : kind invalide « ${d?.kind} »`);
      if (!VALIDATION_MODES.includes(d?.validation)) errors.push(`livrable ${d?.id} : validation invalide « ${d?.validation} »`);
      if (typeof d?.required !== 'boolean') errors.push(`livrable ${d?.id} : required booléen requis`);
      // Un livrable auto DOIT référencer un exercice réel.
      if (d?.validation === 'auto') {
        if (!isNonEmpty(d?.exerciseRef)) errors.push(`livrable ${d?.id} : validation auto sans exerciseRef`);
        else if (!exerciseIds.has(d.exerciseRef)) errors.push(`livrable ${d?.id} : exerciseRef inexistant « ${d.exerciseRef} »`);
      }
      // Un livrable structural DOIT porter une spec de document.
      if (d?.validation === 'structural' && !isValidDocSpec(d?.docSpec)) {
        errors.push(`livrable ${d?.id} : validation structurelle sans docSpec valide`);
      }
    }
    if (!m.deliverables.some((d) => d?.required)) errors.push('au moins un livrable requis attendu');
  }

  // Rubric (grille visible).
  if (m.rubric != null) {
    if (!isArr(m.rubric) || m.rubric.length > MAX.rubric) errors.push('rubric hors bornes');
    else for (const r of m.rubric) {
      if (!isNonEmpty(r?.label)) errors.push('rubric : critère sans libellé');
      if (r?.blocking != null && typeof r.blocking !== 'boolean') errors.push('rubric : blocking booléen');
    }
  }

  return { ok: errors.length === 0, errors };
}

function isValidDocSpec(spec) {
  if (!spec || typeof spec !== 'object') return false;
  if (!isArr(spec.requiredSections) || spec.requiredSections.length === 0) return false;
  if (spec.minLength != null && typeof spec.minLength !== 'number') return false;
  return true;
}

/** Valide un catalogue complet : ids uniques + chaque mission valide + dépendances. */
export function validateMissionCatalogue(missions = [], ctx = {}) {
  const errors = [];
  const ids = new Set();
  for (const m of missions) {
    if (ids.has(m?.id)) errors.push(`mission en doublon « ${m?.id} »`);
    ids.add(m?.id);
  }
  for (const m of missions) {
    const r = validateMission(m, ctx);
    for (const e of r.errors) errors.push(`${m?.id ?? '?'} : ${e}`);
    for (const dep of m?.dependsOn ?? []) if (!ids.has(dep)) errors.push(`${m?.id} : dépendance inexistante « ${dep} »`);
  }
  return { ok: errors.length === 0, errors };
}

/**
 * Vue PUBLIQUE d'une mission (indexable, envoyable au client) : aucune donnée
 * interne de notation, aucune solution. Les livrables n'exposent que leurs
 * critères d'acceptation (sections attendues), jamais d'attendu caché.
 */
export function publicMissionView(m) {
  return {
    id: m.id, title: m.title, description: m.description, category: m.category,
    difficulty: m.difficulty, estimatedHours: m.estimatedHours,
    skills: [...(m.skills ?? [])], trackRefs: [...(m.trackRefs ?? [])], dayRefs: [...(m.dayRefs ?? [])],
    deliverables: (m.deliverables ?? []).map((d) => ({
      id: d.id, kind: d.kind, title: d.title, required: d.required, validation: d.validation,
      // Sections attendues = critères d'acceptation publics (pas un attendu caché).
      requiredSections: d.docSpec?.requiredSections ?? undefined,
    })),
    rubric: (m.rubric ?? []).map((r) => ({ label: r.label, blocking: !!r.blocking })),
  };
}

// ── Validation STRUCTURELLE honnête des documents ────────────────────────────
// Vérifie la forme, JAMAIS le fond. Ne prétend pas juger la qualité sémantique.

const PLACEHOLDER_RE = /\b(todo|tbd|fixme|xxx+|lorem ipsum|à compléter|à remplir|placeholder)\b|<[^>\n]{0,40}>|\.\.\.\.+/i;

/**
 * @param {string} text
 * @param {{requiredSections:string[], minLength?:number, maxLength?:number, requireMentions?:string[], forbidPlaceholders?:boolean}} spec
 * @returns {{ ok:boolean, missingSections:string[], placeholders:boolean, tooShort:boolean, tooLong:boolean, missingMentions:string[] }}
 */
export function validateDocumentStructure(text, spec = {}) {
  const t = isStr(text) ? text : '';
  const lower = t.toLowerCase();
  const requiredSections = spec.requiredSections ?? [];
  const missingSections = requiredSections.filter((s) => !lower.includes(String(s).toLowerCase()));
  const forbid = spec.forbidPlaceholders !== false;
  const placeholders = forbid && PLACEHOLDER_RE.test(t);
  const tooShort = spec.minLength != null && t.trim().length < spec.minLength;
  const tooLong = spec.maxLength != null && t.length > spec.maxLength;
  const missingMentions = (spec.requireMentions ?? []).filter((s) => !lower.includes(String(s).toLowerCase()));
  const ok = missingSections.length === 0 && !placeholders && !tooShort && !tooLong && missingMentions.length === 0;
  return { ok, missingSections, placeholders, tooShort, tooLong, missingMentions };
}
