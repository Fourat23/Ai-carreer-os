// V72 CP14 — parcours séquentiel des 365 journées.
//
// Instrument de LECTURE, pas de correction : il produit la matière du CP14 (ordre,
// charge, revues, projets, compétences, fils narratifs, transitions) sous une forme
// dénombrable, pour que la marche jour après jour porte sur des faits et non sur une
// impression laissée par un échantillon.
//
// Usage : node scripts/v72/cp14-parcours-sequentiel.mjs [--json]
import { readFileSync, existsSync } from 'node:fs';

const prog = JSON.parse(readFileSync('data/program.json', 'utf8'));
const n3 = (n) => String(n).padStart(3, '0');
const jours = prog.days;
const moisDe = new Map(prog.months.map((m) => [m.month, m]));
const semaineDe = new Map(prog.weeks.map((w) => [w.week, w]));
const nomSkill = new Map(prog.skills.map((s) => [s.id, s.name]));

// --- leçons attachées à chaque journée, et première apparition de chaque leçon
const lecons = new Map();          // jour -> [slug]
const premiere = new Map();        // slug -> jour de première programmation
for (const d of jours) {
  const f = `curriculum/days/day-${n3(d.day)}.md`;
  const md = existsSync(f) ? readFileSync(f, 'utf8') : '';
  const slugs = [...new Set([...md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))]
    .filter((s) => existsSync(`curriculum/lessons/${s}.md`));
  lecons.set(d.day, slugs);
  for (const s of slugs) if (!premiere.has(s)) premiere.set(s, d.day);
}

// --- fils narratifs : un produit nommé qui revient dans les titres
const filsConnus = [];
for (const d of jours) {
  const m = d.title.match(/^([A-ZÉÈÀÎÔÛ][A-Za-zÉÈÀÎÔÛéèàîôûç0-9+.-]{2,})\s*:/);
  if (m) filsConnus.push([d.day, m[1]]);
}
const fils = new Map();
for (const [j, nom] of filsConnus) { if (!fils.has(nom)) fils.set(nom, []); fils.get(nom).push(j); }

// --- compétences : couverture et dispersion
const parSkill = new Map();
for (const d of jours) {
  if (!parSkill.has(d.skill)) parSkill.set(d.skill, []);
  parSkill.get(d.skill).push(d.day);
}
const skills = prog.skills.map((s) => {
  const js = parSkill.get(s.id) ?? [];
  const trous = [];
  for (let i = 1; i < js.length; i++) if (js[i] - js[i - 1] > 30) trous.push([js[i - 1], js[i]]);
  return { id: s.id, name: s.name, n: js.length, premier: js[0] ?? null, dernier: js.at(-1) ?? null,
           etendue: js.length ? js.at(-1) - js[0] + 1 : 0, densite: js.length ? +(js.length / (js.at(-1) - js[0] + 1)).toFixed(2) : 0,
           trous };
});

// --- charge : heures déclarées et lecture générée
const parSemaine = new Map();
for (const d of jours) {
  if (!parSemaine.has(d.week)) parSemaine.set(d.week, { heures: 0, lecture: 0, jours: [], revues: 0 });
  const s = parSemaine.get(d.week);
  s.heures += d.hours; s.lecture += d.readingMinutes; s.jours.push(d.day);
  if (d.isReview) s.revues++;
}

// --- transitions : changement de compétence d'un jour au suivant, hors revue
let ruptures = 0; const rupturesDetail = [];
for (let i = 1; i < jours.length; i++) {
  const a = jours[i - 1], b = jours[i];
  if (a.isReview || b.isReview) continue;
  if (a.skill !== b.skill) { ruptures++; if (a.month !== b.month) rupturesDetail.push([a.day, a.skill, b.skill]); }
}

// --- découverte : nouvelles leçons par tranche de 30 jours
const decouverte = [];
for (let base = 1; base <= 365; base += 30) {
  const n = [...premiere.values()].filter((j) => j >= base && j < base + 30).length;
  decouverte.push([base, Math.min(base + 29, 365), n]);
}

const sortie = {
  jours: jours.map((d) => ({
    j: d.day, s: d.week, m: d.month, skill: d.skill, diff: d.difficulty, h: d.hours,
    lect: d.readingMinutes, revue: d.isReview, projet: d.project ?? null,
    titre: d.title, lecons: lecons.get(d.day),
    nouvelles: lecons.get(d.day).filter((x) => premiere.get(x) === d.day),
  })),
  mois: prog.months.map((m) => ({
    m: m.month, titre: m.title, projet: m.project ?? null, scores: m.expectedScores ?? null,
    jours: jours.filter((d) => d.month === m.month).map((d) => d.day),
    skills: [...new Set(jours.filter((d) => d.month === m.month).map((d) => d.skill))],
    heures: +jours.filter((d) => d.month === m.month).reduce((a, d) => a + d.hours, 0).toFixed(1),
  })),
  semaines: [...parSemaine.entries()].map(([w, v]) => ({
    s: w, theme: semaineDe.get(w)?.theme ?? null, mois: semaineDe.get(w)?.month ?? null,
    skillsDeclares: semaineDe.get(w)?.skills ?? [],
    skillsReels: [...new Set(jours.filter((d) => d.week === w && !d.isReview).map((d) => d.skill))],
    heures: +v.heures.toFixed(1), lecture: v.lecture, n: v.jours.length, revues: v.revues,
  })),
  skills,
  fils: [...fils.entries()].filter(([, js]) => js.length >= 3).map(([nom, js]) => ({ nom, n: js.length, de: js[0], a: js.at(-1) })).sort((a, b) => a.de - b.de),
  decouverte,
  ruptures: { total: ruptures, interMois: rupturesDetail.length },
};

if (process.argv.includes('--json')) { console.log(JSON.stringify(sortie, null, 1)); process.exit(0); }

const F = (x, n = 0) => String(x).padStart(n);
console.log(`journées ${jours.length} · semaines ${parSemaine.size} · mois ${prog.months.length}`);
console.log(`leçons programmées ${premiere.size} · revues ${jours.filter((d) => d.isReview).length}`);
console.log(`ruptures de compétence jour à jour (hors revue) : ${ruptures} · dont aux changements de mois : ${rupturesDetail.length}`);
console.log('\n— compétences —');
for (const s of sortie.skills)
  console.log(`${s.id.padEnd(10)} ${F(s.n, 3)} j · ${s.premier ? `j${F(s.premier, 3)}→j${F(s.dernier, 3)}` : 'AUCUNE'} · densité ${s.densite} · trous>30j ${s.trous.length}`);
console.log('\n— découverte de leçons par tranche de 30 jours —');
for (const [a, b, n] of sortie.decouverte) console.log(`j${F(a, 3)}–j${F(b, 3)} : ${F(n, 3)} nouvelles`);
console.log('\n— fils narratifs (≥ 3 journées) —');
for (const f of sortie.fils) console.log(`${f.nom.padEnd(18)} ${F(f.n, 3)} j · j${f.de}→j${f.a}`);
console.log('\n— charge hebdomadaire : extrêmes —');
const sem = [...sortie.semaines].sort((a, b) => b.heures - a.heures);
for (const s of sem.slice(0, 5)) console.log(`s${F(s.s, 2)} ${F(s.heures, 5)} h · lecture ${F(s.lecture, 4)} min · ${s.theme}`);
console.log('  …');
for (const s of sem.slice(-5)) console.log(`s${F(s.s, 2)} ${F(s.heures, 5)} h · lecture ${F(s.lecture, 4)} min · ${s.theme}`);
