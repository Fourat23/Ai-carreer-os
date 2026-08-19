// V50 CP4/CP5/CP9 — intègre les exercices orphelins dans le parcours 365 jours.
// Édite data/day-exercises.json (données AUTHORED, hors corpus gelé et progress).
// Règles déterministes (ADR-050) :
//  - un exercice ne va que sur un jour dont la compétence PROJETÉE fait partie de
//    ses compétences ET ≥ jour où TOUTES ses compétences sont introduites
//    (aucune pratique avant l'introduction d'une compétence requise) ;
//  - les jours de RÉVISION accueillent la réactivation tardive (réutilise les 52
//    jours isReview existants) ;
//  - distribution round-robin, priorité aux jours peu chargés, plafond par jour ;
//  - aucun jour n'est réordonné, aucune leçon gelée n'est touchée.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { projectSkill } from '../lib/practice-coverage.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const rd = (p) => JSON.parse(readFileSync(R(p), 'utf8'));
const readdirJson = (dir) => readdirSync(R(dir)).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(R(dir), f), 'utf8')));

const program = rd('data/program.json');
const days = program.days;
const de = rd('data/day-exercises.json');
const exercises = readdirJson('data/exercises');

const skillsOf = (ex) => [...new Set((ex.skills || []).map(projectSkill).filter(Boolean))];
const daySkill = (d) => projectSkill(d.skill) || d.skill;

// Première exposition par compétence.
const firstExposure = {};
for (const d of days) { const s = daySkill(d); if (firstExposure[s] === undefined || d.day < firstExposure[s]) firstExposure[s] = d.day; }
const firstOf = (s) => (firstExposure[s] ?? Infinity);

// Charge courante par jour.
const load = {};
for (const [k, v] of Object.entries(de)) load[k] = Array.isArray(v) ? v.length : 0;
const CAP = 5;

const mapped = new Set(Object.values(de).flat());
const orphans = exercises.filter((e) => !mapped.has(e.id));

// Index jours par compétence (non-review et review séparés), triés.
const learnDaysBySkill = {}, reviewDaysAll = days.filter((d) => d.isReview).map((d) => d.day).sort((a, b) => a - b);
for (const d of days) if (!d.isReview) (learnDaysBySkill[daySkill(d)] ??= []).push(d.day);
for (const s of Object.keys(learnDaysBySkill)) learnDaysBySkill[s].sort((a, b) => a - b);

const addTo = (day, id) => { const k = String(day); de[k] ??= []; if (!de[k].includes(id)) { de[k].push(id); load[k] = (load[k] || 0) + 1; return true; } return false; };
const pick = (candidates, id) => {
  // trie par charge croissante puis jour croissant ; place sur le 1er sous le plafond.
  const sorted = candidates.slice().sort((a, b) => (load[String(a)] || 0) - (load[String(b)] || 0) || a - b);
  for (const day of sorted) if ((load[String(day)] || 0) < CAP) return addTo(day, id);
  return sorted.length ? addTo(sorted[0], id) : false; // dépasse le cap en dernier recours
};

// Regrouper par compétence-cible (celle qui possède des jours d'apprentissage),
// pour distribuer et réserver ~30% à la réactivation.
const bySkill = {};
for (const e of orphans) {
  const sk = skillsOf(e);
  const minDay = Math.max(...sk.map(firstOf)); // ≥ toutes les compétences introduites
  const target = sk.find((s) => (learnDaysBySkill[s] || []).some((d) => d >= minDay)) || sk.find((s) => firstExposure[s] !== undefined) || sk[0];
  (bySkill[target] ??= []).push({ e, minDay });
}

let placed = 0, unplaced = 0;
for (const s of Object.keys(bySkill).sort((a, b) => firstOf(a) - firstOf(b))) {
  const list = bySkill[s].sort((a, b) => (a.e.difficulty - b.e.difficulty) || a.e.id.localeCompare(b.e.id));
  for (const { e, minDay } of list) {
    const sk = skillsOf(e);
    // jours d'apprentissage : skill du jour ∈ compétences de l'exercice, jour ≥ minDay.
    const learn = days.filter((d) => !d.isReview && sk.includes(daySkill(d)) && d.day >= minDay).map((d) => d.day);
    // réactivation : jours de révision ≥ minDay (retrieval sur jour de révision).
    const react = reviewDaysAll.filter((d) => d >= minDay);
    // Fenêtre appropriée = jours d'apprentissage + jours de révision. Le débordement
    // reste TOUJOURS dans cette fenêtre (jamais un jour arbitraire éloigné).
    let cands = [...learn, ...react];
    // Repli borné : jours (apprentissage OU révision) dont la compétence appartient
    // à l'exercice, sans contrainte de minDay (compétence introduite ailleurs).
    if (!cands.length) cands = days.filter((d) => sk.includes(daySkill(d)) || d.isReview).map((d) => d.day);
    if (!cands.length) { unplaced++; continue; }
    if (pick(cands, e.id)) placed++; else unplaced++;
  }
}

// Réactivation tardive : pour les compétences de code fondamentales dont la
// pratique finit tôt, dupliquer quelques exercices déjà mappés sur des jours de
// révision tardifs (retrieval practice ; réutilise les jours isReview existants).
const FOUNDATIONAL = ['jsts', 'algo', 'ds', 'http', 'sql', 'python', 'gitlinux', 'se'];
const lastPracticeDay = {};
for (const [k, ids] of Object.entries(de)) for (const id of ids) { const ex = exercises.find((x) => x.id === id); if (ex) for (const s of skillsOf(ex)) lastPracticeDay[s] = Math.max(lastPracticeDay[s] || 0, Number(k)); }
for (const s of FOUNDATIONAL) {
  const last = lastPracticeDay[s] || 0;
  if (365 - last <= 90) continue; // déjà réactivé assez tard
  const pool = exercises.filter((e) => skillsOf(e).includes(s) && (e.difficulty >= 3)); // exercices consistants
  const lateReview = reviewDaysAll.filter((d) => d > last + 30);
  const step = lateReview.length > 4 ? Math.floor(lateReview.length / 4) : 1;
  const slots = lateReview.filter((_, i) => i % step === 0).slice(0, 4);
  let i = 0;
  for (const day of slots) { const e = pool[i % pool.length]; if (e) addTo(day, e.id); i++; }
}

// Écriture triée numériquement (diff stable).
const ordered = {};
for (const k of Object.keys(de).sort((a, b) => Number(a) - Number(b))) ordered[k] = de[k];
writeFileSync(R('data/day-exercises.json'), JSON.stringify(ordered, null, 2) + '\n');

const nowMapped = new Set(Object.values(ordered).flat());
console.log(`Orphelins avant : ${orphans.length} · placés : ${placed} · non placés : ${unplaced}`);
console.log(`Exercices mappés : ${nowMapped.size}/${exercises.length} · jours avec pratique : ${Object.values(ordered).filter((v) => v.length).length}/${days.length}`);
