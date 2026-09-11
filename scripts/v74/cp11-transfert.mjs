// V74 · CP11 — TRANSFERT ENTRE COMPÉTENCES. Lecture seule.
//
// La question de rétention n'est pas « sait-il réciter cette notion ? » mais
// « sait-il l'employer AILLEURS ? ». Une notion retenue seulement dans son
// contexte d'origine n'est pas retenue, elle est reconnue.
//
// Cette sonde mesure trois choses, et la troisième est celle qui compte :
//   A. ce que valait le signal de transfert du moteur avant le CP11 ;
//   B. ce que le produit possède réellement comme artefacts de transfert ;
//   C. ce qui sépare les deux.
//
// AUCUN SCORE DE TRANSFERT N'EST INVENTÉ. Le CP0 a déclaré le transfert
// professionnel UNMEASURABLE, et cette sonde ne mesure que du corpus.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { TRANSFER_LEVELS, TRANSFER_LABEL } from '../../lib/transfer-taxonomy.mjs';
import { EVIDENCE_SOURCE_TYPES, QUALIFYING_SOURCE_TYPES } from '../../lib/evidence.mjs';

const ROOT = process.cwd();
const pad3 = (n) => String(n).padStart(3, '0');
const pct = (n, d) => (d ? `${n}/${d} (${Math.round((n / d) * 100)} %)` : `${n}/0`);

const program = JSON.parse(readFileSync(join(ROOT, 'data', 'program.json'), 'utf8'));
const lessons = program.lessons ?? [];
const connus = new Set(lessons.map((l) => l.slug));
const skillsOf = new Map(lessons.map((l) => [l.slug, l.skills ?? []]));
const competences = new Set((program.skills ?? []).map((s) => s.id));

// ── A. Ce que valait l'ancien signal ─────────────────────────────────────
const parJour = new Map();
for (const d of program.days) {
  const f = join(ROOT, 'curriculum', 'days', `day-${pad3(d.day)}.md`);
  if (!existsSync(f)) continue;
  parJour.set(d.day, [...new Set([...readFileSync(f, 'utf8').matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))]
    .filter((s) => connus.has(s)));
}
const distrib = {};
let deuxPlus = 0;
for (const [, cs] of parJour) {
  const sk = new Set();
  for (const c of cs) for (const s of skillsOf.get(c) ?? []) sk.add(s);
  distrib[sk.size] = (distrib[sk.size] ?? 0) + 1;
  if (sk.size >= 2) deuxPlus += 1;
}

console.log('# V74 · CP11 — TRANSFERT ENTRE COMPÉTENCES\n');
console.log('## A. Ce que le moteur appelait « transfert » avant le CP11\n');
console.log('Critère utilisé : « la journée porte des leçons couvrant ≥ 2 compétences ».');
console.log(`journées satisfaisant ce critère : ${pct(deuxPlus, parJour.size)}`);
console.log(`distribution du nombre de compétences par journée : ${Object.entries(distrib).sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k} → ${v}`).join(' · ')}`);
console.log('\n→ Un indicateur qui s’allume sur 74 % des journées ne distingue rien.');
console.log('→ Et surtout il ne mesure PAS le transfert : deux compétences enseignées le même');
console.log('  jour ne demandent pas de transposer l’une dans l’autre. C’est une CO-OCCURRENCE.\n');

// ── B. Ce que le produit possède réellement ──────────────────────────────
const defis = readdirSync(join(ROOT, 'data', 'transfer-challenges'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(ROOT, 'data', 'transfer-challenges', f), 'utf8')));

const niveaux = {};
for (const c of defis) niveaux[c.transferLevel] = (niveaux[c.transferLevel] ?? 0) + 1;
const couv = new Map();
for (const c of defis) for (const s of c.skills ?? []) if (competences.has(s)) couv.set(s, (couv.get(s) ?? 0) + 1);

console.log('## B. Ce que le produit possède réellement\n');
console.log(`taxonomie de distance : ${TRANSFER_LEVELS.map((t) => `${t} ${TRANSFER_LABEL[t]}`).join(' · ')}`);
console.log(`défis de transfert : ${defis.length} · niveaux ${Object.entries(niveaux).map(([k, v]) => `${k} → ${v}`).join(' · ')}`);
console.log(`tous marqués crossDomain : ${defis.every((c) => c.crossDomain === true) ? 'oui' : 'NON'}`);
console.log(`compétences couvertes : ${pct(couv.size, competences.size)}`);
console.log(`sans aucun défi : ${[...competences].filter((s) => !couv.has(s)).join(', ') || '(aucune)'}`);
console.log(`répartition : ${[...couv].sort((a, b) => b[1] - a[1]).map(([s, n]) => `${s} ${n}`).join(' · ')}\n`);

// ── C. Ce qui sépare les deux ────────────────────────────────────────────
let joursCitant = 0;
for (const d of program.days) {
  const f = join(ROOT, 'curriculum', 'days', `day-${pad3(d.day)}.md`);
  if (!existsSync(f)) continue;
  const md = readFileSync(f, 'utf8');
  if (defis.some((c) => md.includes(c.id))) joursCitant += 1;
}
const dansProgramJson = JSON.stringify(program).includes('transfer-challenge');
const pageExiste = existsSync(join(ROOT, 'app', 'transfer')) || existsSync(join(ROOT, 'app', 'transfers'));

console.log('## C. CE QUI SÉPARE LES DEUX — les trois verrous\n');
console.log(`1. journées du curriculum citant un défi : ${pct(joursCitant, 365)}`);
console.log(`2. défis référencés dans data/program.json : ${dansProgramJson ? 'oui' : 'NON'}`);
console.log(`3. page ou route exposant un défi à l’apprenant : ${pageExiste ? 'oui' : 'NON'}`);
console.log(`4. type de preuve permettant d’enregistrer un défi réussi : ${EVIDENCE_SOURCE_TYPES.includes('transfer-challenge') ? 'oui (ajouté au CP11)' : 'NON'}`);
console.log(`   dont qualifiant : ${QUALIFYING_SOURCE_TYPES.has('transfer-challenge') ? 'oui' : 'non'}`);
console.log('\n→ AVANT le CP11, les quatre verrous étaient fermés : le moteur de rétention était');
console.log('  STRUCTURELLEMENT incapable d’observer un transfert, et son compteur ne pouvait');
console.log('  valoir que zéro — quoi que fasse l’apprenant.');
console.log('→ Le CP11 ouvre le quatrième (le type de preuve). Les trois premiers restent');
console.log('  fermés : ce sont la dette D10, et ils appartiennent au curriculum et à l’UI.');
