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
import { EXTRAS_31_90 } from './data/days-31-90-extras.mjs';
import { GUIDED_01_30 } from './data/days-01-30-guided.mjs';
import { DAYS_ENRICH as ENRICH_BASE } from './data/days-enrich.mjs';
import { ENRICH_91_120 } from './data/days-enrich-91-120.mjs';
import { ENRICH_121_150 } from './data/days-enrich-121-150.mjs';
import { ENRICH_151_180 } from './data/days-enrich-151-180.mjs';
import { ENRICH_181_210 } from './data/days-enrich-181-210.mjs';
import { ENRICH_211_240 } from './data/days-enrich-211-240.mjs';
import { ENRICH_241_270 } from './data/days-enrich-241-270.mjs';
import { ENRICH_271_300 } from './data/days-enrich-271-300.mjs';
import { ENRICH_301_365 } from './data/days-enrich-301-365.mjs';

// Fusion des enrichissements par jour (les fichiers spécialisés priment).
const DAYS_ENRICH = { ...ENRICH_BASE, ...ENRICH_91_120, ...ENRICH_121_150, ...ENRICH_151_180, ...ENRICH_181_210, ...ENRICH_211_240, ...ENRICH_241_270, ...ENRICH_271_300, ...ENRICH_301_365 };
import { LESSON_BY_SKILL, FUTURE_BY_SKILL, INTERVIEW_BY_SKILL, CASE_BY_SKILL, LESSONS } from './data/lessons-map.mjs';

// Compétences « IA / data » pour lesquelles un cas métier est attendu.
const DATA_AI_SKILLS = new Set(['sql', 'python', 'ml', 'dl', 'llm', 'rag', 'agents', 'evalia', 'secu', 'cloud', 'http']);

const lessonTitle = (file) => (LESSONS.find((l) => l.file === file)?.title ?? file);

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
    const enrich = DAYS_ENRICH[365] ?? {};
    return {
      day: 365, week: 52, month: 12, isReview: false, planned: true,
      title: "Jour 365 — Clôture de l'année et lancement de la suite",
      skill: 'autonomy', difficulty: 2, hours: 4.5,
      objective: "Célébrer et consolider une année entière d'apprentissage, finaliser le portfolio et les candidatures, et acter le passage à la phase « recherche d'emploi active ».",
      concepts: [],
      exercise: "1) Relis ta toute première note (jour 1) et écris une lettre à ton toi d'il y a un an. 2) Vérifie que tes 7 projets sont propres et publics sur GitHub. 3) Confirme que tes premières candidatures sont ENVOYÉES (pas « prêtes »). 4) Relis ton PLAN-90-JOURS.md et bloque tes 3 prochaines actions dans un agenda.",
      deliverable: "Lettre-bilan de l'année + checklist portfolio complète + confirmation des candidatures envoyées + 3 prochaines actions datées.",
      theoryExtra: enrich.theory,
      guidedExample: enrich.guided,
      caseStudy: enrich.caseStudy,
      interview: enrich.interview,
      future: enrich.future,
      solution: enrich.solution,
      criteria: [
        "Lettre-bilan écrite (comparaison honnête avec le toi du jour 1).",
        "Les 7 projets sont propres, publics et démontrables sur GitHub.",
        "Les premières candidatures sont ENVOYÉES, pas seulement prêtes.",
        "PLAN-90-JOURS.md relu et 3 prochaines actions datées dans l'agenda.",
      ],
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
    // Fusion des suppléments (théorie/critères pour 31-90 ; exemple guidé/à-retenir pour 1-30).
    const extra31 = EXTRAS_31_90[n] ?? {};
    const guided = GUIDED_01_30[n] ?? {};
    const enrich = DAYS_ENRICH[n] ?? {};
    return {
      ...src,
      week, month, isReview: false, detailed: true,
      theory: src.theory ?? extra31.theory,
      theoryExtra: enrich.theory,
      criteria: src.criteria ?? extra31.criteria,
      guidedExample: src.guidedExample ?? guided.guidedExample ?? enrich.guided,
      takeaways: src.takeaways ?? guided.takeaways ?? enrich.takeaways,
      future: src.future ?? guided.future,
      caseStudy: enrich.caseStudy,
      interview: src.interview ?? enrich.interview,
      lessonsOverride: enrich.lessons,
      // « Erreurs fréquentes » : explicites, sinon reprises des pièges de la correction.
      mistakes: src.mistakes ?? src.solution?.pitfalls,
    };
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
      const enrich = DAYS_ENRICH[n] ?? {};
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
        theoryExtra: enrich.theory,
        guidedExample: enrich.guided,
        caseStudy: enrich.caseStudy,
        interview: enrich.interview,
        takeaways: enrich.takeaways,
        lessonsOverride: enrich.lessons,
        future: enrich.future,
        solution: enrich.solution,
        criteria: [
          `Le livrable est produit et correspond à : ${entry.deliverable}`,
          "J'ai d'abord tenté seul (sans IA) au moins 30 minutes.",
          "Je peux expliquer chaque décision à l'oral, en 2 minutes.",
          "J'ai testé/vérifié le résultat, pas seulement supposé que « ça marche ».",
        ],
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
    L.push('## 🎯 Objectif du jour');
    L.push(day.objective);
    L.push('');
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
    // Enrichissement optionnel des revues (synthèse, grille de notation,
    // plan de remédiation, questions d'entretien) via DAYS_ENRICH.
    const enrichRev = DAYS_ENRICH[day.day] ?? {};
    if (enrichRev.reviewSynthese) {
      L.push('### Synthèse de la semaine');
      L.push(enrichRev.reviewSynthese);
      L.push('');
    }
    if (enrichRev.reviewGrid) {
      L.push('### Grille de notation');
      L.push(enrichRev.reviewGrid);
      L.push('');
    }
    if (enrichRev.remediation) {
      L.push('### Plan de remédiation (si un critère échoue)');
      L.push(enrichRev.remediation);
      L.push('');
    }
    if (enrichRev.interview) {
      L.push('### Questions d\'entretien de la semaine');
      L.push(enrichRev.interview);
      L.push('');
    }
    L.push('### Auto-évaluation');
    L.push('- Note honnête de la semaine (0-5) : ____');
    L.push('- Mets à jour tes scores de compétences dans l\'application.');
    L.push('- Ce que je dois revoir : ____');
    L.push('');
    return L.join('\n');
  }

  // ── 1. Objectif du jour ──
  L.push(`## 🎯 Objectif du jour`);
  L.push(day.objective);
  L.push('');

  // ── 2. Cours approfondi (théorie + renvoi vers les leçons de fond) ──
  L.push('## 📖 Cours approfondi');
  if (day.concepts?.length) {
    L.push('**Concepts abordés :** ' + day.concepts.join(' · ') + '.');
    L.push('');
  }
  if (day.theory) {
    L.push(day.theory);
    L.push('');
  } else if (!day.theoryExtra) {
    L.push('Ce jour approfondit et applique les notions de la semaine. Travaille la théorie via la ou les leçons de fond ci-dessous, puis passe à la pratique.');
    L.push('');
  }
  if (day.theoryExtra) {
    L.push(day.theoryExtra);
    L.push('');
  }
  const lessons = day.lessonsOverride ?? LESSON_BY_SKILL[day.skill] ?? [];
  if (lessons.length) {
    L.push('**Leçon(s) de fond à lire/relire :**');
    for (const f of lessons) L.push(`- [${lessonTitle(f)}](/doc/lessons/${f.replace(/\.md$/, '')})`);
    L.push('');
  }
  if (day.schedule?.length) {
    L.push('**Découpage horaire de la journée :**');
    for (const s of day.schedule) L.push(`- ${s}`);
    L.push('');
  }

  // ── 3. Exemple guidé (pas-à-pas AVANT l'exercice autonome) ──
  if (day.guidedExample) {
    L.push('## 🧭 Exemple guidé');
    L.push('*Étudie ce pas-à-pas, puis FERME-le et attaque la pratique autonome de mémoire.*');
    L.push('');
    L.push(day.guidedExample);
    L.push('');
  }

  // ── 4-5. Pratique autonome (exercice principal + bonus) ──
  L.push('## ✍️ Pratique autonome');
  L.push('> **D\'abord sans IA.** Tente seul au moins 30 minutes. Ne copie-colle jamais une réponse d\'IA : lis, ferme, réécris de mémoire.');
  L.push('');
  if (day.exercise) {
    L.push('### Exercice principal');
    L.push(day.exercise);
    L.push('');
  }
  if (day.bonus) {
    L.push('### Exercice bonus');
    L.push(day.bonus);
    L.push('');
  }

  // ── 6. Mini-quiz ──
  if (day.quiz?.length) {
    L.push('## ❓ Mini-quiz');
    L.push('*Teste ta compréhension (définition, raisonnement, application, piège). Réponses dans la correction.*');
    L.push('');
    day.quiz.forEach((q, i) => L.push(`${i + 1}. ${q.q}`));
    L.push('');
  }

  // ── 8. Livrable ──
  if (day.deliverable) {
    L.push('## 📦 Livrable attendu');
    L.push(day.deliverable);
    L.push('');
  }

  // ── 9. Critères de validation ──
  if (day.criteria?.length) {
    L.push('## ✅ Critères de validation');
    for (const c of day.criteria) L.push(`- [ ] ${c}`);
    L.push('');
  }

  // Erreurs fréquentes + ressources + consigne IA spécifique
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
  if (day.aiRule) {
    L.push('## 🤖 Consigne d\'utilisation de l\'IA');
    L.push(day.aiRule);
    L.push('');
  }

  // ── Cas métier (compétences data/IA) ──
  const caseStudy = day.caseStudy ?? CASE_BY_SKILL[day.skill];
  if (caseStudy) {
    L.push('## 🏢 Cas métier');
    L.push(caseStudy);
    L.push('');
  }

  // ── Question d'entretien ──
  const interview = day.interview ?? INTERVIEW_BY_SKILL[day.skill];
  if (interview) {
    L.push('## 🎤 Question d\'entretien');
    L.push(interview);
    L.push('');
  }

  // ── 7 bis. À retenir ──
  L.push('## 🧠 À retenir');
  const takeaways = day.takeaways ?? deriveTakeaways(day);
  for (const t of takeaways) L.push(`- ${t}`);
  L.push('');

  // ── 10. Lien avec le futur ──
  L.push('## 🚀 Pourquoi ça comptera plus tard');
  L.push(day.future ?? FUTURE_BY_SKILL[day.skill] ?? 'Cette compétence sera réutilisée dans les projets et évaluée en entretien.');
  L.push('');

  // Correction (rappel du lien) + questions de réflexion.
  L.push('## 🧩 Questions de réflexion (à faire seul)');
  L.push('- Qu\'est-ce que je ne comprends pas encore parfaitement ?');
  L.push('- Comment j\'expliquerais ce concept à l\'oral, en entretien ?');
  L.push('- Où précisément le réutiliserai-je dans un projet IA/data/archi ?');
  L.push('');
  L.push(`➡️ **[Voir la correction](../solutions/day-${pad3(day.day)}-solution.md)** — uniquement après avoir vraiment essayé.`);
  L.push('');

  return L.join('\n');
}

// « À retenir » par défaut quand un jour n'a pas de takeaways explicites.
function deriveTakeaways(day) {
  const out = [];
  if (day.concepts?.length) out.push('Concepts clés du jour : ' + day.concepts.slice(0, 5).join(', ') + '.');
  const lessons = LESSON_BY_SKILL[day.skill] ?? [];
  if (lessons.length) out.push('Approfondis via la leçon de fond : ' + lessons.map(lessonTitle).join(', ') + '.');
  out.push('Je dois pouvoir REFAIRE l\'exercice seul demain et l\'EXPLIQUER à l\'oral — sinon ce n\'est pas encore acquis.');
  return out;
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
    if (s.oral) {
      L.push('## 🎤 À savoir expliquer à l\'oral');
      L.push(s.oral);
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

// ── Rendu d'une correction pour un jour de REVUE (grille d'évaluation) ──
function renderReviewSolution(day) {
  const r = day.review;
  const L = [];
  L.push(`# Correction / Grille — Jour ${day.day} : Revue de la semaine ${day.week}`);
  L.push('');
  L.push(`[← Retour au jour ${day.day}](../days/day-${pad3(day.day)}.md)`);
  L.push('');
  L.push('> Une revue ne « se corrige » pas : elle s\'ÉVALUE. Voici l\'attendu, la grille et les critères de passage.');
  L.push('');
  if (r) {
    L.push('## 🎯 Attendu de la semaine');
    L.push(`Thème : **${r.theme}**. ${r.bilan}`);
    L.push('');
    L.push('## ✅ Grille d\'évaluation (note chaque axe de 0 à 5)');
    L.push('- **Test pratique réussi** dans le temps imparti : ' + r.practicalTest);
    L.push('- **Test théorique** (réponds de mémoire puis auto-corrige) : ' + r.theoryTest);
    L.push('- **Mini-projet / livrable** conforme : ' + r.miniProject);
    L.push('- **Exercice d\'architecture** fait sérieusement : ' + r.archiExercise);
    L.push('');
    L.push('## 📋 Checklist de validation');
    for (const c of (r.checklist ?? [])) L.push(`- [ ] ${c}`);
    L.push('');
    L.push('## 🚦 Critères de passage à la semaine suivante');
    for (const c of (r.passCriteria ?? [])) L.push(`- [ ] ${c}`);
    L.push('');
  }
  L.push('## ⚠️ Erreurs fréquentes en revue');
  L.push('- Se sur-noter (familiarité ≠ maîtrise) : ne compte que ce que tu produis SEUL et sais EXPLIQUER.');
  L.push('- Bâcler le test théorique en le relisant au lieu de répondre de mémoire (rappel actif).');
  L.push('- Avancer malgré des critères non atteints : mieux vaut consolider 2-3 jours que bâtir sur du sable.');
  L.push('- Oublier de mettre à jour ses scores de compétences dans l\'application.');
  L.push('');
  L.push('## 🧩 Auto-évaluation finale');
  L.push('- Note honnête de la semaine (0-5) : ____');
  L.push('- Ma plus grande difficulté cette semaine : ____');
  L.push('- Ce que je dois revoir avant d\'avancer : ____');
  L.push('- Si des critères ne sont pas atteints : quel plan de rattrapage (daté) ?');
  L.push('');
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
  // Chaque jour a une correction : une vraie correction pour les jours de travail,
  // une grille d'évaluation pour les jours de revue.
  writeMd(join(CUR, 'solutions', `day-${pad3(n)}-solution.md`),
    day.isReview ? renderReviewSolution(day) : renderSolution(day));
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
  lessons: LESSONS.map((l) => ({
    slug: l.file.replace(/\.md$/, ''), title: l.title,
    cat: l.cat, level: l.level, min: l.min, skills: l.skills ?? [],
  })),
};
writeFileSync(join(ROOT, 'data', 'program.json'), JSON.stringify(program, null, 2));

console.log(`✔ Curriculum généré : ${written} fichiers écrits, ${kept} préservés (<!-- keep -->).`);
console.log(`  → 365 jours, 52 semaines, 12 mois, + data/program.json`);
