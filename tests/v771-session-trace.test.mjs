// V77.1 · CP4 — LE RECONSTRUCTEUR, MIS À L'ÉPREUVE.
//
// Un reconstructeur indulgent mesurerait sa propre indulgence. Ces tests lui
// donnent des archives ABÎMÉES et vérifient qu'il DIT ce qui manque, au lieu de
// combler. Chaque cas correspond à une façon crédible dont une trace réelle se
// dégrade : un fait perdu, un instant absent, un producteur muet, deux faits à
// la même seconde, un concept de trop, une version de protocole qui ne
// correspond pas.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  reconstruireLaSession, delaiEnHeures, verdictDuDelai, resultatDuFait,
  instantDuFait, cleDuFait, parcoursDeLArchive, GENRES_DE_MANQUE, CODES_DE_DONNEE_MANQUANTE,
} from '../lib/session-trace.mjs';

const FIXTURE = JSON.parse(readFileSync('data/pilot/v78-pilot-1.json', 'utf8'));
const PROV = { producer: 'recall-station', method: 'auto-report', note: '' };

/** Une archive complète et saine, celle qu'une session parfaite produirait. */
function archiveSaine() {
  const t = (s) => `2026-03-01T10:00:${String(s).padStart(2, '0')}.000Z`;
  return {
    exportedAt: t(59),
    session: { sessionId: 'S1', protocolVersion: FIXTURE.protocolVersion, scopeId: FIXTURE.scopeId, portee: 'archive' },
    sauvegardeRestaurable: {
      progress: {
        activeTrackId: 'p',
        tracks: {
          p: {
            recallAttempts: [
              { conceptId: 'networking-http-tls', at: t(1), outcome: 'recalled', format: 'discrim', provenance: PROV },
              { conceptId: 'networking-http-tls', at: t(2), outcome: 'recalled', format: 'cued', provenance: PROV },
              { conceptId: 'api-production-contracts', at: t(3), outcome: 'failed', format: 'free', provenance: PROV },
              { conceptId: 'api-production-contracts', at: t(4), outcome: 'failed', format: 'discrim', provenance: PROV },
              { conceptId: 'api-production-contracts', at: t(30), outcome: 'recalled', format: 'free', provenance: PROV },
              { conceptId: 'api-production-contracts', at: t(40), outcome: 'recalled', format: 'discrim', provenance: PROV },
            ],
            exerciseAttempts: [
              { exerciseId: 'http-rate-limit-decide', at: t(10), passed: 2, total: 4, provenance: { producer: 'lab-runner', method: 'sandbox-tests' } },
              { exerciseId: 'http-rate-limit-decide', at: t(20), passed: 1, total: 4, provenance: { producer: 'lab-runner', method: 'sandbox-tests' } },
              { exerciseId: 'http-rate-limit-decide', at: t(25), passed: 4, total: 4, provenance: { producer: 'lab-runner', method: 'sandbox-tests' } },
            ],
            hintViews: [
              { exerciseId: 'http-rate-limit-decide', at: t(15), action: 'SOUS_PROBLEME', niveau: 1, provenance: { producer: 'lab-runner', method: 'echelle-aide' } },
            ],
            evidence: [
              {
                sourceId: 'http-rate-limit-decide', sourceType: 'exercise', createdAt: t(26),
                conceptIds: ['api-production-contracts'], validation: { status: 'passed', kind: 'exercise-tests' },
                provenance: { producer: 'lab-runner', method: 'sandbox-tests' },
              },
            ],
            transferAttempts: [
              {
                challengeId: 'throttling-everywhere', at: t(50), passed: 3, total: 3,
                conceptIds: ['api-production-contracts', 'authentication'],
                provenance: { producer: 'transfer-grader', method: 'transfer-challenge' },
              },
            ],
          },
        },
      },
    },
    journauxDeTentatives: {},
    instantaneDeSecours: null,
  };
}

const clone = (o) => JSON.parse(JSON.stringify(o));
const piste = (a) => a.sauvegardeRestaurable.progress.tracks.p;

// ─────────────────────────────────────────────────────────────────────────────
// 1. Le cas sain
// ─────────────────────────────────────────────────────────────────────────────

test('CP4 — une archive saine est reconstructible, sans aucun manque', () => {
  const r = reconstruireLaSession(archiveSaine(), FIXTURE);
  assert.deepEqual(r.manques, [], JSON.stringify(r.manques, null, 2));
  assert.equal(r.reconstructible, true);
  assert.equal(r.identite.sessionId, 'S1');
});

test('CP4 — les onze étapes sont rendues, dans l’ordre gelé', () => {
  const r = reconstruireLaSession(archiveSaine(), FIXTURE);
  assert.equal(r.etapes.length, FIXTURE.steps.length);
  const ns = r.etapes.map((e) => e.n);
  assert.deepEqual(ns, [...ns].sort((a, b) => a - b));
  const horodatees = r.etapes.filter((e) => e.at).map((e) => e.at);
  assert.deepEqual(horodatees, [...horodatees].sort());
});

test('CP4 — chaque étape rend son RÉSULTAT, lu dans le fait', () => {
  const r = reconstruireLaSession(archiveSaine(), FIXTURE);
  const par = Object.fromEntries(r.etapes.map((e) => [e.id, e.resultat]));
  assert.equal(par.PRETEST, 'recalled');
  assert.equal(par.PRETEST_FOCAL, 'failed');
  assert.equal(par.EXERCISE_ATTEMPT_FAIL, 'echoue 2/4');
  assert.equal(par.EXERCISE_ATTEMPT_RETRY, 'echoue 1/4');
  assert.equal(par.EXERCISE_ATTEMPT_SUCCESS, 'passed');
  assert.equal(par.TRANSFER, 'reussi');
  assert.equal(par.LESSON, 'NON_OBSERVABLE');
});

test('CP4 — les étapes dont le concept vient de la FIXTURE sont nommées', () => {
  const r = reconstruireLaSession(archiveSaine(), FIXTURE);
  assert.deepEqual(r.conceptsDerivesDeLaFixture, ['EXERCISE_ATTEMPT_FAIL', 'EXERCISE_ATTEMPT_RETRY']);
  // C'est la limite mesurée au CP4 : un ÉCHEC d'exercice ne porte aucun
  // concept. La réussite, elle, en porte un.
  assert.equal(r.etapes.find((e) => e.id === 'EXERCISE_ATTEMPT_SUCCESS').origineDuConcept, 'fait');
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Les archives abîmées — il doit DIRE, pas combler
// ─────────────────────────────────────────────────────────────────────────────

test('CP4 — une étape sans fait devient ETAPE_ABSENTE, jamais un échec', () => {
  const a = clone(archiveSaine());
  piste(a).transferAttempts = [];
  const r = reconstruireLaSession(a, FIXTURE);
  assert.equal(r.reconstructible, false);
  const m = r.manques.find((x) => x.etape === 'TRANSFER');
  assert.equal(m.genre, 'ETAPE_ABSENTE');
  assert.equal(r.etapes.find((e) => e.id === 'TRANSFER').resultat, 'NOT_OBSERVED');
  assert.ok(CODES_DE_DONNEE_MANQUANTE.includes('NOT_OBSERVED'));
});

test('CP4 — un instant absent est un manque, pas une date inventée', () => {
  const a = clone(archiveSaine());
  delete piste(a).evidence[0].createdAt;
  const r = reconstruireLaSession(a, FIXTURE);
  assert.equal(r.reconstructible, false);
  assert.ok(r.manques.some((m) => m.genre === 'CHAMP_ABSENT' && m.etape === 'EXERCISE_ATTEMPT_SUCCESS' && /instant/.test(m.quoi)));
  assert.equal(r.etapes.find((e) => e.id === 'EXERCISE_ATTEMPT_SUCCESS').at, null);
});

test('CP4 — un fait sans provenance.producer est un manque', () => {
  const a = clone(archiveSaine());
  delete piste(a).hintViews[0].provenance;
  const r = reconstruireLaSession(a, FIXTURE);
  assert.equal(r.reconstructible, false);
  assert.ok(r.manques.some((m) => m.etape === 'HINT_VIEW' && /provenance/.test(m.quoi)));
});

test('CP4 — deux faits au même instant rendent l’ordre indéterminé', () => {
  const a = clone(archiveSaine());
  piste(a).exerciseAttempts[1].at = piste(a).exerciseAttempts[0].at;
  const r = reconstruireLaSession(a, FIXTURE);
  assert.equal(r.reconstructible, false);
  assert.ok(r.manques.some((m) => m.genre === 'ORDRE_INDETERMINE'));
});

test('CP4 — un transfert qui ne porte pas les deux concepts attendus est signalé', () => {
  const a = clone(archiveSaine());
  piste(a).transferAttempts[0].conceptIds = ['api-production-contracts'];
  const r = reconstruireLaSession(a, FIXTURE);
  assert.equal(r.reconstructible, false);
  const m = r.manques.find((x) => x.etape === 'TRANSFER');
  assert.equal(m.genre, 'CONCEPT_MULTIPLE');
  assert.match(m.quoi, /la fixture attendait/);
});

test('CP4 — sans identifiant de session, la trace n’est pas reconstructible', () => {
  const a = clone(archiveSaine());
  a.session = null;
  const r = reconstruireLaSession(a, FIXTURE);
  assert.equal(r.reconstructible, false);
  assert.equal(r.manques.filter((m) => m.genre === 'IDENTITE_ABSENTE').length, 2);
});

test('CP4 — une version de protocole discordante est refusée, pas tolérée', () => {
  const a = clone(archiveSaine());
  a.session.protocolVersion = 'V78-PILOT-PROTOCOL-0';
  const r = reconstruireLaSession(a, FIXTURE);
  assert.equal(r.reconstructible, false);
  assert.ok(r.manques.some((m) => m.genre === 'IDENTITE_ABSENTE' && /PROTOCOL-0/.test(m.quoi)));
});

test('CP4 — une archive sans parcours s’arrête net et le dit', () => {
  const r = reconstruireLaSession({ exportedAt: 'x', session: null }, FIXTURE);
  assert.equal(r.reconstructible, false);
  assert.deepEqual(r.etapes, []);
  assert.ok(r.manques.some((m) => /aucun parcours/.test(m.quoi)));
  assert.equal(parcoursDeLArchive({}), null);
});

test('CP4 — un fait d’un AUTRE exercice ne peut pas tenir lieu d’étape', () => {
  const a = clone(archiveSaine());
  for (const t of piste(a).exerciseAttempts) t.exerciseId = 'fizzbuzz';
  const r = reconstruireLaSession(a, FIXTURE);
  assert.equal(r.reconstructible, false);
  assert.ok(r.manques.some((m) => m.etape === 'EXERCISE_ATTEMPT_FAIL' && m.genre === 'ETAPE_ABSENTE'));
});

test('CP4 — deux étapes ne peuvent pas s’appuyer sur le MÊME fait', () => {
  // Sans consommation, une amorce servirait deux fois et la session paraîtrait
  // complète alors qu'il lui manque un fait. C'est le « study event dupliqué ».
  const r = reconstruireLaSession(archiveSaine(), FIXTURE);
  const empreintes = r.etapes
    .filter((e) => e.at && e.cle)
    .map((e) => `${e.fait}|${e.cle}|${e.at}`);
  assert.equal(new Set(empreintes).size, empreintes.length, `un fait sert deux fois : ${empreintes.join(' · ')}`);
});

test('CP4 — l’identité de session ne porte AUCUNE donnée personnelle', async () => {
  const src = readFileSync('lib/pilot-session-server.ts', 'utf8');
  for (const interdit of ['email', 'nom', 'prenom', 'firstName', 'lastName', 'fullName', 'phone']) {
    assert.equal(new RegExp(interdit, 'i').test(src), false, `« ${interdit} » apparaît dans l'identité de session`);
  }
  // Et la version de protocole vient de la FIXTURE, jamais de l'environnement :
  // un facilitateur ne doit pas pouvoir déclarer un protocole qu'il n'a pas suivi.
  assert.match(src, /readFileSync\(\s*\n?\s*join\(process\.cwd\(\), 'data\/pilot\/v78-pilot-1\.json'\)/);
  assert.equal(/process\.env\[[^\]]*\]\s*\?\?\s*['"]V78-PILOT-PROTOCOL/.test(src), false);
  const envs = [...src.matchAll(/process\.env\[([^\]]+)\]/g)].map((m) => m[1]);
  assert.deepEqual(envs, ['VARIABLE_DE_SESSION'], 'une seconde variable d’environnement est lue');
});

test('CP4 — l’instrumentation du pilote n’ÉCRIT rien et n’appelle aucun tiers', () => {
  // `H4` : observer ne doit pas modifier ce qui est observé. Et aucun service
  // tiers n'a sa place dans un produit local — il n'y a pas de destinataire.
  const fichiers = [
    'app/api/progress/export-all/route.ts',
    'lib/pilot-session-server.ts',
    'lib/session-trace.mjs',
    'lib/confusion-taxonomy.mjs',
    'lib/pilot-scope.mjs',
  ];
  for (const f of fichiers) {
    const src = readFileSync(f, 'utf8');
    assert.equal(/writeProgress|writeFileSync|applyCommand/.test(src), false, `${f} écrit alors qu'il observe`);
    assert.equal(/https?:\/\/(?!127\.0\.0\.1|localhost)/.test(src), false, `${f} appelle un hôte externe`);
    assert.equal(/analytics|telemetry|gtag|segment\.io|posthog|sentry/i.test(src), false, `${f} introduit un tiers`);
  }
});

test('CP4 — un PRETEST amputé d’une amorce est signalé, pas complété', () => {
  const a = clone(archiveSaine());
  piste(a).recallAttempts.splice(1, 1); // une seule amorce de prérequis
  const r = reconstruireLaSession(a, FIXTURE);
  assert.equal(r.reconstructible, false);
  assert.ok(r.manques.some((m) => m.etape === 'PRETEST' && /attendu/.test(m.quoi)));
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Le délai
// ─────────────────────────────────────────────────────────────────────────────

test('CP4 — le délai se lit sur les instants de l’archive, jamais ailleurs', () => {
  const r = reconstruireLaSession(archiveSaine(), FIXTURE);
  const h = delaiEnHeures(r.etapes, 'IMMEDIATE_RETRIEVAL', 'DELAYED_RETRIEVAL');
  assert.equal(Math.round(h * 3600), 10);
});

test('CP4 — un délai hors fenêtre est NOMMÉ, pas arrondi vers la fenêtre', () => {
  const f = FIXTURE.delayedRetrievalWindowHours;
  assert.deepEqual(f, [18, 36]);
  assert.equal(verdictDuDelai(24, f), 'DANS_LA_FENETRE');
  assert.equal(verdictDuDelai(18, f), 'DANS_LA_FENETRE');
  assert.equal(verdictDuDelai(36, f), 'DANS_LA_FENETRE');
  assert.equal(verdictDuDelai(17.9, f), 'DELAY_OUT_OF_WINDOW');
  assert.equal(verdictDuDelai(36.1, f), 'DELAY_OUT_OF_WINDOW');
  assert.equal(verdictDuDelai(null, f), 'NOT_OBSERVED');
});

test('CP4 — un délai non mesurable est NOT_OBSERVED, jamais zéro', () => {
  const a = clone(archiveSaine());
  piste(a).recallAttempts = piste(a).recallAttempts.slice(0, 5);
  const r = reconstruireLaSession(a, FIXTURE);
  assert.equal(delaiEnHeures(r.etapes, 'IMMEDIATE_RETRIEVAL', 'DELAYED_RETRIEVAL'), null);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Les lectures élémentaires
// ─────────────────────────────────────────────────────────────────────────────

test('CP4 — l’instant d’une preuve se lit dans createdAt, celui d’une tentative dans at', () => {
  assert.equal(instantDuFait('evidence', { createdAt: 'X', at: 'Y' }), 'X');
  assert.equal(instantDuFait('exerciseAttempts', { at: 'Y' }), 'Y');
  assert.equal(instantDuFait('recallAttempts', {}), null);
});

test('CP4 — la clé d’un fait dépend de son genre', () => {
  assert.equal(cleDuFait('evidence', { sourceId: 'a' }), 'a');
  assert.equal(cleDuFait('transferAttempts', { challengeId: 'b' }), 'b');
  assert.equal(cleDuFait('recallAttempts', { conceptId: 'c' }), 'c');
  assert.equal(cleDuFait('exerciseAttempts', { exerciseId: 'd' }), 'd');
});

test('CP4 — un résultat illisible est INCONNU, jamais un défaut favorable', () => {
  assert.equal(resultatDuFait('exerciseAttempts', { passed: 1 }), 'INCONNU');
  assert.equal(resultatDuFait('evidence', {}), 'INCONNU');
  assert.equal(resultatDuFait('recallAttempts', {}), 'INCONNU');
  assert.equal(resultatDuFait('usageEvents', {}), 'INCONNU');
});

test('CP4 — le vocabulaire des manques est fermé', () => {
  assert.deepEqual([...GENRES_DE_MANQUE], [
    'ETAPE_ABSENTE', 'CHAMP_ABSENT', 'AMBIGUITE', 'ORDRE_INDETERMINE',
    'IDENTITE_ABSENTE', 'CONCEPT_MULTIPLE',
  ]);
  const r = reconstruireLaSession(archiveSaine(), FIXTURE);
  assert.equal(r.manques.length, 0);
  const abime = clone(archiveSaine());
  abime.session = null;
  delete piste(abime).hintViews[0].provenance;
  for (const m of reconstruireLaSession(abime, FIXTURE).manques) {
    assert.ok(GENRES_DE_MANQUE.includes(m.genre), m.genre);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Ce que le produit écrit désormais
// ─────────────────────────────────────────────────────────────────────────────

test('CP4 — une tentative de rappel porte enfin une provenance', async () => {
  const { normalizeAttempt } = await import('../lib/retention.mjs');
  const a = normalizeAttempt({
    conceptId: 'x', at: '2026-01-01T00:00:00.000Z', outcome: 'recalled', format: 'free',
    provenance: { producer: 'recall-station', method: 'auto-report' },
  });
  assert.equal(a.provenance.producer, 'recall-station');
});

// Le point délicat du correctif : `normalizeAttempts` JETTE ce que le
// normaliseur refuse. Exiger la provenance aurait effacé tout l'historique de
// rappel de chaque apprenant, en silence — le contournement `H13`.
test('CP4 — l’historique de rappel survit à l’ajout de la provenance', async () => {
  const { normalizeAttempts } = await import('../lib/retention.mjs');
  const anciennes = [
    { conceptId: 'a', at: '2025-01-01T00:00:00.000Z', outcome: 'recalled', format: 'free' },
    { conceptId: 'b', at: '2025-01-02T00:00:00.000Z', outcome: 'failed', format: 'cued' },
  ];
  const out = normalizeAttempts(anciennes);
  assert.equal(out.length, 2, 'des tentatives historiques ont été perdues');
  assert.equal(out[0].provenance.producer, 'legacy');
  assert.equal(out[1].provenance.producer, 'legacy');
});

test('CP4 — le commandement de rappel nomme son producteur par défaut', async () => {
  const { applyCommand } = await import('../lib/learning-engine.mjs');
  const vide = {
    startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {},
    evidence: [], recallAttempts: [], exerciseAttempts: [], transferAttempts: [], hintViews: [],
    assessmentAttempts: [], missionSubmissions: [], artifactAnalyses: [], usageEvents: [],
  };
  const r = applyCommand(vide, {
    type: 'RECORD_RECALL', conceptId: 'api-production-contracts', outcome: 'recalled', format: 'free',
  }, { now: new Date('2026-01-01T00:00:00.000Z') });
  assert.equal(r.ok, true, r.error);
  assert.equal(r.progress.recallAttempts[0].provenance.producer, 'recall-station');
  // L'instant vient du SERVEUR : la commande n'a fourni aucune date.
  assert.equal(r.progress.recallAttempts[0].at, '2026-01-01T00:00:00.000Z');
});

test('CP4 — un horodatage fourni par le client est IGNORÉ', async () => {
  const { applyCommand } = await import('../lib/learning-engine.mjs');
  const vide = {
    startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {},
    evidence: [], recallAttempts: [], exerciseAttempts: [], transferAttempts: [], hintViews: [],
    assessmentAttempts: [], missionSubmissions: [], artifactAnalyses: [], usageEvents: [],
  };
  const r = applyCommand(vide, {
    type: 'RECORD_RECALL', conceptId: 'x', outcome: 'recalled', format: 'free',
    at: '2019-01-01T00:00:00.000Z', timestamp: '2019-01-01T00:00:00.000Z',
  }, { now: new Date('2026-01-01T00:00:00.000Z') });
  assert.equal(r.ok, true);
  assert.equal(r.progress.recallAttempts[0].at, '2026-01-01T00:00:00.000Z');
});
