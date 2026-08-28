// V66 · CP0 — ÉCHANTILLON STRATIFIÉ, REPRODUCTIBLE, GELÉ AVANT LECTURE.
//
// Construit AVANT d'avoir lu la moindre leçon (brief §3 : « Ne change jamais
// l'échantillon après avoir vu les résultats »). Le tirage aléatoire est
// déterministe : même seed, même échantillon, toujours.
//
//   node scripts/v66-sample.mjs          → l'échantillon
//   node scripts/v66-sample.mjs --json   → JSON, pour les outils de mesure
//
// SEED PUBLIÉE : 20260828 (date du sprint, choisie avant le tirage).

import { readFileSync, readdirSync, existsSync } from 'node:fs';

export const SEED = 20260828;

/** PRNG déterministe (mulberry32). Aucune dépendance, aucun Math.random. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const prog = JSON.parse(readFileSync('data/program.json', 'utf8'));
const words = (t) => t.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
const dayFile = (n) => `curriculum/days/day-${String(n).padStart(3, '0')}.md`;
const dayText = (n) => (existsSync(dayFile(n)) ? readFileSync(dayFile(n), 'utf8') : '');

/** Volume total réellement présenté à l'apprenant pour une journée. */
function volume(day) {
  const t = dayText(day.day);
  const slugs = [...new Set([...t.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))];
  let lw = 0;
  for (const s of slugs) {
    const f = `curriculum/lessons/${s}.md`;
    if (existsSync(f)) lw += words(readFileSync(f, 'utf8'));
  }
  const sf = `curriculum/solutions/day-${String(day.day).padStart(3, '0')}-solution.md`;
  const sw = existsSync(sf) ? words(readFileSync(sf, 'utf8')) : 0;
  return { dayW: words(t), lessons: slugs, lessonW: lw, solW: sw, total: words(t) + lw + sw };
}

const days = prog.days.map((d) => ({ ...d, ...volume(d) }));
const de = JSON.parse(readFileSync('data/day-exercises.json', 'utf8'));
for (const d of days) d.exos = (de[String(d.day)] ?? []).length;
const codeLines = (n) => (dayText(n).match(/```[\s\S]*?```/g) ?? [])
  .reduce((a, b) => a + b.split('\n').length - 2, 0);
for (const d of days) d.code = codeLines(d.day);

// ── Strates. Une par domaine exigé au §3 du brief, prise sur la MÉDIANE de
// volume du domaine — ni la meilleure, ni la pire : la représentative.
const DOMAINS = [
  ['fondations-m1', (d) => d.month === 1],
  ['fondations-m2', (d) => d.month === 2],
  ['backend-api', (d) => d.skill === 'http'],
  ['frontend-react', (d) => d.skill === 'jsts' && d.month >= 4],
  ['sql-data', (d) => d.skill === 'sql'],
  ['python', (d) => d.skill === 'python'],
  ['machine-learning', (d) => d.skill === 'ml'],
  ['deep-learning', (d) => d.skill === 'dl'],
  ['llm', (d) => d.skill === 'llm'],
  ['rag', (d) => d.skill === 'rag'],
  ['agents', (d) => d.skill === 'agents'],
  ['evaluation-ia', (d) => d.skill === 'evalia'],
  ['securite', (d) => d.skill === 'secu'],
  ['architecture', (d) => d.skill === 'archi'],
  ['software-engineering', (d) => d.skill === 'se'],
  ['git-linux', (d) => d.skill === 'gitlinux'],
  ['algo-ds', (d) => d.skill === 'algo' || d.skill === 'ds'],
  ['communication', (d) => d.skill === 'comm'],
];

const picked = new Map();
const add = (day, why) => {
  if (!picked.has(day.day)) picked.set(day.day, { ...day, strates: [] });
  picked.get(day.day).strates.push(why);
};

for (const [name, pred] of DOMAINS) {
  const pool = days.filter(pred).sort((a, b) => a.total - b.total);
  if (!pool.length) continue;
  add(pool[Math.floor(pool.length / 2)], `domaine:${name}`); // médiane du domaine
}

// Extrêmes de volume — 5 plus courtes, 5 plus longues.
const byVol = [...days].sort((a, b) => a.total - b.total);
for (const d of byVol.slice(0, 5)) add(d, 'volume:court');
for (const d of byVol.slice(-5)) add(d, 'volume:long');

// Difficulté annoncée : les deux extrêmes.
for (const d of days.filter((x) => x.difficulty <= 2).slice(0, 3)) add(d, 'difficulté:faible');
for (const d of days.filter((x) => x.difficulty >= 4).slice(0, 3)) add(d, 'difficulté:élevée');

// Enrichissement : journées « detailed » vs non.
for (const d of days.filter((x) => x.detailed).slice(0, 3)) add(d, 'enrichie:oui');
for (const d of days.filter((x) => !x.detailed).slice(0, 3)) add(d, 'enrichie:non');

// Nature : beaucoup de code vs purement théorique.
const byCode = [...days].sort((a, b) => b.code - a.code);
for (const d of byCode.slice(0, 3)) add(d, 'nature:code');
for (const d of byCode.filter((x) => x.code === 0).slice(0, 3)) add(d, 'nature:théorie');

// Sans filet : journées sans exercice ET sans leçon liée.
for (const d of days.filter((x) => x.exos === 0 && x.lessons.length === 0).slice(0, 3)) add(d, 'sansfilet');

// 5 tirages ALÉATOIRES, seed publiée.
{
  const r = rng(SEED);
  const pool = [...days];
  for (let i = 0; i < 5; i += 1) {
    const k = Math.floor(r() * pool.length);
    add(pool[k], `aléatoire:seed${SEED}`);
    pool.splice(k, 1);
  }
}

const sample = [...picked.values()].sort((a, b) => a.day - b.day);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ seed: SEED, n: sample.length, days: sample }, null, 2));
} else {
  console.log(`ÉCHANTILLON V66 — seed ${SEED} — ${sample.length} journées\n`);
  console.log('jour  mois  compétence  diff  détail  mots  exos  code  strates');
  for (const d of sample) {
    console.log(
      String(d.day).padStart(4),
      String(d.month).padStart(4),
      (d.skill ?? '').padEnd(10),
      String(d.difficulty).padStart(4),
      (d.detailed ? 'oui' : 'non').padStart(6),
      String(d.total).padStart(6),
      String(d.exos).padStart(4),
      String(d.code).padStart(5),
      ' ' + d.strates.join(' '),
    );
  }
  const t = sample.map((d) => d.total).sort((a, b) => a - b);
  console.log(`\nvolume — min ${t[0]} · médiane ${t[Math.floor(t.length / 2)]} · max ${t[t.length - 1]}`);
  console.log(`domaines couverts : ${new Set(sample.flatMap((d) => d.strates.filter((s) => s.startsWith('domaine:')))).size} / ${DOMAINS.length}`);
}
