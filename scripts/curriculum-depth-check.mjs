#!/usr/bin/env node
// Audit de PROFONDEUR pédagogique. Lance : npm run curriculum:depth-check
// Vérifie les sections pédagogiques, la longueur, les blocs IA (cas métier + question
// d'entretien), et la bibliothèque de leçons (nombre + structure).

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CUR = join(ROOT, 'curriculum');
const pad3 = (n) => String(n).padStart(3, '0');
const read = (p) => readFileSync(p, 'utf8');
const program = JSON.parse(read(join(ROOT, 'data', 'program.json')));

const LESSON_TARGET = 60;
const DATA_AI_SKILLS = new Set(['sql', 'python', 'ml', 'dl', 'llm', 'rag', 'agents', 'evalia', 'secu', 'cloud', 'http']);
const AI_SKILLS = new Set(['llm', 'rag', 'agents', 'evalia', 'secu']); // cœur IA : exigences renforcées

// Seuils de mots (jours de travail).
const MIN_WORDS = { deep: 700, mid: 420, action: 300 };
const tier = (n) => (n <= 30 ? 'deep' : n <= 90 ? 'mid' : 'action');
const wc = (s) => (s.match(/\S+/g) ?? []).length;

const errors = [];
const warns = [];
let withCourse = 0, withGuided = 0, withFuture = 0, withCorrection = 0, withInterview = 0, withCase = 0;

// ── Jours ──
for (const d of program.days) {
  if (d.isReview) {
    if (!existsSync(join(CUR, 'solutions', `day-${pad3(d.day)}-solution.md`))) errors.push(`Jour ${d.day} (revue) : grille manquante`);
    continue;
  }
  const md = read(join(CUR, 'days', `day-${pad3(d.day)}.md`));
  const sol = join(CUR, 'solutions', `day-${pad3(d.day)}-solution.md`);
  const words = wc(md);
  const t = tier(d.day);

  if (md.includes('## 📖 Cours approfondi')) withCourse++; else errors.push(`Jour ${d.day} : « Cours approfondi » absent`);
  if (md.includes('## 🚀 Pourquoi ça comptera plus tard')) withFuture++; else errors.push(`Jour ${d.day} : « Pourquoi ça comptera plus tard » absent`);
  if (md.includes('## 🎤 Question d\'entretien')) withInterview++;
  if (md.includes('## 🏢 Cas métier')) withCase++;
  if (!md.includes('## 🧠 À retenir')) warns.push(`Jour ${d.day} : « À retenir » absent`);
  if (existsSync(sol)) withCorrection++; else errors.push(`Jour ${d.day} : correction absente`);
  if (md.includes('## 🧭 Exemple guidé')) withGuided++;
  else if (d.day <= 30 && !d.project) errors.push(`Jour ${d.day} : « Exemple guidé » attendu (jour 1-30)`);

  // Jours IA/data : cas métier + question d'entretien OBLIGATOIRES.
  if (DATA_AI_SKILLS.has(d.skill)) {
    if (!md.includes('## 🎤 Question d\'entretien')) errors.push(`Jour ${d.day} (${d.skill}) : question d'entretien manquante`);
    if (!md.includes('## 🏢 Cas métier')) errors.push(`Jour ${d.day} (${d.skill}) : cas métier manquant`);
  }
  // Cœur IA : profondeur renforcée (théorie inline OU >=2 leçons liées).
  if (AI_SKILLS.has(d.skill)) {
    const links = (md.match(/\/doc\/lessons\//g) ?? []).length;
    const courseBody = md.split('## 📖 Cours approfondi')[1]?.split('\n## ')[0] ?? '';
    if (links < 1 && wc(courseBody) < 150) warns.push(`Jour ${d.day} (cœur IA) : cours léger, lier une leçon de fond ou ajouter de la théorie`);
  }

  // Longueur.
  if (words < MIN_WORDS[t]) {
    const msg = `Jour ${d.day} : ${words} mots (< ${MIN_WORDS[t]} pour « ${t} »)`;
    (t === 'action' ? warns : errors).push(msg);
  }
  // Vague / court : lien leçon OU théorie substantielle.
  const hasLessonLink = /\/doc\/lessons\//.test(md);
  const courseBody = md.split('## 📖 Cours approfondi')[1]?.split('\n## ')[0] ?? '';
  if (!hasLessonLink && wc(courseBody) < 120) warns.push(`Jour ${d.day} : cours léger et sans renvoi vers une leçon`);
}

// ── Leçons ──
const lessonFiles = readdirSync(join(CUR, 'lessons')).filter((f) => f.endsWith('.md'));
const nbLessons = lessonFiles.length;
let fullGabarit = 0;
for (const f of lessonFiles) {
  const md = read(join(CUR, 'lessons', f));
  const words = wc(md);
  // Structure minimale commune (ancien + nouveau gabarit).
  const hasExercise = /exercice|mini-exercice/i.test(md);
  const hasVocab = /vocabulaire/i.test(md);
  const headings = (md.match(/^## /gm) ?? []).length;
  if (words < 350) errors.push(`Leçon ${f} : trop courte (${words} mots)`);
  if (headings < 6) errors.push(`Leçon ${f} : structure trop pauvre (${headings} sections)`);
  if (!hasExercise) errors.push(`Leçon ${f} : pas de mini-exercice`);
  if (!hasVocab) warns.push(`Leçon ${f} : pas de section vocabulaire`);
  // Gabarit complet (nouveau standard).
  const full = ['🎯 Objectif', 'Modèle mental', 'Exemple guidé', "Questions d'entretien", 'quand suis-je prêt'];
  if (full.every((s) => md.includes(s))) fullGabarit++;
}
if (nbLessons < LESSON_TARGET) warns.push(`Bibliothèque : ${nbLessons}/${LESSON_TARGET} leçons (cible non atteinte — objectif de qualité en cours)`);

// ── Rapport ──
const nWork = program.days.filter((d) => !d.isReview).length;
console.log('── Audit de profondeur pédagogique ──');
console.log(`Jours de travail                      : ${nWork}`);
console.log(`  avec « Cours approfondi »           : ${withCourse}/${nWork}`);
console.log(`  avec « Exemple guidé »              : ${withGuided}/${nWork}`);
console.log(`  avec « Question d'entretien »       : ${withInterview}/${nWork}`);
console.log(`  avec « Cas métier »                 : ${withCase}/${nWork}`);
console.log(`  avec « Pourquoi ça comptera »       : ${withFuture}/${nWork}`);
console.log(`  avec correction                     : ${withCorrection}/${nWork}`);
console.log(`Leçons de fond                        : ${nbLessons} (dont ${fullGabarit} au gabarit complet) — cible ${LESSON_TARGET}`);
if (warns.length) {
  console.log(`\n⚠️  ${warns.length} avertissement(s) (non bloquants) :`);
  for (const w of warns.slice(0, 25)) console.log(`   - ${w}`);
  if (warns.length > 25) console.log(`   … et ${warns.length - 25} autres`);
}
if (errors.length) {
  console.log(`\n❌ ${errors.length} problème(s) de profondeur :`);
  for (const e of errors.slice(0, 40)) console.log(`   - ${e}`);
  process.exit(1);
}
console.log('\n✅ Profondeur OK : structure pédagogique complète, blocs IA présents, leçons structurées.');
