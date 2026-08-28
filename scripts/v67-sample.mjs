// V67 · CP1 — ÉCHANTILLON GELÉ. Tirage déterministe, publié AVANT toute
// transformation, et non modifiable après avoir vu les résultats.
//
// Deux échantillons sont produits :
//   PRIMAIRE  — audité au CP1 (avant) et rejoué à l'identique au CP14 (après).
//   AVEUGLE   — jamais regardé pendant la migration, ouvert seulement au CP14.
//               Sa seed est publiée ici, mais son contenu ne doit être consulté
//               par personne avant l'audit final : c'est ce qui lui donne sa
//               valeur de contrôle.
//
// Aucun `Math.random`. Le générateur est mulberry32, comme en V66.

import { readFileSync, readdirSync } from 'node:fs';

export const SEED_PRIMAIRE = 20260901;
export const SEED_AVEUGLE = 20260902;

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tire n éléments distincts, déterministe. */
function tirer(liste, n, r) {
  const pool = [...liste];
  const out = [];
  while (out.length < n && pool.length) {
    out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  }
  return out;
}

const P = JSON.parse(readFileSync('data/program.json', 'utf8'));
const lessons = readdirSync('curriculum/lessons').filter((f) => f.endsWith('.md')).map((f) => f.replace('.md', '')).sort();

/** Journée la plus précoce qui enseigne chaque leçon — pour stratifier par période. */
const premierJour = new Map();
for (const d of P.days) {
  let md = '';
  try { md = readFileSync(`curriculum/days/day-${String(d.day).padStart(3, '0')}.md`, 'utf8'); } catch { continue; }
  for (const s of new Set([...md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))) {
    if (!premierJour.has(s) || d.day < premierJour.get(s)) premierJour.set(s, d.day);
  }
}

/** Famille éditoriale, règle identique à V66 (marqueur de surface, publiée avec sa limite). */
function famille(slug) {
  const md = readFileSync(`curriculum/lessons/${slug}.md`, 'utf8');
  const h = [...md.matchAll(/^## +(.+)$/gm)];
  const i = h.findIndex((m) => /explication (compl|progressive)/i.test(m[1]));
  if (i < 0) return '?';
  const b = md.slice(h[i].index, i + 1 < h.length ? h[i + 1].index : md.length);
  if (/progressive/i.test(h[i][1])) return 'B';
  return (b.match(/^### /gm) ?? []).length >= 2 ? 'C' : 'A';
}

/**
 * Échantillon PRIMAIRE : au moins 20 leçons couvrant les trois familles, les
 * trois tiers de l'année et plusieurs domaines, plus 5 revues.
 * La stratification vient AVANT le tirage : on ne tire au hasard qu'à
 * l'intérieur d'une strate, pour qu'aucune strate ne puisse être absente.
 */
export function echantillonPrimaire() {
  const r = rng(SEED_PRIMAIRE);
  const parFamille = { A: [], B: [], C: [] };
  for (const s of lessons) {
    const f = famille(s);
    if (parFamille[f]) parFamille[f].push(s);
  }
  const periode = (s) => {
    const j = premierJour.get(s) ?? 999;
    return j <= 120 ? 'debut' : j <= 245 ? 'milieu' : 'fin';
  };
  const choisies = new Set();
  // 8 A, 4 B, 8 C — proportionnel, avec un plancher qui garantit B.
  for (const [f, n] of [['A', 8], ['B', 4], ['C', 8]]) {
    for (const s of tirer(parFamille[f], n, r)) choisies.add(s);
  }
  // Garantir les trois périodes : si une manque, on la complète.
  for (const p of ['debut', 'milieu', 'fin']) {
    if ([...choisies].some((s) => periode(s) === p)) continue;
    const cand = lessons.filter((s) => periode(s) === p && !choisies.has(s));
    for (const s of tirer(cand, 2, r)) choisies.add(s);
  }
  const revuesToutes = P.days.filter((d) => /revue hebdo/i.test(d.title ?? '')).map((d) => d.day);
  return {
    seed: SEED_PRIMAIRE,
    lecons: [...choisies].sort(),
    revues: tirer(revuesToutes, 5, r).sort((a, b) => a - b),
  };
}

/** Échantillon AVEUGLE — ne pas consulter avant le CP14. */
export function echantillonAveugle() {
  const r = rng(SEED_AVEUGLE);
  const revuesToutes = P.days.filter((d) => /revue hebdo/i.test(d.title ?? '')).map((d) => d.day);
  return {
    seed: SEED_AVEUGLE,
    lecons: tirer(lessons, 20, r).sort(),
    revues: tirer(revuesToutes, 5, r).sort((a, b) => a - b),
  };
}

if (process.argv[1]?.endsWith('v67-sample.mjs')) {
  const p = echantillonPrimaire();
  if (process.argv.includes('--aveugle')) {
    console.log(JSON.stringify(echantillonAveugle(), null, 1));
  } else if (process.argv.includes('--json')) {
    console.log(JSON.stringify(p, null, 1));
  } else {
    console.log(`ÉCHANTILLON PRIMAIRE — seed ${p.seed}`);
    console.log(`  ${p.lecons.length} leçons :`);
    for (const s of p.lecons) console.log(`    ${famille(s)}  j.${String(premierJour.get(s) ?? '—').padStart(3)}  ${s}`);
    console.log(`  ${p.revues.length} revues : ${p.revues.join(', ')}`);
    const fams = p.lecons.map(famille);
    console.log(`  familles : A ${fams.filter((f) => f === 'A').length} · B ${fams.filter((f) => f === 'B').length} · C ${fams.filter((f) => f === 'C').length}`);
  }
}
