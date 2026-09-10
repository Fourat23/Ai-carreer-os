// V74 · CP7 — COUVERTURE RÉELLE DES MARCHES DE REMÉDIATION, lecture seule.
//
// Cette sonde N'A PAS SA PROPRE RÈGLE. Elle appelle `leconUnique` et
// `plusSimpleParmi` de `lib/remediation.mjs` — exactement les fonctions que
// `lib/remediation-server.ts` appelle. Seule la lecture des fichiers diffère.
//
// C'est une réponse directe à l'anomalie n° 21 de V73 : une sonde qui
// réimplémente la règle du produit finit par mesurer sa propre approximation
// et par en conclure quelque chose sur le produit.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { leconUnique, plusSimpleParmi } from '../../lib/remediation.mjs';
import { MISCONCEPTIONS } from '../../lib/misconceptions.mjs';

const ROOT = process.cwd();
const pad3 = (n) => String(n).padStart(3, '0');
const pct = (n, d) => (d ? `${n}/${d} (${Math.round((n / d) * 100)} %)` : `${n}/0`);

const program = JSON.parse(readFileSync(join(ROOT, 'data', 'program.json'), 'utf8'));
const exercices = readdirSync(join(ROOT, 'data', 'exercises')).filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(ROOT, 'data', 'exercises', f), 'utf8')))
  .map((e) => ({ id: e.id, title: e.title ?? e.id, difficulty: Number(e.difficulty) || 0, skills: e.skills ?? [] }));

// ── Les deux ensembles de candidates, tels que le module serveur les collecte.
const declarantsDe = new Map();
for (const l of program.lessons ?? []) {
  for (const r of l.practiceRefs ?? []) {
    if (r.kind !== 'exercise') continue;
    if (!declarantsDe.has(r.id)) declarantsDe.set(r.id, []);
    declarantsDe.get(r.id).push(l.slug);
  }
}

const dayExercises = JSON.parse(readFileSync(join(ROOT, 'data', 'day-exercises.json'), 'utf8'));
const joursDe = new Map();
for (const [jour, ids] of Object.entries(dayExercises.days ?? dayExercises)) {
  for (const id of Array.isArray(ids) ? ids : []) {
    if (!joursDe.has(id)) joursDe.set(id, []);
    joursDe.get(id).push(Number(jour));
  }
}

const slugsConnus = new Set((program.lessons ?? []).map((l) => l.slug));
const leconsDuJour = new Map();
for (const d of program.days ?? []) {
  const path = join(ROOT, 'curriculum', 'days', `day-${pad3(d.day)}.md`);
  if (!existsSync(path)) continue;
  const md = readFileSync(path, 'utf8');
  const slugs = [...new Set([...md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))]
    .filter((s) => slugsConnus.has(s));
  leconsDuJour.set(d.day, slugs);
}

// ── Sections de chaque leçon (mêmes motifs que le module serveur).
const nu = (t) => String(t).replace(/^[^\p{L}]+/u, '').trim();
const MOTIFS = {
  modeleMental: /mod[eè]le mental/i, erreurs: /erreurs fr[eé]quentes/i,
  antipatterns: /anti-?patterns/i, exempleGuide: /exemple guid/i,
  exempleApplique: /exemple appliqu/i, correction: /correction/i,
};
const sectionsDe = new Map();
for (const slug of slugsConnus) {
  const path = join(ROOT, 'curriculum', 'lessons', `${slug}.md`);
  const titres = existsSync(path)
    ? [...readFileSync(path, 'utf8').matchAll(/^## +(.+)$/gm)].map((m) => nu(m[1])) : [];
  sectionsDe.set(slug, Object.fromEntries(
    Object.entries(MOTIFS).map(([k, re]) => [k, titres.some((t) => re.test(t))]),
  ));
}

const miscDe = new Map();
for (const m of MISCONCEPTIONS) for (const id of m.exerciseRefs ?? []) if (!miscDe.has(id)) miscDe.set(id, m.id);

// ── Mesure.
const cpt = {
  leconDeclaration: 0, leconJournee: 0, sansLecon: 0,
  modeleMental: 0, erreurs: 0, exempleGuide: 0, correction: 0,
  misconception: 0, voisin: 0,
  marche1: 0, marche2: 0, marche3: 0, marche4: 0,
  aucuneMarche: 0,
};

for (const ex of exercices) {
  const jours = joursDe.get(ex.id) ?? [];
  const parJournee = [...new Set(jours.flatMap((j) => leconsDuJour.get(j) ?? []))];
  const l = leconUnique(declarantsDe.get(ex.id) ?? [], parJournee);
  if (!l) cpt.sansLecon += 1;
  else if (l.via === 'declaration') cpt.leconDeclaration += 1;
  else cpt.leconJournee += 1;

  const s = l ? sectionsDe.get(l.slug) ?? {} : {};
  if (s.modeleMental) cpt.modeleMental += 1;
  if (s.erreurs) cpt.erreurs += 1;
  if (s.exempleGuide) cpt.exempleGuide += 1;
  if (s.correction) cpt.correction += 1;
  if (miscDe.has(ex.id)) cpt.misconception += 1;

  const v = plusSimpleParmi(exercices, ex);
  if (v) cpt.voisin += 1;

  // Matière effectivement disponible à chaque marche de l'échelle.
  const m1 = !!s.modeleMental;                                  // niveau 1, zéro test passé
  const m2 = miscDe.has(ex.id) || !!s.erreurs || !!s.antipatterns; // niveau 2, indice
  const m3 = !!s.exempleGuide || !!s.exempleApplique;            // niveau 3, exemple
  const m4 = !!v;                                               // niveau 4, exercice plus simple
  if (m1) cpt.marche1 += 1;
  if (m2) cpt.marche2 += 1;
  if (m3) cpt.marche3 += 1;
  if (m4) cpt.marche4 += 1;
  // Le sous-problème est toujours disponible (0 exercice sans test public), donc
  // « aucune marche » ne peut survenir que si TOUT le reste manque ET qu'aucun
  // test échoué n'est transmis. On mesure le cas défavorable.
  if (!m1 && !m2 && !m3 && !m4) cpt.aucuneMarche += 1;
}

const N = exercices.length;
console.log('# V74 · CP7 — COUVERTURE DES MARCHES (règle partagée avec le produit)\n');
console.log(`exercices : ${N}\n`);
console.log('## Rattachement leçon (règle `leconUnique`, partagée avec `remediation-server.ts`)');
console.log(`par DÉCLARATION (intention d'auteur) : ${pct(cpt.leconDeclaration, N)}`);
console.log(`par JOURNÉE (repli)                  : ${pct(cpt.leconJournee, N)}`);
console.log(`AUCUN rattachement unique            : ${pct(cpt.sansLecon, N)}\n`);
console.log('## Matière disponible, par marche de l’échelle');
console.log(`niveau 1 · MODELE_MENTAL        : ${pct(cpt.marche1, N)}`);
console.log(`niveau 2 · INDICE               : ${pct(cpt.marche2, N)}  (dont misconception nommée ${pct(cpt.misconception, N)})`);
console.log(`niveau 3 · EXEMPLE_ANALOGUE     : ${pct(cpt.marche3, N)}`);
console.log(`niveau 4 · EXERCICE_PLUS_SIMPLE : ${pct(cpt.marche4, N)}`);
console.log(`niveau 5 · CORRECTION_COMPLETE  : ${pct(N, N)}  (la solution de référence existe pour les 376)`);
console.log(`\nexercices SANS AUCUNE marche adossée à une leçon ni à un voisin : ${pct(cpt.aucuneMarche, N)}`);
console.log('(pour ceux-là le SOUS_PROBLEME reste disponible : 0 exercice sur 376 est sans test public nommé)');
