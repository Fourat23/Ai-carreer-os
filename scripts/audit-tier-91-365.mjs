// audit-tier-91-365.mjs — Audit structurel Y2/Y3 du palier 91-365 (Chantier C).
// LECTURE SEULE : ne modifie aucun contenu pédagogique. Parse le markdown RENDU
// (curriculum/days + curriculum/solutions) — la source de vérité de ce que voit
// l'apprenant — + les métadonnées de data/program.json.
// Sortie : audit-y2-y3.json (à la racine). N'écrase aucun fichier pédagogique.

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const DAYS_DIR = path.join(ROOT, 'curriculum', 'days');
const SOL_DIR = path.join(ROOT, 'curriculum', 'solutions');
const PROG = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'program.json'), 'utf8'));
const PROG_DAYS = Array.isArray(PROG) ? PROG : (PROG.days || []);
const byNum = {};
for (const d of PROG_DAYS) byNum[d.day] = d;

// ---- utilitaires ----
function words(s) {
  if (!s) return 0;
  return String(s).replace(/```[\s\S]*?```/g, ' ').replace(/`+/g, ' ')
    .split(/\s+/).filter(Boolean).length;
}
function wordsWithCode(s) {
  if (!s) return 0;
  return String(s).replace(/`+/g, ' ').split(/\s+/).filter(Boolean).length;
}
// découpe un markdown en sections {header, body} sur les '## '
function sections(md) {
  const parts = md.split(/\n(?=## )/);
  const out = [];
  for (const p of parts) {
    const m = p.match(/^## (.+)/);
    if (m) out.push({ header: m[1].trim(), body: p.slice(p.indexOf('\n') + 1).trim() });
  }
  return out;
}
function findSection(secs, needle) {
  return secs.find(s => s.header.includes(needle));
}
function pct(arr, p) {
  if (!arr.length) return 0;
  const a = [...arr].sort((x, y) => x - y);
  const idx = (a.length - 1) * (p / 100);
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  if (lo === hi) return a[lo];
  return Math.round(a[lo] + (a[hi] - a[lo]) * (idx - lo));
}
function stats(arr) {
  if (!arr.length) return { n: 0 };
  const a = [...arr].sort((x, y) => x - y);
  const sum = a.reduce((s, x) => s + x, 0);
  return {
    n: a.length, min: a[0], max: a[a.length - 1],
    mean: Math.round(sum / a.length), median: pct(a, 50),
    p10: pct(a, 10), p25: pct(a, 25), p75: pct(a, 75), p90: pct(a, 90),
  };
}

// ---- collecte par jour ----
function analyzeDay(n) {
  const pad = String(n).padStart(3, '0');
  const dayFile = path.join(DAYS_DIR, `day-${pad}.md`);
  const solFile = path.join(SOL_DIR, `day-${pad}-solution.md`);
  if (!fs.existsSync(dayFile)) return null;
  const meta = byNum[n] || {};
  const dayMd = fs.readFileSync(dayFile, 'utf8');
  const solMd = fs.existsSync(solFile) ? fs.readFileSync(solFile, 'utf8') : '';
  const dsecs = sections(dayMd);
  const ssecs = sections(solMd);

  const isReview = !!meta.isReview || dayMd.includes('Revue hebdomadaire');
  const title = meta.title || '';
  const isProject = (meta.skillName || '') === 'Autonomie projet'
    || /^Projet\s*\d|capstone|DocSense|ChurnScope|TaskFlow|LivreAPI|BiblioApp|DataPulse/i.test(title);

  // sections jour
  const theory = findSection(dsecs, 'Cours approfondi');
  const guided = findSection(dsecs, 'Exemple guidé');
  const reflect = findSection(dsecs, 'Questions de réflexion');
  const miniquiz = findSection(dsecs, 'Mini-quiz');
  const retain = findSection(dsecs, 'À retenir');
  const caseS = findSection(dsecs, 'Cas métier');
  const interview = findSection(dsecs, "Question d'entretien");
  const practice = findSection(dsecs, 'Pratique autonome');
  const criteria = findSection(dsecs, 'Critères de validation');

  // sections solution
  const sLogic = findSection(ssecs, 'logique attendue');
  const sSimple = findSection(ssecs, 'solution simple');
  const sImproved = findSection(ssecs, 'solution améliorée');
  const sChecks = findSection(ssecs, 'Comment vérifier');
  const sPitfalls = findSection(ssecs, 'Erreurs probables');
  const sOral = findSection(ssecs, 'expliquer à l');
  const sQuizAns = findSection(ssecs, 'Réponses du mini-quiz');

  // heuristique "distinction minimale/robuste IMPLICITE" dans la logique
  const logicTxt = (sLogic ? sLogic.body : '') + ' ' + (sPitfalls ? sPitfalls.body : '');
  const implicitSimpleRobust = /minimal|simple d'abord|baseline|na[ïi]ve|version 1|v0|puis (on|tu)|amélior|robuste|industrialis|passe(r)? (au|à) l|monter en|trade-?off|compromis|arbitrage|version simple|première version/i.test(logicTxt);
  const reasoningPresent = sLogic && words(sLogic.body) >= 20;
  const tradeoffPresent = /compromis|trade-?off|arbitrage|coût|au prix de|en échange|sinon|selon|dépend|quand .* sinon|si .* alors/i.test(logicTxt);

  // reflect/quiz : compter les items (puces, questions)
  function countQuestions(sec) {
    if (!sec) return 0;
    const bullets = (sec.body.match(/^[-*] /gm) || []).length;
    const qmarks = (sec.body.match(/\?/g) || []).length;
    const numbered = (sec.body.match(/^\d+[.)]/gm) || []).length;
    return Math.max(bullets, numbered, qmarks);
  }

  // lessons
  const lessonLinks = (theory ? (theory.body.match(/\/doc\/lessons\//g) || []).length : 0);

  // blocs vides / génériques — on EXCLUT les sections structurellement brèves par
  // conception (objectif, livrable, critères = résumés courts). On ne flague qu'un
  // bloc de CONTENU réellement vide (< 3 mots).
  const SHORT_BY_DESIGN = ['Objectif', 'Livrable', 'Critères', 'À retenir'];
  const emptyBlocks = dsecs
    .filter(s => !SHORT_BY_DESIGN.some(k => s.header.includes(k)))
    .filter(s => words(s.body) < 3)
    .map(s => s.header);

  const totalWords = wordsWithCode(dayMd);
  const corrWords = ssecs.reduce((a, s) => a + words(s.body), 0);

  return {
    day: n, month: meta.month || null, title: meta.title || '',
    skill: meta.skillName || meta.skill || '', type: isReview ? 'review' : (isProject ? 'project' : 'learning'),
    totalWords,
    theoryWords: theory ? words(theory.body) : 0,
    guidedPresent: !!guided, guidedWords: guided ? words(guided.body) : 0,
    casePresent: !!caseS, caseWords: caseS ? words(caseS.body) : 0,
    interviewPresent: !!interview, interviewWords: interview ? words(interview.body) : 0,
    retainPresent: !!retain,
    // Y2 : évaluation formative
    miniquizExplicit: !!miniquiz,
    reflectPresent: !!reflect, reflectQuestions: countQuestions(reflect),
    criteriaPresent: !!criteria, criteriaItems: countQuestions(criteria),
    // correction
    corrWords,
    corrSections: ssecs.map(s => s.header.replace(/^[^\p{L}]+/u, '').trim()),
    corrLogic: !!sLogic, corrLogicWords: sLogic ? words(sLogic.body) : 0,
    corrSimpleExplicit: !!sSimple, corrImprovedExplicit: !!sImproved,
    corrChecks: !!sChecks, corrPitfalls: !!sPitfalls, corrOral: !!sOral,
    corrQuizAnswers: !!sQuizAns,
    // Y3 : distinction implicite
    implicitSimpleRobust, reasoningPresent, tradeoffPresent,
    lessonLinks,
    emptyBlocks,
  };
}

// ---- exécution : paliers ----
const TIERS = {
  '1-30': [1, 30], '31-90': [31, 90], '91-180': [91, 180],
  '181-270': [181, 270], '271-365': [271, 365],
};
const all = {};
for (let n = 1; n <= 365; n++) {
  const a = analyzeDay(n);
  if (a) all[n] = a;
}
const learning91 = Object.values(all).filter(d => d.day >= 91 && d.day <= 365 && d.type !== 'review');

// classification Y2 (évaluation formative) — A/B/C
function classifyY2(d) {
  if (d.type === 'review') return null;
  const hasFormative = d.miniquizExplicit || (d.reflectPresent && d.reflectQuestions >= 2);
  const weakFormative = d.reflectPresent && d.reflectQuestions === 1;
  if (hasFormative) return 'A';
  if (weakFormative || d.criteriaPresent) return 'B';
  return 'C';
}
// classification Y3 (correction) — A/B/C
function classifyY3(d) {
  if (d.type === 'review') return null;
  const hasReasoning = d.corrLogic && d.corrLogicWords >= 25;
  const hasPitfalls = d.corrPitfalls;
  const hasChecks = d.corrChecks;
  const hasOral = d.corrOral;
  const hasDistinction = d.corrSimpleExplicit && d.corrImprovedExplicit;
  const coreCount = [hasReasoning, hasPitfalls, hasChecks].filter(Boolean).length;
  // A : raisonnement + pièges + vérifs (+ distinction explicite OU implicite OU trade-off)
  if (coreCount === 3 && (hasDistinction || d.implicitSimpleRobust || d.tradeoffPresent) && hasOral) return 'A';
  if (coreCount === 3) return 'A'; // 3 rubriques coeur = solide même sans oral (rare)
  if (coreCount >= 2) return 'B';
  return 'C';
}

for (const d of Object.values(all)) {
  d.classY2 = classifyY2(d);
  d.classY3 = classifyY3(d);
}

// ---- agrégats par palier ----
function tierMetrics(lo, hi, onlyLearning = true) {
  const ds = Object.values(all).filter(d => d.day >= lo && d.day <= hi && (!onlyLearning || d.type !== 'review'));
  return {
    count: ds.length,
    reviews: Object.values(all).filter(d => d.day >= lo && d.day <= hi && d.type === 'review').length,
    projects: ds.filter(d => d.type === 'project').length,
    totalWords: stats(ds.map(d => d.totalWords)),
    theoryWords: stats(ds.map(d => d.theoryWords)),
    corrWords: stats(ds.map(d => d.corrWords)),
    guidedWords: stats(ds.filter(d => d.guidedPresent).map(d => d.guidedWords)),
    miniquizExplicit: ds.filter(d => d.miniquizExplicit).length,
    reflectPresent: ds.filter(d => d.reflectPresent).length,
    corrSimpleExplicit: ds.filter(d => d.corrSimpleExplicit).length,
    corrImprovedExplicit: ds.filter(d => d.corrImprovedExplicit).length,
    corrPitfalls: ds.filter(d => d.corrPitfalls).length,
    corrChecks: ds.filter(d => d.corrChecks).length,
    corrOral: ds.filter(d => d.corrOral).length,
    casePresent: ds.filter(d => d.casePresent).length,
  };
}
const tiers = {};
for (const [k, [lo, hi]] of Object.entries(TIERS)) tiers[k] = tierMetrics(lo, hi);

// ---- par mois (91-365) ----
const byMonth = {};
for (const d of learning91) {
  const m = d.month;
  if (!byMonth[m]) byMonth[m] = [];
  byMonth[m].push(d);
}
const monthMetrics = {};
for (const [m, ds] of Object.entries(byMonth)) {
  monthMetrics[m] = {
    count: ds.length,
    theoryWords: stats(ds.map(d => d.theoryWords)),
    corrWords: stats(ds.map(d => d.corrWords)),
    y3: { A: ds.filter(d => d.classY3 === 'A').length, B: ds.filter(d => d.classY3 === 'B').length, C: ds.filter(d => d.classY3 === 'C').length },
    y2: { A: ds.filter(d => d.classY2 === 'A').length, B: ds.filter(d => d.classY2 === 'B').length, C: ds.filter(d => d.classY2 === 'C').length },
  };
}

// ---- par domaine (91-365) ----
const byDomain = {};
for (const d of learning91) {
  const s = d.skill;
  if (!byDomain[s]) byDomain[s] = [];
  byDomain[s].push(d);
}
const domainMetrics = {};
for (const [s, ds] of Object.entries(byDomain)) {
  domainMetrics[s] = {
    count: ds.length,
    theoryWords: stats(ds.map(d => d.theoryWords)),
    corrWords: stats(ds.map(d => d.corrWords)),
    y3C: ds.filter(d => d.classY3 === 'C').map(d => d.day),
    y2C: ds.filter(d => d.classY2 === 'C').map(d => d.day),
  };
}

// ---- outliers (91-365 learning) ----
const corrArr = learning91.map(d => d.corrWords);
const cs = stats(corrArr);
const theoArr = learning91.map(d => d.theoryWords);
const ts = stats(theoArr);
const outliers = {
  corrLow: learning91.filter(d => d.corrWords < cs.p10).map(d => ({ day: d.day, corrWords: d.corrWords, title: d.title })),
  corrHigh: learning91.filter(d => d.corrWords > cs.p90).map(d => ({ day: d.day, corrWords: d.corrWords, title: d.title })),
  theoryLow: learning91.filter(d => d.theoryWords < ts.p10).map(d => ({ day: d.day, theoryWords: d.theoryWords, title: d.title })),
  emptyBlocks: learning91.filter(d => d.emptyBlocks.length).map(d => ({ day: d.day, blocks: d.emptyBlocks })),
  noReflect: learning91.filter(d => !d.reflectPresent).map(d => d.day),
  noOral: learning91.filter(d => !d.corrOral).map(d => d.day),
  noChecks: learning91.filter(d => !d.corrChecks).map(d => d.day),
  noPitfalls: learning91.filter(d => !d.corrPitfalls).map(d => d.day),
};

// ---- classification listes A/B/C (91-365) ----
const y2lists = { A: [], B: [], C: [] };
const y3lists = { A: [], B: [], C: [] };
for (const d of learning91) {
  if (d.classY2) y2lists[d.classY2].push(d.day);
  if (d.classY3) y3lists[d.classY3].push(d.day);
}

// ---- échantillon de lecture MANUELLE (traçable) — renseigné à la main ----
// Sections réellement lues : correction complète (logique/pièges/vérifs/oral)
// + « Questions de réflexion » pour les 22 jours ; théorie/guidé en plus pour le batch 1 (92-148).
const MANUAL_SAMPLE = [
  { day: 92, reason: 'M4 / domaine JS-React', read: 'correction+réflexion+guidé', verdict: 'A', proof: 'logique = "Solution simple : une fonction par bloc… Solution améliorée : isoler les composants réutilisables, typer, pureté" ; 4 pièges, 5 vérifs, oral cadré entretien', weakness: null, confidence: 'haute' },
  { day: 106, reason: 'M4 / Software engineering (tests)', read: 'correction+réflexion', verdict: 'A', proof: 'distinction simple/améliorée inline (AAA, déterminisme, sabotage du code) ; pièges/vérifs concrets', weakness: null, confidence: 'haute' },
  { day: 113, reason: 'M4 / projet (BiblioApp socle)', read: 'correction+réflexion', verdict: 'A', proof: 'simple/améliorée inline (walking skeleton) ; vérif "ouvrir /livres/3 en onglet neuf"', weakness: null, confidence: 'haute' },
  { day: 120, reason: 'M5 / Python', read: 'correction+réflexion', verdict: 'A', proof: 'simple (traduire JS) vs améliorée (idiomatique : comprehensions, .get, enumerate) inline', weakness: null, confidence: 'haute' },
  { day: 134, reason: 'M5 / SQL', read: 'correction+réflexion', verdict: 'A', proof: 'simple vs améliorée (3NF, dépendances, dénormalisation assumée) inline ; test du déménagement', weakness: null, confidence: 'haute' },
  { day: 148, reason: 'M6 / ML-stats', read: 'correction+réflexion', verdict: 'A', proof: 'simple (moyenne) vs améliorée (tendance+dispersion, asymétrie) inline ; "quand la moyenne ment"', weakness: null, confidence: 'haute' },
  { day: 165, reason: 'M6 / ML (2e du mois)', read: 'correction+réflexion', verdict: 'A', proof: 'distinction inline présente (grep) + 4 rubriques', weakness: null, confidence: 'moyenne' },
  { day: 190, reason: 'M7 / outlier correction la plus courte (125 mots)', read: 'correction+réflexion', verdict: 'A-', proof: 'logique dense (1 insight) + 3 pièges + 3 vérifs + oral ; PAS de distinction simple/robuste (tranche M2)', weakness: 'correction compacte, dimension décision/robuste ténue — déjà auditée et validée en M2', confidence: 'haute' },
  { day: 194, reason: 'M7 / outlier correction courte (135 mots)', read: 'correction+réflexion', verdict: 'A-', proof: 'logique = méthode recyclée mois 6 ; pièges/vérifs concrets ; pas de distinction simple/robuste (tranche M2)', weakness: 'idem 190 : compacte, tranche M2 validée', confidence: 'haute' },
  { day: 197, reason: 'M7 / LLM (lu en M2)', read: 'correction+réflexion (M2)', verdict: 'A', proof: 'logique = "trois lois démontrées" ; pièges/vérifs riches (déjà solide en M2)', weakness: null, confidence: 'haute' },
  { day: 211, reason: 'M8 / LLM prod (181-270 sans label)', read: 'correction+réflexion', verdict: 'A', proof: 'logique = système 3 pièces + boucle mesurée (score avant→après→revert) ; 4 pièges excellents ; oral = scénario incident', weakness: null, confidence: 'haute' },
  { day: 218, reason: 'M8 / RAG (181-270 sans label)', read: 'correction+réflexion', verdict: 'A', proof: 'logique = idempotent/traçable/vérifié + "JSON = choix ASSUMÉ, tu sais ce qui le fera craquer" = compromis simple/robuste EXPLICITE ; oral = "pourquoi JSON et pas vector DB"', weakness: null, confidence: 'haute' },
  { day: 241, reason: 'M9 / RAG chunking (181-270 sans label)', read: 'correction+réflexion', verdict: 'A', proof: 'pièges & oral centrés TRADE-OFF ("pas une victoire, un trade-off", "décision chiffrée assumée")', weakness: null, confidence: 'haute' },
  { day: 253, reason: 'M9 / Évaluation IA (181-270 sans label)', read: 'correction+réflexion', verdict: 'A', proof: 'logique = 3 propriétés du golden set ; raisonnement méthode dense ; 4 rubriques', weakness: null, confidence: 'haute' },
  { day: 260, reason: 'M9 / Sécurité (181-270 sans label)', read: 'correction+réflexion', verdict: 'A', proof: 'logique = red teaming 2 surfaces + objectifs ; menace indirecte RAG ; 4 rubriques', weakness: null, confidence: 'haute' },
  { day: 274, reason: 'M10 / Agents', read: 'correction+réflexion', verdict: 'A', proof: 'simple (boucle while) vs améliorée (3 garde-fous, budget, traces) inline', weakness: null, confidence: 'haute' },
  { day: 288, reason: 'M10 / Architecture / correction longue', read: 'correction+réflexion', verdict: 'A', proof: 'simple vs améliorée (test du changement, contaminations, interfaces) inline', weakness: null, confidence: 'haute' },
  { day: 302, reason: 'M11 / projet capstone (SPEC)', read: 'correction+réflexion', verdict: 'A', proof: 'simple vs améliorée (persona→5 cas testables→hors-scope courageux) inline', weakness: null, confidence: 'haute' },
  { day: 314, reason: 'M11 / projet jalon', read: 'correction+réflexion', verdict: 'A', proof: 'simple vs améliorée (démo bout-en-bout + revue archi) inline', weakness: null, confidence: 'haute' },
  { day: 337, reason: 'M12 / Communication (README)', read: 'correction+réflexion', verdict: 'A', proof: 'simple vs améliorée (README qui VEND, recruteur 90 s) inline', weakness: null, confidence: 'haute' },
  { day: 348, reason: 'M12 / Communication (offres)', read: 'correction+réflexion', verdict: 'A', proof: 'simple vs améliorée (10 offres, récurrence, 2 manques rattrapables) inline', weakness: null, confidence: 'haute' },
  { day: 365, reason: 'M12 / capstone final / correction la plus longue (432 mots)', read: 'correction+réflexion', verdict: 'A', proof: 'simple vs améliorée (profil = système à évaluer, preuves, plans 30/90j) inline ; très riche', weakness: null, confidence: 'haute' },
];

const output = {
  generatedAt: new Date().toISOString(),
  manualSample: MANUAL_SAMPLE,
  meta: {
    startHead: '5eca0ef',
    scope: '91-365',
    learning91Count: learning91.length,
    note: 'Classification A/B/C AUTOMATISÉE (heuristique). Les verdicts finaux exigent lecture manuelle — voir DIAGNOSTIC_Y2_Y3.md.',
  },
  tiers,
  monthMetrics,
  domainMetrics,
  outliers,
  y2: { counts: { A: y2lists.A.length, B: y2lists.B.length, C: y2lists.C.length }, lists: y2lists },
  y3: { counts: { A: y3lists.A.length, B: y3lists.B.length, C: y3lists.C.length }, lists: y3lists },
  perDay: Object.fromEntries(learning91.map(d => [d.day, {
    day: d.day, month: d.month, title: d.title, skill: d.skill, type: d.type,
    totalWords: d.totalWords, theoryWords: d.theoryWords, corrWords: d.corrWords,
    guidedWords: d.guidedWords, casePresent: d.casePresent, interviewPresent: d.interviewPresent,
    miniquizExplicit: d.miniquizExplicit, reflectPresent: d.reflectPresent, reflectQuestions: d.reflectQuestions,
    corrSections: d.corrSections, corrSimpleExplicit: d.corrSimpleExplicit, corrImprovedExplicit: d.corrImprovedExplicit,
    corrPitfalls: d.corrPitfalls, corrChecks: d.corrChecks, corrOral: d.corrOral,
    implicitSimpleRobust: d.implicitSimpleRobust, tradeoffPresent: d.tradeoffPresent, reasoningPresent: d.reasoningPresent,
    lessonLinks: d.lessonLinks, emptyBlocks: d.emptyBlocks,
    classY2: d.classY2, classY3: d.classY3,
  }])),
};

const OUT = path.join(ROOT, 'audit-y2-y3.json');
fs.writeFileSync(OUT, JSON.stringify(output, null, 2));

// ---- résumé console ----
console.log('=== AUDIT Y2/Y3 — palier 91-365 ===');
console.log('Jours d\'apprentissage 91-365 :', learning91.length,
  '| projets:', learning91.filter(d => d.type === 'project').length);
console.log('\n--- Corrections (mots) par palier [learning] ---');
for (const [k, m] of Object.entries(tiers)) {
  console.log(`${k.padEnd(9)} n=${String(m.count).padStart(3)} corr med=${String(m.corrWords.median).padStart(3)} [p10=${m.corrWords.p10} p90=${m.corrWords.p90}]  théo med=${String(m.theoryWords.median).padStart(3)}  mini-quiz=${m.miniquizExplicit}/${m.count}  simple=${m.corrSimpleExplicit}  amélio=${m.corrImprovedExplicit}  reflect=${m.reflectPresent}`);
}
console.log('\n--- Y2 (éval formative) 91-365 :', JSON.stringify(output.y2.counts));
console.log('--- Y3 (correction) 91-365    :', JSON.stringify(output.y3.counts));
console.log('\nY2 catégorie C (jours):', y2lists.C.join(', ') || 'aucun');
console.log('Y3 catégorie C (jours):', y3lists.C.join(', ') || 'aucun');
console.log('Y3 catégorie B (jours):', y3lists.B.join(', ') || 'aucun');
console.log('\nOutliers corr basse (<p10):', outliers.corrLow.map(d => d.day).join(', '));
console.log('Sans oral:', outliers.noOral.join(', ') || 'aucun');
console.log('Sans vérifs:', outliers.noChecks.join(', ') || 'aucun');
console.log('Sans pièges:', outliers.noPitfalls.join(', ') || 'aucun');
console.log('Sans reflect:', outliers.noReflect.join(', ') || 'aucun');
console.log('Blocs vides:', outliers.emptyBlocks.length ? JSON.stringify(outliers.emptyBlocks) : 'aucun');
console.log('\n→ audit-y2-y3.json écrit.');
