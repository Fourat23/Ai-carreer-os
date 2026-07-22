#!/usr/bin/env node
// Audit pédagogique global (LECTURE SEULE) — n'écrit AUCUN fichier du curriculum.
// Produit : audit-pedagogique-365.json (anomalies machine-readable) + inventaire.
// Lance : node scripts/audit-pedagogique.mjs
// Toutes les mesures sont RECALCULÉES à partir des fichiers réels (md + program.json).

import { readFileSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CUR = join(ROOT, 'curriculum');
const pad3 = (n) => String(n).padStart(3, '0');
const read = (p) => readFileSync(p, 'utf8');
const wc = (s) => (s.match(/\S+/g) ?? []).length;
const program = JSON.parse(read(join(ROOT, 'data', 'program.json')));

const lessonFiles = new Set(readdirSync(join(CUR, 'lessons')).filter((f) => f.endsWith('.md')));
const anomalies = [];
let anomId = 0;
const addAnom = (day, category, severity, description, proof, recommendation, file) => {
  anomalies.push({ id: `A${String(++anomId).padStart(4, '0')}`, day, category, severity, description, proof, recommendation, file, status: 'open' });
};

// Extrait le corps d'une section ## <titre> jusqu'au prochain ## (ou fin).
function section(md, heading) {
  const i = md.indexOf(heading);
  if (i === -1) return null;
  const after = md.slice(i + heading.length);
  const next = after.search(/\n## /);
  return (next === -1 ? after : after.slice(0, next)).trim();
}

const inventory = [];

for (const d of program.days) {
  const dayPath = join(CUR, 'days', `day-${pad3(d.day)}.md`);
  const solPath = join(CUR, 'solutions', `day-${pad3(d.day)}-solution.md`);
  const md = existsSync(dayPath) ? read(dayPath) : '';
  const sol = existsSync(solPath) ? read(solPath) : '';
  const tier = d.day <= 30 ? 'deep' : d.day <= 90 ? 'mid' : 'action';

  // Sections jour
  const hasCourse = md.includes('## 📖 Cours approfondi');
  const hasGuided = md.includes('## 🧭 Exemple guidé');
  const hasQuiz = md.includes('## ❓ Mini-quiz');
  const hasCase = md.includes('## 🏢 Cas métier');
  const hasInterview = md.includes("## 🎤 Question d'entretien");
  const hasFuture = md.includes('## 🚀 Pourquoi ça comptera plus tard');
  const hasCriteria = md.includes('## ✅ Critères de validation');
  const hasDeliverable = md.includes('## 📦 Livrable attendu');
  const hasMistakes = md.includes('## ⚠️ Erreurs fréquentes');
  const courseBody = section(md, '## 📖 Cours approfondi') ?? '';
  const theoryWords = wc(courseBody);
  const caseBody = section(md, '## 🏢 Cas métier') ?? '';
  const interviewBody = section(md, "## 🎤 Question d'entretien") ?? '';
  const guidedBody = section(md, '## 🧭 Exemple guidé') ?? '';
  // Modèle mental = 1re phrase en gras du cours approfondi (theoryExtra enrichi)
  const mmMatch = courseBody.match(/\*\*([^*]{40,})\*\*/);
  const mentalModel = mmMatch ? mmMatch[1].replace(/\s+/g, ' ').trim() : '';

  // Critères mesurables : heuristique (contient un nombre, %, "testé", "vérifi", "prouv", cases à cocher)
  const critBody = section(md, '## ✅ Critères de validation') ?? '';
  const critItems = (critBody.match(/^- \[.\]/gm) ?? []).length;
  const critMeasurable = /\d|%|test|vérifi|prouv|compil|passe|zéro|au moins|exactement|démontrable|attendu|correct|complet|fonctionne/i.test(critBody);

  // Solution
  const solWords = wc(sol);
  const solHasLogic = sol.includes('## 🧠 La logique attendue');
  const solHasSimple = sol.includes('## ✅ Une solution simple');
  const solHasImproved = sol.includes('## 🚀 Une solution améliorée');
  const solHasPitfalls = sol.includes('## ⚠️ Erreurs probables');
  const solHasChecks = sol.includes('## 🔍 Comment vérifier');
  const solHasOral = sol.includes("## 🎤 À savoir expliquer");
  const solHasQuizAns = sol.includes('## ❓ Réponses du mini-quiz');

  // Blocs de code : nombre de ``` (doit être pair)
  const fencesDay = (md.match(/```/g) ?? []).length;
  const fencesSol = (sol.match(/```/g) ?? []).length;

  // Liens de leçons
  const lessonLinks = [...md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]);
  const brokenLinks = lessonLinks.filter((l) => !lessonFiles.has(l + '.md'));

  // Caractères corrompus
  let corrupt = false;
  for (const ch of md + sol) {
    const o = ch.codePointAt(0);
    if (o === 0xfffd || (o >= 0x0400 && o <= 0x04ff) || (o >= 0x10a0 && o <= 0x10ff)) { corrupt = true; break; }
  }
  // Placeholders / TODO
  // Placeholders réels uniquement. NB : "todo" (statut de tâche), "grep TODO",
  // placeholder="..." (attribut React) et "à compléter par ..." (prose) sont du contenu
  // LÉGITIME — on ne détecte que les marqueurs de brouillon sans ambiguïté.
  const placeholder = /(\bFIXME\b|lorem ipsum|\bTODO:|\[à rédiger\]|\[à compléter\])/i.test(md + sol);

  inventory.push({
    day: d.day, week: d.week, month: d.month, title: d.title, skill: d.skill, skillName: d.skillName,
    type: d.isReview ? 'revue' : d.project ? 'projet' : 'apprentissage',
    project: d.project ?? null, deliverable: d.deliverable ?? null,
    lessons: lessonLinks, tier,
    sections: { hasCourse, hasGuided, hasQuiz, hasCase, hasInterview, hasFuture, hasCriteria, hasDeliverable, hasMistakes },
    theoryWords, critItems, critMeasurable,
    solutionWords: solWords,
    solutionSections: { solHasLogic, solHasSimple, solHasImproved, solHasPitfalls, solHasChecks, solHasOral, solHasQuizAns },
    mentalModel: mentalModel.slice(0, 160),
    caseWords: wc(caseBody), interviewWords: wc(interviewBody), guidedWords: wc(guidedBody),
  });

  // ── ANOMALIES AUTOMATISÉES ──
  if (!d.isReview) {
    if (!hasCourse) addAnom(d.day, 'structure', 'majeur', 'Cours approfondi absent', 'section "## 📖 Cours approfondi" manquante', 'Ajouter la théorie', dayPath);
    if (!hasFuture) addAnom(d.day, 'structure', 'moyen', 'Section "Pourquoi ça comptera" absente', 'heading manquant', 'Ajouter la projection', dayPath);
    if (!existsSync(solPath)) addAnom(d.day, 'structure', 'bloquant', 'Correction absente', 'fichier solution manquant', 'Créer la correction', solPath);
    // Cas métier / entretien obligatoires pour les compétences data/IA
    const DATA_AI = new Set(['sql', 'python', 'ml', 'dl', 'llm', 'rag', 'agents', 'evalia', 'secu', 'cloud', 'http']);
    if (DATA_AI.has(d.skill) && !hasCase) addAnom(d.day, 'structure', 'majeur', `Cas métier manquant (${d.skill})`, 'section absente', 'Ajouter un cas métier', dayPath);
    if (DATA_AI.has(d.skill) && !hasInterview) addAnom(d.day, 'structure', 'majeur', `Question d'entretien manquante (${d.skill})`, 'section absente', 'Ajouter une question', dayPath);
    // Théorie mince
    const minW = tier === 'deep' ? 700 : tier === 'mid' ? 420 : 300;
    if (theoryWords > 0 && wc(md) < minW) addAnom(d.day, 'profondeur', 'moyen', `Jour court (${wc(md)} mots < ${minW})`, `wc=${wc(md)}`, 'Enrichir', dayPath);
    // Critères non mesurables
    if (hasCriteria && !critMeasurable) addAnom(d.day, 'criteres', 'moyen', 'Critères de validation non mesurables', critBody.slice(0, 120), 'Rendre les critères mesurables', dayPath);
    // Correction trop courte
    if (existsSync(solPath) && solWords < 120) addAnom(d.day, 'correction', 'majeur', `Correction très courte (${solWords} mots)`, `wc=${solWords}`, 'Étoffer la correction', solPath);
  }
  // Blocs de code non fermés
  if (fencesDay % 2 !== 0) addAnom(d.day, 'technique', 'majeur', 'Bloc de code non fermé (jour)', `${fencesDay} fences`, 'Fermer le bloc', dayPath);
  if (fencesSol % 2 !== 0) addAnom(d.day, 'technique', 'majeur', 'Bloc de code non fermé (solution)', `${fencesSol} fences`, 'Fermer le bloc', solPath);
  // Liens cassés
  for (const b of brokenLinks) addAnom(d.day, 'technique', 'majeur', `Lien de leçon inexistant: ${b}`, `/doc/lessons/${b}`, 'Corriger ou créer la leçon', dayPath);
  // Caractères corrompus
  if (corrupt) addAnom(d.day, 'technique', 'majeur', 'Caractères corrompus détectés', 'U+FFFD ou bloc non-latin', 'Nettoyer', dayPath);
  // Placeholders
  if (placeholder) addAnom(d.day, 'technique', 'majeur', 'Placeholder / TODO détecté', 'motif TODO/placeholder', 'Compléter', dayPath);
}

// ── Revues non enrichies (base sans Synthèse/Grille/Remédiation/Entretien) ──
for (const d of program.days.filter((x) => x.isReview)) {
  const md = read(join(CUR, 'days', `day-${pad3(d.day)}.md`));
  const enriched = ['Synthèse de la semaine', 'Grille de notation', 'Plan de remédiation', "Questions d'entretien de la semaine"].every((h) => md.includes(h));
  if (!enriched) addAnom(d.day, 'revue', 'moyen', 'Revue non enrichie (structure de base seulement)',
    'manque Synthèse structurée / Grille de notation mesurable / Plan de remédiation / Questions d\'entretien',
    'Ajouter les 4 sections d\'évaluation enrichie', join(CUR, 'days', `day-${pad3(d.day)}.md`));
}

// ── Leçons orphelines (jamais liées depuis un jour) ──
const linkedLessons = new Set();
for (const d of program.days) {
  const md = read(join(CUR, 'days', `day-${pad3(d.day)}.md`));
  [...md.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].forEach((m) => linkedLessons.add(m[1] + '.md'));
}
for (const lf of lessonFiles) if (!linkedLessons.has(lf)) addAnom(0, 'lecons', 'mineur', `Leçon orpheline (jamais liée): ${lf}`, 'aucun jour ne référence cette leçon', 'Lier la leçon depuis les jours pertinents', join(CUR, 'lessons', lf));

// ── Jours de travail sans cas métier ──
for (const inv of inventory.filter((i) => i.type !== 'revue' && !i.sections.hasCase)) {
  addAnom(inv.day, 'cas-metier', 'mineur', `Cas métier absent (${inv.skill})`, 'section "## 🏢 Cas métier" absente', 'Ajouter un cas métier propre au sujet', join(CUR, 'days', `day-${pad3(inv.day)}.md`));
}

// ── Écarts de cohérence entre paliers (systémiques) ──
const actionNoQuiz = inventory.filter((i) => i.type !== 'revue' && i.tier === 'action' && !i.sections.hasQuiz).length;
if (actionNoQuiz > 0) addAnom(0, 'coherence', 'mineur', `Mini-quiz absent sur ${actionNoQuiz} jours (palier 91-365)`, 'les paliers deep (1-30) et mid (31-90) ont un mini-quiz, pas le palier action (91-365)', 'Ajouter un mini-quiz au palier 91-365 pour l\'uniformité', 'systémique');
const actionFoldedSol = inventory.filter((i) => i.type !== 'revue' && i.tier === 'action' && !i.solutionSections.solHasSimple).length;
if (actionFoldedSol > 0) addAnom(0, 'coherence', 'mineur', `Solutions sans sections "simple/améliorée" séparées sur ${actionFoldedSol} jours (91-365)`, 'le contenu simple/améliorée est présent en prose dans "La logique attendue" mais pas en sections dédiées comme en 1-90', 'Uniformiser la structure des corrections (optionnel)', 'systémique');

// ── Titres dupliqués ──
const titleMap = new Map();
for (const d of program.days) {
  const t = d.title.trim();
  if (!titleMap.has(t)) titleMap.set(t, []);
  titleMap.get(t).push(d.day);
}
for (const [t, days] of titleMap) if (days.length > 1) addAnom(days[0], 'duplication', 'moyen', 'Titre dupliqué', `"${t}" jours ${days.join(',')}`, 'Différencier les titres', 'program.json');

// ── Doublons EXACTS (réutilisation générique) : modèles mentaux / cas métier / entretien ──
function getField(day, field) {
  const dayPath = join(CUR, 'days', `day-${pad3(day)}.md`);
  if (!existsSync(dayPath)) return '';
  const md = read(dayPath);
  if (field === 'case') return (section(md, '## 🏢 Cas métier') ?? '').replace(/\s+/g, ' ').trim();
  if (field === 'interview') return (section(md, "## 🎤 Question d'entretien") ?? '').replace(/\s+/g, ' ').trim();
  return '';
}
function exactDupGroups(field, label) {
  const map = new Map();
  for (const inv of inventory.filter(i => i.type !== 'revue')) {
    let t = field === 'mm' ? inv.mentalModel : getField(inv.day, field);
    if (!t) continue;
    if (!map.has(t)) map.set(t, []);
    map.get(t).push(inv.day);
  }
  for (const [t, days] of map) {
    if (days.length > 1) {
      addAnom(days[0], 'duplication', 'majeur',
        `${label} générique réutilisé sur ${days.length} jours`,
        `jours ${days.join(',')} — texte identique`,
        `Rédiger un ${label.toLowerCase()} spécifique par jour`, 'enrich');
    }
  }
}
exactDupGroups('mm', 'Modèle mental');
exactDupGroups('case', 'Cas métier');
exactDupGroups('interview', "Question d'entretien");

// ── Écriture des sorties ──
writeFileSync(join(ROOT, 'audit-pedagogique-365.json'), JSON.stringify({ generatedAt: new Date().toISOString(), counts: {
  total: program.days.length,
  work: inventory.filter(i => i.type === 'apprentissage').length,
  review: inventory.filter(i => i.type === 'revue').length,
  project: inventory.filter(i => i.type === 'projet').length,
}, anomalies }, null, 2));
writeFileSync(join(ROOT, 'scripts', 'audit-inventory.json'), JSON.stringify(inventory, null, 2));

// ── Résumé console ──
const bySev = {};
for (const a of anomalies) bySev[a.severity] = (bySev[a.severity] ?? 0) + 1;
const byCat = {};
for (const a of anomalies) byCat[a.category] = (byCat[a.category] ?? 0) + 1;
console.log('=== AUDIT AUTOMATISÉ ===');
console.log('Jours:', program.days.length, '| apprentissage:', inventory.filter(i=>i.type==='apprentissage').length, '| revue:', inventory.filter(i=>i.type==='revue').length, '| projet(tag):', inventory.filter(i=>i.type==='projet').length);
console.log('Anomalies:', anomalies.length);
console.log('Par gravité:', JSON.stringify(bySev));
console.log('Par catégorie:', JSON.stringify(byCat));
// Statistiques structurelles
const noQuiz = inventory.filter(i => i.type!=='revue' && !i.sections.hasQuiz).length;
const noGuided = inventory.filter(i => i.type!=='revue' && !i.sections.hasGuided).length;
const noCase = inventory.filter(i => i.type!=='revue' && !i.sections.hasCase).length;
const solNoSimple = inventory.filter(i => i.type!=='revue' && !i.solutionSections.solHasSimple).length;
const solNoImproved = inventory.filter(i => i.type!=='revue' && !i.solutionSections.solHasImproved).length;
console.log('--- Statistiques structurelles (jours de travail) ---');
console.log('sans Mini-quiz:', noQuiz, '/ 313');
console.log('sans Exemple guidé:', noGuided, '/ 313');
console.log('sans Cas métier:', noCase, '/ 313');
console.log('solutions sans "solution simple" (section):', solNoSimple, '/ 313');
console.log('solutions sans "solution améliorée" (section):', solNoImproved, '/ 313');
// Théorie : min/max/median
const tw = inventory.filter(i=>i.type!=='revue').map(i=>wc(read(join(CUR,'days',`day-${pad3(i.day)}.md`)))).sort((a,b)=>a-b);
console.log('mots/jour (travail) min/median/max:', tw[0], tw[Math.floor(tw.length/2)], tw[tw.length-1]);
const sw = inventory.filter(i=>i.type!=='revue').map(i=>i.solutionWords).sort((a,b)=>a-b);
console.log('mots/correction min/median/max:', sw[0], sw[Math.floor(sw.length/2)], sw[sw.length-1]);
