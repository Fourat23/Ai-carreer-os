#!/usr/bin/env node
// Générateur de curriculum — SOURCE DE VÉRITÉ : scripts/data/*.mjs
// Produit :
//   - curriculum/days/day-XXX.md         (365 jours)
//   - curriculum/solutions/day-XXX-solution.md
//   - curriculum/week-XX.md              (52 semaines, revues hebdo)
//   - curriculum/month-XX.md             (12 mois, revues mensuelles)
//   - curriculum/year-overview.md
//   - data/program.json                  (index consommé par l'app)
//
// Règle d'édition manuelle : un fichier .md dont la PREMIÈRE ligne est
// exactement `<!-- keep -->` n'est JAMAIS écrasé (tes retouches sont préservées).
//
// Usage : node scripts/generate-curriculum.mjs   (ou : npm run generate)

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SKILLS } from './data/skills.mjs';
import { MONTHS, WEEKS, monthOfWeek, weekOfDay } from './data/program-structure.mjs';
import { DAYS_01_15 } from './data/days-01-15.mjs';
import { DAYS_16_30 } from './data/days-16-30.mjs';
import { DAYS_31_90 } from './data/days-31-90.mjs';
import { WEEK_PLANS } from './data/days-plan.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CUR = join(ROOT, 'curriculum');
const skillName = (id) => (SKILLS.find((s) => s.id === id)?.name ?? id);
const pad3 = (n) => String(n).padStart(3, '0');
const pad2 = (n) => String(n).padStart(2, '0');
const DIFF_LABEL = ['', 'Débutant', 'Facile', 'Intermédiaire', 'Avancé', 'Difficile'];

// ── Utilitaires d'écriture (respecte <!-- keep -->) ──
function ensureDir(p) { if (!existsSync(p)) mkdirSync(p, { recursive: true }); }
function writeMd(path, content) {
  if (existsSync(path)) {
    const first = readFileSync(path, 'utf8').split('\n', 1)[0].trim();
    if (first === '<!-- keep -->') { kept++; return; }
  }
  writeFileSync(path, content);
  written++;
}
let written = 0, kept = 0;

// ── Construction de la table des 365 jours ──
// On fusionne les jours rédigés (1-90) et les jours planifiés (91-365).
const REVIEW_DAYS = new Set(); // jours de revue hebdo (le 7e de chaque semaine)
for (let d = 7; d <= 365; d += 7) REVIEW_DAYS.add(d);

// Index des jours rédigés par numéro
const writtenDays = new Map();
for (const day of [...DAYS_01_15, ...DAYS_16_30, ...DAYS_31_90]) writtenDays.set(day.day, day);

// Construit un objet-jour complet et normalisé pour n'importe quel numéro 1..365.
function buildDay(n) {
  const week = weekOfDay(n);
  const month = monthOfWeek(week);
  const isReview = REVIEW_DAYS.has(n);

  // Jour 365 : la clôture de l'année (jour hors des 52×7 = 364).
  if (n === 365) {
    return {
      day: 365, week: 52, month: 12, isReview: false, planned: true,
      title: "Jour 365 — Clôture de l'année et lancement de la suite",
      skill: 'autonomy', difficulty: 2, hours: 4.5,
      objective: "Célébrer et consolider une année entière d'apprentissage, finaliser le portfolio et les candidatures, et acter le passage à la phase « recherche d'emploi active ».",
      concepts: [],
      exercise: "1) Relis ta toute première note (jour 1) et écris une lettre à ton toi d'il y a un an. 2) Vérifie que tes 7 projets sont propres et publics sur GitHub. 3) Confirme que tes premières candidatures sont ENVOYÉES (pas « prêtes »). 4) Relis ton PLAN-90-JOURS.md et bloque tes 3 prochaines actions dans un agenda.",
      deliverable: "Lettre-bilan de l'année + checklist portfolio complète + confirmation des candidatures envoyées + 3 prochaines actions datées.",
    };
  }

  if (isReview) {
    const w = WEEKS[week - 1];
    return {
      day: n, week, month, isReview: true,
      title: `Revue hebdomadaire — semaine ${week}`,
      skill: (w?.skills?.[0]) ?? 'autonomy',
      difficulty: 2, hours: 4.5,
      objective: `Faire le bilan de la semaine ${week} (${w?.theme ?? ''}), valider les acquis et décider du passage à la semaine suivante.`,
      review: w ?? null,
    };
  }

  if (writtenDays.has(n)) {
    const src = writtenDays.get(n);
    return { ...src, week, month, isReview: false, detailed: true };
  }

  // Jour planifié (91-365) : dérivé de WEEK_PLANS.
  const plan = WEEK_PLANS[week];
  if (plan) {
    // position du jour dans la semaine (1..6) parmi les jours non-revue
    const weekStart = (week - 1) * 7 + 1;
    let pos = 0;
    for (let d = weekStart; d < n; d++) if (!REVIEW_DAYS.has(d)) pos++;
    const entry = plan.days[pos];
    if (entry) {
      return {
        day: n, week, month, isReview: false, planned: true,
        title: entry.title,
        skill: entry.skill ?? plan.skill,
        difficulty: 3, hours: 4.5,
        objective: entry.objective,
        concepts: [],
        exercise: entry.exercise,
        deliverable: entry.deliverable,
        project: entry.project,
      };
    }
  }

  // Filet de sécurité (ne devrait pas arriver) : jour générique.
  const w = WEEKS[week - 1];
  return {
    day: n, week, month, isReview: false, planned: true,
    title: `${w?.theme ?? 'Travail'} — jour ${n}`,
    skill: (w?.skills?.[0]) ?? 'autonomy',
    difficulty: 3, hours: 4.5,
    objective: `Approfondir le thème de la semaine : ${w?.theme ?? ''}.`,
    exercise: "Choisis un exercice concret relié au thème de la semaine et produis un livrable démontrable.",
    deliverable: "Un livrable concret relié au thème de la semaine.",
  };
}

// ── Rendu Markdown d'un jour ──
function renderDay(day) {
  const L = [];
  L.push(`# Jour ${day.day} — ${day.title}`);
  L.push('');
  L.push(`> **Mois ${day.month}** · **Semaine ${day.week}** · Compétence : **${skillName(day.skill)}** · Difficulté : ${DIFF_LABEL[day.difficulty] ?? day.difficulty}/5 · Durée : ${day.hours} h`);
  L.push('');
  L.push(`[← Dashboard](../../) · [Semaine ${day.week}](../week-${pad2(day.week)}.md) · [Mois ${day.month}](../month-${pad2(day.month)}.md)${day.isReview ? '' : ` · [Correction](../solutions/day-${pad3(day.day)}-solution.md)`}`);
  L.push('');

  if (day.isReview) {
    const r = day.review;
    L.push('## 🔁 Revue hebdomadaire');
    L.push('');
    if (r) {
      L.push(`**Thème de la semaine :** ${r.theme}`);
      L.push('');
      L.push('### Bilan');
      L.push(r.bilan);
      L.push('');
      L.push('### Test pratique');
      L.push(r.practicalTest);
      L.push('');
      L.push('### Test théorique');
      L.push(r.theoryTest);
      L.push('');
      L.push('### Mini-projet / livrable');
      L.push(r.miniProject);
      L.push('');
      L.push('### Checklist');
      for (const c of r.checklist) L.push(`- [ ] ${c}`);
      L.push('');
      L.push('### Critères de passage à la semaine suivante');
      for (const c of r.passCriteria) L.push(`- [ ] ${c}`);
      L.push('');
      L.push('### Exercice de réflexion architecturale');
      L.push(r.archiExercise);
      L.push('');
    }
    L.push('### Auto-évaluation');
    L.push('- Note honnête de la semaine (0-5) : ____');
    L.push('- Mets à jour tes scores de compétences dans l\'application.');
    L.push('- Ce que je dois revoir : ____');
    L.push('');
    return L.join('\n');
  }

  L.push(`## 🎯 Objectif`);
  L.push(day.objective);
  L.push('');

  if (day.concepts?.length) {
    L.push('## 📚 Concepts');
    for (const c of day.concepts) L.push(`- ${c}`);
    L.push('');
  }
  if (day.theory) {
    L.push('## 🧠 Théorie courte');
    L.push(day.theory);
    L.push('');
  }
  if (day.schedule?.length) {
    L.push('## ⏱️ Découpage horaire');
    for (const s of day.schedule) L.push(`- ${s}`);
    L.push('');
  }
  if (day.exercise) {
    L.push('## ✍️ Exercice principal');
    L.push(day.exercise);
    L.push('');
  }
  if (day.bonus) {
    L.push('## ⭐ Exercice bonus');
    L.push(day.bonus);
    L.push('');
  }
  if (day.quiz?.length) {
    L.push('## ❓ Mini-quiz');
    day.quiz.forEach((q, i) => L.push(`${i + 1}. ${q.q}`));
    L.push('');
    L.push('*(Réponses dans la correction.)*');
    L.push('');
  }
  if (day.deliverable) {
    L.push('## 📦 Livrable attendu');
    L.push(day.deliverable);
    L.push('');
  }
  if (day.criteria?.length) {
    L.push('## ✅ Critères de validation');
    for (const c of day.criteria) L.push(`- [ ] ${c}`);
    L.push('');
  }
  if (day.mistakes?.length) {
    L.push('## ⚠️ Erreurs fréquentes');
    for (const m of day.mistakes) L.push(`- ${m}`);
    L.push('');
  }
  if (day.resources?.length) {
    L.push('## 🔗 Ressources');
    for (const r of day.resources) L.push(`- ${r}`);
    L.push('');
  }

  // Règle anti-dépendance à l'IA (toujours présente).
  L.push('## 🤖 Règle d\'utilisation de l\'IA');
  L.push('**D\'abord sans IA.** Tente seul au moins 30 minutes avant toute aide. Ne copie-colle jamais une réponse d\'IA : lis, ferme, réécris de mémoire.');
  if (day.aiRule) { L.push(''); L.push(day.aiRule); }
  L.push('');

  L.push('## 🧩 Questions de réflexion (à faire seul)');
  L.push('- Qu\'est-ce que je ne comprends pas encore parfaitement ?');
  L.push('- Comment j\'expliquerais ce concept en entretien ?');
  L.push('- Où réutiliserai-je ça dans un projet ?');
  L.push('');

  return L.join('\n');
}

// ── Rendu Markdown d'une correction ──
function renderSolution(day) {
  const L = [];
  L.push(`# Correction — Jour ${day.day} : ${day.title}`);
  L.push('');
  L.push(`[← Retour au jour ${day.day}](../days/day-${pad3(day.day)}.md)`);
  L.push('');
  L.push('> ⛔ **Ne lis cette correction qu\'après avoir vraiment tenté seul.** Une correction n\'est pas une réponse à copier : c\'est un outil pour comprendre ta démarche.');
  L.push('');

  const s = day.solution;
  if (s && typeof s === 'object') {
    if (s.logic) { L.push('## 🧠 La logique attendue'); L.push(s.logic); L.push(''); }
    if (s.simple) { L.push('## ✅ Une solution simple'); L.push(s.simple); L.push(''); }
    if (s.improved) { L.push('## 🚀 Une solution améliorée'); L.push(s.improved); L.push(''); }
    if (s.pitfalls?.length) {
      L.push('## ⚠️ Erreurs probables et points à vérifier');
      for (const p of s.pitfalls) L.push(`- ${p}`);
      L.push('');
    }
    if (s.checks?.length) {
      L.push('## 🔍 Comment vérifier ta solution');
      for (const c of s.checks) L.push(`- ${c}`);
      L.push('');
    }
    if (day.quiz?.length) {
      L.push('## ❓ Réponses du mini-quiz');
      day.quiz.forEach((q, i) => { L.push(`${i + 1}. **${q.q}**`); L.push(`   → ${q.a}`); });
      L.push('');
    }
    if (s.reflection?.length) {
      L.push('## 🧩 Questions de réflexion');
      for (const r of s.reflection) L.push(`- ${r}`);
      L.push('');
    }
  } else {
    // Correction générique guidée pour les jours planifiés.
    L.push('## 🧠 La logique attendue');
    L.push('Ce jour privilégie l\'autonomie. La « correction » n\'est pas un code à copier mais une grille d\'auto-évaluation.');
    L.push('');
    L.push('## ✅ Auto-évaluation de ton livrable');
    L.push('- [ ] Mon livrable correspond exactement à ce qui était demandé.');
    L.push('- [ ] J\'ai d\'abord tenté seul, sans IA, au moins 30 minutes.');
    L.push('- [ ] Je peux expliquer chaque décision que j\'ai prise.');
    L.push('- [ ] J\'ai testé/vérifié le résultat, pas seulement « ça a l\'air de marcher ».');
    L.push('- [ ] J\'ai noté ce qui m\'a bloqué (donnée précieuse sur mes lacunes).');
    L.push('');
    L.push('## ⚠️ Points à vérifier');
    L.push('- Ai-je géré les cas limites et les erreurs, pas seulement le chemin heureux ?');
    L.push('- Mon code est-il lisible par un tiers (nommage, structure) ?');
    L.push('- Ai-je réutilisé des patterns déjà appris plutôt que tout réinventer ?');
    L.push('');
    L.push('## 🧩 Questions de réflexion');
    L.push('- Qu\'est-ce que cet exercice prouve à un recruteur ?');
    L.push('- Comment l\'expliquerais-je à l\'oral en 2 minutes ?');
    L.push('- Quelle version « améliorée » pourrais-je viser si j\'y revenais ?');
    L.push('');
  }
  return L.join('\n');
}

// ── Rendu d'une semaine ──
function renderWeek(week) {
  const w = WEEKS[week - 1];
  const month = monthOfWeek(week);
  const start = (week - 1) * 7 + 1;
  const days = [];
  for (let d = start; d <= start + 6 && d <= 365; d++) days.push(d);
  const L = [];
  L.push(`# Semaine ${week} — ${w?.theme ?? ''}`);
  L.push('');
  L.push(`> **Mois ${month}** · Compétences : ${(w?.skills ?? []).map(skillName).join(', ')}`);
  L.push('');
  L.push(`[← Mois ${month}](month-${pad2(month)}.md) · [Vue d'ensemble](year-overview.md)`);
  L.push('');
  L.push('## Jours de la semaine');
  for (const d of days) {
    const label = REVIEW_DAYS.has(d) ? ' _(revue hebdo)_' : '';
    L.push(`- [Jour ${d}](days/day-${pad3(d)}.md)${label}`);
  }
  L.push('');
  if (w) {
    L.push('## Revue hebdomadaire (jour 7)');
    L.push(`- **Bilan :** ${w.bilan}`);
    L.push(`- **Test pratique :** ${w.practicalTest}`);
    L.push(`- **Test théorique :** ${w.theoryTest}`);
    L.push(`- **Mini-projet :** ${w.miniProject}`);
    L.push('- **Critères de passage :**');
    for (const c of w.passCriteria) L.push(`  - [ ] ${c}`);
    L.push(`- **Exercice d'architecture :** ${w.archiExercise}`);
    L.push('');
  }
  return L.join('\n');
}

// ── Rendu d'un mois ──
function renderMonth(month) {
  const m = MONTHS[month - 1];
  const weeks = [];
  for (let w = 1; w <= 52; w++) if (monthOfWeek(w) === month) weeks.push(w);
  const L = [];
  L.push(`# Mois ${month} — ${m.title}`);
  L.push('');
  L.push(`[← Vue d'ensemble](year-overview.md)`);
  L.push('');
  L.push('## Objectif du mois');
  L.push(m.summary);
  L.push('');
  L.push('## Semaines');
  for (const w of weeks) L.push(`- [Semaine ${w}](week-${pad2(w)}.md) — ${WEEKS[w - 1]?.theme ?? ''}`);
  L.push('');
  if (m.project) {
    L.push('## Projet du mois');
    L.push(`**Projet ${m.project.id} : ${m.project.name}** — voir [la fiche projet](projects/project-${pad2(m.project.id)}.md).`);
    L.push('');
  }
  L.push('## 🗓️ Revue mensuelle');
  L.push(`- **Projet validant :** ${m.validatingProject}`);
  L.push('- **Score attendu en fin de mois :**');
  for (const [sk, val] of Object.entries(m.expectedScores)) L.push(`  - ${skillName(sk)} : ${val}/5`);
  L.push('- **Compétences acquises :**');
  for (const s of m.skillsAcquired) L.push(`  - ${s}`);
  L.push(`- **Lacunes fréquentes à corriger :** ${m.gaps}`);
  L.push(`- **Livrable portfolio :** ${m.portfolioDeliverable}`);
  L.push(`- **Simulation d'entretien :** ${m.interviewSim}`);
  L.push(`- **Exercice d'explication technique orale :** ${m.oralExercise}`);
  L.push('');
  return L.join('\n');
}

// ── Rendu de la vue d'ensemble de l'année ──
function renderYearOverview() {
  const L = [];
  L.push('# AI Career OS — Vue d\'ensemble de l\'année');
  L.push('');
  L.push('Programme de 12 mois (365 jours, 4-5 h/jour) pour passer de quasi-débutant à profil employable sur des rôles IA appliquée : **AI Engineer junior+, LLM/RAG Engineer junior, AI Product Engineer, Full-stack orienté IA**.');
  L.push('');
  L.push('## Principe');
  L.push('- 6 jours de travail + 1 jour de revue hebdomadaire par semaine.');
  L.push('- Chaque jour : théorie courte, pratique, exercice, correction guidée, livrable.');
  L.push('- Règle d\'or : **d\'abord sans IA**, puis l\'IA comme tuteur, jamais comme presse-bouton.');
  L.push('- 7 projets portfolio progressifs, dont un projet final production-grade (DocSense).');
  L.push('');
  L.push('## Les 12 mois');
  L.push('');
  L.push('| Mois | Thème | Projet |');
  L.push('|------|-------|--------|');
  for (const m of MONTHS) {
    L.push(`| [${m.month}](month-${pad2(m.month)}.md) | ${m.title} | ${m.project ? `P${m.project.id}` : '—'} |`);
  }
  L.push('');
  L.push('## Les 20 compétences suivies (0-5)');
  L.push(SKILLS.map((s) => s.name).join(' · '));
  L.push('');
  L.push('## Projets portfolio');
  L.push('1. TaskFlow CLI — fondations (mois 2)');
  L.push('2. LivreAPI — API REST + Postman (mois 3)');
  L.push('3. BiblioApp — full-stack (mois 4)');
  L.push('4. DataPulse — pipeline data + dashboard (mois 5)');
  L.push('5. ChurnScope — ML classique end-to-end (mois 6)');
  L.push('6. DocQA — application RAG évaluée (mois 8-9)');
  L.push('7. **DocSense — assistant d\'analyse documentaire (projet final, mois 11-12)**');
  L.push('');
  L.push('## Ressources et méthode');
  L.push('- [Ressources](resources/resources.md)');
  L.push('- [Comment apprendre](methodology/how-to-learn.md)');
  L.push('- [Utiliser l\'IA sans en dépendre](methodology/how-to-use-ai-without-dependency.md)');
  L.push('- [Grille de compétences](rubrics/skills-scorecard.md)');
  L.push('- [Stratégie CV / LinkedIn](career/cv-linkedin-strategy.md)');
  L.push('');
  return L.join('\n');
}

// ══════════ GÉNÉRATION ══════════
ensureDir(join(CUR, 'days'));
ensureDir(join(CUR, 'solutions'));
ensureDir(join(ROOT, 'data'));

const programDays = [];
for (let n = 1; n <= 365; n++) {
  const day = buildDay(n);
  writeMd(join(CUR, 'days', `day-${pad3(n)}.md`), renderDay(day));
  if (!day.isReview) {
    writeMd(join(CUR, 'solutions', `day-${pad3(n)}-solution.md`), renderSolution(day));
  }
  // Entrée d'index (légère) pour l'app.
  programDays.push({
    day: n, week: day.week, month: day.month,
    title: day.title, skill: day.skill, skillName: skillName(day.skill),
    difficulty: day.difficulty, hours: day.hours,
    isReview: !!day.isReview, detailed: !!day.detailed,
    deliverable: day.deliverable ?? null,
    project: day.project ?? null,
  });
}

for (let w = 1; w <= 52; w++) writeMd(join(CUR, `week-${pad2(w)}.md`), renderWeek(w));
for (let m = 1; m <= 12; m++) writeMd(join(CUR, `month-${pad2(m)}.md`), renderMonth(m));
writeMd(join(CUR, 'year-overview.md'), renderYearOverview());

// data/program.json — index consommé par l'app Next.js
const program = {
  generatedAt: new Date().toISOString(),
  skills: SKILLS,
  months: MONTHS.map((m) => ({
    month: m.month, title: m.title, summary: m.summary,
    project: m.project, expectedScores: m.expectedScores,
    firstWeek: null,
  })),
  weeks: WEEKS.map((w) => ({ week: w.week, theme: w.theme, month: monthOfWeek(w.week), skills: w.skills })),
  days: programDays,
};
writeFileSync(join(ROOT, 'data', 'program.json'), JSON.stringify(program, null, 2));

console.log(`✔ Curriculum généré : ${written} fichiers écrits, ${kept} préservés (<!-- keep -->).`);
console.log(`  → 365 jours, 52 semaines, 12 mois, + data/program.json`);
