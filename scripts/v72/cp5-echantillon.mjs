// V72 — CP5. Tirage de l echantillon stratifie de 24 lecons.
// GRAINE PUBLIEE AVANT LE TIRAGE : 20260909. Generateur deterministe (mulberry32).
// Contrainte du contrat : au plus 8 lecons communes avec l echantillon aveugle V71 (32).
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
const GRAINE = 20260909;
const mulberry32 = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const rnd = mulberry32(GRAINE);

const L = JSON.parse(readFileSync('docs/v71/LEDGER-128.json', 'utf8'));
const A = Array.isArray(L) ? L : (L.lecons || L.entries);
const dom = JSON.parse(readFileSync('docs/v71/domaines.json', 'utf8'));
const parLecon = new Map();
if (Array.isArray(dom)) for (const d of dom) parLecon.set(d.slug, d.domaine);
else for (const [k, v] of Object.entries(dom)) { if (Array.isArray(v)) v.forEach((s) => parLecon.set(s, k)); else parLecon.set(k, v); }
const v71 = new Set(Object.keys(JSON.parse(readFileSync('docs/v71/CP13-BLIND-32.json', 'utf8'))));

// hors parcours = jamais citee par une journee
const prog = JSON.parse(readFileSync('data/program.json', 'utf8'));
const n3 = (n) => String(n).padStart(3, '0');
const cite = new Set();
for (const d of prog.days) {
  let md; try { md = readFileSync(`curriculum/days/day-${n3(d.day)}.md`, 'utf8'); } catch { continue; }
  for (const m of md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)) cite.add(m[1]);
}
const mots = (s) => readFileSync(`curriculum/lessons/${s}.md`, 'utf8').replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;

const pop = A.map((e) => ({
  slug: e.slug,
  domaine: parLecon.get(e.slug) ?? 'inconnu',
  moy: e.D.reduce((a, b) => a + b, 0) / 14,
  d14: e.D[13],
  mots: mots(e.slug),
  parcours: cite.has(e.slug),
  v71: v71.has(e.slug),
}));
const median = [...pop].map((x) => x.mots).sort((a, b) => a - b)[Math.floor(pop.length / 2)];
pop.forEach((x) => { x.long = x.mots >= median; });

// strates : par domaine (proportionnel), avec correctifs sur D14, longueur et hors-parcours
const parDom = {};
for (const x of pop) (parDom[x.domaine] ??= []).push(x);
const N = 24;
const quotas = {};
let reste = N;
const doms = Object.keys(parDom).sort();
for (const d of doms) { quotas[d] = Math.max(1, Math.round(parDom[d].length / pop.length * N)); }
let somme = Object.values(quotas).reduce((a, b) => a + b, 0);
while (somme > N) { const d = doms.slice().sort((a, b) => quotas[b] - quotas[a])[0]; quotas[d]--; somme--; }
while (somme < N) { const d = doms.slice().sort((a, b) => (parDom[b].length / quotas[b]) - (parDom[a].length / quotas[a]))[0]; quotas[d]++; somme++; }

const pick = [];
for (const d of doms) {
  const bucket = [...parDom[d]];
  // ordre deterministe puis melange par la graine
  bucket.sort((a, b) => a.slug.localeCompare(b.slug));
  for (let i = bucket.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [bucket[i], bucket[j]] = [bucket[j], bucket[i]]; }
  // preference : varier D14 bon/faible, court/long, parcours/hors, et limiter le recouvrement V71
  const score = (x) => (x.v71 ? 2 : 0);
  bucket.sort((a, b) => score(a) - score(b));
  const q = quotas[d];
  const choisis = [];
  for (const x of bucket) {
    if (choisis.length >= q) break;
    const dejaD14 = choisis.filter((y) => (y.d14 < 5) === (x.d14 < 5)).length;
    if (q >= 2 && dejaD14 >= Math.ceil(q * 0.75)) continue;
    choisis.push(x);
  }
  for (const x of bucket) { if (choisis.length >= q) break; if (!choisis.includes(x)) choisis.push(x); }
  pick.push(...choisis);
}
const communs = pick.filter((x) => x.v71).length;
console.log(`GRAINE ${GRAINE} · echantillon ${pick.length} · communs avec l echantillon aveugle V71 : ${communs} (max 8)`);
console.log(`quotas : ${doms.map((d) => `${d}=${quotas[d]}`).join(' · ')}`);
console.log(`\n${'lecon'.padEnd(34)}${'domaine'.padEnd(17)}moy   D14  mots  parcours  V71`);
for (const x of pick.sort((a, b) => a.domaine.localeCompare(b.domaine) || a.slug.localeCompare(b.slug)))
  console.log(`${x.slug.padEnd(34)}${x.domaine.padEnd(17)}${x.moy.toFixed(2)}  ${x.d14}   ${String(x.mots).padStart(4)}  ${x.parcours ? 'oui     ' : 'HORS    '}  ${x.v71 ? 'oui' : '-'}`);
const rep = (f) => `${pick.filter(f).length}/${pick.length}`;
console.log(`\nequilibrages : D14<5 ${rep((x) => x.d14 < 5)} · longues ${rep((x) => x.long)} · hors parcours ${rep((x) => !x.parcours)} · deja lues au V71 ${rep((x) => x.v71)}`);
writeFileSync('docs/v72/CP5-ECHANTILLON-24.json', JSON.stringify({ graine: GRAINE, medianeMots: median, lecons: pick }, null, 2) + '\n');
