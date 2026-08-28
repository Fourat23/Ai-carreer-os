// Gate v66:check — protège le Retention Engine I et les invariants gelés du
// sprint (`docs/V66-ACADEMIC-GRID-FROZEN.md`).
//
// MÉTHODE, identique aux gates précédents et non négociable : chaque règle a
// été VUE ÉCHOUER par un test négatif dédié (`scripts/v66-negative.sh`) avant
// d'être considérée acquise. Une règle protégée par deux mécanismes est cassée
// deux fois, séparément — la leçon de V65 (N2) et de V65.1 (le test de
// déduplication qui restait vert parce qu'une autre garde attrapait le cas).

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  RECALL_OUTCOMES, RECALL_FORMATS, RETENTION_STATES, INTERVALS,
  RETAINED_MIN_SPAN_DAYS, normalizeAttempt, projectRecall, projectSchedule,
  projectExposures, projectRetentionState, projectRetention, interleave,
  buildReviewQueue, availableFormats,
} from '../lib/retention.mjs';
import { applyCommand, COMMANDS } from '../lib/learning-engine.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const read = (p) => (existsSync(R(p)) ? readFileSync(R(p), 'utf8') : '');
// Un gate qui lit les COMMENTAIRES est un gate qu'un commentaire peut tromper.
const code = (p) => read(p)
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .split('\n').map((l) => l.replace(/(^|[^:'"`\\])\/\/.*$/, '$1')).join('\n');

const errors = [];
const ok = [];
function must(cond, msg, detail = '') {
  if (cond) ok.push(msg); else errors.push(`${msg}${detail ? ` — ${detail}` : ''}`);
}
function safe(fn, msg) {
  try { fn(); } catch (e) { errors.push(`${msg} — la règle a levé : ${e.message}`); }
}
function walk(dir, out = []) {
  if (!existsSync(R(dir))) return out;
  for (const e of readdirSync(R(dir))) {
    const rel = `${dir}/${e}`;
    if (statSync(R(rel)).isDirectory()) walk(rel, out); else out.push(rel);
  }
  return out;
}

const d = (n) => `2026-01-${String(n).padStart(2, '0')}T10:00:00.000Z`;
const A = (id, at, outcome, format = 'free') => ({ conceptId: id, at, outcome, format });
const empty = () => ({
  startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {},
  evidence: [], recallAttempts: [],
});

// ── R1. Un seul fait est écrit : la tentative ────────────────────────────
safe(() => {
  // Aucune commande du moteur ne doit pouvoir poser un ÉTAT de rétention, une
  // échéance ou une série. Le vocabulaire interdit est énuméré ici parce qu'il
  // est court et fermé ; la règle R2 vérifie en plus par le comportement.
  const INTERDITES = /^(SET_RETENTION|SET_RETENTION_STATE|MARK_RETAINED|SET_CONSECUTIVE|SET_DUE|SCHEDULE_CONCEPT)/;
  const offenders = COMMANDS.filter((c) => INTERDITES.test(c));
  must(offenders.length === 0,
    '[R1] aucune commande n’écrit un état de rétention', offenders.join(', '));
  must(COMMANDS.includes('RECORD_RECALL'),
    '[R1] RECORD_RECALL est la seule écriture du moteur de rétention');
}, '[R1] surface d’écriture');

safe(() => {
  // La progression ne doit porter AUCUN champ dérivé de rétention : ni état,
  // ni échéance, ni compteur. Seule la liste de faits est persistée.
  let p = empty();
  const r = applyCommand(p, { type: 'RECORD_RECALL', conceptId: 'x', outcome: 'recalled' }, { now: d(1) });
  must(r.ok, '[R1] RECORD_RECALL accepte une tentative valide', r.error ?? '');
  const keys = Object.keys(r.progress).filter((k) => /retention|due|consecutiveSuccesses|interval/i.test(k));
  must(keys.length === 0,
    '[R1] la progression ne stocke aucun champ dérivé de rétention', keys.join(', '));
  const a = r.progress.recallAttempts[0];
  must(a && Object.keys(a).sort().join(',') === 'at,conceptId,format,outcome,sourceRef',
    '[R1] une tentative ne porte QUE des faits', a ? Object.keys(a).join(',') : 'aucune');
}, '[R1] forme du fait');

safe(() => {
  // La date vient du SERVEUR. Une tentative antidatée par l'appelant fausserait
  // l'espacement, qui se calcule sur des dates.
  const r = applyCommand(empty(),
    { type: 'RECORD_RECALL', conceptId: 'x', outcome: 'recalled', at: '2020-01-01T00:00:00.000Z' },
    { now: d(9) });
  must(r.ok && r.progress.recallAttempts[0].at === d(9),
    '[R1] la date d’une tentative est celle du serveur, jamais celle du client',
    r.ok ? r.progress.recallAttempts[0].at : r.error);
}, '[R1] horodatage serveur');

// ── R2. Un état ne se fabrique pas : il se mérite ────────────────────────
safe(() => {
  for (const type of ['SET_RETENTION', 'MARK_RETAINED', 'SET_DUE', 'SCHEDULE_CONCEPT']) {
    const r = applyCommand(empty(), { type, conceptId: 'x', state: 'retenu' }, { now: d(1) });
    must(r.ok === false && r.code === 'UNKNOWN_COMMAND',
      `[R2] ${type} est refusée`, r.ok ? 'ACCEPTÉE' : r.code);
  }
  // Et par le modèle : trois réussites le même jour ne suffisent jamais.
  //
  // ATTENTION — ce cas est protégé par DEUX gardes : le comptage par DATE UTC
  // et le seuil d'étalement. Le test négatif N4 a d'abord été rendu invisible
  // par la seconde (casser le comptage laissait le gate vert, parce que
  // l'étalement restait nul). Même trou de forme que N2 en V65 et que le test
  // de déduplication en V65.1. Les deux gardes sont donc vérifiées SÉPARÉMENT
  // ci-dessous : le comptage par sa valeur, l'état par son résultat.
  const meme = ['08', '09', '10'].map((h) => A('x', `2026-01-01T${h}:00:00.000Z`, 'recalled'));
  const rec = projectRecall('x', meme);
  must(rec.successes === 3 && rec.distinctSuccessDays === 1,
    '[R2] les réussites sont comptées par DATE, pas par tentative',
    `${rec.successes} réussites, ${rec.distinctSuccessDays} date(s)`);
  const ex = projectExposures({ x: [1] }, { 1: { startedAt: d(1) } }).x;
  const st = projectRetentionState(ex, rec, '2026-01-01T11:00:00.000Z');
  must(st.state !== 'retenu',
    '[R2] répéter dans la même journée ne produit pas « retenu »', st.state);
}, '[R2] mérite');

// ── R3. Domaines fermés ──────────────────────────────────────────────────
safe(() => {
  must(normalizeAttempt(A('x', d(1), 'presque')) === null,
    '[R3] une issue hors domaine est refusée');
  must(normalizeAttempt(A('x', 'hier', 'recalled')) === null,
    '[R3] une date invalide est refusée');
  must(RECALL_OUTCOMES.length === 3 && RECALL_OUTCOMES.includes('failed'),
    '[R3] l’échec est une issue de plein droit');
  must(RETENTION_STATES.length === 5,
    '[R3] les cinq états du brief existent', RETENTION_STATES.join(','));
  const r = applyCommand(empty(), { type: 'RECORD_RECALL', conceptId: 'x', outcome: 'ok' }, { now: d(1) });
  must(r.ok === false && r.code === 'INVALID_OUTCOME',
    '[R3] la commande refuse une issue hors domaine', r.ok ? 'ACCEPTÉE' : r.code);
}, '[R3] domaines');

// ── R4. Déterminisme et reconstructibilité ───────────────────────────────
safe(() => {
  const attempts = [A('x', d(1), 'recalled'), A('x', d(5), 'partial'), A('x', d(9), 'failed')];
  const args = {
    concepts: [{ id: 'x', title: 'X', skills: ['algo'] }],
    conceptDays: { x: [1] }, days: { 1: { startedAt: d(1) } }, attempts, now: d(20),
  };
  const a = JSON.stringify(projectRetention(args));
  const b = JSON.stringify(projectRetention(args));
  must(a === b, '[R4] la projection est déterministe');

  // Ordre d'insertion indifférent : le tri par date est ce qui le garantit.
  const melange = { ...args, attempts: [...attempts].reverse() };
  must(JSON.stringify(projectRetention(melange)) === a,
    '[R4] la projection ne dépend pas de l’ordre d’insertion des tentatives');

  // L'échéance ne consulte pas l'horloge : la rejouer six mois plus tard rend
  // la même date.
  const s1 = projectSchedule(projectRecall('x', [A('x', d(1), 'recalled')]));
  must(s1.dueAt === '2026-01-04T10:00:00.000Z',
    '[R4] l’échéance se calcule depuis la dernière tentative, pas depuis maintenant', String(s1.dueAt));
}, '[R4] déterminisme');

// ── R5. L’espacement suit les paliers publiés ────────────────────────────
safe(() => {
  for (let consecutiveSuccesses = 0; consecutiveSuccesses <= 3; consecutiveSuccesses++) {
    const attempts = Array.from({ length: consecutiveSuccesses }, (_, i) => A('x', d(i + 1), 'recalled'));
    if (consecutiveSuccesses === 0) attempts.push(A('x', d(1), 'failed'));
    const s = projectSchedule(projectRecall('x', attempts));
    must(s.intervalDays === INTERVALS[consecutiveSuccesses],
      `[R5] série ${consecutiveSuccesses} → ${INTERVALS[consecutiveSuccesses]} jour(s)`, String(s.intervalDays));
  }
  must(INTERVALS.every((n) => Number.isInteger(n) && n > 0) && INTERVALS.at(-1) <= 365,
    '[R5] les paliers sont des entiers, et aucun ne dépasse la durée du cursus',
    INTERVALS.join(','));
  const asc = INTERVALS.every((n, i) => i === 0 || n > INTERVALS[i - 1]);
  must(asc, '[R5] les paliers sont strictement croissants', INTERVALS.join(','));
}, '[R5] espacement');

// ── R6. Un échec ne disparaît pas ────────────────────────────────────────
safe(() => {
  const r = projectRecall('x', [A('x', d(1), 'recalled'), A('x', d(2), 'recalled'), A('x', d(3), 'failed')]);
  must(r.failures === 1 && r.consecutiveSuccesses === 0 && r.successes === 2,
    '[R6] un échec remet la série à zéro sans effacer les réussites passées',
    `succès ${r.successes}, échecs ${r.failures}, série ${r.consecutiveSuccesses}`);
  const s = projectSchedule(r);
  must(s.intervalDays === INTERVALS[0],
    '[R6] après un échec, l’espacement revient au premier palier', String(s.intervalDays));
}, '[R6] échec');

// ── R7. « À revoir » prime, « nouveau » n’entre pas dans la file ─────────
safe(() => {
  const ex = projectExposures({ x: [1] }, { 1: { startedAt: d(1) } }).x;
  const attempts = [A('x', d(1), 'recalled'), A('x', d(5), 'recalled'), A('x', d(12), 'recalled')];
  const st = projectRetentionState(ex, projectRecall('x', attempts), '2026-06-01T10:00:00.000Z');
  must(st.state === 'a_revoir', '[R7] une échéance dépassée prime sur tout autre état', st.state);

  const nouveau = [{
    conceptId: 'n', title: 'N', skills: [], state: 'nouveau', reason: '',
    recall: { attemptCount: 0 }, schedule: { dueAt: null, intervalDays: null, basis: '' },
    exposure: { exposed: true },
  }];
  must(buildReviewQueue(nouveau, { now: d(9) }).length === 0,
    '[R7] on ne réactive pas ce qui n’a jamais été activé');
}, '[R7] file');

// ── R8. Entrelacement dérivé, pas deviné ────────────────────────────────
safe(() => {
  const mk = (id, skills, due) => ({ conceptId: id, skills, schedule: { dueAt: due } });
  const items = [
    mk('a1', ['rag'], d(1)), mk('a2', ['rag'], d(1)), mk('a3', ['rag'], d(1)),
    mk('b1', ['algo'], d(1)), mk('b2', ['algo'], d(1)),
  ];
  const out = interleave(items);
  must(out.length === items.length, '[R8] l’entrelacement ne perd aucun élément');
  // Aucune paire consécutive de même famille tant que l'autre a des éléments.
  const reste = { rag: 3, algo: 2 };
  let viole = null;
  for (let i = 0; i < out.length; i++) {
    const f = out[i].skills[0];
    reste[f] -= 1;
    if (i + 1 < out.length && out[i + 1].skills[0] === f) {
      const autres = Object.entries(reste).filter(([k]) => k !== f).reduce((n, [, v]) => n + v, 0);
      if (autres > 0) viole = `${f} deux fois de suite en position ${i}`;
    }
  }
  must(viole === null, '[R8] deux notions de la même famille ne se suivent pas si une autre attend', viole ?? '');
  must(JSON.stringify(interleave(items)) === JSON.stringify(out),
    '[R8] l’entrelacement est déterministe');
}, '[R8] entrelacement');

// ── R9. Les formes de rappel sont MESURÉES sur le corpus ────────────────
safe(() => {
  must(availableFormats([]).length === 0,
    '[R9] une leçon sans section exploitable n’offre aucune forme');
  must(availableFormats(['🎯 Objectif']).join(',') === 'free',
    '[R9] les formes proposées sont celles que la leçon porte réellement');
  must(RECALL_FORMATS.length >= 3,
    '[R9] le rappel actif existe sous plusieurs formes', RECALL_FORMATS.join(','));

  // Elles doivent être réellement disponibles SUR LE CORPUS, pas en théorie.
  const lessons = walk('curriculum/lessons').filter((f) => f.endsWith('.md'));
  const couverture = new Map(RECALL_FORMATS.map((f) => [f, 0]));
  let sansForme = 0;
  for (const f of lessons) {
    const titles = [...read(f).matchAll(/^## +(.+)$/gm)].map((m) => m[1]);
    const av = availableFormats(titles);
    if (av.length === 0) sansForme += 1;
    for (const x of av) couverture.set(x, couverture.get(x) + 1);
  }
  must(sansForme === 0,
    '[R9] aucune leçon du corpus n’est privée de toute forme de rappel', `${sansForme} leçons`);
  const mortes = [...couverture].filter(([, n]) => n === 0).map(([f]) => f);
  must(mortes.length === 0,
    '[R9] aucune forme déclarée n’est morte sur le corpus réel', mortes.join(', '));
}, '[R9] formes');

// ── R10. Le catalogue de concepts est DÉRIVÉ, jamais énuméré ────────────
safe(() => {
  const src = code('lib/retention-server.ts');
  must(/doc\/lessons\/\(\[a-z0-9-\]\+\)|doc\\\/lessons/.test(src) || src.includes('/doc/lessons/'),
    '[R10] le rattachement journée → concept est lu dans le corpus');
  // Une liste codée en dur de slugs serait une seconde source de vérité.
  const listeEnDur = /const\s+\w*(CONCEPTS?|SLUGS?)\w*\s*=\s*\[\s*'[a-z0-9-]{4,}'\s*,\s*'/i.test(src);
  must(!listeEnDur,
    '[R10] aucune liste de concepts codée en dur dans le serveur de rétention');
}, '[R10] dérivation');

// ── R11. Aucune seconde source de vérité, aucune gamification ───────────
safe(() => {
  // `lib/review.mjs` (V19) et `lib/retention.mjs` (V66) coexistent, mais aucun
  // des deux ne doit lire l'état de l'autre : ce serait rétablir la divergence
  // que V65.1 a mis un sprint à supprimer.
  must(!code('lib/review.mjs').includes('retention'),
    '[R11] le moteur de révision par journée ignore le moteur de rétention');
  must(!/from '\.\/review\.mjs'/.test(code('lib/retention.mjs')),
    '[R11] le moteur de rétention ignore le moteur de révision par journée');

  const BAD = /\b(xp|leaderboard|classement|badge de mérite|points gagnés|consecutiveSuccesses de jours)\b/i;
  const NEG = /(aucun|sans|pas d|jamais|interdit|anti-|ni )/i;
  const offenders = [];
  for (const f of [...walk('lib'), ...walk('app')].filter((x) => /\.(mjs|ts|tsx)$/.test(x))) {
    for (const [i, l] of code(f).split('\n').entries()) {
      if (BAD.test(l) && !NEG.test(l)) offenders.push(`${f}:${i + 1}`);
    }
  }
  must(offenders.length === 0,
    '[R11] la rétention n’introduit aucune gamification', offenders.slice(0, 5).join(', '));
}, '[R11] frontières');

// ── R12. Les artefacts gelés du CP1 existent et n’ont pas bougé ─────────
safe(() => {
  const grid = read('docs/V66-ACADEMIC-GRID-FROZEN.md');
  must(grid.includes('20260828'), '[R12] la seed de l’échantillon est publiée');
  must(/D1[\s\S]*D12/.test(grid), '[R12] les 12 dimensions notées sont publiées');
  must(grid.includes('ACADEMIC_QUALITY_READY'),
    '[R12] la grille rappelle le verdict interdit à ce sprint');
  // Lecture du CODE, commentaires retirés : le fichier explique en commentaire
  // qu'il n'utilise aucun `Math.random`, et un gate qui lit les commentaires
  // est un gate qu'un commentaire peut tromper — dans les deux sens.
  const sample = code('scripts/v66-sample.mjs');
  must(!sample.includes('Math.random'),
    '[R12] l’échantillon est tiré sans aléa non reproductible');
  must(sample.includes('export const SEED = 20260828'),
    '[R12] la seed n’a pas été modifiée après publication des résultats');
  must(existsSync(R('docs/audits/v66/before-symptoms.json')) && existsSync(R('docs/audits/v66/before-load.json')),
    '[R12] les résultats BEFORE sont figés dans le dépôt');
}, '[R12] gel');

// ── R13. La surface n’écrit rien et n’invente rien ──────────────────────
safe(() => {
  const page = code('app/retention/page.tsx');
  must(!/applyCommand|writeProgress/.test(page),
    '[R13] la page de réactivation n’écrit jamais');
  must(page.includes('getRetentionSummary'),
    '[R13] la page lit le read-model transverse, elle ne recalcule rien');
  // Les seuils affichés doivent VENIR du modèle : les recopier créerait une
  // seconde source, et la page mentirait le jour où la règle change.
  must(page.includes('INTERVALS') && page.includes('RETAINED_MIN_SPAN_DAYS'),
    '[R13] les seuils affichés sont importés du modèle, jamais recopiés');
  must(!/\b(1, 3, 7, 16, 35)\b/.test(page),
    '[R13] aucun palier d’espacement recopié à la main dans la page');

  const station = code('app/retention/RecallStation.tsx');
  must(station.includes('RECORD_RECALL'),
    '[R13] la station enregistre par commande nommée, pas par écriture libre');
  must(/setError|role="alert"/.test(station),
    '[R13] un échec d’enregistrement est visible par l’apprenant');
  // Le geste imposé : la réponse ne s'ouvre qu'après « J'ai tenté ».
  must(/revealed/.test(station) && /reveal\(/.test(station),
    '[R13] les issues ne sont accessibles qu’après une tentative déclarée');
}, '[R13] surface');

console.log(`── v66:check — ${ok.length} vérifications passées`);
if (errors.length) {
  console.error(`\n❌ v66:check : ${errors.length} régression(s)\n`);
  for (const e of errors) console.error(`  • ${e}`);
  process.exit(1);
}
console.log('\n✅ V66 · Retention Engine I : un seul fait écrit, aucun état fabriqué, espacement déterministe et publié, échec conservé, entrelacement dérivé du programme, formes de rappel mesurées sur le corpus, artefacts du CP1 gelés.');
