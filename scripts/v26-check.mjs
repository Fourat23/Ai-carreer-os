#!/usr/bin/env node
// Gate V26 — lance : npm run v26:check
//
// Valide STRUCTURELLEMENT les nouvelles Leçons de fond du périmètre V26 (cf.
// docs/architecture/v26-lessons-plan.json) : fichier présent, entrée LESSONS
// cohérente, sections minimales, concepts requis couverts, aucun marqueur
// d'authoring, liens internes valides, absence de duplication manifeste.
// NE JUGE JAMAIS la profondeur par la longueur — la qualité réelle est auditée à la
// main (docs/PEDAGOGICAL-AUDIT-V26.md). Lecture seule ; exit 1 au moindre problème.
// Robuste : passe si le plan est absent (attendu avant CP2) ou sans leçon.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSONS } from './data/lessons-map.mjs';
import { normalizeText } from '../lib/glossary-core.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const LES = R('curriculum/lessons');
const errors = [];
const warn = [];

const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const validDays = new Set(program.days.map((d) => d.day));
const knownSkills = new Set((program.skills ?? []).map((s) => s.id ?? s.slug ?? s));

// Sections minimales attendues (par libellé, tolérant aux emoji/variantes).
const REQUIRED_SECTIONS = [
  ['objectif'],
  ['modèle mental', 'modele mental'],
  ['explication', 'théorie', 'theorie', 'fonctionnement'],
  ['erreurs fréquentes', 'erreurs frequentes', 'pièges', 'pieges', 'anti-pattern'],
  ['à retenir', 'a retenir', 'synthèse', 'synthese'],
  ['vocabulaire'],
  ['liens'],
];
const AUTHORING_MARKERS = /\bTODO\b|\bFIXME\b|PLACEHOLDER|Lorem ipsum|à compléter|a completer|XXX(?!X)/i;

const planPath = R('docs/architecture/v26-lessons-plan.json');
if (!existsSync(planPath)) {
  console.log('── Gate V26 (fondation pédagogique) ──');
  console.log('⚠️  plan v26-lessons-plan.json absent : rien à valider (attendu avant CP2).');
  console.log('\n✅ V26 valide (aucun périmètre déclaré).');
  process.exit(0);
}

const plan = JSON.parse(readFileSync(planPath, 'utf8'));
const newLessons = Array.isArray(plan.newLessons) ? plan.newLessons : [];
const bySlug = new Map(LESSONS.map((l) => [l.file.replace(/\.md$/, ''), l]));
const fingerprints = new Map();

for (const entry of newLessons) {
  const slug = entry.slug;
  const where = `leçon ${slug}`;
  const file = join(LES, `${slug}.md`);
  if (!existsSync(file)) { errors.push(`${where} : fichier curriculum/lessons/${slug}.md manquant`); continue; }
  const md = readFileSync(file, 'utf8');
  const nmd = normalizeText(md);

  // Entrée LESSONS cohérente.
  const meta = bySlug.get(slug);
  if (!meta) errors.push(`${where} : aucune entrée dans LESSONS (lessons-map.mjs)`);
  else {
    if (!meta.title || !meta.title.trim()) errors.push(`${where} : title manquant`);
    if (!meta.cat || !meta.cat.trim()) errors.push(`${where} : cat manquante`);
    if (![1, 2, 3].includes(meta.level)) errors.push(`${where} : level invalide (${meta.level})`);
    if (!Number.isFinite(meta.min) || meta.min <= 0) errors.push(`${where} : min invalide`);
    for (const s of meta.skills ?? []) if (knownSkills.size && !knownSkills.has(s)) warn.push(`${where} : compétence « ${s} » hors taxonomie programme`);
  }

  // Sections minimales.
  for (const variants of REQUIRED_SECTIONS) {
    if (!variants.some((v) => nmd.includes(normalizeText(v)))) errors.push(`${where} : section manquante (${variants[0]})`);
  }

  // Marqueurs d'authoring.
  if (AUTHORING_MARKERS.test(md)) errors.push(`${where} : marqueur d'authoring non résolu (TODO/PLACEHOLDER/…)`);

  // Concepts requis (substring normalisé).
  for (const c of (plan.requiredConcepts?.[slug] ?? [])) {
    if (!nmd.includes(normalizeText(c))) errors.push(`${where} : concept requis absent « ${c} »`);
  }

  // Liens internes valides.
  for (const m of md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)) {
    if (!existsSync(join(LES, `${m[1]}.md`))) errors.push(`${where} : lien mort vers leçon « ${m[1]} »`);
  }
  for (const m of md.matchAll(/\/day\/(\d{1,3})/g)) {
    if (!validDays.has(Number(m[1]))) errors.push(`${where} : lien mort vers jour ${m[1]}`);
  }

  // Empreinte anti-duplication (corps normalisé sans le titre).
  const body = nmd.replace(/[^a-z0-9]+/g, ' ').trim();
  const fp = body.slice(0, 400);
  if (fingerprints.has(fp)) errors.push(`${where} : contenu quasi identique à « ${fingerprints.get(fp)} »`);
  else fingerprints.set(fp, slug);
}

// Périmètre : les leçons du plan doivent réellement être des ajouts V26 (pas des
// leçons pré-existantes détournées). Informatif si baselineRef indisponible.
console.log('── Gate V26 (fondation pédagogique) ──');
console.log(`Leçons V26 déclarées : ${newLessons.length}`);
console.log(`Leçons totales       : ${LESSONS.length}`);
for (const w of warn) console.log(`⚠️  ${w}`);
if (errors.length) { console.error(`\n❌ ${errors.length} problème(s) :`); for (const e of errors) console.error(`   • ${e}`); process.exit(1); }
console.log('\n✅ V26 valide : leçons du périmètre cohérentes (structure, liens, concepts, unicité).');
