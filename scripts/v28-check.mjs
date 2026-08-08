#!/usr/bin/env node
// Gate V28 — lance : npm run v28:check
//
// Valide STRUCTURELLEMENT les leçons du périmètre V28 (cf.
// docs/architecture/v28-lessons-plan.json) : les NOUVELLES leçons Observabilité/SRE/
// incident ET les leçons HISTORIQUES corrigées (audit rétroactif). Mêmes contrôles
// que v27:check : on-ramp débutant AVANT l'objectif, prérequis explicités (pas un lien
// nu), vocabulaire, sections minimales, absence de placeholders, liens internes
// valides, practiceRefs résolus (obligatoires pour les leçons critiques), graphe de
// prérequis sans cycle, distinction réel/simulé (scan de danger). NE JUGE JAMAIS la
// profondeur par la longueur — la qualité réelle est auditée à la main
// (docs/PEDAGOGICAL-AUDIT-V28.md). Lecture seule ; exit 1 au moindre problème.
// Robuste : passe si le plan est absent ou sans leçon.

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
const AUTHORING_MARKERS = /\bTODO\b|\bFIXME\b|PLACEHOLDER|Lorem ipsum|à compléter|a completer|XXX(?!X)/i;

const planPath = R('docs/architecture/v28-lessons-plan.json');
if (!existsSync(planPath)) {
  console.log('── Gate V28 (Observabilité/SRE & audit rétroactif) ──');
  console.log('⚠️  plan v28-lessons-plan.json absent : rien à valider (attendu avant CP2).');
  console.log('\n✅ V28 valide (aucun périmètre déclaré).');
  process.exit(0);
}

const plan = JSON.parse(readFileSync(planPath, 'utf8'));
const newLessons = Array.isArray(plan.newLessons) ? plan.newLessons : [];
const hardenedLegacy = Array.isArray(plan.hardenedLegacy) ? plan.hardenedLegacy : [];
const perimeter = [...new Set([...newLessons, ...hardenedLegacy])];
const critical = new Set(Array.isArray(plan.critical) ? plan.critical : []);
const prereq = plan.prereq && typeof plan.prereq === 'object' ? plan.prereq : {};
const bySlug = new Map(LESSONS.map((l) => [l.file.replace(/\.md$/, ''), l]));

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

  if (AUTHORING_MARKERS.test(md)) errors.push(`${where} : marqueur d'authoring non résolu`);

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

console.log('── Gate V28 (Observabilité/SRE & audit rétroactif) ──');
console.log(`Nouvelles leçons obs/SRE : ${newLessons.length}`);
console.log(`Historiques corrigées    : ${hardenedLegacy.length}`);
console.log(`Leçons critiques         : ${critical.size}`);
for (const w of warn) console.log(`⚠️  ${w}`);
if (errors.length) { console.error(`\n❌ ${errors.length} problème(s) :`); for (const e of errors) console.error(`   • ${e}`); process.exit(1); }
console.log('\n✅ V28 valide : périmètre conforme (on-ramp, prérequis, vocabulaire, liens, pratique, graphe acyclique, réel/simulé).');
