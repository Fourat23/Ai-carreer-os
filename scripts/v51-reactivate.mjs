// V51 CP7 — remédiation de rétention. Casse les écarts de pratique > 90 j en
// RATTACHANT des exercices EXISTANTS à des JOURS DE RÉVISION existants situés
// DANS l'écart (retrieval espacé). Aucune leçon touchée, aucun jour réordonné,
// aucune duplication de contenu (un exercice réutilisé pour réactivation est
// légitime), pas de placement avant introduction (fenêtre entre 2 pratiques).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { projectSkill } from '../lib/practice-coverage.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const rd = (p) => JSON.parse(readFileSync(R(p), 'utf8'));
const readdirJson = (dir) => readdirSync(R(dir)).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(R(dir), f), 'utf8')));

const program = rd('data/program.json');
const de = rd('data/day-exercises.json');
const exercises = readdirJson('data/exercises');
const pj = (e) => [...new Set((e.skills || []).map(projectSkill).filter(Boolean))];

const reviewDays = program.days.filter((d) => d.isReview).map((d) => d.day).sort((a, b) => a - b);
const REVIEW_CAP = 3; // charge légère sur un jour de révision

// Première exposition d'enseignement par compétence (prérequis).
const firstExposure = {};
for (const d of program.days) { const s = projectSkill(d.skill) || d.skill; if (firstExposure[s] === undefined || d.day < firstExposure[s]) firstExposure[s] = d.day; }
const introDayOf = (e) => Math.max(...pj(e).map((s) => firstExposure[s] ?? Infinity)); // jour où TOUTES ses compétences sont introduites

// Seules les compétences de code sont réactivées (comm/autonomy/cloud = non-code/external).
const NON_CODE = new Set(['comm', 'autonomy', 'cloud']);
const TARGET_MAX_GAP = 80;

const practiceDaysOf = (skill) => {
  const set = new Set();
  for (const [k, ids] of Object.entries(de)) for (const id of ids) { const e = exercises.find((x) => x.id === id); if (e && pj(e).includes(skill)) set.add(Number(k)); }
  return [...set].sort((a, b) => a - b);
};
const loadOf = (day) => (de[String(day)] || []).length;
const addTo = (day, id) => { const k = String(day); de[k] ??= []; if (!de[k].includes(id)) { de[k].push(id); return true; } return false; };

const skills = [...new Set(exercises.flatMap(pj))].filter((s) => !NON_CODE.has(s));
let inserted = 0;
const report = [];

for (const skill of skills) {
  const pool = exercises.filter((e) => pj(e).includes(skill)).sort((a, b) => (b.difficulty - a.difficulty) || a.id.localeCompare(b.id));
  if (!pool.length) continue;
  // Choisit un exercice du pool dont TOUTES les compétences sont introduites au jour visé.
  const pickForDay = (day) => { for (let k = 0; k < pool.length; k++) { const e = pool[(startIdx + k) % pool.length]; if (introDayOf(e) <= day) { startIdx = (startIdx + k + 1) % pool.length; return e.id; } } return null; };
  let startIdx = 0;

  // Itère : tant qu'il reste un écart > TARGET dans la fenêtre de pratique.
  for (let guard = 0; guard < 12; guard++) {
    const pd = practiceDaysOf(skill);
    if (pd.length < 1) break;
    // Écarts internes + queue (jusqu'à 365 pour une compétence de code pertinente).
    const windows = [];
    for (let i = 1; i < pd.length; i++) if (pd[i] - pd[i - 1] > TARGET_MAX_GAP) windows.push([pd[i - 1], pd[i]]);
    const tail = 365 - pd[pd.length - 1];
    if (tail > TARGET_MAX_GAP) windows.push([pd[pd.length - 1], 365]);
    if (!windows.length) break;
    // Prend le plus grand écart, insère UNE réactivation au milieu (jour de révision libre).
    windows.sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]));
    const [a, b] = windows[0];
    const mid = (a + b) / 2;
    const candidates = reviewDays.filter((d) => d > a && d < b && loadOf(d) < REVIEW_CAP).sort((x, y) => Math.abs(x - mid) - Math.abs(y - mid));
    if (!candidates.length) break; // aucun jour de révision libre dans l'écart : dette documentée
    const day = candidates[0];
    const id = pickForDay(day);
    if (id && addTo(day, id)) { inserted++; report.push(`${skill}: réactivation jour ${day} ← ${id} (écart ${a}→${b})`); }
    else break;
  }
}

// Écriture triée.
const ordered = {};
for (const k of Object.keys(de).sort((x, y) => Number(x) - Number(y))) ordered[k] = de[k];
writeFileSync(R('data/day-exercises.json'), JSON.stringify(ordered, null, 2) + '\n');
console.log(`Réactivations insérées : ${inserted}`);
for (const r of report.slice(0, 40)) console.log('  ' + r);
