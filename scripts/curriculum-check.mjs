#!/usr/bin/env node
// Vérification d'INTÉGRITÉ du curriculum. Lance : npm run curriculum:check
// Vérifie présence et cohérence (jours, corrections, semaines, mois, sections,
// compétences, liens internes). Sort en code 1 si une vérification échoue.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SKILLS } from './data/skills.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CUR = join(ROOT, 'curriculum');
const pad3 = (n) => String(n).padStart(3, '0');
const pad2 = (n) => String(n).padStart(2, '0');
const read = (p) => readFileSync(p, 'utf8');
const dayFile = (n) => join(CUR, 'days', `day-${pad3(n)}.md`);
const solFile = (n) => join(CUR, 'solutions', `day-${pad3(n)}-solution.md`);

const errors = [];
const warns = [];
const fail = (m) => errors.push(m);
const warn = (m) => warns.push(m);

const program = JSON.parse(read(join(ROOT, 'data', 'program.json')));
const skillIds = new Set(SKILLS.map((s) => s.id));

// 1. 365 jours présents
let daysOk = 0;
for (let n = 1; n <= 365; n++) if (existsSync(dayFile(n))) daysOk++; else fail(`Jour manquant : day-${pad3(n)}.md`);
// 2. 365 corrections présentes
let solOk = 0;
for (let n = 1; n <= 365; n++) if (existsSync(solFile(n))) solOk++; else fail(`Correction manquante : day-${pad3(n)}-solution.md`);
// 3. 52 semaines
let weeksOk = 0;
for (let w = 1; w <= 52; w++) if (existsSync(join(CUR, `week-${pad2(w)}.md`))) weeksOk++; else fail(`Semaine manquante : week-${pad2(w)}.md`);
// 4. 12 mois
let monthsOk = 0;
for (let m = 1; m <= 12; m++) if (existsSync(join(CUR, `month-${pad2(m)}.md`))) monthsOk++; else fail(`Mois manquant : month-${pad2(m)}.md`);

// 5-9. Chaque jour : objectif, exercice/activité, livrable, critère, compétence
for (const d of program.days) {
  const md = existsSync(dayFile(d.day)) ? read(dayFile(d.day)) : '';
  if (!md.includes('## 🎯 Objectif')) fail(`Jour ${d.day} : pas d'objectif`);
  const hasActivity = md.includes('Pratique autonome') || md.includes('Exercice') || md.includes('Revue hebdomadaire') || md.includes('Test pratique');
  if (!hasActivity) fail(`Jour ${d.day} : pas d'exercice ni d'activité`);
  if (!d.isReview) {
    if (!md.includes('## 📦 Livrable')) fail(`Jour ${d.day} : pas de livrable`);
    if (!md.includes('## ✅ Critères de validation')) fail(`Jour ${d.day} : pas de critère de validation`);
  }
  if (!skillIds.has(d.skill)) fail(`Jour ${d.day} : compétence inconnue « ${d.skill} »`);
}

// 10. Liens internes importants : chaque jour référence une correction et une leçon existante.
for (const d of program.days) {
  const md = existsSync(dayFile(d.day)) ? read(dayFile(d.day)) : '';
  // lien correction
  const solLink = `../solutions/day-${pad3(d.day)}-solution.md`;
  if (!d.isReview && md.includes(solLink) && !existsSync(solFile(d.day))) fail(`Jour ${d.day} : lien correction cassé`);
  // liens leçons /doc/lessons/<file>
  const lessonLinks = [...md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]);
  for (const slug of lessonLinks) {
    if (!existsSync(join(CUR, 'lessons', `${slug}.md`))) fail(`Jour ${d.day} : leçon liée manquante « ${slug} »`);
  }
}

// Liens semaine/mois depuis year-overview et cohérence des fiches projets/docs
const requiredDocs = [
  'year-overview.md', 'resources/resources.md',
  'rubrics/skills-scorecard.md', 'rubrics/monthly-evaluation.md', 'rubrics/interview-evaluation.md',
  'career/cv-linkedin-strategy.md', 'career/interview-prep.md',
  'methodology/how-to-learn.md', 'methodology/how-to-use-ai-without-dependency.md',
  'methodology/how-to-debug.md', 'methodology/how-to-think-like-an-engineer.md',
  'methodology/how-to-design-architecture.md',
  'QUALITY_STANDARD.md', 'how-to-use-12-months.md',
];
for (const doc of requiredDocs) if (!existsSync(join(CUR, doc))) fail(`Document requis manquant : ${doc}`);
for (const id of ['01', '02', '03', '04', '05', '06', 'final'])
  if (!existsSync(join(CUR, 'projects', `project-${id}.md`))) fail(`Fiche projet manquante : project-${id}.md`);

// Bibliothèque de leçons : compte réel + cible (avertissement tant que < 60).
const LESSON_TARGET = 60;
const nbLessons = existsSync(join(CUR, 'lessons'))
  ? readdirSync(join(CUR, 'lessons')).filter((f) => f.endsWith('.md')).length : 0;
if (nbLessons < LESSON_TARGET) warn(`Leçons : ${nbLessons}/${LESSON_TARGET} (cible non atteinte — chantier qualité en cours)`);

// Kit d'auteur (maintenabilité sans Fable).
for (const f of ['AUTHORING_GUIDE.md', 'templates/lesson-template.md', 'templates/day-template.md',
  'templates/solution-template.md', 'templates/project-template.md'])
  if (!existsSync(join(CUR, f))) fail(`Kit d'auteur manquant : ${f}`);

// Rapport
console.log('── Vérification d\'intégrité du curriculum ──');
console.log(`Jours          : ${daysOk}/365`);
console.log(`Corrections    : ${solOk}/365`);
console.log(`Semaines       : ${weeksOk}/52`);
console.log(`Mois           : ${monthsOk}/12`);
console.log(`Leçons de fond : ${nbLessons} (cible ${LESSON_TARGET})`);
for (const w of warns) console.log(`⚠️  ${w}`);
if (errors.length) {
  console.log(`\n❌ ${errors.length} erreur(s) :`);
  for (const e of errors.slice(0, 50)) console.log(`   - ${e}`);
  process.exit(1);
}
console.log('\n✅ Intégrité OK : tout est présent et cohérent.');

function countLessons() {
  let c = 0;
  for (const l of ['terminal-shell-filesystem', 'git-fundamentals', 'javascript-basics', 'typescript-basics',
    'algorithmic-thinking', 'data-structures-intro', 'http-rest-json', 'api-design-basics', 'sql-foundations',
    'clean-code', 'testing-foundations', 'architecture-basics', 'design-patterns-intro', 'python-foundations',
    'statistics-for-ml', 'machine-learning-basics', 'llm-fundamentals', 'rag-fundamentals', 'agents-fundamentals',
    'ai-evaluation', 'ai-security']) if (existsSync(join(CUR, 'lessons', `${l}.md`))) c++;
  return c;
}
