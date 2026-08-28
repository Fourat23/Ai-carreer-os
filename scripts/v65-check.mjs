// Gate v65:check — protège les invariants du moteur Compétence / Preuve /
// Historique (contrat docs/V65-COMPETENCY-EVIDENCE-CONTRACT.md).
//
// Deux natures de vérification :
//   • STRUCTURELLES — lecture du code, pour empêcher qu'un raccourci revienne ;
//   • COMPORTEMENTALES — exécution du modèle pur, pour vérifier les RÈGLES.
//
// Chaque règle doit avoir été VUE ÉCHOUER. C'est le cinquième sprint consécutif
// où le test négatif trouve un trou dans un gate neuf ; la discipline tient.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { makeEvidence, isQualifying, appendEvidence, evidenceKey } from '../lib/evidence.mjs';
import { createLedger, projectCompetency, whyCompetencyState, competencyStateFrom } from '../lib/competency.mjs';
import { buildHistory, HISTORY_EVENT_TYPES } from '../lib/learner-history.mjs';
import { applyCommand } from '../lib/learning-engine.mjs';
import { programSkill } from '../lib/skill-taxonomy.mjs';

const ROOT = process.cwd();
const readf = (p) => readFileSync(join(ROOT, p), 'utf8');
// Un gate qui lit les COMMENTAIRES est un gate qu'un commentaire peut tromper
// (trou trouvé en V64). On ne regarde que le code exécutable.
const code = (p) => readf(p)
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .split('\n').map((l) => l.replace(/(^|[^:'"`\\])\/\/.*$/, '$1')).join('\n');

const errors = [];
const ok = [];
const must = (cond, name, detail = '') => {
  if (cond) ok.push(name); else errors.push(`${name}${detail ? ` — ${detail}` : ''}`);
};

const T1 = '2026-03-01T09:00:00.000Z';
const T2 = '2026-03-02T09:00:00.000Z';
const emptyProgress = () => ({ startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {}, evidence: [] });
/** Appel protégé : un modèle qui PLANTE doit être rapporté, pas propager. */
const safeCall = (fn, label) => {
  try { return fn(); } catch (e) { errors.push(`${label} — le modèle a levé : ${e.message}`); return { ok: false, crashed: true }; }
};

const mk = (over = {}) => makeEvidence({
  sourceType: 'exercise', sourceId: 'ex-1', competencyIds: ['jsts'],
  provenance: { producer: 'gate' },
  validation: { status: 'passed', kind: 'exercise-tests', checkedAt: T1 },
  ...over,
}, { now: over.now ?? T1 });

// ── 1. EVIDENCE_REQUIRES_PROVENANCE ───────────────────────────────────────
{
  const noProv = safeCall(() => mk({ provenance: null }), '[EVIDENCE_REQUIRES_PROVENANCE] provenance absente');
  must(noProv.ok === false, '[EVIDENCE_REQUIRES_PROVENANCE] une preuve sans provenance est refusée');
  const emptyProv = safeCall(() => mk({ provenance: {} }), '[EVIDENCE_REQUIRES_PROVENANCE] provenance vide');
  must(emptyProv.ok === false, '[EVIDENCE_REQUIRES_PROVENANCE] une provenance sans producteur est refusée');
  must(mk().ok === true && !!mk().evidence.provenance.producer, '[EVIDENCE_REQUIRES_PROVENANCE] une preuve valide porte son producteur');
}

// ── 2. EVIDENCE_DEDUPLICATED ──────────────────────────────────────────────
{
  const a = mk().evidence;
  const b = mk({ now: T2 }).evidence; // horloge différente, même fait
  const list = appendEvidence([], a).evidence;
  const second = appendEvidence(list, b);
  must(second.added === false && second.evidence.length === 1,
    '[EVIDENCE_DEDUPLICATED] rejouer le même fait ne crée pas de doublon', `${second.evidence.length} preuve(s)`);
  must(evidenceKey(a) === evidenceKey(b), '[EVIDENCE_DEDUPLICATED] la clé métier ignore l’horodatage');

  // TROU TROUVÉ AU TEST NÉGATIF (N2) : supprimer la déduplication par CLÉ MÉTIER
  // laissait le gate vert, parce qu'un second garde-fou déduplique par
  // identifiant — et les deux preuves partageaient le même id déterministe.
  // On teste donc explicitement le cas que SEULE la clé métier attrape :
  // même fait, identifiants différents.
  const renamed = { ...a, id: 'ev-autre-identifiant' };
  const third = appendEvidence(list, renamed);
  must(third.added === false && third.evidence.length === 1,
    '[EVIDENCE_DEDUPLICATED] un même fait sous un autre identifiant est refusé', `${third.evidence.length} preuve(s)`);
}

// ── 3. UNKNOWN_COMPETENCY_REJECTED ────────────────────────────────────────
{
  must(mk({ competencyIds: ['quantum-blockchain'] }).ok === false,
    '[UNKNOWN_COMPETENCY_REJECTED] une compétence inconnue est refusée');
  must(mk({ competencyIds: [] }).ok === false,
    '[UNKNOWN_COMPETENCY_REJECTED] une preuve sans compétence est refusée');
  must(programSkill('quantum-blockchain') === null,
    '[UNKNOWN_COMPETENCY_REJECTED] la taxonomie ne devine jamais un identifiant');
  const r = applyCommand(
    applyCommand(emptyProgress(), { type: 'START', day: 1 }, { now: T1 }).progress,
    { type: 'SUBMIT', day: 1, stepId: 's', content: 'x', skills: ['quantum-blockchain'] }, { now: T1 },
  );
  must(r.ok === false && r.code === 'UNKNOWN_COMPETENCY',
    '[UNKNOWN_COMPETENCY_REJECTED] la commande entière échoue, rien n’est écrit', r.code ?? 'acceptée');
}

// ── 4. SKILL_STATE_IS_PROJECTED ───────────────────────────────────────────
{
  const src = code('lib/competency.mjs');
  must(!/node:fs|writeFileSync|readFileSync/.test(src), '[SKILL_STATE_IS_PROJECTED] la projection ne fait aucune I/O');
  must(!/new Date\(\)/.test(src), '[SKILL_STATE_IS_PROJECTED] la projection n’a pas d’horloge propre');
  // Reconstructibilité : effacer tout et rejouer depuis les seules preuves.
  const evs = [mk().evidence, mk({ sourceId: 'ex-2', now: T2 }).evidence];
  const a = projectCompetency('jsts', createLedger(evs).getEvidenceBySkill('jsts'));
  const b = projectCompetency('jsts', createLedger([...evs].reverse()).getEvidenceBySkill('jsts'));
  must(JSON.stringify(a) === JSON.stringify(b),
    '[SKILL_STATE_IS_PROJECTED] la projection est déterministe et reconstructible');
}

// ── 5. NAVIGATION_DOES_NOT_CREATE_EVIDENCE ────────────────────────────────
{
  // Aucune page ne peut fabriquer une preuve : `makeEvidence` n'est appelé que
  // par le serveur (routes API + modèles), jamais depuis un composant client.
  const clientOffenders = [];
  (function walk(dir) {
    for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
      const p = `${dir}/${e.name}`;
      if (e.isDirectory()) { walk(p); continue; }
      if (!/\.tsx?$/.test(e.name)) continue;
      const src = code(p);
      if (/^'use client'|^"use client"/m.test(src) && /makeEvidence|appendEvidence/.test(src)) clientOffenders.push(p);
    }
  })('app');
  must(clientOffenders.length === 0,
    '[NAVIGATION_DOES_NOT_CREATE_EVIDENCE] aucun composant client ne fabrique de preuve', clientOffenders.join(', '));

  // Une lecture pure ne mute rien : les read-models n'écrivent jamais.
  const rm = code('lib/learner-read-models.ts');
  must(!/writeProgress|applyCommand/.test(rm),
    '[NAVIGATION_DOES_NOT_CREATE_EVIDENCE] les read-models ne mutent jamais la progression');
  const hist = code('lib/learner-history.mjs');
  must(!/writeProgress|new Date\(\)/.test(hist),
    '[NAVIGATION_DOES_NOT_CREATE_EVIDENCE] l’historique est une projection sans écriture ni horloge');
}

// ── 6. COMPLETE_IS_IDEMPOTENT ─────────────────────────────────────────────
{
  let p = applyCommand(emptyProgress(), { type: 'START', day: 5 }, { now: T1 }).progress;
  const first = applyCommand(p, { type: 'COMPLETE', day: 5 }, { now: T1 });
  const second = applyCommand(first.progress, { type: 'COMPLETE', day: 5 }, { now: T2 });
  must(second.ok === true && second.effects.some((e) => e.startsWith('noop:')),
    '[COMPLETE_IS_IDEMPOTENT] un second COMPLETE est un no-op');
  must(JSON.stringify(second.progress) === JSON.stringify(first.progress),
    '[COMPLETE_IS_IDEMPOTENT] la progression est strictement identique');
  const route = code('app/api/progress/route.ts');
  must(/noop:/.test(route), '[COMPLETE_IS_IDEMPOTENT] la route n’écrit pas sur un no-op');
}

// ── 7. DIAGNOSTIC_DOES_NOT_REQUIRE_FAKE_DAY ───────────────────────────────
{
  const r = makeEvidence({
    sourceType: 'assessment', sourceId: 'diag-http', competencyIds: ['http'],
    provenance: { producer: 'assessment-grader' },
    validation: { status: 'passed', kind: 'assessment-grade', checkedAt: T1 },
  }, { now: T1 });
  must(r.ok === true && r.evidence.dayId === null,
    '[DIAGNOSTIC_DOES_NOT_REQUIRE_FAKE_DAY] un diagnostic existe sans journée', String(r.evidence?.dayId));
  const route = code('app/api/assessments/[id]/route.ts');
  must(!/openSessions/.test(route),
    '[DIAGNOSTIC_DOES_NOT_REQUIRE_FAKE_DAY] la route n’emprunte plus une session ouverte');
}

// ── 8. HISTORY_IS_FACT_BASED ──────────────────────────────────────────────
{
  const banned = /(PAGE_VIEW|NAVIGATION|ROUTE_CHANGE|SCROLL|FOCUS|VISIT)/;
  must(!HISTORY_EVENT_TYPES.some((t) => banned.test(t)),
    '[HISTORY_IS_FACT_BASED] aucun type d’événement de navigation', HISTORY_EVENT_TYPES.join(','));
  const events = buildHistory({
    days: { '3': { status: 'done', session: { state: 'completed', startedAt: T1, completedAt: T2, lastActiveAt: T2, reopenCount: 0, steps: {} } } },
    evidence: [mk().evidence],
  });
  must(events.length === 3, '[HISTORY_IS_FACT_BASED] un fait persisté = un événement', `${events.length} événement(s)`);
  must(events.every((e) => typeof e.at === 'string' && !Number.isNaN(new Date(e.at).getTime())),
    '[HISTORY_IS_FACT_BASED] tout événement porte un horodatage réel');
  // Une journée jamais commencée ne produit AUCUN événement.
  must(buildHistory({ days: { '9': { status: 'not-started' } }, evidence: [] }).length === 0,
    '[HISTORY_IS_FACT_BASED] une journée non commencée ne raconte rien');
}

// ── 9. NO_DUPLICATE_HISTORY_EVENT ─────────────────────────────────────────
{
  const progress = {
    days: { '3': { status: 'done', session: { state: 'completed', startedAt: T1, completedAt: T2, lastActiveAt: T2, reopenCount: 0, steps: {} } } },
    evidence: [mk().evidence],
  };
  const a = buildHistory(progress);
  const b = buildHistory(progress);
  must(JSON.stringify(a) === JSON.stringify(b), '[NO_DUPLICATE_HISTORY_EVENT] l’historique est déterministe');
  const keys = a.map((e) => `${e.type}|${e.at}|${e.dayId}|${e.evidenceId ?? ''}`);
  must(new Set(keys).size === keys.length, '[NO_DUPLICATE_HISTORY_EVENT] aucun doublon');
}

// ── 10. REVIEW_PRODUCES_EVIDENCE ──────────────────────────────────────────
{
  let p = applyCommand(emptyProgress(), { type: 'START', day: 14 }, { now: T1 }).progress;
  p = applyCommand(p, { type: 'COMPLETE', day: 14 }, { now: T1 }).progress;
  const r = applyCommand(p, { type: 'SET_COMPREHENSION', day: 14, value: 'partial', skills: ['gitlinux'] }, { now: T1 });
  const ev = (r.progress?.evidence ?? []).find((e) => e.sourceType === 'review');
  must(!!ev, '[REVIEW_PRODUCES_EVIDENCE] une révision produit une preuve');
  must(ev && isQualifying(ev) === false,
    '[REVIEW_PRODUCES_EVIDENCE] une preuve de révision n’est JAMAIS qualifiante');
  // TROU TROUVÉ AU TEST NÉGATIF (N9) : l'invariant tenait par DEUX mécanismes
  // indépendants (le type hors de l'ensemble qualifiant, ET l'absence de
  // validation). Casser l'un laissait l'autre le protéger, donc le gate restait
  // vert. On teste maintenant les deux séparément.
  must(ev && ev.validation === null,
    '[REVIEW_PRODUCES_EVIDENCE] le moteur n’attache aucune validation à une révision');
  must(makeEvidence({
    sourceType: 'review', sourceId: 'r1', competencyIds: ['jsts'],
    provenance: { producer: 'gate' },
    validation: { status: 'passed', kind: 'self' },
  }, { now: T1 }).ok === false,
    '[REVIEW_PRODUCES_EVIDENCE] une révision ne peut pas se déclarer réussie');
  const proj = projectCompetency('gitlinux', createLedger(r.progress.evidence).getEvidenceBySkill('gitlinux'));
  must(proj.state === 'practiced',
    '[REVIEW_PRODUCES_EVIDENCE] réviser ne démontre pas une compétence', proj.state);
}

// ── 11. NO_DIRECT_SKILL_MUTATION ──────────────────────────────────────────
{
  // TROU TROUVÉ AU TEST NÉGATIF (N5) : la vérification cherchait le NOM de la
  // variable (`skills[...]=`). Une écriture via une variable nommée autrement
  // passait. On vérifie désormais ce qui compte : ces modules ne RENVOIENT
  // jamais de carte `skills`, quelle que soit la variable qui la porte.
  for (const f of ['lib/lab-progress.mjs', 'lib/mission-state.mjs']) {
    const src = code(f);
    must(!/\breturn\b[^;]*\{[^}]*\bskills\b\s*[,:}]/s.test(src),
      `[NO_DIRECT_SKILL_MUTATION] ${f} ne renvoie aucune carte de niveaux`);
    must(!/\bskills\b\s*:\s*\w+\s*[,}]/.test(src.split('return').slice(1).join('return')),
      `[NO_DIRECT_SKILL_MUTATION] ${f} n’écrit aucun niveau de compétence`);
  }
  // La projection ne lit JAMAIS progress.skills : l'auto-évaluation déclarée
  // ne peut donc pas se faire passer pour un état.
  must(!/progress\.skills|\.skills\[/.test(code('lib/competency.mjs')),
    '[NO_DIRECT_SKILL_MUTATION] la projection ignore l’auto-évaluation déclarée');
  must(!/skillStats/.test(code('app/skills/page.tsx')),
    '[NO_DIRECT_SKILL_MUTATION] /skills ne consomme plus l’ancien modèle mutable');
}

// ── 12. EMPTY_STATE_IS_NOT_ZERO_MASTERY ───────────────────────────────────
{
  const led = createLedger([]);
  const proj = projectCompetency('rag', led.getEvidenceBySkill('rag'));
  must(proj.state === 'unassessed' && proj.evidenceCount === 0,
    '[EMPTY_STATE_IS_NOT_ZERO_MASTERY] sans preuve, l’état est « non évaluée »', proj.state);
  const why = whyCompetencyState(proj, led);
  must(/Aucune preuve/i.test(why.facts.join(' ')),
    '[EMPTY_STATE_IS_NOT_ZERO_MASTERY] le produit dit « aucune preuve », pas « 0 »');
  const page = code('app/skills/page.tsx');
  must(/Aucune preuve enregistrée/.test(page),
    '[EMPTY_STATE_IS_NOT_ZERO_MASTERY] /skills porte un état vide honnête');
  must(!/0\s*%|0\s*\/\s*5/.test(page),
    '[EMPTY_STATE_IS_NOT_ZERO_MASTERY] /skills n’affiche aucun « 0 % » ni « 0/5 »');
}

// ── 13. NO_FAKE_PERCENTAGE_MASTERY ────────────────────────────────────────
{
  const banned = /\b(XP|streak|leaderboard|maîtrise\s*\d+\s*%|mastery\s*\d+|confetti|confettis)\b/i;
  const files = ['lib/competency.mjs', 'lib/evidence.mjs', 'lib/learner-history.mjs',
                 'app/skills/page.tsx', 'app/skills/SkillsBoard.tsx', 'app/history/page.tsx'];
  const hits = files.filter((f) => banned.test(code(f)));
  must(hits.length === 0, '[NO_FAKE_PERCENTAGE_MASTERY] aucune métrique de jeu ni pourcentage de maîtrise', hits.join(', '));
  // Aucun calcul de pourcentage de compétence dans les surfaces.
  const pct = files.filter((f) => /\/\s*totalCount\s*\)\s*\*\s*100|Math\.round\([^)]*\*\s*100\s*\)/.test(code(f)));
  must(pct.length === 0, '[NO_FAKE_PERCENTAGE_MASTERY] aucun pourcentage calculé sur les compétences', pct.join(', '));
}

// ── 14. NO_SECOND_SOURCE_OF_TRUTH ─────────────────────────────────────────
{
  // Le registre est écrit par le moteur et les modèles serveurs — pas ailleurs.
  const writers = [];
  (function walk(dir) {
    for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
      const p = `${dir}/${e.name}`;
      if (e.isDirectory()) { walk(p); continue; }
      if (!/\.tsx?$/.test(e.name)) continue;
      if (/evidence\s*:\s*\[/.test(code(p)) && !/route\.ts$/.test(p)) writers.push(p);
    }
  })('app');
  must(writers.length === 0, '[NO_SECOND_SOURCE_OF_TRUTH] aucune page ne compose un registre', writers.join(', '));

  // Une seule règle de qualification, dans un seul module.
  const qualifiers = ['lib/competency.mjs', 'lib/learner-history.mjs', 'lib/learner-read-models.ts']
    .filter((f) => /status\s*===\s*'passed'/.test(code(f)));
  must(qualifiers.length === 0,
    '[NO_SECOND_SOURCE_OF_TRUTH] la règle de qualification n’est réimplémentée nulle part', qualifiers.join(', '));

  // La machine à états est exhaustive et vit à un seul endroit.
  must(competencyStateFrom({ qualifying: [], nonQualifying: [] }) === 'unassessed'
    && competencyStateFrom({ qualifying: [], nonQualifying: [{}] }) === 'practiced',
    '[NO_SECOND_SOURCE_OF_TRUTH] la machine à états répond depuis un seul module');
}

// ── 15. Artefacts du sprint ───────────────────────────────────────────────
{
  for (const f of [
    'docs/V65-COMPETENCY-EVIDENCE-CONTRACT.md',
    'docs/audits/V65-CP0-AUDIT.md',
    'docs/audits/v65/cp1-before.json',
    'lib/evidence.mjs', 'lib/evidence.d.ts',
    'lib/competency.mjs', 'lib/competency.d.ts',
    'lib/learner-history.mjs', 'lib/learner-read-models.ts',
    'app/history/page.tsx',
    'tests/v65-evidence.test.mjs',
  ]) must(existsSync(join(ROOT, f)), `[artefacts] ${f} présent`);
}

console.log(`── v65:check — ${ok.length} vérifications passées`);
if (errors.length) {
  console.error(`\n❌ v65:check : ${errors.length} régression(s)\n`);
  for (const e of errors) console.error(`  • ${e}`);
  process.exit(1);
}
console.log('\n✅ V65 valide : preuve avec provenance et dédup, compétence inconnue rejetée, état projeté et reconstructible, navigation sans preuve, COMPLETE idempotent, diagnostic sans journée d’emprunt, historique factuel, révision produisant une preuve, aucune mutation directe de compétence, état vide honnête, aucun pourcentage de maîtrise, aucune seconde source de vérité.');
