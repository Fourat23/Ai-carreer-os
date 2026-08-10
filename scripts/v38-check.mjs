#!/usr/bin/env node
// Gate V38 — lance : npm run v38:check
//
// Valide STRUCTURELLEMENT les leçons du périmètre V38 (cf.
// docs/architecture/v38-lessons-plan.json) : Backend II (API production, async/
// messaging) + System Design fondations + systèmes distribués + leçons durcies le
// cas échéant.
// Mêmes contrôles que v27/v28/v29 : on-ramp débutant AVANT l'objectif, prérequis explicités
// (pas un lien nu), vocabulaire, sections minimales, absence de placeholders, liens
// internes valides, practiceRefs résolus (obligatoires pour les leçons critiques), graphe
// de prérequis sans cycle, distinction réel/simulé (scan de danger).
//
// AJOUTE deux SIGNAUX PÉDAGOGIQUES en AVERTISSEMENT (jamais bloquants seuls, ce sont des
// PROXYS, pas des preuves de compréhension) : densité conceptuelle (trop de vocabulaire
// nouveau d'un coup) et jargon employé « à froid » (terme technique critique utilisé sans
// aucune glose de définition à proximité de son premier usage). Ces signaux alimentent le
// rapport CP11 (docs/PEDAGOGICAL-AUDIT-V38.md).
//
// NE JUGE JAMAIS la profondeur par la longueur. Lecture seule ; exit 1 au moindre problème
// structurel bloquant. Robuste : passe si le plan est absent ou sans leçon.

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSONS } from './data/lessons-map.mjs';
import { normalizeText } from '../lib/glossary-core.mjs';
import { blockingSignals } from '../lib/pedagogy-audit.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const LES = R('curriculum/lessons');
const errors = [];
const warn = [];

const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const validDays = new Set(program.days.map((d) => d.day));

const KNOWN_LABS = new Set(['terminal', 'pipeline', 'cloud-topology', 'kubernetes', 'security', 'cloud-architecture']);
const REQUIRED_SECTIONS = [
  ['le problème d', 'probleme d', 'pour un débutant', 'pour un debutant'], // on-ramp
  ['objectif'],
  ['prérequis', 'prerequis'],
  ['modèle mental', 'modele mental'],
  ['explication', 'théorie', 'theorie', 'fonctionnement'],
  ['exemple guidé', 'exemple guide'],
  ['erreurs fréquentes', 'erreurs frequentes', 'pièges', 'pieges'],
  ['à retenir', 'a retenir', 'synthèse', 'synthese'],
  ['vocabulaire'],
  ['liens'],
];
// Marqueurs d'authoring non résolus. NB : « placeholder » en minuscules est un
// ATTRIBUT HTML légitime (leçons formulaires) — on ne flague donc que la forme
// d'authoring PLACEHOLDER en MAJUSCULES (convention), pas le mot en minuscules.
const AUTHORING_MARKERS = /\bTODO\b|\bFIXME\b|Lorem ipsum|à compléter|a completer|XXX(?!X)/i;
const AUTHORING_MARKERS_CS = /\bPLACEHOLDER\b/;

// Seuil de densité conceptuelle : nombre de termes de vocabulaire « gras » DISTINCTS
// au-dessus duquel on alerte (proxy de surcharge cognitive). Non bloquant.
const DENSITY_WARN = 42;
// Jargon critique susceptible d'être « front-loadé » : si le premier usage n'a aucune
// glose de définition à proximité, on alerte (proxy, non bloquant).
const CRITICAL_JARGON = [
  'reconciliation', 'réconciliation', 'idempotence', 'idempotent', 'coupling', 'couplage',
  'cohesion', 'cohésion', 'invariant', 'closure', 'hydration', 'hydratation',
  'isolation', 'sérialisation', 'normalisation', 'sharding', 'partitionnement',
  'backpressure', 'memoization', 'mémoïsation',
];
// Indices de glose (définition/contextualisation) attendus près d'un premier usage.
const GLOSS_CUES = [
  'c’est-à-dire', "c'est-à-dire", 'autrement dit', 'signifie', 'désigne', 'appelé', 'appelée',
  'appelée', "s'appelle", 's’appelle', 'consiste à', 'correspond à', ' : ', '(', 'nommé',
];

const planPath = R('docs/architecture/v38-lessons-plan.json');
if (!existsSync(planPath)) {
  console.log('── Gate V38 (Backend II + System Design)');
  console.log('⚠️  plan v38-lessons-plan.json absent : rien à valider (attendu avant CP2).');
  console.log('\n✅ V38 valide (aucun périmètre déclaré).');
  process.exit(0);
}

const plan = JSON.parse(readFileSync(planPath, 'utf8'));
const newLessons = Array.isArray(plan.newLessons) ? plan.newLessons : [];
const hardenedLegacy = Array.isArray(plan.hardenedLegacy) ? plan.hardenedLegacy : [];
const perimeter = [...new Set([...newLessons, ...hardenedLegacy])];
const critical = new Set(Array.isArray(plan.critical) ? plan.critical : []);
const removedLessons = Array.isArray(plan.removedLessons) ? plan.removedLessons : [];
const prereq = plan.prereq && typeof plan.prereq === 'object' ? plan.prereq : {};
const bySlug = new Map(LESSONS.map((l) => [l.file.replace(/\.md$/, ''), l]));

// Les leçons SPLITTÉES/retirées ne doivent plus exister (ni dans LESSONS, ni sur
// disque, ni référencées comme prérequis) — sinon doublon ou lien mort.
for (const slug of removedLessons) {
  if (bySlug.has(slug)) errors.push(`leçon retirée ${slug} : encore présente dans LESSONS (doublon)`);
  if (existsSync(join(LES, `${slug}.md`))) errors.push(`leçon retirée ${slug} : fichier .md encore présent`);
  for (const [s, deps] of Object.entries(prereq)) {
    if ((deps || []).includes(slug)) errors.push(`leçon retirée ${slug} : encore référencée en prérequis de ${s}`);
  }
}

function sectionBody(md, labels) {
  const lines = md.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s/.test(lines[i]) && labels.some((l) => normalizeText(lines[i]).includes(normalizeText(l)))) {
      const body = [];
      for (let j = i + 1; j < lines.length && !/^##\s/.test(lines[j]); j++) body.push(lines[j]);
      return body.join('\n');
    }
  }
  return null;
}

function headingIndex(md, labels) {
  const lines = md.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s/.test(lines[i]) && labels.some((l) => normalizeText(lines[i]).includes(normalizeText(l)))) return i;
  }
  return -1;
}

// Densité conceptuelle : nombre de termes **gras** distincts (proxy de vocabulaire neuf).
function conceptDensity(md) {
  const set = new Set();
  for (const m of md.matchAll(/\*\*([^*]{2,40})\*\*/g)) set.add(normalizeText(m[1]).trim());
  return set.size;
}

// Jargon à froid : premier usage sans glose dans une fenêtre de ±160 caractères, et absent
// de la section Vocabulaire. Proxy volontairement conservateur.
function coldJargon(md) {
  const nmd = md.toLowerCase();
  const vocab = normalizeText(sectionBody(md, ['vocabulaire']) || '');
  const cold = [];
  for (const term of CRITICAL_JARGON) {
    const t = term.toLowerCase();
    const idx = nmd.indexOf(t);
    if (idx === -1) continue;
    const windowText = md.slice(Math.max(0, idx - 160), idx + t.length + 160).toLowerCase();
    const hasGloss = GLOSS_CUES.some((c) => windowText.includes(c.toLowerCase()));
    const inVocab = vocab.includes(normalizeText(term));
    if (!hasGloss && !inVocab) cold.push(term);
  }
  return cold;
}

for (const slug of perimeter) {
  const where = `leçon ${slug}`;
  const file = join(LES, `${slug}.md`);
  if (!existsSync(file)) { errors.push(`${where} : fichier curriculum/lessons/${slug}.md manquant`); continue; }
  const md = readFileSync(file, 'utf8');
  const nmd = normalizeText(md);

  for (const variants of REQUIRED_SECTIONS) {
    if (!variants.some((v) => nmd.includes(normalizeText(v)))) errors.push(`${where} : section manquante (${variants[0]})`);
  }

  const iOnramp = headingIndex(md, ['le problème d', 'probleme d', 'pour un débutant', 'pour un debutant']);
  const iObj = headingIndex(md, ['objectif']);
  if (iOnramp === -1) errors.push(`${where} : on-ramp débutant « Le problème d'abord » absent`);
  else if (iObj !== -1 && iOnramp > iObj) errors.push(`${where} : l'on-ramp débutant doit précéder l'Objectif`);

  const preBody = sectionBody(md, ['prérequis', 'prerequis']);
  if (preBody != null) {
    const prose = preBody.replace(/\[[^\]]*\]\([^)]*\)/g, ' ').replace(/`[^`]*`/g, ' ').replace(/[^\p{L}\s]/gu, ' ');
    const words = prose.split(/\s+/).filter((w) => w.length > 1);
    if (words.length < 12) errors.push(`${where} : prérequis trop maigres (expliciter ce qu'il faut savoir et pourquoi)`);
  }

  if (AUTHORING_MARKERS.test(md) || AUTHORING_MARKERS_CS.test(md)) errors.push(`${where} : marqueur d'authoring non résolu`);

  for (const m of md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)) {
    if (!existsSync(join(LES, `${m[1]}.md`))) errors.push(`${where} : lien mort vers leçon « ${m[1]} »`);
  }
  for (const m of md.matchAll(/\/day\/(\d{1,3})/g)) {
    if (!validDays.has(Number(m[1]))) errors.push(`${where} : lien mort vers jour ${m[1]}`);
  }

  for (const s of blockingSignals(md)) errors.push(`${where} : signal bloquant « ${s.code} » — ${s.excerpt}`);

  const meta = bySlug.get(slug);
  const refs = Array.isArray(meta?.practiceRefs) ? meta.practiceRefs : [];
  if (critical.has(slug) && refs.length === 0) errors.push(`${where} : leçon critique sans practiceRefs (lier au moins un artefact pratique)`);
  for (const r of refs) {
    if (!r || typeof r !== 'object') { errors.push(`${where} : practiceRef invalide`); continue; }
    if (r.kind === 'exercise' && !existsSync(R(`data/exercises/${r.id}.json`))) errors.push(`${where} : practiceRef exercice introuvable « ${r.id} »`);
    else if (r.kind === 'mission' && !existsSync(R(`data/missions/${r.id}.json`))) errors.push(`${where} : practiceRef mission introuvable « ${r.id} »`);
    else if (r.kind === 'playbook' && !existsSync(R(`data/playbooks/${r.id}.json`))) errors.push(`${where} : practiceRef playbook introuvable « ${r.id} »`);
    else if (r.kind === 'lab' && !KNOWN_LABS.has(r.id)) errors.push(`${where} : practiceRef Lab inconnu « ${r.id} »`);
    else if (!['exercise', 'mission', 'playbook', 'lab'].includes(r.kind)) errors.push(`${where} : practiceRef de kind inconnu « ${r.kind} »`);
  }

  // Signaux pédagogiques (proxys, non bloquants).
  const density = conceptDensity(md);
  if (density > DENSITY_WARN) warn.push(`${where} : densité conceptuelle élevée (${density} termes en gras > ${DENSITY_WARN}) — vérifier la charge cognitive`);
  const cold = coldJargon(md);
  if (cold.length) warn.push(`${where} : jargon possiblement « à froid » (${cold.join(', ')}) — vérifier la glose au premier usage`);
}

for (const [slug, deps] of Object.entries(prereq)) {
  if (!bySlug.has(slug)) errors.push(`prereq : slug source inconnu « ${slug} »`);
  for (const d of (Array.isArray(deps) ? deps : [])) if (!bySlug.has(d)) errors.push(`prereq : dépendance inconnue « ${d} » (de ${slug})`);
}
(function detectCycle() {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map();
  const visit = (n, stack) => {
    color.set(n, GRAY);
    for (const d of (prereq[n] ?? [])) {
      if (color.get(d) === GRAY) { errors.push(`prereq : cycle détecté (${[...stack, n, d].join(' → ')})`); return true; }
      if ((color.get(d) ?? WHITE) === WHITE && visit(d, [...stack, n])) return true;
    }
    color.set(n, BLACK);
    return false;
  };
  for (const n of Object.keys(prereq)) if ((color.get(n) ?? WHITE) === WHITE) if (visit(n, [])) return;
})();

console.log('── Gate V38 (Backend II + System Design)');
console.log(`Nouvelles leçons  : ${newLessons.length}`);
console.log(`Historiques corr. : ${hardenedLegacy.length}`);
console.log(`Leçons critiques  : ${critical.size}`);
for (const w of warn) console.log(`⚠️  ${w}`);
if (errors.length) { console.error(`\n❌ ${errors.length} problème(s) :`); for (const e of errors) console.error(`   • ${e}`); process.exit(1); }
console.log('\n✅ V38 valide : périmètre conforme (on-ramp, prérequis, vocabulaire, liens, pratique, graphe acyclique, réel/simulé).');
