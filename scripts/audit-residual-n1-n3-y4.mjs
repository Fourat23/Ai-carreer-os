// audit-residual-n1-n3-y4.mjs — Audit EN LECTURE SEULE des anomalies résiduelles N1, N3, Y4.
// Ne régénère rien, ne modifie aucun fichier. Lit uniquement les fichiers rendus + le program.json.
// N1 : leçons orphelines / sous-référencées (jamais ou peu liées depuis un jour).
// N3 : titres de jours dupliqués (exacts ou sémantiquement identiques).
// Y4 : critères de validation subjectifs / non mesurables.
// Chaque signal est BRUT : il doit être vérifié manuellement avant tout verdict pédagogique.
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const DAYS_DIR = path.join(ROOT, 'curriculum/days');
const LESSONS_DIR = path.join(ROOT, 'curriculum/lessons');

function readDay(n) { return fs.readFileSync(path.join(DAYS_DIR, `day-${String(n).padStart(3, '0')}.md`), 'utf8'); }
function section(md, header) {
  const parts = md.split(/\n(?=## )/);
  const m = parts.find(s => s.replace(/^## /, '').split('\n')[0].includes(header));
  return m ? m.slice(m.indexOf('\n') + 1).trim() : '';
}
const program = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/program.json'), 'utf8'));
const days = Object.values(program).find(v => Array.isArray(v) && v.length && v[0] && 'day' in v[0]);

console.log('═══════════════════════════════════════════════════════════════');
console.log(' AUDIT RÉSIDUEL N1 / N3 / Y4 — lecture seule');
console.log('═══════════════════════════════════════════════════════════════\n');

// ───────────────────────── N1 : leçons orphelines / sous-référencées ─────────────────────────
const lessonSlugs = fs.readdirSync(LESSONS_DIR).filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, ''));
const refCount = Object.fromEntries(lessonSlugs.map(s => [s, 0]));
const refDays = Object.fromEntries(lessonSlugs.map(s => [s, []]));
const linkRe = /\/doc\/lessons\/([a-z0-9-]+)/g;
for (let n = 1; n <= 365; n++) {
  const f = path.join(DAYS_DIR, `day-${String(n).padStart(3, '0')}.md`);
  if (!fs.existsSync(f)) continue;
  const md = fs.readFileSync(f, 'utf8');
  const seen = new Set();
  let m; while ((m = linkRe.exec(md))) seen.add(m[1]);
  for (const s of seen) { if (s in refCount) { refCount[s]++; refDays[s].push(n); } }
}
const orphans = lessonSlugs.filter(s => refCount[s] === 0);
const under = lessonSlugs.filter(s => refCount[s] > 0 && refCount[s] <= 2).sort((a, b) => refCount[a] - refCount[b]);

console.log('── N1 · Leçons orphelines (0 lien depuis un jour) ──');
console.log(`Total leçons : ${lessonSlugs.length} · orphelines : ${orphans.length}`);
for (const s of orphans) console.log(`  ⚠ ORPHELINE : ${s}  (référencée par 0 jour)`);
console.log(`\n── N1 · Leçons sous-référencées (1-2 jours) — à inspecter ──`);
for (const s of under) console.log(`  · ${s} → ${refCount[s]} jour(s) : ${refDays[s].join(', ')}`);

// ───────────────────────── N3 : titres de jours dupliqués ─────────────────────────
console.log('\n── N3 · Titres de jours dupliqués ──');
function normTitle(t) {
  return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}
const byExact = {}, byNorm = {};
for (const d of days) {
  const t = (d.title || '').trim();
  (byExact[t] ??= []).push(d.day);
  (byNorm[normTitle(t)] ??= []).push({ day: d.day, title: t });
}
const exactDup = Object.entries(byExact).filter(([, ds]) => ds.length > 1);
console.log(`Titres exactement dupliqués : ${exactDup.length}`);
for (const [t, ds] of exactDup) console.log(`  ⚠ EXACT « ${t} » → jours ${ds.join(', ')}`);
const normDup = Object.entries(byNorm).filter(([, arr]) => new Set(arr.map(a => a.title)).size > 1 && arr.length > 1);
console.log(`Titres sémantiquement identiques (après normalisation, formulations distinctes) : ${normDup.length}`);
for (const [, arr] of normDup) console.log(`  · ${arr.map(a => `${a.day}:« ${a.title} »`).join('  |  ')}`);

// ───────────────────────── Y4 : critères de validation subjectifs ─────────────────────────
console.log('\n── Y4 · Critères de validation subjectifs / non mesurables ──');
// Marqueurs subjectifs (jugement sans mesure) ; on EXCLUT si un ancrage mesurable est présent sur la même puce.
const SUBJ = /\b(lisible|sans effort|coh[ée]rent|propre|clair(?:e|ement)?|[ée]l[ée]gant|joli|soign[ée]|intuiti|de qualit[ée]|compr[ée]hensible|pertinent|bien (?:structur|[ée]crit|nomm|rang)|facile à (?:lire|comprendre|maintenir))\b/i;
const MEASURABLE = /(\btous?\b|\btoutes?\b|\bchaque\b|\d|%|≥|>=|<=|au moins|passe|tests?\b|couvre|renvoie|retourne|affiche|contient|liste|exactement|aucun|zéro|bornes?|gère)/i;
const y4hits = [];
for (const d of days) {
  const n = d.day;
  const md = readDay(n);
  const crit = section(md, 'Critères de validation') || section(md, 'Critères de réussite');
  if (!crit) continue;
  for (const line of crit.split('\n')) {
    const b = line.replace(/^-\s*\[[ x]\]\s*/, '').replace(/^-\s*/, '').trim();
    if (!b || !line.trim().startsWith('-')) continue;
    if (SUBJ.test(b) && !MEASURABLE.test(b)) y4hits.push({ day: n, crit: b });
  }
}
console.log(`Puces de critères flaggées subjectives (sans ancrage mesurable) : ${y4hits.length}`);
const byDayY4 = {};
for (const h of y4hits) (byDayY4[h.day] ??= []).push(h.crit);
for (const [n, cs] of Object.entries(byDayY4).sort((a, b) => +a[0] - +b[0])) {
  console.log(`  jour ${n} :`);
  for (const c of cs) console.log(`      ⚠ « ${c} »`);
}

// ───────────────────────── Contexte hors-scope N1/N3/Y4 (signalé, non compté) ─────────────────────────
console.log('\n── Contexte (hors périmètre N1/N3/Y4, pour information) ──');
let noCase = [];
for (const d of days) {
  if (d.isReview || d.day < 91) continue;
  const md = readDay(d.day);
  if (!section(md, 'Cas métier')) noCase.push(d.day);
}
console.log(`Jours d'apprentissage 91-365 sans section « Cas métier » : ${noCase.length}`);
if (noCase.length) console.log(`  ${noCase.join(', ')}`);

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(' Fin de l\'audit brut. Chaque signal DOIT être vérifié manuellement.');
console.log('═══════════════════════════════════════════════════════════════');
