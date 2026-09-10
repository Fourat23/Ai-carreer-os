// V73 · CP12 — INTÉGRITÉ FACTUELLE.
//
// Ce checkpoint ne juge rien : il vérifie ce qui est VÉRIFIABLE MÉCANIQUEMENT, et publie les
// erreurs de sonde au même titre que les erreurs de contenu.
//
// Sept contrôles, tous déclaratifs :
//   R1  liens de leçon des 365 journées → la leçon existe
//   R2  liens entre leçons              → la leçon citée existe
//   R3  `practiceRefs` de la carte      → l'artefact existe (exercice, playbook, mission, lab)
//   R4  exercices de `day-exercises`    → l'exercice existe dans la banque
//   R5  clés dupliquées                 → dans LESSONS_V67 et dans les fichiers d'enrichissement
//   R6  `readingMinutes`                → recompté indépendamment, document par document
//   R7  solutions de référence          → chaque exercice a une solution et des tests
//
// R5 est la dette du CP3 : les anomalies n° 10 et n° 14 sont toutes deux des CLÉS DUPLIQUÉES
// dans un littéral d'objet — la dernière écrase la première, silencieusement, et le
// rattachement est perdu sans le moindre message. C'était une anomalie de sonde au CP2, et un
// défaut de PRODUCTION au CP3.
//
// Usage : node scripts/v73/cp12-integrite.mjs [--json]
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const lire = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const n3 = (n) => String(n).padStart(3, '0');
const idsDe = (d) => new Set(existsSync(`data/${d}`) ? readdirSync(`data/${d}`).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)) : []);
const prog = JSON.parse(readFileSync('data/program.json', 'utf8'));
const { LESSONS } = await import('../data/lessons-map.mjs');

const slugs = new Set(readdirSync('curriculum/lessons').filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)));
const exos = idsDe('exercises'), playbooks = idsDe('playbooks'), missions = idsDe('missions');
const labRoutes = new Set([...lire('app/doc/[...slug]/page.tsx').match(/const LAB_ROUTES[^}]*}/s)?.[0]
  .matchAll(/^\s*'?([a-z0-9-]+)'?\s*:/gm) ?? []].map((m) => m[1]).filter((x) => x !== 'const'));
const connu = { exercise: exos, playbook: playbooks, mission: missions, lab: labRoutes };

const res = {};

// ── R1 · liens de leçon des journées
res.R1 = [];
for (const d of prog.days) {
  const md = lire(`curriculum/days/day-${n3(d.day)}.md`);
  for (const m of md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g))
    if (!slugs.has(m[1])) res.R1.push(`j${d.day} → ${m[1]}`);
}

// ── R2 · liens entre leçons
res.R2 = [];
for (const s of slugs)
  for (const m of lire(`curriculum/lessons/${s}.md`).matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g))
    if (!slugs.has(m[1])) res.R2.push(`${s} → ${m[1]}`);

// ── R3 · practiceRefs de la carte
res.R3 = [];
for (const l of LESSONS)
  for (const r of l.practiceRefs ?? [])
    if (!connu[r.kind]?.has(r.id)) res.R3.push(`${l.file} → ${r.kind}:${r.id}`);

// ── R4 · exercices programmés par les journées
res.R4 = [];
const dayEx = existsSync('data/day-exercises.json') ? JSON.parse(readFileSync('data/day-exercises.json', 'utf8')) : {};
for (const [j, ids] of Object.entries(dayEx))
  for (const id of ids) if (!exos.has(id)) res.R4.push(`j${j} → ${id}`);

// ── R5 · clés dupliquées dans les littéraux d'objet des données de journée
res.R5 = [];
for (const f of readdirSync('scripts/data').filter((x) => x.endsWith('.mjs'))) {
  const src = readFileSync(`scripts/data/${f}`, 'utf8');
  const vus = new Map();
  // indentation LARGE : les fichiers d'enrichissement n'ont pas tous la même. Un motif trop
  // étroit ne trouverait rien et rendrait le contrôle vert par construction — le contraire de
  // ce qu'il doit faire.
  for (const m of src.matchAll(/^[ \t]{1,8}(\d{1,3})\s*:/gm)) {
    const k = m[1];
    if (vus.has(k)) res.R5.push(`${f} : clé ${k} déclarée deux fois`);
    vus.set(k, true);
  }
}

// ── R6 · readingMinutes recompté document par document
const minutes = (md) => {
  const s = md.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`\n]*`/g, ' ');
  const mots = s.split(/\s+/).filter(Boolean).length;
  const lc = [...md.matchAll(/```[\s\S]*?```/g)].map((m) => Math.max(0, m[0].split('\n').length - 2)).reduce((a, b) => a + b, 0);
  return mots / 150 + lc / 20;
};
res.R6 = [];
for (const d of prog.days) {
  const md = lire(`curriculum/days/day-${n3(d.day)}.md`);
  const ls = [...new Set([...md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))];
  let t = minutes(md) + minutes(lire(`curriculum/solutions/day-${n3(d.day)}-solution.md`));
  for (const s of ls) t += minutes(lire(`curriculum/lessons/${s}.md`));
  const ecart = Math.round(t) - d.readingMinutes;
  if (Math.abs(ecart) > 3) res.R6.push(`j${d.day} : déclaré ${d.readingMinutes}, recompté ${Math.round(t)}`);
}

// ── R7 · chaque exercice a une solution de référence et des tests
res.R7 = [];
for (const id of exos) {
  const x = JSON.parse(readFileSync(`data/exercises/${id}.json`, 'utf8'));
  if (!x.reference || !Object.keys(x.reference).length) res.R7.push(`${id} : aucune solution de référence`);
  else if (!Array.isArray(x.tests) || !x.tests.length) res.R7.push(`${id} : aucun test`);
}

const total = Object.values(res).reduce((a, b) => a + b.length, 0);
if (process.argv.includes('--json')) process.stdout.write(JSON.stringify({ ...res, total }));
else {
  const NOMS = {
    R1: 'liens de leçon des 365 journées', R2: 'liens entre leçons',
    R3: 'practiceRefs de la carte', R4: 'exercices programmés par les journées',
    R5: 'clés dupliquées dans les données de journée', R6: 'readingMinutes recompté',
    R7: 'exercices sans solution de référence ou sans test',
  };
  console.log(`inventaire : ${slugs.size} leçons · ${exos.size} exercices · ${playbooks.size} playbooks · ${missions.size} missions · ${labRoutes.size} labs`);
  console.log('');
  for (const [k, v] of Object.entries(res)) {
    console.log(`${k}  ${NOMS[k].padEnd(46)} ${v.length === 0 ? '✅ 0' : `❌ ${v.length}`}`);
    for (const x of v.slice(0, 6)) console.log(`      ${x}`);
    if (v.length > 6) console.log(`      … et ${v.length - 6} autres`);
  }
  console.log(`\nTOTAL : ${total}`);
}
process.exitCode = total === 0 ? 0 : 1;
