// V74 · CP7 — SONDE DE SUBSTRAT, LECTURE SEULE.
//
// Avant d'écrire une règle de remédiation, mesurer ce sur quoi elle pourra
// réellement s'appuyer. Une marche de remédiation qui n'a de matière que sur
// 4 exercices sur 376 n'est pas une marche : c'est une décoration.
//
// Cette sonde ne modifie rien. Elle répond à quatre questions :
//   A. combien d'exercices ont un VOISIN STRICTEMENT PLUS SIMPLE ?
//   B. combien d'exercices ont une MISCONCEPTION enregistrée ?
//   C. combien de leçons portent les sections d'un indice / d'un exemple ?
//   D. quelle est la structure des tests (le sous-problème s'y appuie) ?
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { MISCONCEPTIONS } from '../../lib/misconceptions.mjs';

const ROOT = process.cwd();
const EX_DIR = join(ROOT, 'data', 'exercises');
const LEC_DIR = join(ROOT, 'curriculum', 'lessons');

const exercises = readdirSync(EX_DIR).filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(EX_DIR, f), 'utf8')));

const pct = (n, d) => (d ? `${n}/${d} (${Math.round((n / d) * 100)} %)` : `${n}/0`);
const med = (a) => {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

// ── A. VOISIN PLUS SIMPLE ────────────────────────────────────────────────
const diffs = exercises.map((e) => Number(e.difficulty) || 0);
const parDiff = {};
for (const d of diffs) parDiff[d] = (parDiff[d] ?? 0) + 1;

let avecVoisin = 0;
const nbVoisins = [];
for (const e of exercises) {
  const skills = new Set(e.skills ?? []);
  const d = Number(e.difficulty) || 0;
  const v = exercises.filter((o) => o.id !== e.id
    && (Number(o.difficulty) || 0) < d
    && (o.skills ?? []).some((s) => skills.has(s)));
  if (v.length) { avecVoisin += 1; nbVoisins.push(v.length); }
}

// ── B. MISCONCEPTIONS ────────────────────────────────────────────────────
const exAvecMisc = new Set();
for (const m of MISCONCEPTIONS) for (const id of m.exerciseRefs ?? []) exAvecMisc.add(id);
const exReels = new Set(exercises.map((e) => e.id));
const miscExistants = [...exAvecMisc].filter((id) => exReels.has(id));
const miscFantomes = [...exAvecMisc].filter((id) => !exReels.has(id));

const skillsAvecMisc = new Set(MISCONCEPTIONS.map((m) => m.skill));
let exCouvertsParSkill = 0;
for (const e of exercises) if ((e.skills ?? []).some((s) => skillsAvecMisc.has(s))) exCouvertsParSkill += 1;

// ── C. SECTIONS DE LEÇON ─────────────────────────────────────────────────
const nu = (t) => String(t).replace(/^[^\p{L}]+/u, '').trim();
const MOTIFS = {
  erreurs: /erreurs fr[eé]quentes/i,
  antipatterns: /anti-?patterns/i,
  modeleMental: /mod[eè]le mental/i,
  exempleGuide: /exemple guid/i,
  exempleApplique: /exemple appliqu/i,
  correction: /correction/i,
  miniExercice: /mini-?exercice/i,
  verification: /v[eé]rification de compr[eé]hension/i,
};
const lecons = readdirSync(LEC_DIR).filter((f) => f.endsWith('.md'));
const compte = Object.fromEntries(Object.keys(MOTIFS).map((k) => [k, 0]));
for (const f of lecons) {
  const titres = [...readFileSync(join(LEC_DIR, f), 'utf8').matchAll(/^##\s+(.+)$/gm)].map((m) => nu(m[1]));
  for (const [k, re] of Object.entries(MOTIFS)) if (titres.some((t) => re.test(t))) compte[k] += 1;
}

// ── D. STRUCTURE DES TESTS ───────────────────────────────────────────────
const nbTests = exercises.map((e) => (e.tests ?? []).length);
const nbPublics = exercises.map((e) => (e.tests ?? []).filter((t) => !t.private).length);
const sansTestPublic = exercises.filter((e) => (e.tests ?? []).every((t) => t.private)).length;
const sansNom = exercises.reduce((n, e) => n + (e.tests ?? []).filter((t) => !t.name).length, 0);

console.log('# V74 · CP7 — SUBSTRAT DE LA REMÉDIATION (lecture seule)\n');
console.log(`exercices : ${exercises.length} · leçons : ${lecons.length}\n`);

console.log('## A. Exercice plus simple');
console.log(`difficultés observées : ${Object.entries(parDiff).sort().map(([d, n]) => `${d} → ${n}`).join(' · ')}`);
console.log(`exercices ayant AU MOINS un voisin strictement plus simple sur une compétence commune : ${pct(avecVoisin, exercises.length)}`);
console.log(`nombre de voisins, médiane : ${med(nbVoisins)} · max : ${Math.max(...nbVoisins, 0)}\n`);

console.log('## B. Misconceptions (registre EXISTANT, 57 entrées)');
console.log(`exercices nommément cités par une misconception : ${pct(miscExistants.length, exercises.length)}`);
console.log(`références d'exercices FANTÔMES dans le registre : ${miscFantomes.length}${miscFantomes.length ? ` → ${miscFantomes.slice(0, 8).join(', ')}` : ''}`);
console.log(`compétences couvertes par au moins une misconception : ${skillsAvecMisc.size}`);
console.log(`exercices dont une compétence a au moins une misconception : ${pct(exCouvertsParSkill, exercises.length)}\n`);

console.log('## C. Sections de leçon mobilisables');
for (const [k, n] of Object.entries(compte)) console.log(`${k.padEnd(16)} ${pct(n, lecons.length)}`);
console.log('');

console.log('## D. Tests (support du sous-problème)');
console.log(`tests par exercice, médiane ${med(nbTests)} · min ${Math.min(...nbTests)} · max ${Math.max(...nbTests)}`);
console.log(`tests PUBLICS par exercice, médiane ${med(nbPublics)} · min ${Math.min(...nbPublics)}`);
console.log(`exercices SANS AUCUN test public : ${sansTestPublic}`);
console.log(`tests sans nom : ${sansNom}`);
