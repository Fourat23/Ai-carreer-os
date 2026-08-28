// FIXTURE V65.1 — produite PAR LE PRODUIT.
//
// Aucun `progress.json` n'est écrit à la main : chaque fait passe par l'API de
// commandes réelle (`POST /api/progress`) et par la route des diagnostics.
// Une fixture écrite à la main peut contenir un état que le produit serait
// incapable de produire ; celle-ci ne le peut pas.
//
// POURQUOI ELLE EXISTE. La leçon de V65 : `.rev-track` a porté un défaut
// d'accessibilité pendant huit sprints parce qu'aucune fixture n'avait jamais
// rempli l'échéancier. Une suite verte sur une progression vide ne mesure rien.
//
// USAGE :
//   cp data/progress.json /tmp/fx.json
//   AICOS_PROGRESS_FILE=/tmp/fx.json npx next start -p 3500 &
//   AICOS_PROGRESS_FILE=/tmp/fx.json node scripts/v651-fixture.mjs http://127.0.0.1:3500
//
// Elle couvre les QUATRE états de compétence, les sept types de source
// pertinents, une tentative ratée puis réussie, un diagnostic réussi et un
// raté, des niveaux déclarés, et des révisions en retard.
const BASE = process.argv[2] ?? 'http://127.0.0.1:3493';
const fs = await import('node:fs');

const de = JSON.parse(fs.readFileSync('data/day-exercises.json', 'utf8'));
const exById = {};
for (const f of fs.readdirSync('data/exercises')) {
  const j = JSON.parse(fs.readFileSync('data/exercises/' + f, 'utf8'));
  exById[j.id] = j;
}

let ok = 0, ko = 0;
async function cmd(command) {
  const r = await fetch(`${BASE}/api/progress`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ command }),
  });
  const j = await r.json();
  if (j.ok) ok += 1; else { ko += 1; console.log('  ✗', command.type, j.code, j.error); }
  return j;
}

// ── 12 journées terminées, chacune avec ses exercices RÉELS validés ──
const DONE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
for (const day of DONE) {
  await cmd({ type: 'START', day });
  for (const exId of de[String(day)] ?? []) {
    const ex = exById[exId];
    if (!ex) continue;
    // Jour 7 : une première tentative ÉCHOUE. Un échec est une trace, pas une
    // preuve qualifiante — il doit rester visible et ne rien créditer.
    if (day === 7) {
      const s = await cmd({
        type: 'SUBMIT', day, stepId: exId, kind: 'code', content: '// tentative incomplète',
        skills: ex.skills, evidenceId: exId, evidenceTitle: ex.title,
        validation: { status: 'failed', kind: 'exercise-tests', detail: '2 tests sur 5 passent.' },
      });
      if (s.ok) {
        await cmd({
          type: 'ATTACH_VALIDATION', day, submissionId: `sub-${exId}-1`,
          skills: ex.skills, evidenceId: exId, evidenceTitle: ex.title,
          validation: { status: 'passed', kind: 'exercise-tests', detail: 'Tous les tests passent.' },
        });
      }
      continue;
    }
    await cmd({
      type: 'SUBMIT', day, stepId: exId, kind: 'code', content: `console.log('${exId}');`,
      skills: ex.skills, evidenceId: exId, evidenceTitle: ex.title,
      validation: { status: 'passed', kind: 'exercise-tests', detail: 'Tous les tests passent.' },
    });
  }
  // La révision porte sur les compétences RÉELLES de la journée : c'est ce que
  // fait l'UI (DayCorrection, ReviewList) — la fixture ne triche pas.
  const daySkills = [...new Set((de[String(day)] ?? []).flatMap((i) => exById[i]?.skills ?? []))];
  await cmd({ type: 'SET_COMPREHENSION', day, value: day % 4 === 0 ? 'partial' : 'understood', skills: daySkills });
  await cmd({ type: 'COMPLETE', day });
}

// ── Journée 13 en cours, un travail rendu non encore validé ──
await cmd({ type: 'START', day: 13 });
{
  const exId = (de['13'] ?? [])[0];
  const ex = exById[exId];
  if (ex) {
    await cmd({
      type: 'SUBMIT', day: 13, stepId: exId, kind: 'code', content: '// en cours',
      skills: ex.skills, evidenceId: exId, evidenceTitle: ex.title,
    });
  }
}

// ── Niveaux déclarés (auto-évaluation) : ce N'EST PAS une preuve ──
await cmd({ type: 'SET_SKILL', skill: 'rag', score: 2 });
await cmd({ type: 'SET_SKILL', skill: 'llm', score: 1 });

// ── Une révision planifiée ──
await cmd({ type: 'SCHEDULE_REVIEW', day: 3, at: new Date(Date.now() - 86400000).toISOString() });
await cmd({ type: 'SCHEDULE_REVIEW', day: 6, at: new Date(Date.now() + 3 * 86400000).toISOString() });

// ── Deux diagnostics réellement passés, via LEUR route, avec record ──
// L'un réussi, l'autre échoué : un échec doit rester une trace non qualifiante.
{
  const dir = 'data/assessments';
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  for (const [i, f] of [files[0], files[3]].entries()) {
    const a = JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8'));
    const responses = {};
    for (const [n, q] of (a.questions ?? []).entries()) {
      const good = q.answer;
      // Le second diagnostic est délibérément raté.
      responses[q.id] = i === 1 && n % 2 === 0 ? (typeof good === 'number' ? (good + 1) % 4 : '') : good;
    }
    const r = await fetch(`${BASE}/api/assessments/${a.id}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ responses, record: true }),
    });
    const j = await r.json();
    console.log('  diagnostic', a.id, j.result?.passed + '/' + j.result?.total,
                'réussi=' + j.result?.passedOverall, 'enregistré=' + j.recorded);
  }
}

console.log(`\nfixture : ${ok} commandes acceptées, ${ko} refusées`);

// ── Une tentative EN AVANCE, ratée : l'état « Pratiquée » ─────────────────
// Un apprenant peut ouvrir un exercice hors séquence depuis le laboratoire.
// L'échec laisse une TRACE sans rien démontrer : c'est exactement ce que
// « Pratiquée » doit vouloir dire, et sans ce cas l'état n'est jamais vu.
{
  const day = 39;
  const exId = (de[String(day)] ?? [])[0];
  const ex = exById[exId];
  if (ex) {
    await cmd({ type: 'START', day });
    await cmd({
      type: 'SUBMIT', day, stepId: exId, kind: 'code', content: '// piste explorée trop tôt',
      skills: ex.skills, evidenceId: exId, evidenceTitle: ex.title,
      validation: { status: 'failed', kind: 'exercise-tests', detail: '1 test sur 4 passe.' },
    });
    await cmd({ type: 'PAUSE', day });
  }
}

// ── DÉCALAGE TEMPOREL ASSUMÉ ──────────────────────────────────────────────
// `createdAt` est posé par le SERVEUR (invariant). Sans machine à remonter le
// temps, toutes les preuves portent la même date, et l'état « Consolidée »
// (≥ 2 preuves qualifiantes de sources ET de jours distincts) reste
// INATTEIGNABLE — donc jamais vu à l'œil. La leçon de V65 est précisément
// qu'un état jamais rempli cache ses défauts pendant des sprints.
//
// On ne fabrique donc AUCUN fait : chaque preuve ci-dessous a été produite par
// le moteur. On déplace seulement l'HORLOGE de la journée N vers son passé
// plausible, puis on renormalise par le code produit (`normalizeLedger`), pour
// que le résultat soit exactement ce que le produit aurait écrit ce jour-là.
const { normalizeLedger } = await import(new URL('lib/evidence.mjs', 'file://' + process.cwd() + '/').href);
const FILE = process.env.AICOS_PROGRESS_FILE;
if (FILE) {
  const v3 = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const flat = v3.tracks[v3.activeTrackId];
  const shiftOf = (day) => (Number.isInteger(day) && day >= 1 && day <= 12 ? (13 - day) : 0);
  const move = (iso, days) => (typeof iso === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(iso)
    ? new Date(Date.parse(iso) - days * 86400000).toISOString() : iso);
  const deep = (v, d) => {
    if (typeof v === 'string') return move(v, d);
    if (Array.isArray(v)) return v.map((x) => deep(x, d));
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deep(x, d)]));
    return v;
  };
  const days = {};
  for (const [k, dp] of Object.entries(flat.days ?? {})) days[k] = deep(dp, shiftOf(Number(k)));
  const evidence = normalizeLedger((flat.evidence ?? []).map((e) => deep(e, shiftOf(e.dayId))));
  v3.tracks[v3.activeTrackId] = { ...flat, days, evidence };
  fs.writeFileSync(FILE, JSON.stringify(v3, null, 2));
  const dates = new Set(evidence.map((e) => e.createdAt.slice(0, 10)));
  console.log(`décalage : ${evidence.length} preuves réparties sur ${dates.size} dates UTC`);
}
