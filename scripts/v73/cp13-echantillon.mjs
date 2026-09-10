// V73 · CP13 — TIRAGE DE L'ÉCHANTILLON D'AUDIT À L'AVEUGLE.
//
// L'échantillon est tiré et PUBLIÉ AVANT toute lecture de résultat. La graine est écrite
// ci-dessous, dans le code, avant le tirage : 20260913.
//
// ANOMALIE DE TIRAGE DU CP0, ÉVITÉE ICI. Le premier jet du CP0 stratifiait puis parcourait les
// strates dans l'ordre alphabétique : « milieu » venant après « hors », aucune leçon du milieu
// du parcours n'était tirée. La correction était un TOURNIQUET (round-robin) sur les strates,
// et elle est reprise telle quelle.
//
// STRATES OBLIGATOIRES, décidées avant le tirage — le CP13 doit pouvoir répondre « les
// corrections des CP3 à CP12 ont-elles dégradé quelque chose ? », donc l'échantillon doit
// contenir des unités TOUCHÉES et des unités TÉMOINS :
//   A  semaines réécrites au CP10          (s6..s13, s15, s34)
//   B  semaines réattachées au CP10        (s28..s33)
//   C  journées dont readingMinutes a changé au CP12 (j197..j210 et les autres)
//   D  journées dont la difficulté a été redérivée au CP9, montée de 3 à 4 ou 5
//   E  journées de projet nouvellement déclarées au CP11
//   F  leçons rattachées au parcours au CP3 (CSS, Next.js, cloud)
//   G  TÉMOINS : leçons jamais touchées depuis le CP0
//   H  TÉMOINS : journées jamais touchées par aucun CP
//
// Usage : node scripts/v73/cp13-echantillon.mjs [--ecrire]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const GRAINE = 20260913;
let etat = GRAINE;
const alea = () => { etat = (etat * 1103515245 + 12345) % 2147483648; return etat / 2147483648; };
const tire = (arr, n) => { const c = [...arr]; const out = []; while (out.length < n && c.length) out.push(...c.splice(Math.floor(alea() * c.length), 1)); return out; };

const prog = JSON.parse(readFileSync('data/program.json', 'utf8'));
const g = JSON.parse(readFileSync('docs/v73/curriculum-graph.json', 'utf8'));
const n3 = (n) => String(n).padStart(3, '0');

// journées et leçons touchées depuis le début de V73 (fe7a10c = HEAD au début du CP0)
const touche = (chemin) => {
  try { return execSync(`git log --oneline fe7a10c..HEAD -- ${chemin}`, { encoding: 'utf8' }).trim().length > 0; }
  catch { return false; }
};

const rm = JSON.parse(readFileSync('docs/v73/cp13-readingminutes-avant.json', 'utf8'));
const prg = JSON.parse(readFileSync('docs/v73/progression-365.json', 'utf8'));

const strates = {
  A: [6, 7, 8, 9, 10, 11, 12, 13, 15, 34].map((w) => `semaine-${w}`),
  B: [28, 29, 30, 31, 32, 33].map((w) => `semaine-${w}`),
  C: rm.changees.map((j) => `jour-${j}`),
  D: prg.jours.filter((b) => b.j >= 91 && b.j <= 364 && !b.revue && b.difficulteDerivee >= 4).map((b) => `jour-${b.j}`),
  E: g.jours.filter((d) => d.projet != null && d.j >= 113).map((d) => `jour-${d.j}`),
  F: ['css-fundamentals', 'css-flexbox', 'css-grid', 'responsive-design', 'nextjs-foundations',
      'nextjs-rendering', 'nextjs-server-client-components', 'nextjs-data-production',
      'cloud-fundamentals', 'cloud-networking', 'cloud-compute-storage', 'cloud-aws-core',
      'cloud-azure-core', 'cloud-finops', 'iac-fundamentals'].map((s) => `lecon-${s}`),
  G: JSON.parse(readFileSync('docs/v73/V73-STATUTS-128.json', 'utf8'))
      .map((l) => l.slug).filter((s) => !touche(`curriculum/lessons/${s}.md`)).map((s) => `lecon-${s}`),
  H: prog.days.filter((d) => !touche(`curriculum/days/day-${n3(d.day)}.md`)).map((d) => `jour-${d.day}`),
};

// tourniquet : on prend une unité par strate, en tournant, jusqu'à 36
const pools = Object.entries(strates).map(([k, v]) => ({ k, v: tire(v, v.length) }));
const echantillon = [];
for (let i = 0; echantillon.length < 36; i++) {
  let progres = false;
  for (const p of pools) { if (p.v[i] !== undefined && echantillon.length < 36) { echantillon.push({ strate: p.k, unite: p.v[i] }); progres = true; } }
  if (!progres) break;
}

const sortie = { graine: GRAINE, tireLe: new Date().toISOString().slice(0, 10),
  taillesDeStrate: Object.fromEntries(Object.entries(strates).map(([k, v]) => [k, v.length])),
  n: echantillon.length, echantillon };
if (process.argv.includes('--ecrire')) writeFileSync('docs/v73/CP13-ECHANTILLON-36.json', JSON.stringify(sortie, null, 1));
console.log(`graine ${GRAINE} · ${echantillon.length} unités`);
console.log('tailles de strate :', JSON.stringify(sortie.taillesDeStrate));
const par = {};
for (const e of echantillon) (par[e.strate] ??= []).push(e.unite);
for (const [k, v] of Object.entries(par)) console.log(`  ${k} (${v.length}) : ${v.join(' ')}`);
