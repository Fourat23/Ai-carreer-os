// V73 · CP0 · J — échantillon stratifié de contrôle de non-régression académique.
//
// But : vérifier que V73 ne part PAS de l'hypothèse fausse « tous les cours sont mauvais ».
// La graine est publiée AVANT le tirage, le générateur est déterministe et rejouable.
//
// Stratification imposée par le brief : périodes différentes, domaines différents, longueurs
// différentes, bonnes ET moins bonnes selon V71, dans le parcours ET hors parcours.
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const GRAINE = 20260910;               // publiée avant le tirage
const CIBLE = 24;

let etat = GRAINE;
const rnd = () => { etat = (etat * 1103515245 + 12345) & 0x7fffffff; return etat / 0x7fffffff; };
const melange = (a) => { const t = [...a]; for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; } return t; };

const prog = JSON.parse(readFileSync('data/program.json', 'utf8'));
const { LESSONS } = await import('../data/lessons-map.mjs');
const n3 = (n) => String(n).padStart(3, '0');
const lire = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');

const premier = new Map();
for (const d of prog.days) {
  const md = lire(`curriculum/days/day-${n3(d.day)}.md`);
  for (const m of md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)) if (!premier.has(m[1])) premier.set(m[1], d.day);
}

// notes de texte V71, si le registre est présent — sinon la strate « note » est déclarée absente
let notes = new Map();
if (existsSync('docs/v71/LEDGER-128.json')) {
  for (const e of JSON.parse(readFileSync('docs/v71/LEDGER-128.json', 'utf8'))) {
    if (!e?.slug || !Array.isArray(e.D) || !e.D.length) continue;
    notes.set(e.slug, +(e.D.reduce((a, b) => a + b, 0) / e.D.length).toFixed(4));   // D14 moyen
  }
}

const tous = readdirSync('curriculum/lessons').filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3));
const meta = tous.map((s) => {
  const e = LESSONS.find((x) => x.file === `${s}.md`);
  const md = lire(`curriculum/lessons/${s}.md`);
  return { slug: s, cat: e?.cat ?? '?', level: e?.level ?? null, mots: md.split(/\s+/).length,
           jour: premier.get(s) ?? null, note: notes.get(s) ?? null };
});
const medianeMots = [...meta.map((m) => m.mots)].sort((a, b) => a - b)[Math.floor(meta.length / 2)];

const periode = (j) => (j === null ? 'hors' : j <= 90 ? 'debut' : j <= 240 ? 'milieu' : 'fin');
const strates = {};
for (const m of meta) {
  const cle = `${periode(m.jour)}|${m.cat}`;
  (strates[cle] ??= []).push(m);
}

// Tirage en TOURNIQUET sur les périodes, pas en ordre alphabétique des strates : un premier
// jet trié par clé donnait 11 « début », 7 « fin », 6 « hors » et ZÉRO « milieu », parce que
// « milieu » vient après « hors » dans l'alphabet et tombait sous le plafond de 24. Le défaut
// était dans le tirage, pas dans le corpus ; il est corrigé ici et signalé dans le rapport.
const PERIODES = ['debut', 'milieu', 'fin', 'hors'];
const parPeriode = Object.fromEntries(PERIODES.map((p) => [p, Object.keys(strates).filter((k) => k.startsWith(p + '|'))]));
const choix = [];
let reste2 = true;
while (choix.length < CIBLE && reste2) {
  reste2 = false;
  for (const p of PERIODES) {
    const cles = parPeriode[p];
    if (!cles.length) continue;
    const cle = cles.shift();
    const dispo = melange(strates[cle].filter((m) => !choix.includes(m)));
    if (dispo[0] && choix.length < CIBLE) { choix.push(dispo[0]); reste2 = true; }
  }
}
const reste = melange(meta.filter((m) => !choix.includes(m)));
for (const m of reste) { if (choix.length >= CIBLE) break; choix.push(m); }

// contrôles de stratification, publiés avec le tirage
const rapport = {
  graine: GRAINE, taille: choix.length, medianeMotsCorpus: medianeMots,
  periodes: choix.reduce((a, m) => { a[periode(m.jour)] = (a[periode(m.jour)] ?? 0) + 1; return a; }, {}),
  domaines: choix.reduce((a, m) => { a[m.cat] = (a[m.cat] ?? 0) + 1; return a; }, {}),
  horsParcours: choix.filter((m) => m.jour === null).length,
  auDessusMediane: choix.filter((m) => m.mots > medianeMots).length,
  notesDisponibles: notes.size ? `oui (${notes.size} leçons)` : 'NON — strate « note V71 » déclarée absente',
  avecNote: choix.filter((m) => m.note !== null).length,
  noteMin: Math.min(...choix.filter((m) => m.note !== null).map((m) => m.note)),
  noteMax: Math.max(...choix.filter((m) => m.note !== null).map((m) => m.note)),
  sousLaMediane: choix.filter((m) => m.note !== null && m.note < 4.9).length,
  lecons: choix.sort((a, b) => (a.jour ?? 999) - (b.jour ?? 999)),
};
console.log(JSON.stringify(rapport, null, 1));
