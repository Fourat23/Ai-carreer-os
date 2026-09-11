// V75 · CP0 — FORENSIC TELEMETRY & DETTES. STRICTEMENT LECTURE SEULE.
//
// Cette sonde ne modifie rien et n'écrit qu'un JSON de mesures dans docs/v75/.
// Elle répond aux sous-audits CP0.B → CP0.G du brief :
//   B. inventaire des événements persistés
//   C. D3  — RECORD_ATTEMPT
//   D. D4  — evidence[] et son grain
//   E. D6  — weeklyReviews
//   F. D8  — rattachement des 376 exercices
//   G. D10 — les 25 défis de transfert
//
// RÈGLE DE LA SONDE : ne jamais inventer un conceptId, ne jamais choisir
// arbitrairement une leçon pour verdir une métrique. Quand c'est ambigu, la
// sonde écrit « ambigu » — c'est une mesure, pas un échec.
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const pad3 = (n) => String(n).padStart(3, '0');
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
const pct = (n, d) => (d ? `${n}/${d} (${Math.round((n / d) * 100)} %)` : `${n}/0`);
const med = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

const program = JSON.parse(lire('data/program.json'));
const lessons = program.lessons ?? [];
const slugs = new Set(lessons.map((l) => l.slug));
const competences = new Set((program.skills ?? []).map((s) => s.id));
const out = {};

// ═════════════════════════════════════════════════════════════════════════
// B. INVENTAIRE DES ÉVÉNEMENTS PERSISTÉS
// ═════════════════════════════════════════════════════════════════════════
// Chaque entrée décrit un fait RÉELLEMENT écrit dans la progression, avec le
// grain qu'il porte et ce qui lui manque. « — » signifie « champ absent »,
// jamais « champ vide ».
const EVENEMENTS = [
  {
    nom: 'ExerciseAttempt', source: 'app/api/lab/[exerciseId]/route.ts', collection: 'exerciseAttempts',
    timestamp: 'serveur', learnerId: 'implicite (fichier unique)', dayId: 'dayRefs[]', conceptId: '—',
    competencyIds: '—', exerciseId: 'oui', projectId: '—', outcome: 'success|partial|failure (DÉRIVÉ)',
    duration: 'durationMs', provenance: 'obligatoire', validation: '—',
    idempotency: 'exerciseId + seconde + passed/total', schemaVersion: '—',
  },
  {
    nom: 'RecallAttempt', source: 'RecallStation → RECORD_RECALL', collection: 'recallAttempts',
    timestamp: 'serveur', learnerId: 'implicite', dayId: 'via sourceRef (regex)', conceptId: 'oui',
    competencyIds: '—', exerciseId: '—', projectId: '—', outcome: 'recalled|partial|failed',
    duration: 'durationMs (défaut 0)', provenance: 'oui', validation: '—',
    idempotency: 'conceptId + seconde + format', schemaVersion: '—',
  },
  {
    nom: 'Evidence', source: 'lab, diagnostics, missions, capstones, transfer', collection: 'evidence',
    timestamp: 'createdAt serveur', learnerId: 'implicite', dayId: 'dayId', conceptId: '—  ← D4',
    competencyIds: 'oui (20)', exerciseId: 'via sourceId', projectId: 'via sourceId',
    outcome: 'validation.status', duration: '—', provenance: 'producer/method/note',
    validation: 'status/kind/checkedAt/detail/score', idempotency: 'sourceType:sourceId:comps:q',
    schemaVersion: '—',
  },
  {
    nom: 'DayAttempt (legacy)', source: 'app/day/[id]/DayCorrection.tsx', collection: 'days[n].attempts',
    timestamp: 'serveur', learnerId: 'implicite', dayId: 'oui', conceptId: '—', competencyIds: '—',
    exerciseId: '—', projectId: '—', outcome: 'CHAÎNE LIBRE (40 car.) ← D3', duration: '—',
    provenance: '—', validation: '—', idempotency: 'AUCUNE', schemaVersion: '—',
  },
  {
    nom: 'Submission', source: 'SUBMIT', collection: 'days[n].submissions',
    timestamp: 'serveur', learnerId: 'implicite', dayId: 'oui', conceptId: '—', competencyIds: 'via skills',
    exerciseId: 'via stepId', projectId: '—', outcome: 'validation.status', duration: '—',
    provenance: '—', validation: 'oui', idempotency: 'stepId + at', schemaVersion: '—',
  },
  {
    nom: 'WeeklyReview', source: 'SET_WEEKLY_REVIEW', collection: 'weeklyReviews',
    timestamp: '—  ← D6', learnerId: 'implicite', dayId: '—', conceptId: '—', competencyIds: '—',
    exerciseId: '—', projectId: '—', outcome: '—', duration: '—', provenance: '—',
    validation: '—', idempotency: 'clé = numéro de semaine', schemaVersion: '—',
  },
  {
    nom: 'TransferAttempt', source: 'INEXISTANT', collection: '—',
    timestamp: '—', learnerId: '—', dayId: '—', conceptId: '—', competencyIds: '—',
    exerciseId: '—', projectId: '—', outcome: '—', duration: '—', provenance: '—',
    validation: '—', idempotency: '—', schemaVersion: '—',
  },
];
out.B_evenements = EVENEMENTS;

// ═════════════════════════════════════════════════════════════════════════
// C. D3 — RECORD_ATTEMPT
// ═════════════════════════════════════════════════════════════════════════
const srcEngine = lire('lib/learning-engine.mjs');
const producteurs = [];
for (const f of ['app/day/[id]/DayCorrection.tsx']) if (lire(f).includes('RECORD_ATTEMPT')) producteurs.push(f);
const outcomesEnDur = [...srcEngine.matchAll(/outcome:\s*'([a-z-]+)'/g)].map((m) => m[1]);
// Un consommateur RÉEL lit `attempts.count` ou `attempts.history` ailleurs que
// dans la fonction qui les écrit.
const fichiersLib = readdirSync(join(ROOT, 'lib')).map((f) => `lib/${f}`);
const consommateurs = fichiersLib
  .filter((f) => /\.(mjs|ts|tsx)$/.test(f))
  .filter((f) => /attempts\.(count|history)/.test(lire(f)) && f !== 'lib/learning.mjs');
out.C_D3 = {
  producteurs,
  nbProducteurs: producteurs.length,
  outcomeVocabulaire: 'CHAÎNE LIBRE — aucune liste fermée, borne 40 caractères',
  outcomesObserves: [...new Set(outcomesEnDur)],
  consommateursReels: consommateurs,
  nbConsommateursReels: consommateurs.length,
  ecritDans: 'days[n].attempts = { count, lastAt, history[] }',
  provenance: false,
  idempotence: false,
};

// ═════════════════════════════════════════════════════════════════════════
// D. D4 — evidence[] et son grain
// ═════════════════════════════════════════════════════════════════════════
// Aucune donnée d'apprenant n'existe (progress.json absent). On mesure donc la
// CAPACITÉ du schéma, pas des preuves réelles : quels types de preuve peuvent
// porter un concept, et pour combien de sources le rattachement serait unique.
const srcEvidence = lire('lib/evidence.mjs');
const champs = [...srcEvidence.matchAll(/^\s{2}([a-zA-Z]+):/gm)].map((m) => m[1]);
const declarants = new Map();
for (const l of lessons) {
  for (const r of l.practiceRefs ?? []) {
    if (r.kind !== 'exercise') continue;
    if (!declarants.has(r.id)) declarants.set(r.id, new Set());
    declarants.get(r.id).add(l.slug);
  }
}
out.D_D4 = {
  champsPortes: champs.slice(0, 20),
  porteConceptId: srcEvidence.includes('conceptId'),
  porteCompetencyIds: srcEvidence.includes('competencyIds'),
  grainCompetences: competences.size,
  grainConcepts: slugs.size,
  sourceTypes: [...srcEvidence.matchAll(/^\s*'([a-z-]+)',\s*\/\//gm)].map((m) => m[1]),
  note: 'Aucune preuve d’apprenant réelle à mesurer : data/progress.json est absent par invariant.',
};

// ═════════════════════════════════════════════════════════════════════════
// E. D6 — weeklyReviews
// ═════════════════════════════════════════════════════════════════════════
const srcLearning = lire('lib/learning.mjs');
const normWeekly = /normalizeWeekly|weeklyReviews/.test(srcLearning);
const consommateursWeekly = [...fichiersLib, ...readdirSync(join(ROOT, 'app')).map((f) => `app/${f}`)]
  .filter((f) => /\.(mjs|ts|tsx)$/.test(f))
  .filter((f) => lire(f).includes('weeklyReviews'));
out.E_D6 = {
  normaliseur: normWeekly ? 'partiel' : 'AUCUN',
  consommateurs: consommateursWeekly,
  schemaObserve: 'objet libre indexé par numéro de semaine — aucun champ obligatoire, aucun horodatage',
  commande: 'SET_WEEKLY_REVIEW',
};

// ═════════════════════════════════════════════════════════════════════════
// F. D8 — rattachement des 376 exercices
// ═════════════════════════════════════════════════════════════════════════
const exercices = readdirSync(join(ROOT, 'data', 'exercises')).filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(ROOT, 'data', 'exercises', f), 'utf8')));

const dayExercises = JSON.parse(lire('data/day-exercises.json'));
const joursDe = new Map();
for (const [j, ids] of Object.entries(dayExercises)) {
  for (const id of Array.isArray(ids) ? ids : []) {
    if (!joursDe.has(id)) joursDe.set(id, []);
    joursDe.get(id).push(Number(j));
  }
}
const leconsDuJour = new Map();
for (const d of program.days) {
  const p = join(ROOT, 'curriculum', 'days', `day-${pad3(d.day)}.md`);
  if (!existsSync(p)) continue;
  leconsDuJour.set(d.day, [...new Set([...readFileSync(p, 'utf8').matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))].filter((s) => slugs.has(s)));
}

const CLASSES = { UNAMBIGUOUS: 0, RESOLVABLE_FROM_CONTEXT: 0, MULTI_CONCEPT_BY_DESIGN: 0, AMBIGUOUS: 0, ORPHAN: 0 };
const table = [];
for (const ex of exercices) {
  const decl = [...(declarants.get(ex.id) ?? [])];
  const jours = joursDe.get(ex.id) ?? [];
  const parJour = [...new Set(jours.flatMap((j) => leconsDuJour.get(j) ?? []))];
  const skillsEx = (ex.skills ?? []).filter((s) => competences.has(s));

  let classe;
  if (decl.length === 1) classe = 'UNAMBIGUOUS';
  else if (decl.length === 0 && parJour.length === 0) classe = 'ORPHAN';
  else if (decl.length === 0 && parJour.length === 1) classe = 'RESOLVABLE_FROM_CONTEXT';
  // Plusieurs leçons DÉCLARENT l'exercice : c'est une intention d'auteur
  // répétée, pas une coïncidence. Le brief demande de conserver « multi » quand
  // c'est par conception.
  else if (decl.length > 1) classe = 'MULTI_CONCEPT_BY_DESIGN';
  else classe = 'AMBIGUOUS';
  CLASSES[classe] += 1;
  table.push({ id: ex.id, declarants: decl.length, parJour: parJour.length, skills: skillsEx.length, classe });
}
out.F_D8 = {
  total: exercices.length,
  classes: CLASSES,
  candidatesParJour: {
    mediane: med(table.filter((t) => t.classe === 'AMBIGUOUS' || t.classe === 'RESOLVABLE_FROM_CONTEXT').map((t) => t.parJour)),
    max: Math.max(...table.map((t) => t.parJour), 0),
  },
  exercicesSansCompetenceProgramme: table.filter((t) => t.skills === 0).length,
};

// ═════════════════════════════════════════════════════════════════════════
// G. D10 — les 25 défis de transfert
// ═════════════════════════════════════════════════════════════════════════
const defis = readdirSync(join(ROOT, 'data', 'transfer-challenges')).filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(ROOT, 'data', 'transfer-challenges', f), 'utf8')));
const joursCitant = program.days.filter((d) => {
  const p = join(ROOT, 'curriculum', 'days', `day-${pad3(d.day)}.md`);
  return existsSync(p) && defis.some((c) => readFileSync(p, 'utf8').includes(c.id));
}).length;
out.G_D10 = {
  total: defis.length,
  niveaux: defis.reduce((a, c) => ({ ...a, [c.transferLevel]: (a[c.transferLevel] ?? 0) + 1 }), {}),
  crossDomain: defis.filter((c) => c.crossDomain === true).length,
  competencesCouvertes: new Set(defis.flatMap((c) => c.skills ?? []).filter((s) => competences.has(s))).size,
  avecBridge: defis.filter((c) => typeof c.bridge === 'string' && c.bridge.length >= 8).length,
  questionsMediane: med(defis.map((c) => (c.questions ?? []).length)),
  // LES VERROUS
  routeExiste: existsSync(join(ROOT, 'app', 'transfer')),
  serveurExiste: existsSync(join(ROOT, 'lib', 'transfer-challenges-server.ts')),
  joursCitantUnDefi: joursCitant,
  refDansProgramJson: lire('data/program.json').includes('transfer-challenge'),
  typeDePreuveExiste: lire('lib/evidence.mjs').includes("'transfer-challenge'"),
  navigation: lire('app/shell/nav.ts').includes('/transfer'),
};

mkdirSync(join(ROOT, 'docs', 'v75'), { recursive: true });
writeFileSync(join(ROOT, 'docs', 'v75', 'cp0-forensics.json'), `${JSON.stringify(out, null, 1)}\n`);

// ── Sortie lisible ───────────────────────────────────────────────────────
console.log('# V75 · CP0 — TÉLÉMÉTRIE & DETTES (lecture seule)\n');
console.log('## B. Événements réellement persistés\n');
console.log('| événement | conceptId | competencyIds | outcome | provenance | idempotence |');
console.log('|---|---|---|---|---|---|');
for (const e of EVENEMENTS) console.log(`| ${e.nom} | ${e.conceptId} | ${e.competencyIds} | ${e.outcome} | ${e.provenance} | ${e.idempotency} |`);

console.log('\n## C. D3 — RECORD_ATTEMPT');
console.log(`producteurs : ${out.C_D3.nbProducteurs} (${producteurs.join(', ') || 'aucun'})`);
console.log(`outcome : ${out.C_D3.outcomeVocabulaire}`);
console.log(`CONSOMMATEURS RÉELS de attempts.count/history : ${out.C_D3.nbConsommateursReels}`);
console.log(`provenance : ${out.C_D3.provenance} · idempotence : ${out.C_D3.idempotence}`);

console.log('\n## D. D4 — evidence[]');
console.log(`porte conceptId : ${out.D_D4.porteConceptId} · porte competencyIds : ${out.D_D4.porteCompetencyIds}`);
console.log(`grain disponible : ${out.D_D4.grainCompetences} compétences · ${out.D_D4.grainConcepts} concepts`);

console.log('\n## E. D6 — weeklyReviews');
console.log(`normaliseur : ${out.E_D6.normaliseur} · consommateurs : ${out.E_D6.consommateurs.join(', ') || 'aucun'}`);
console.log(`schéma : ${out.E_D6.schemaObserve}`);

console.log('\n## F. D8 — rattachement des exercices');
for (const [k, v] of Object.entries(CLASSES)) console.log(`${k.padEnd(26)} ${pct(v, exercices.length)}`);
console.log(`candidates par journée (cas non déclarés) : médiane ${out.F_D8.candidatesParJour.mediane} · max ${out.F_D8.candidatesParJour.max}`);
console.log(`exercices sans compétence du programme : ${pct(out.F_D8.exercicesSansCompetenceProgramme, exercices.length)}`);

console.log('\n## G. D10 — défis de transfert');
console.log(`défis ${out.G_D10.total} · niveaux ${JSON.stringify(out.G_D10.niveaux)} · crossDomain ${out.G_D10.crossDomain} · avec pont ${out.G_D10.avecBridge}`);
console.log(`questions par défi, médiane : ${out.G_D10.questionsMediane}`);
console.log('VERROUS :');
console.log(`  route app/transfer          : ${out.G_D10.routeExiste ? 'existe' : 'ABSENTE'}`);
console.log(`  read-model serveur          : ${out.G_D10.serveurExiste ? 'existe' : 'ABSENT'}`);
console.log(`  entrée de navigation        : ${out.G_D10.navigation ? 'existe' : 'ABSENTE'}`);
console.log(`  journées citant un défi     : ${out.G_D10.joursCitantUnDefi}/365`);
console.log(`  référence dans program.json : ${out.G_D10.refDansProgramJson ? 'oui' : 'NON'}`);
console.log(`  type de preuve              : ${out.G_D10.typeDePreuveExiste ? 'existe (V74·CP11)' : 'ABSENT'}`);
console.log('\nécrit : docs/v75/cp0-forensics.json');
