#!/usr/bin/env node
// Audit de PROFONDEUR pédagogique. Lance : npm run curriculum:depth-check
// Vérifie que chaque jour a les sections pédagogiques attendues et une longueur
// suffisante selon la tranche (1-30 très détaillés, 31-90 détaillés, 91-365 actionnables).

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CUR = join(ROOT, 'curriculum');
const pad3 = (n) => String(n).padStart(3, '0');
const read = (p) => readFileSync(p, 'utf8');
const program = JSON.parse(read(join(ROOT, 'data', 'program.json')));

// Seuils de mots (hors jours de revue).
const MIN_WORDS = { deep: 700, mid: 450, action: 220 };   // 1-30 / 31-90 / 91-365
const tier = (n) => (n <= 30 ? 'deep' : n <= 90 ? 'mid' : 'action');
const wordCount = (s) => (s.match(/\S+/g) ?? []).length;

const errors = [];
const warns = [];
let deepWithCourse = 0, deepWithGuided = 0, withFuture = 0, withCorrection = 0;

for (const d of program.days) {
  if (d.isReview) { // les revues ont leur propre grille, on vérifie juste sa présence
    if (!existsSync(join(CUR, 'solutions', `day-${pad3(d.day)}-solution.md`))) errors.push(`Jour ${d.day} (revue) : grille manquante`);
    continue;
  }
  const md = read(join(CUR, 'days', `day-${pad3(d.day)}.md`));
  const sol = join(CUR, 'solutions', `day-${pad3(d.day)}-solution.md`);
  const words = wordCount(md);
  const t = tier(d.day);

  // Sections obligatoires pour tous les jours de travail.
  if (!md.includes('## 📖 Cours approfondi')) errors.push(`Jour ${d.day} : section « Cours approfondi » absente`);
  else deepWithCourse += d.day <= 30 ? 1 : 0;
  if (!md.includes('## 🚀 Pourquoi ça comptera plus tard')) errors.push(`Jour ${d.day} : section « Pourquoi ça comptera plus tard » absente`);
  else withFuture++;
  if (!md.includes('## 🧠 À retenir')) warns.push(`Jour ${d.day} : section « À retenir » absente`);
  if (existsSync(sol)) withCorrection++; else errors.push(`Jour ${d.day} : correction absente`);

  // Exemple guidé : obligatoire pour 1-30 (hors jours "projet" purs), recommandé ensuite.
  const hasGuided = md.includes('## 🧭 Exemple guidé');
  if (hasGuided) deepWithGuided += d.day <= 30 ? 1 : 0;
  else if (d.day <= 30 && !d.project) errors.push(`Jour ${d.day} : « Exemple guidé » attendu (jour 1-30)`);

  // Longueur minimale.
  if (words < MIN_WORDS[t]) {
    const msg = `Jour ${d.day} : ${words} mots (< ${MIN_WORDS[t]} attendus pour la tranche « ${t} »)`;
    if (t === 'action') warns.push(msg); else errors.push(msg);
  }

  // Le cours doit renvoyer vers au moins une leçon de fond OU contenir de la théorie substantielle.
  const hasLessonLink = /\/doc\/lessons\//.test(md);
  const courseBody = md.split('## 📖 Cours approfondi')[1]?.split('##')[0] ?? '';
  if (!hasLessonLink && wordCount(courseBody) < 120)
    warns.push(`Jour ${d.day} : cours approfondi léger et sans renvoi vers une leçon de fond`);
}

// Rapport
console.log('── Audit de profondeur pédagogique ──');
console.log(`Jours 1-30 avec « Cours approfondi »  : ${deepWithCourse}/26 (hors revues)`);
console.log(`Jours 1-30 avec « Exemple guidé »     : ${deepWithGuided}`);
console.log(`Jours avec « Pourquoi ça comptera »   : ${withFuture}`);
console.log(`Jours avec correction                 : ${withCorrection}`);
console.log(`Leçons de fond                        : ${countLessons()}/21`);
if (warns.length) {
  console.log(`\n⚠️  ${warns.length} avertissement(s) (non bloquants) :`);
  for (const w of warns.slice(0, 20)) console.log(`   - ${w}`);
  if (warns.length > 20) console.log(`   … et ${warns.length - 20} autres`);
}
if (errors.length) {
  console.log(`\n❌ ${errors.length} problème(s) de profondeur :`);
  for (const e of errors.slice(0, 40)) console.log(`   - ${e}`);
  process.exit(1);
}
console.log('\n✅ Profondeur OK : structure pédagogique complète et longueurs suffisantes.');

function countLessons() {
  let c = 0;
  for (const l of ['terminal-shell-filesystem', 'git-fundamentals', 'javascript-basics', 'typescript-basics',
    'algorithmic-thinking', 'data-structures-intro', 'http-rest-json', 'api-design-basics', 'sql-foundations',
    'clean-code', 'testing-foundations', 'architecture-basics', 'design-patterns-intro', 'python-foundations',
    'statistics-for-ml', 'machine-learning-basics', 'llm-fundamentals', 'rag-fundamentals', 'agents-fundamentals',
    'ai-evaluation', 'ai-security']) if (existsSync(join(CUR, 'lessons', `${l}.md`))) c++;
  return c;
}
