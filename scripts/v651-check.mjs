// Gate v651:check — protège les conditions de sortie GELÉES au CP1
// (`docs/V65-1-CRITERIA-FROZEN.md`). Il lit le code et rejoue le modèle ; il
// ne remplace pas la suite navigateur (`v651:ux`), il la complète.
//
// MÉTHODE. Chaque règle a été VUE ÉCHOUER par un test négatif dédié avant
// d'être considérée acquise. Et lorsqu'un invariant est protégé par DEUX
// mécanismes, chacun est cassé séparément : au CP12 de ce sprint, le test de
// déduplication restait vert après suppression de la clé métier, parce qu'une
// garde par identifiant attrapait le cas — exactement le trou trouvé au CP2 de
// V65, et le même que la règle N2 de V65 avait mis au jour. Un test qui reste
// vert parce qu'autre chose protège ne prouve rien sur la règle visée.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createLedger, projectCompetencies, whyCompetencyState, nextActionForCompetency,
  COMPETENCY_STATES, COMPETENCY_STATE_LABEL,
} from '../lib/competency.mjs';
import { makeEvidence, appendEvidence, evidenceKey, isQualifying, deterministicId } from '../lib/evidence.mjs';
import { programSkill } from '../lib/skill-taxonomy.mjs';

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
/** Une règle qui CRASHE n'est pas une règle qui passe (leçon N1 de V65). */
function safe(fn, msg) {
  try { fn(); } catch (e) { errors.push(`${msg} — la règle a levé : ${e.message}`); }
}

function walk(dir, out = []) {
  if (!existsSync(R(dir))) return out;
  for (const e of readdirSync(R(dir))) {
    const rel = `${dir}/${e}`;
    if (statSync(R(rel)).isDirectory()) walk(rel, out);
    else out.push(rel);
  }
  return out;
}

console.log('── Gate v651:check (Competency Product Closure)');

// ── C1. Une seule source de vérité de compétence ──────────────────────────
safe(() => {
  const dead = ['lib/skill-state.mjs', 'lib/skill-vocabulary.mjs'];
  must(dead.every((f) => !existsSync(R(f))),
    '[C1] le modèle de compétence concurrent est supprimé',
    dead.filter((f) => existsSync(R(f))).join(', '));

  const owners = walk('lib').filter((f) => f.endsWith('.mjs'))
    .filter((f) => /\b(COMPETENCY_STATES|COMPETENCY_STATE_LABEL|SKILL_STATES|SKILL_STATE_LABEL)\s*=/.test(read(f)));
  must(owners.length === 1 && owners[0] === 'lib/competency.mjs',
    '[C1] un seul fichier définit les états de compétence',
    owners.join(', ') || 'aucun');

  const importers = [...walk('app'), ...walk('lib')]
    .filter((f) => /\.(ts|tsx|mjs)$/.test(f))
    .filter((f) => /from ['"][^'"]*skill-(state|vocabulary)/.test(code(f)));
  must(importers.length === 0,
    '[C1] aucune surface ne lit l’ancien modèle',
    importers.join(', '));
}, '[C1] source de vérité unique');

// ── C2/C5. Décompte de preuves : enregistrements ≠ somme de crédits ───────
safe(() => {
  const rm = code('lib/learner-read-models.ts');
  must(/qualifyingEvidenceCount:\s*all\.filter\(isQualifying\)\.length/.test(rm),
    '[C5] qualifyingEvidenceCount compte des ENREGISTREMENTS',
    'un décompte de preuves n’est pas une somme de crédits par compétence');
  must(/competencyCreditCount/.test(rm),
    '[C5] la somme des crédits existe sous son propre nom');

  // Et l'UI ne doit pas remettre la somme là où on annonce des preuves.
  const skills = code('app/skills/page.tsx');
  must(!/competencyCreditCount[^;]*preuves? qualifiantes?/s.test(skills),
    '[C5] /skills n’affiche pas la somme des crédits comme un décompte de preuves');
}, '[C5] aucun nombre inventé');

// ── C3. Vocabulaire unique : les surfaces du ledger passent par les NOMS ──
safe(() => {
  // PREMIER ESSAI, ÉCARTÉ : chercher « .skills.join( » dans les .tsx. La règle
  // mesurait un NOM DE VARIABLE, pas son contenu — la leçon N5 de V65. Elle
  // accusait /period et le catalogue du laboratoire, qui joignent des
  // `skillName` déjà francisés ou une botte de foin de recherche.
  //
  // Ce qui est TOUJOURS un identifiant, en revanche, c'est `competencyIds` :
  // le champ du ledger. Le rendre brut est le défaut P0-3 du CP0.
  const raw = walk('app').filter((f) => f.endsWith('.tsx'))
    .filter((f) => /competencyIds\.join\(/.test(code(f).replace(/`[^`]*`/g, '``')));
  must(raw.length === 0,
    '[C3] aucune surface ne rend `competencyIds` brut',
    raw.join(', '));

  // Et, positivement : les deux surfaces qui affichent les compétences d'une
  // preuve DOIVENT passer par une table de noms du programme.
  for (const f of ['app/synthese/page.tsx', 'app/history/page.tsx']) {
    must(/skillName\.get\(|skillName\[|skillNames\[/.test(code(f)),
      `[C3] ${f} traduit les identifiants en noms du programme`);
  }
}, '[C3] vocabulaire unique');

// ── C4. Aucun identifiant d'état anglais dans un texte du moteur ──────────
safe(() => {
  const texts = [];
  for (const s of COMPETENCY_STATES) texts.push(COMPETENCY_STATE_LABEL[s]);
  const evd = makeEvidence({
    sourceType: 'exercise', sourceId: 'x', competencyIds: ['algo'],
    title: 'x', validation: { status: 'passed', kind: 'exercise-tests', detail: 'ok' },
    provenance: { producer: 'gate', method: 'stub', note: 'x' },
  }, { now: '2026-01-01T00:00:00.000Z' });
  const ledger = createLedger(evd.ok ? [evd.evidence] : []);
  for (const c of projectCompetencies([{ id: 'algo', name: 'Algorithmie' }, { id: 'secu', name: 'Sécurité' }], ledger)) {
    const why = whyCompetencyState(c, ledger);
    texts.push(why.rule, why.stateLabel, ...why.facts);
    const a = nextActionForCompetency(c);
    if (a) texts.push(a.action, a.reason, a.goal, a.expectedEvidence, a.cta);
  }
  const blob = texts.join(' ').toLowerCase();
  const leaked = [...COMPETENCY_STATES, 'not-started', 'discovered', 'to-consolidate']
    .filter((s) => new RegExp(`\\b${s}\\b`).test(blob));
  must(leaked.length === 0,
    '[C4] aucun identifiant d’état anglais dans un texte produit',
    leaked.join(', '));
}, '[C4] pas de fuite d’identifiant');

// ── C6. L'explication vient du moteur, pas d'un texte écrit en dur ────────
safe(() => {
  for (const f of ['app/skills/SkillsBoard.tsx', 'app/skills/[id]/page.tsx']) {
    const src = code(f);
    must(/why\.rule|whyCompetencyState/.test(src),
      `[C6] ${f} consomme l’explication du moteur`);
    must(!/Au moins (une|deux) preuves? qualifiantes?/.test(src),
      `[C6] ${f} ne réécrit pas la règle en dur`,
      'la règle vit dans competency.mjs');
  }
  // Déterminisme : deux appels, même sortie.
  const evd = makeEvidence({
    sourceType: 'exercise', sourceId: 'y', competencyIds: ['algo'],
    title: 'y', validation: { status: 'passed', kind: 'exercise-tests', detail: 'ok' },
    provenance: { producer: 'gate', method: 'stub', note: 'y' },
  }, { now: '2026-01-01T00:00:00.000Z' });
  const l = createLedger([evd.evidence]);
  const c = projectCompetencies([{ id: 'algo', name: 'Algorithmie' }], l)[0];
  must(JSON.stringify(whyCompetencyState(c, l)) === JSON.stringify(whyCompetencyState(c, l)),
    '[C6] l’explication est déterministe');
}, '[C6] explicabilité');

// ── C7. Reconstructibilité : la projection ne dépend que des preuves ──────
safe(() => {
  const mk = (id, src, when, status) => makeEvidence({
    sourceType: 'exercise', sourceId: src, competencyIds: ['algo'], title: id,
    validation: { status, kind: 'exercise-tests', detail: 'x' },
    provenance: { producer: 'gate', method: 'stub', note: 'x' },
  }, { now: when }).evidence;
  const list = [mk('a', 'a', '2026-01-01T00:00:00.000Z', 'passed'), mk('b', 'b', '2026-01-02T00:00:00.000Z', 'passed')];
  const skills = [{ id: 'algo', name: 'Algorithmie' }];
  const a = JSON.stringify(projectCompetencies(skills, createLedger(list)));
  // On repart d'un objet nu : aucun champ dérivé conservé.
  const b = JSON.stringify(projectCompetencies(skills, createLedger(JSON.parse(JSON.stringify(list)))));
  must(a === b, '[C7] la projection se reconstruit à l’identique depuis les seules preuves');
  must(JSON.parse(a)[0].state === 'reinforced',
    '[C7] deux réussites de sources et de jours distincts consolident');
}, '[C7] reconstructibilité');

// ── C8. La surface de détail existe et est atteignable ───────────────────
safe(() => {
  must(existsSync(R('app/skills/[id]/page.tsx')),
    '[C8] la route /skills/[id] existe');
  const detail = code('app/skills/[id]/page.tsx');
  for (const [needle, what] of [
    [/getCompetencyReachability/, 'atteignabilité'],
    [/nextActionForCompetency/, 'prochaine action'],
    [/provenance/, 'provenance'],
    [/whyCompetencyState|summary\.explanations/, 'explication'],
  ]) {
    must(needle.test(detail), `[C8] le détail porte : ${what}`);
  }
  must(/href={`\/skills\/\$\{c\.competencyId\}`}/.test(code('app/skills/SkillsBoard.tsx')),
    '[C8] /skills mène au détail');
}, '[C8] surface de détail');

// ── C9. Les diagnostics connaissent l'apprenant ──────────────────────────
safe(() => {
  must(/getHistoryBySource\(['"]assessment['"]\)/.test(code('app/diagnostics/page.tsx')),
    '[C9] /diagnostics lit l’historique de l’apprenant');
  must(existsSync(R('app/api/capstones/[id]/route.ts')),
    '[C9] un capstone réussi peut produire une preuve');
  const cap = code('app/api/capstones/[id]/route.ts');
  must(/gradeCapstone\(/.test(cap) && /body\.record !== true/.test(cap),
    '[C9] le capstone est corrigé par le SERVEUR et n’écrit que sur demande');
  must(/appendEvidence\(/.test(cap),
    '[C9] le capstone passe par la déduplication du ledger');
}, '[C9] convergence des évaluations');

// ── C10. L'historique est exploitable ────────────────────────────────────
safe(() => {
  const h = code('app/history/page.tsx');
  must(/searchParams/.test(h), '[C10] l’historique porte des filtres dans l’URL');
  must(/activeType|activeCompetency/.test(h), '[C10] au moins deux axes de filtre');
  must(!/navigation|pageview|visite/i.test(code('lib/learner-history.mjs')),
    '[C10] l’historique reste factuel : aucun événement de navigation');
}, '[C10] historique utile');

// ── C11. La révision ne fait jamais progresser une compétence ────────────
safe(() => {
  const r = makeEvidence({
    sourceType: 'review', sourceId: 'day-1-2026-01-01', competencyIds: ['algo'],
    title: 'Révision', validation: { status: 'passed', kind: 'exercise-tests', detail: 'x' },
    provenance: { producer: 'review-engine', method: 'spaced-repetition', note: 'x' },
  }, { now: '2026-01-01T00:00:00.000Z' });
  must(r.ok === false && r.code === 'UNQUALIFIABLE_SOURCE',
    '[C11] une révision ne peut pas porter une validation réussie',
    JSON.stringify(r).slice(0, 120));

  const nr = makeEvidence({
    sourceType: 'review', sourceId: 'day-1-2026-01-01', competencyIds: ['algo'],
    title: 'Révision', validation: null,
    provenance: { producer: 'review-engine', method: 'spaced-repetition', note: 'x' },
  }, { now: '2026-01-01T00:00:00.000Z' });
  must(nr.ok && !isQualifying(nr.evidence),
    '[C11] une révision produit une trace NON qualifiante');
  const c = projectCompetencies([{ id: 'algo', name: 'Algo' }], createLedger([nr.evidence]))[0];
  must(c.state === 'practiced' && c.qualifyingEvidenceCount === 0,
    '[C11] une révision seule ne démontre rien');

  // Invariant 25, RETARGETÉ EN V66 — et il faut dire pourquoi, sinon cette
  // ligne ressemble à un assouplissement de confort.
  //
  // En V65.1, la règle interdisait TOUT second moteur de répétition espacée :
  // le Retention Engine n'était pas autorisé, et la tentation de le commencer
  // « en passant » était réelle. Le sprint V66 l'autorise explicitement et le
  // construit. La règle ne disparaît donc pas : elle protège désormais ce
  // qu'elle protégeait vraiment — qu'il n'existe pas TROIS moteurs, ni un
  // quatrième qui se glisserait sous un autre nom.
  //
  // Deux moteurs sont admis, nommément, et aucun autre :
  //   lib/review.mjs     — planifie une JOURNÉE depuis la compréhension déclarée ;
  //   lib/retention.mjs  — planifie un CONCEPT depuis des tentatives réelles.
  // Leur étanchéité est vérifiée séparément par la règle R11 de `v66:check`.
  const MOTEURS_AUTORISES = new Set(['lib/review.mjs', 'lib/retention.mjs', 'lib/retention.d.ts', 'lib/retention-server.ts']);
  const extra = walk('lib')
    .filter((f) => /sm-?2|spaced|retention/i.test(f) && !MOTEURS_AUTORISES.has(f));
  must(extra.length === 0,
    '[C11] aucun TROISIÈME moteur de répétition espacée',
    extra.join(', '));
}, '[C11] pont révision');

// ── C12. Idempotence et dédoublonnage par CLÉ MÉTIER ─────────────────────
safe(() => {
  const base = makeEvidence({
    sourceType: 'exercise', sourceId: 'dup', competencyIds: ['algo'], title: 'Dup',
    validation: { status: 'passed', kind: 'exercise-tests', detail: 'ok' },
    provenance: { producer: 'gate', method: 'stub', note: 'x' },
  }, { now: '2026-01-01T00:00:00.000Z' }).evidence;

  // CE QUE SEULE LA CLÉ MÉTIER ATTRAPE : même fait, AUTRE identifiant. Sans ce
  // cas, la garde par `id` suffit et la règle ne mesure rien.
  const twin = makeEvidence({
    id: 'venu-dailleurs',
    sourceType: 'exercise', sourceId: 'dup', competencyIds: ['algo'], title: 'Dup (rejoué)',
    validation: { status: 'passed', kind: 'exercise-tests', detail: 'ok' },
    provenance: { producer: 'gate', method: 'stub', note: 'x' },
  }, { now: '2026-02-02T00:00:00.000Z' }).evidence;
  must(twin.id !== base.id, '[C12] préalable : les identifiants diffèrent');
  must(evidenceKey(twin) === evidenceKey(base), '[C12] même fait métier, même clé');
  const dup = appendEvidence([base], twin);
  must(dup.added === false && dup.reason === 'DUPLICATE',
    '[C12] le doublon est refusé PAR LA CLÉ MÉTIER', JSON.stringify(dup.reason));

  // Et l'inverse : un échec puis une réussite sont DEUX faits.
  const failed = makeEvidence({
    sourceType: 'exercise', sourceId: 'retry', competencyIds: ['algo'], title: 'Raté',
    validation: { status: 'failed', kind: 'exercise-tests', detail: '1/4' },
    provenance: { producer: 'gate', method: 'stub', note: 'x' },
  }, { now: '2026-01-01T00:00:00.000Z' }).evidence;
  const passed = makeEvidence({
    sourceType: 'exercise', sourceId: 'retry', competencyIds: ['algo'], title: 'Réussi',
    validation: { status: 'passed', kind: 'exercise-tests', detail: '4/4' },
    provenance: { producer: 'gate', method: 'stub', note: 'x' },
  }, { now: '2026-01-01T01:00:00.000Z' }).evidence;
  must(failed.id !== passed.id,
    '[C12] un échec et une réussite ne partagent pas d’identifiant',
    'sinon la garde d’unicité rejette la RÉUSSITE (régression mesurée au CP12)');
  const a = appendEvidence([failed], passed);
  must(a.added === true, '[C12] une réussite après un échec entre au ledger');
  must(deterministicId('exercise', 'x', true) !== deterministicId('exercise', 'x', false),
    '[C12] l’identifiant déterministe porte le discriminant qualifiant');
}, '[C12] idempotence');

// ── C15. Les gates mesurent, et la taxonomie ne devine pas ───────────────
safe(() => {
  must(programSkill('quantum-blockchain') === null,
    '[C15] la taxonomie ne devine jamais une compétence inconnue');
  const pkg = JSON.parse(read('package.json'));
  must(typeof pkg.scripts['v651:check'] === 'string',
    '[C15] v651:check est déclaré');
  must(pkg.scripts['gates:active'].includes('v651:check'),
    '[C15] v651:check est branché sur gates:active');
}, '[C15] gates');

// ── C17. Aucune gamification ─────────────────────────────────────────────
safe(() => {
  const BAD = /\b(xp|leaderboard|classement|badge de mérite|points gagnés|streak)\b/i;
  const NEG = /(aucun|sans|pas d|jamais|interdit|anti-|ni )/i;
  const offenders = [];
  for (const f of [...walk('lib'), ...walk('app')].filter((x) => /\.(mjs|ts|tsx)$/.test(x))) {
    for (const [i, l] of code(f).split('\n').entries()) {
      if (BAD.test(l) && !NEG.test(l)) offenders.push(`${f}:${i + 1}`);
    }
  }
  must(offenders.length === 0, '[C17] aucune mécanique de gamification', offenders.slice(0, 5).join(', '));
}, '[C17] anti-gamification');

console.log(`── v651:check — ${ok.length} vérifications passées`);
if (errors.length) {
  console.error(`\n❌ v651:check : ${errors.length} régression(s)\n`);
  for (const e of errors) console.error(`  • ${e}`);
  process.exit(1);
}
console.log('\n✅ V65.1 valide : une seule source de vérité, décomptes honnêtes, vocabulaire unique, explication déterministe, projection reconstructible, détail par compétence, évaluations convergentes, historique filtrable, révision non qualifiante, dédoublonnage par clé métier, aucune gamification.');
