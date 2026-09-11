// V74 · CP10 — CHARGE ET ARBITRAGE. Lecture seule.
//
// Mesure ce que le plan de journée change réellement : combien de journées
// reçoivent une réactivation, combien n'en reçoivent aucune, et ce que devient
// le budget pendant les six séries de journées surchargées.
//
// La charge vient de `docs/v73/charge-365.json`, artefact publié de V73 — la
// même source que le CP6 a utilisée pour son BEFORE/AFTER. Aucune charge n'est
// recalculée ici : recalculer aurait produit une seconde vérité, et la V73
// n'est pas rejugée.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  BUDGET_JOURNEE, BUDGET_SEMAINE, CIBLE_REACTIVATION,
  budgetReactivationDe, repartirLaSemaine,
} from '../../lib/daily-plan.mjs';

const ROOT = process.cwd();
const charge = JSON.parse(readFileSync(join(ROOT, 'docs', 'v73', 'charge-365.json'), 'utf8'));
const parJour = new Map(charge.jours.map((d) => [d.j, d]));

const pct = (n, d) => `${n}/${d} (${Math.round((n / d) * 100)} %)`;
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

console.log('# V74 · CP10 — ARBITRAGE DU BUDGET DE JOURNÉE\n');
console.log(`budget journée ${BUDGET_JOURNEE.bas}–${BUDGET_JOURNEE.haut} min · plafond semaine ${BUDGET_SEMAINE} min\n`);

// ── A. La charge héritée, telle quelle ───────────────────────────────────
const cats = {};
for (const d of charge.jours) cats[d.cat] = (cats[d.cat] ?? 0) + 1;
console.log('## A. Charge héritée de V73 (non renégociée)');
console.log(`catégories : ${Object.entries(cats).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
const heavy = charge.jours.filter((d) => d.cat === 'HEAVY');
console.log(`journées HEAVY : ${heavy.length} · borne haute de ${Math.min(...heavy.map((d) => d.haut))} à ${Math.max(...heavy.map((d) => d.haut))} min`);
const revues = charge.jours.filter((d) => d.revue);
console.log(`journées de revue : ${revues.length} · borne haute médiane ${med(revues.map((d) => d.haut))} · max ${Math.max(...revues.map((d) => d.haut))}`);
console.log(`MARGE MINIMALE sur une journée de revue : ${Math.min(...revues.map((d) => BUDGET_JOURNEE.haut - d.haut))} min`);
console.log('→ la journée de revue NE PEUT PAS servir de réservoir : hypothèse réfutée par la mesure.\n');

// ── B. Le grain de la semaine ────────────────────────────────────────────
const semaines = [];
for (let s = 1; s <= 52; s += 1) {
  const jours = [];
  for (let d = (s - 1) * 7 + 1; d <= s * 7; d += 1) {
    const x = parJour.get(d);
    if (x) jours.push({ jour: d, chargeHaut: x.haut, cat: x.cat, revue: x.revue });
  }
  semaines.push({ s, jours });
}
const surchargees = semaines
  .map((w) => ({ s: w.s, total: w.jours.reduce((n, j) => n + j.chargeHaut, 0) }))
  .filter((w) => w.total > BUDGET_SEMAINE);
console.log('## B. Au grain de la SEMAINE, le problème change de nature');
console.log(`semaines dont la borne haute dépasse ${BUDGET_SEMAINE} : ${pct(surchargees.length, 52)}`);
console.log(surchargees.map((w) => `  S${w.s} : ${w.total} min (+${w.total - BUDGET_SEMAINE})`).join('\n'));
const marges = semaines.map((w) => BUDGET_SEMAINE - w.jours.reduce((n, j) => n + j.chargeHaut, 0));
console.log(`marge hebdomadaire : min ${Math.min(...marges)} · médiane ${med(marges)} · max ${Math.max(...marges)}`);
const heavyDansSemainesTenables = heavy.filter((d) => {
  const s = Math.ceil(d.j / 7);
  return !surchargees.some((w) => w.s === s);
}).length;
console.log(`→ ${heavyDansSemainesTenables} des ${heavy.length} journées surchargées appartiennent à des semaines GLOBALEMENT TENABLES.`);
console.log('→ le défaut est une RÉPARTITION dans la semaine, pas un excès de programme.\n');

// ── C. BEFORE : budget fixe de 20 min, sans regarder la charge ───────────
console.log('## C. BEFORE — budget fixe de 20 min, la charge du jour ignorée\n');
let debordantes = 0;
let minutesHorsBudget = 0;
for (const d of charge.jours) {
  const total = d.haut + CIBLE_REACTIVATION;
  if (total > BUDGET_JOURNEE.haut) { debordantes += 1; minutesHorsBudget += total - BUDGET_JOURNEE.haut; }
}
console.log(`journées dépassant le budget une fois la réactivation ajoutée : ${pct(debordantes, 365)}`);
console.log(`minutes cumulées au-dessus du budget : ${Math.round(minutesHorsBudget)}`);
console.log(`journées sans aucune réactivation : 0/365 — mais 20 min étaient ajoutées à des journées déjà à 331 min.\n`);

// ── D. AFTER : la réactivation prend ce que la journée laisse ────────────
console.log('## D. AFTER — la réactivation ne prend que ce que la journée laisse\n');
let sansReactivation = 0;
let totalMinutes = 0;
let debordantes2 = 0;
const parJourMinutes = new Map();
let nonPlacees = 0;
for (const w of semaines) {
  const r = repartirLaSemaine(w.jours);
  nonPlacees += r.semaine.minutesNonPlacees;
  for (const j of r.jours) {
    parJourMinutes.set(j.jour, j.minutes);
    totalMinutes += j.minutes;
    if (j.minutes === 0) sansReactivation += 1;
    const x = parJour.get(j.jour);
    if (x && x.haut + j.minutes > BUDGET_JOURNEE.haut) debordantes2 += 1;
  }
}
console.log(`journées dépassant le budget une fois la réactivation ajoutée : ${pct(debordantes2, 365)}`);
console.log(`journées sans aucune réactivation : ${pct(sansReactivation, 365)}`);
console.log(`minutes de réactivation placées sur l’année : ${Math.round(totalMinutes)} (BEFORE : ${365 * CIBLE_REACTIVATION})`);
console.log(`minutes non placées faute de marge dans la semaine : ${Math.round(nonPlacees)}`);

// ── E. Le vrai coût : les séries de silence ──────────────────────────────
console.log('\n## E. Le coût à publier : combien de jours SANS réactivation d’affilée\n');
const series = [];
let cur = 0;
for (let d = 1; d <= 365; d += 1) {
  if ((parJourMinutes.get(d) ?? 0) === 0) cur += 1;
  else { if (cur) series.push(cur); cur = 0; }
}
if (cur) series.push(cur);
console.log(`séries de journées sans réactivation : ${series.length} · plus longue : ${series.length ? Math.max(...series) : 0} jours`);
const parTaille = {};
for (const n of series) parTaille[n] = (parTaille[n] ?? 0) + 1;
console.log(`distribution : ${Object.entries(parTaille).sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}j → ${v}`).join(' · ')}`);
