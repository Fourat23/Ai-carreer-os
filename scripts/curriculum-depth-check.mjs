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
if (nbLessons < LESSON_TARGET) errors.push(`Bibliothèque : ${nbLessons}/${LESSON_TARGET} leçons — exigence minimale non atteinte`);

// ── V72 · CP12 — DURCISSEMENT SUR UNE PROPRIÉTÉ OBJECTIVE : les références mortes ──
//
// Trouvé au CP9 : deux leçons citaient dans leur section « Pratique » des exercices
// (`api-idempotency`, `dlq-duplicate`) qui n'existaient dans AUCUN des 541 identifiants
// du dépôt. Aucun gate ne le voyait — les gates vérifient les CATALOGUES, jamais la prose
// des leçons. L'apprenant, lui, cherche un exercice qui n'est nulle part.
//
// C'est exactement le genre de propriété qu'un gate peut tenir : décidable, objective,
// sans jugement pédagogique. On l'ajoute ici plutôt que d'inventer une notation.
// Renvoie le contenu des sections « ## … Pratique … » ou « ## … Exercice … » d'une leçon.
function sectionsPratique(md) {
  const out = []; let dedans = false, buf = [];
  for (const l of md.split('\n')) {
    if (l.startsWith('## ')) {
      if (dedans) { out.push(buf.join('\n')); buf = []; }
      dedans = /Pratique|Exercice/.test(l);
    } else if (dedans) buf.push(l);
  }
  if (dedans) out.push(buf.join('\n'));
  return out;
}

const CATALOGUES = ['exercises', 'missions', 'capstones', 'terminal-tasks', 'playbooks',
  'pipelines', 'security', 'cloud', 'topologies', 'manifests', 'transfer-challenges', 'assessments'];
const idsConnus = new Set();
for (const d of CATALOGUES) {
  const p = join(ROOT, 'data', d);
  if (existsSync(p)) for (const f of readdirSync(p)) if (f.endsWith('.json')) idsConnus.add(f.slice(0, -5));
}
const slugsLecons = new Set(lessonFiles.map((f) => f.slice(0, -3)));
// Termes techniques écrits en code qui ressemblent à un identifiant sans en être un.
const TERME_TECHNIQUE = /^(aria-|auto-fill|auto-fit|grid-template|cherry-pick|pre-commit|pas-un-|box-sizing|border-box|min-width|max-width|flex-|align-|justify-)/;
let refsMortes = 0;
for (const f of lessonFiles) {
  const md = read(join(CUR, 'lessons', f));
  // Découpage par titre plutôt que par expression régulière : avec le drapeau `m`,
  // `$` marque la fin de LIGNE, donc `([\s\S]*?)(?=^## |$)` capturait une chaîne VIDE.
  // Le contrôle passait sur du néant et annonçait « 0 référence morte ». Trouvé par le
  // test négatif n° 8 du CP12, qui est exactement ce à quoi sert un test négatif.
  for (const bloc of sectionsPratique(md))
    for (const [, id] of bloc.matchAll(/`([a-z][a-z0-9]+(?:-[a-z0-9]+){1,4})`/g)) {
      if (idsConnus.has(id) || slugsLecons.has(id) || TERME_TECHNIQUE.test(id)) continue;
      errors.push(`Leçon ${f} : référence morte « ${id} » — aucun exercice, playbook ni diagnostic de ce nom`);
      refsMortes++;
    }
}

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
console.log(`Leçons de fond                        : ${nbLessons} — cible ${LESSON_TARGET}`);
console.log(`  contrôles EXIGÉS par leçon          : ≥ 350 mots · ≥ 6 sections · un exercice · références vivantes`);
console.log(`  références mortes                    : ${refsMortes}`);
console.log(`  INDICATEUR, non exigé — gabarit complet : ${fullGabarit}/${nbLessons}`);
console.log(`     (« Objectif », « Modèle mental », « Exemple guidé », « Questions d'entretien »,`);
console.log(`      « quand suis-je prêt » réunis. NON exigé délibérément : imposer ces cinq titres`);
console.log(`      ferait ajouter des sections pour satisfaire un contrôle, ce qui dégraderait`);
console.log(`      des leçons volontairement plus courtes. La qualité pédagogique ne se note pas ici.)`);
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
// V72 · CP12 — MESSAGE HONNÊTE. L'ancien disait « leçons structurées », ce qui laissait
// croire à une vérification de structure pédagogique. Ce gate vérifie quatre propriétés
// objectives par leçon, et rien d'autre. Un message qui promet plus que ce qu'il tient
// est un gate vert auquel on ne peut pas se fier.
console.log('\n✅ Profondeur OK : journées au gabarit attendu (cours, exemple guidé, entretien,');
console.log('   cas métier sur les compétences IA/data, correction), et pour chaque leçon :');
console.log('   longueur minimale, nombre de sections, présence d\'un exercice, aucune référence morte.');
console.log('   Ce gate ne juge PAS la qualité pédagogique — il vérifie des propriétés décidables.');
