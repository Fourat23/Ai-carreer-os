// V73 · CP11 — PRATIQUE, PROJETS, TRANSFERT.
//
// La question du checkpoint : chaque compétence promise est-elle PRATIQUÉE et APPLIQUÉE, ou
// seulement exposée ? Trois niveaux distincts, mesurés séparément parce qu'ils ne se
// remplacent pas :
//
//   EXPOSITION  la journée met la notion devant l'apprenant (cours, leçon liée)
//   PRATIQUE    la journée fait produire quelque chose sur cette notion — un exercice de la
//               banque, ou un artefact de pratique atteignable depuis une leçon programmée
//   APPLICATION la notion sert dans une journée de PRODUCTION (projet)
//
// Deux compteurs de pratique, et il faut les deux :
//   `artefacts`  = artefacts de pratique atteignables depuis les leçons PROGRAMMÉES qui
//                  déclarent la compétence. C'est la mesure du CP0, reprise à l'identique pour
//                  que les deux chiffres soient comparables.
//   `exercices`  = exercices de la banque effectivement attachés aux journées qui portent la
//                  compétence. C'est ce que l'apprenant rencontre dans son calendrier.
//   Une compétence peut être riche en artefacts et pauvre en exercices programmés — c'est
//   précisément l'écart qu'il faut voir.
//
// RÈGLE DÉCLARÉE AVANT MESURE (§7 anti-Goodhart) : une compétence pratiquée DANS le projet
// d'une autre compétence EST pratiquée. Le CP11 ne fabriquera pas un projet par compétence
// pour faire monter un compteur.
//
// Usage : node scripts/v73/cp11-pratique.mjs [--json] [--ecrire]
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { buildCurriculumGraph } from '../../lib/curriculum-graph.mjs';

const prog = JSON.parse(readFileSync('data/program.json', 'utf8'));
const { LESSONS } = await import('../data/lessons-map.mjs');
const g = JSON.parse(readFileSync('docs/v73/curriculum-graph.json', 'utf8'));
const statuts = JSON.parse(readFileSync('docs/v73/V73-STATUTS-128.json', 'utf8'));
const lire = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const idsDe = (d) => (existsSync(`data/${d}`) ? readdirSync(`data/${d}`).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)) : []);
const labRoutes = new Set([...lire('app/doc/[...slug]/page.tsx').match(/const LAB_ROUTES[^}]*}/s)?.[0]
  .matchAll(/^\s*'?([a-z0-9-]+)'?\s*:/gm) ?? []].map((m) => m[1]).filter((x) => x !== 'const'));

const leconsPourGraphe = LESSONS.map((e) => ({
  slug: e.file.replace(/\.md$/, ''), title: e.title, cat: e.cat, level: e.level,
  skills: e.skills ?? [], practiceRefs: e.practiceRefs ?? [],
}));
const graphe = buildCurriculumGraph({
  lessons: leconsPourGraphe, prereqPlans: [],
  known: { exercises: new Set(idsDe('exercises')), playbooks: new Set(idsDe('playbooks')),
           missions: new Set(idsDe('missions')), labs: labRoutes,
           skills: new Set(prog.skills.map((s) => s.id)) },
});

// leçons PROGRAMMÉES = celles qu'au moins une journée relie (statut établi au CP4)
const programmees = new Set(g.jours.flatMap((d) => d.lecons));
const skillsDeLecon = new Map(leconsPourGraphe.map((l) => [l.slug, l.skills ?? []]));
const sansLecon = new Set(prog.skills.map((s) => s.id).filter((id) => !statuts.some((l) => l.competences.includes(id))));

const fiches = prog.skills.map((s) => {
  const leconsDeLaCompetence = [...programmees].filter((sl) => (skillsDeLecon.get(sl) ?? []).includes(s.id));
  const artefacts = new Set(graphe.practices.filter((p) => leconsDeLaCompetence.includes(p.lesson)).map((p) => `${p.kind}:${p.id}`));

  const jours = g.jours.filter((d) => !d.revue && (d.competencesPortees.includes(s.id) || (sansLecon.has(s.id) && d.etiquette === s.id)));
  const exercices = new Set(jours.flatMap((d) => d.exercices));
  const production = jours.filter((d) => d.estProduction);
  const pratique = jours.filter((d) => !d.estProduction && d.exercices.length);
  const exposition = jours.filter((d) => !d.estProduction && !d.exercices.length);

  const niveauMax = Math.max(0, ...prog.months.map((m) => m.expectedScores?.[s.id] ?? 0));
  return {
    competence: s.id, nom: s.name,
    leconsProgrammees: leconsDeLaCompetence.length,
    artefacts: artefacts.size, exercices: exercices.size,
    jExposition: exposition.length, jPratique: pratique.length, jProduction: production.length,
    joursProduction: production.map((d) => d.j),
    projets: [...new Set(production.map((d) => (/^(Projet \d+|DocSense)/.exec(d.titre) ?? [, '?'])[1]))],
    niveauAttendu: niveauMax,
    // le niveau promis exige-t-il davantage que ce que le parcours fait faire ?
    // niveau 1-2 : exposition suffit · 3 : pratique exigée · 4-5 : application exigée
    manque: null,
  };
});
for (const f of fiches) {
  if (f.niveauAttendu >= 4 && f.jProduction === 0) f.manque = 'NIVEAU_4_SANS_APPLICATION';
  else if (f.niveauAttendu >= 3 && f.jPratique + f.jProduction === 0) f.manque = 'NIVEAU_3_SANS_PRATIQUE';
  else if (f.niveauAttendu >= 3 && f.exercices === 0 && f.jProduction === 0) f.manque = 'NIVEAU_3_SANS_ARTEFACT';
}

// ── les projets : ce que chacun fait travailler, et l'écart entre deux projets
const projets = new Map();
for (const d of g.jours) {
  if (d.revue || !d.estProduction) continue;
  const k = (/^(Projet \d+|DocSense)/.exec(d.titre) ?? [, '?'])[1];
  if (!projets.has(k)) projets.set(k, { jours: [], competences: new Map() });
  const p = projets.get(k); p.jours.push(d.j);
  for (const c of d.competencesPortees) p.competences.set(c, (p.competences.get(c) ?? 0) + 1);
}
const fichesProjets = [...projets].map(([k, p]) => ({
  projet: k, n: p.jours.length, de: p.jours[0], a: p.jours.at(-1),
  mois: g.jours[p.jours[0] - 1].mois,
  competences: [...p.competences].sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c}:${n}`),
}));

// ── trous de production : intervalles sans aucune journée de projet
const prod = g.jours.filter((d) => !d.revue && d.estProduction).map((d) => d.j);
const trous = [];
for (let i = 1; i < prod.length; i++) if (prod[i] - prod[i - 1] > 30) trous.push({ de: prod[i - 1], a: prod[i], jours: prod[i] - prod[i - 1] });

// ── leçons enseignées mais jamais construites avec : aucune journée de production ne les relie
const leconsEnProduction = new Set(g.jours.filter((d) => !d.revue && d.estProduction).flatMap((d) => d.lecons));
const jamaisConstruites = statuts
  .filter((l) => programmees.has(l.slug) && !leconsEnProduction.has(l.slug))
  .map((l) => ({ slug: l.slug, statut: l.statut, competences: l.competences }));

const sortie = {
  regle: "Une compétence pratiquée DANS le projet d'une autre EST pratiquée. Le CP11 ne fabrique pas un projet par compétence pour faire monter un compteur.",
  competences: fiches, projets: fichesProjets, trousDeProduction: trous,
  leconsJamaisConstruites: jamaisConstruites,
};
if (process.argv.includes('--ecrire')) {
  const { writeFileSync } = await import('node:fs');
  writeFileSync('docs/v73/pratique-transfert.json', JSON.stringify(sortie, null, 1));
}
if (process.argv.includes('--json')) process.stdout.write(JSON.stringify(sortie));
else {
  const P = (x, n) => String(x).padStart(n);
  console.log('compétence   leçons  artefacts  exos  jExpo  jPrat  jProd  niv  manque');
  for (const f of fiches)
    console.log(`${f.competence.padEnd(12)} ${P(f.leconsProgrammees, 6)} ${P(f.artefacts, 10)} ${P(f.exercices, 5)} ${P(f.jExposition, 6)} ${P(f.jPratique, 6)} ${P(f.jProduction, 6)} ${P(f.niveauAttendu || '—', 4)}  ${f.manque ?? ''}`);
  console.log('\nPROJETS');
  for (const p of fichesProjets) console.log(`  ${p.projet.padEnd(10)} ${P(p.n, 2)} j · j${p.de}-j${p.a} · mois ${p.mois} · ${p.competences.slice(0, 6).join(' ')}`);
  console.log('\nTROUS DE PRODUCTION (> 30 jours sans journée de projet)');
  for (const t of trous) console.log(`  j${t.de} → j${t.a} : ${t.jours} jours`);
  console.log(`\nLEÇONS PROGRAMMÉES MAIS JAMAIS RELIÉES À UNE JOURNÉE DE PRODUCTION : ${jamaisConstruites.length}`);
  const parStatut = {};
  for (const l of jamaisConstruites) (parStatut[l.statut] ??= []).push(l.slug);
  for (const [k, v] of Object.entries(parStatut)) console.log(`  ${k.padEnd(10)} ${v.length}`);
}
