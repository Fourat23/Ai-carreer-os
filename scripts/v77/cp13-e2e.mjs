// V77 · CP13 — TRAVERSER DES CHAÎNES COMPLÈTES, SUR LE PRODUIT QUI TOURNE.
//
// ── POURQUOI CE CHECKPOINT EXISTE ───────────────────────────────────────
//
// Les onze checkpoints précédents ont chacun mesuré leur propre surface. Un
// produit n'est pourtant pas une somme de surfaces : le défaut décisif du CP0
// (`A13`) vivait ENTRE deux d'entre elles, et aucune mesure locale ne l'aurait
// trouvé.
//
// Ce script traverse des chaînes de bout en bout **en HTTP**, sur le produit
// reconstruit, et regarde ce que chacune écrit — **et ce qu'elle n'écrit pas**.
//
// ── LA RÈGLE, ET ELLE EST INHABITUELLE ──────────────────────────────────
//
// **`N/A` et `NO_FACT` sont des réponses VALIDES.** Une chaîne qui n'écrit rien
// est constatée telle quelle. Réparer une chaîne muette pour que le tableau
// soit plein serait exactement le piège que V77 passe son temps à éviter.
//
// Usage :  node scripts/v77/cp13-e2e.mjs [--json]   (serveur attendu sur $BASE)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.AICOS_BASE ?? 'http://127.0.0.1:3190';
const PROG = process.env.AICOS_PROGRESS_FILE;

const post = async (chemin, corps) => {
  const r = await fetch(`${BASE}${chemin}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(corps),
  });
  let json = null;
  try { json = await r.json(); } catch { /* réponse non JSON : on garde le statut */ }
  return { status: r.status, json };
};
const get = async (chemin) => {
  const r = await fetch(`${BASE}${chemin}`);
  try { return { status: r.status, json: await r.json() }; } catch { return { status: r.status, json: null }; }
};

/** L'état écrit, lu par l'EXPORT du produit — pas par le fichier sur disque. */
async function etat() {
  const { json } = await get('/api/progress/export');
  const t = json?.progress?.tracks?.[json.progress.activeTrackId] ?? {};
  const n = (k) => (Array.isArray(t[k]) ? t[k].length : 0);
  return {
    evidence: n('evidence'),
    evidenceQualifiantes: (t.evidence ?? []).filter((e) => e?.validation?.status === 'passed'
      && ['exercise', 'assessment', 'capstone', 'transfer-challenge'].includes(e.sourceType)
      && e.evidenceLevel === 'VALIDATED').length,
    exerciseAttempts: n('exerciseAttempts'),
    assessmentAttempts: n('assessmentAttempts'),
    missionSubmissions: n('missionSubmissions'),
    artifactAnalyses: n('artifactAnalyses'),
    usageEvents: n('usageEvents'),
    transferAttempts: n('transferAttempts'),
    recallAttempts: n('recallAttempts'),
    hintViews: n('hintViews'),
    _preuves: (t.evidence ?? []).map((e) => `${e.sourceType}:${e.sourceId} ${e.validation?.status}/${e.validation?.kind} ${e.evidenceLevel}`),
  };
}

const delta = (a, b) => Object.fromEntries(
  Object.keys(b).filter((k) => !k.startsWith('_')).map((k) => [k, b[k] - a[k]]).filter(([, v]) => v !== 0),
);

const chaines = [];
const raconter = (nom, question, avant, apres, attendu, note) => chaines.push({
  nom, question, ecrit: delta(avant, apres), attendu, note,
  preuves: apres._preuves.filter((p) => !avant._preuves.includes(p)),
});

async function reset() { await post('/api/progress/reset', {}); }

// ── C1 · EXERCICE → MISSION → COMPÉTENCE ────────────────────────────────
//
// La chaîne du défaut `A13`. Un exercice résolu valide le livrable `auto` d'une
// mission ; la mission se termine sur une revue auto-signée.
async function c1() {
  await reset();
  const a = await etat();
  // Le corrigé n'est JAMAIS servi par l'API — c'est une garantie de V76, et la
  // sonde ne doit pas la contourner par une route. Elle lit donc la fixture
  // depuis le disque, comme un auteur le ferait.
  const fixture = JSON.parse(readFileSync(join(process.cwd(), 'data', 'exercises', 'cicd-env-promotion.json'), 'utf8'));
  await post('/api/lab/cicd-env-promotion', { action: 'run', files: fixture.reference ?? {} });
  await post('/api/missions/cicd-blocked-delivery', { action: 'start' });
  await post('/api/missions/cicd-blocked-delivery', {
    action: 'submit-doc',
    deliverableId: 'runbook',
    content: '## Pré-requis\nx\n## Déploiement\nartefact\n## Vérification\nx\n## Rollback\nrollback\n## Approbation\napprobation\n'.repeat(4),
  });
  await post('/api/missions/cicd-blocked-delivery', { action: 'self-assess', deliverableId: 'self-review', selfAssessment: { fait: true } });
  await post('/api/missions/cicd-blocked-delivery', { action: 'validate-review', deliverableId: 'self-review' });
  const b = await etat();
  raconter('C1 · exercice → mission → compétence',
    'une production, combien de crédits ?', a, b,
    'UNE preuve qualifiante (l’exercice), une preuve de mission NON qualifiante',
    'la chaîne du défaut A13 du CP0');
}

// ── C2 · DIAGNOSTIC ÉCHOUÉ PUIS RÉUSSI ──────────────────────────────────
async function c2() {
  await reset();
  const a = await etat();
  await post('/api/assessments/async-messaging-queues', { record: true, responses: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 } });
  await new Promise((r) => setTimeout(r, 11000));
  await post('/api/assessments/async-messaging-queues', { record: true, responses: { q1: 1, q2: 1, q3: [0, 1, 3], q4: 1, q5: 1 } });
  const b = await etat();
  raconter('C2 · diagnostic échoué puis réussi',
    'la courbe est-elle conservée ?', a, b,
    'DEUX tentatives, deux preuves (échec + réussite)',
    'avant le CP4 : une seule trace, celle de l’échec');
}

// ── C3 · CAPSTONE ───────────────────────────────────────────────────────
async function c3() {
  await reset();
  const a = await etat();
  // Même règle qu'en C1 : le corrigé vit dans la fixture, pas dans une réponse
  // d'API. La sonde le lit sur le disque plutôt que d'ouvrir une porte.
  const c = JSON.parse(readFileSync(join(process.cwd(), 'data', 'capstones', 'agent-tool-loop-incident.json'), 'utf8'));
  const responses = {};
  for (const ph of c.phases ?? []) for (const q of ph.questions ?? []) if (q.answer !== undefined) responses[q.id] = q.answer;
  await post('/api/capstones/agent-tool-loop-incident', { record: true, responses });
  const b = await etat();
  raconter('C3 · capstone corrigé par le serveur',
    'est-il enfin archivé pour ce qu’il est ?', a, b,
    'une tentative + une preuve `capstone-grade` VALIDATED, simulation: true',
    'avant le CP6 : archivé `self`, donc une auto-déclaration');
}

// ── C4 · ARTEFACT POSTÉ, PUIS REPRIS ────────────────────────────────────
async function c4() {
  await reset();
  const a = await etat();
  await post('/api/kubernetes/broken-service', { action: 'analyze' }); // SANS artefact
  const milieu = await etat();
  const base = await get('/api/kubernetes/broken-service');
  const manifest = base.json?.manifest ?? null;
  if (manifest) {
    const v1 = { ...manifest };
    await post('/api/kubernetes/broken-service', { action: 'analyze', manifest: v1 });
    const v2 = JSON.parse(JSON.stringify(v1));
    for (const r of v2.resources ?? []) if (r.kind === 'Deployment') { r.spec = { ...(r.spec ?? {}), replicas: 3 }; }
    await post('/api/kubernetes/broken-service', { action: 'analyze', manifest: v2 });
  }
  const b = await etat();
  chaines.push({
    nom: 'C4 · artefact : sans, puis posté, puis repris',
    question: 'analyser la fixture compte-t-il comme un travail ?',
    ecritSansArtefact: delta(a, milieu),
    ecrit: delta(milieu, b),
    attendu: 'RIEN sans artefact · DEUX analyses ensuite (deux versions)',
    note: 'la garde la plus facile à perdre du CP7',
    preuves: [],
  });
}

// ── C5 · TERMINAL ET PIPELINES ──────────────────────────────────────────
async function c5() {
  await reset();
  const a = await etat();
  await post('/api/terminal/term-list-files', { action: 'run', args: { format: '-la' } });
  const p = await post('/api/pipelines/deploy-staging', { action: 'run', event: { kind: 'manual' }, approved: true });
  const b = await etat();
  raconter('C5 · terminal + pipelines',
    'un usage produit-il une preuve ?', a, b,
    'DEUX usages, ZÉRO preuve, ZÉRO fait pédagogique',
    `le pipeline a rendu « ${p.json?.run?.status ?? '?'} », et le fait ne le porte pas`);
}

// ── C6 · UNE CHAÎNE QUI N'ÉCRIT RIEN, ET C'EST LA RÉPONSE ───────────────
async function c6() {
  await reset();
  const a = await etat();
  await get('/api/kubernetes/broken-service');
  await post('/api/kubernetes/broken-service', { action: 'reset' });
  await post('/api/security/leaked-secret-config', { action: 'remediate' });
  await post('/api/terminal/term-list-files', { action: 'availability' });
  const b = await etat();
  raconter('C6 · consulter, réinitialiser, demander le corrigé',
    'que reste-t-il d’une consultation ?', a, b,
    'RIEN — et c’est une réponse VALIDE',
    'ouvrir une page n’est pas un fait de travail ; `remediate` rend la correction DU PRODUIT');
}

await c1(); await c2(); await c3(); await c4(); await c5(); await c6();
await reset();

const rapport = { generatedAt: new Date().toISOString(), base: BASE, progressFile: PROG ?? null, chaines };

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(rapport, null, 1));
} else {
  console.log('\n── V77 · CP13 — CHAÎNES TRAVERSÉES DE BOUT EN BOUT (HTTP réel)\n');
  for (const c of chaines) {
    console.log(`  ${c.nom}`);
    console.log(`     question : ${c.question}`);
    if (c.ecritSansArtefact !== undefined) {
      console.log(`     sans artefact → ${JSON.stringify(c.ecritSansArtefact)}`);
    }
    console.log(`     écrit    : ${Object.keys(c.ecrit).length ? JSON.stringify(c.ecrit) : 'RIEN'}`);
    for (const p of c.preuves) console.log(`       preuve : ${p}`);
    console.log(`     attendu  : ${c.attendu}`);
    console.log(`     note     : ${c.note}\n`);
  }
}
