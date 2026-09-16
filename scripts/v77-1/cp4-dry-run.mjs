// V77.1 · CP4 — RÉPÉTITION À BLANC, SUR LE PRODUIT RÉEL, SANS AUCUN HUMAIN.
//
// Ce script traverse les onze étapes du protocole gelé en HTTP, contre un
// serveur de production reconstruit, avec une progression HORS DÉPÔT. À chaque
// étape il compare les neuf faits AVANT et APRÈS, et vérifie ce que l'étape a
// réellement laissé.
//
// ── CE QU'IL NE FAIT PAS, ET POURQUOI ───────────────────────────────────────
//
// Il n'attend pas 24 heures. Le délai n'est donc PAS simulé en avançant une
// horloge : ce serait mesurer sa propre simulation. Il mesure la PROPRIÉTÉ qui
// rend le délai fiable — **un horodatage fourni par le client n'a aucun effet
// sur l'instant du fait** — en envoyant des commandes délibérément menteuses
// et en relisant ce que le disque a gardé.
//
// Usage :
//   node scripts/v77-1/cp4-dry-run.mjs --base http://127.0.0.1:3211 \
//        --progress /chemin/hors/depot/progress.json [--json]

import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { reconstruireLaSession, delaiEnHeures, verdictDuDelai } from '../../lib/session-trace.mjs';

const arg = (nom, defaut = null) => {
  const i = process.argv.indexOf(nom);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : defaut;
};
const BASE = arg('--base', 'http://127.0.0.1:3211');
const PROGRESS = arg('--progress');
const JSON_SEUL = process.argv.includes('--json');
const dire = (...a) => { if (!JSON_SEUL) console.log(...a); };

const FIXTURE = JSON.parse(readFileSync('data/pilot/v78-pilot-1.json', 'utf8'));
const FOCAL = 'api-production-contracts';
const PREREQUIS = 'networking-http-tls';
const EXERCICE = 'http-rate-limit-decide';
const TRANSFERT = 'throttling-everywhere';

const GENRES = [
  'evidence', 'recallAttempts', 'exerciseAttempts', 'transferAttempts', 'hintViews',
  'assessmentAttempts', 'missionSubmissions', 'artifactAnalyses', 'usageEvents',
];

const rapport = { etapes: [], controles: [], reconstruction: null, risques: [] };

// ── outils ──
async function http(chemin, init) {
  const r = await fetch(`${BASE}${chemin}`, init);
  const texte = await r.text();
  let corps = null;
  try { corps = JSON.parse(texte); } catch { corps = texte; }
  return { status: r.status, corps };
}
// L'API attend `{ command: { … } }`. La première version de ce script postait
// la commande à plat, recevait `NO_COMMAND`, et concluait que le produit
// n'écrivait rien. C'était la SONDE qui était cassée, pas le produit — le
// défaut classique : mesurer son propre appareil. D'où le contrôle ci-dessous,
// qui échoue bruyamment si une commande est refusée.
const commande = async (cmd) => {
  const r = await http('/api/progress', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command: cmd }),
  });
  if (r.status !== 200 || r.corps?.ok !== true) {
    throw new Error(`commande ${cmd.type} refusée (${r.status}) : ${JSON.stringify(r.corps)}`);
  }
  return r;
};

function disque() {
  if (!PROGRESS || !existsSync(PROGRESS)) return { activeTrackId: null, tracks: {} };
  return JSON.parse(readFileSync(PROGRESS, 'utf8'));
}
function parcours() {
  const d = disque();
  return d.tracks?.[d.activeTrackId] ?? {};
}
function compteurs() {
  const p = parcours();
  return Object.fromEntries(GENRES.map((g) => [g, (p[g] ?? []).length]));
}
function empreinteDuDisque() {
  if (!PROGRESS || !existsSync(PROGRESS)) return 'ABSENT';
  return createHash('sha256').update(readFileSync(PROGRESS)).digest('hex').slice(0, 16);
}
function delta(avant, apres) {
  return Object.fromEntries(GENRES.map((g) => [g, apres[g] - avant[g]]).filter(([, n]) => n !== 0));
}

/** Joue une étape et mesure ce qu'elle a laissé. */
async function etape(id, attendu, action) {
  const avant = compteurs();
  const res = await action();
  const apres = compteurs();
  const d = delta(avant, apres);
  const p = parcours();
  const dernier = attendu ? (p[attendu] ?? []).slice(-1)[0] ?? null : null;
  const ligne = {
    etape: id,
    faitAttendu: attendu,
    delta: d,
    conforme: attendu ? d[attendu] >= 1 : Object.keys(d).length === 0,
    dernierFait: dernier
      ? {
        at: dernier.at ?? null,
        conceptId: dernier.conceptId ?? null,
        conceptIds: dernier.conceptIds ?? null,
        exerciseId: dernier.exerciseId ?? null,
        challengeId: dernier.challengeId ?? null,
        outcome: dernier.outcome ?? null,
        passed: dernier.passed ?? null,
        total: dernier.total ?? null,
        status: dernier.status ?? null,
        evidenceLevel: dernier.evidenceLevel ?? null,
        action: dernier.action ?? null,
        provenance: dernier.provenance ?? null,
        sourceRef: dernier.sourceRef ?? null,
      }
      : null,
    http: res?.status ?? null,
  };
  rapport.etapes.push(ligne);
  dire(`  ${ligne.conforme ? '✅' : '❌'} ${id.padEnd(26)} attendu=${String(attendu)} delta=${JSON.stringify(d)}`);
  return res;
}

function controle(nom, verdict, detail) {
  rapport.controles.push({ nom, verdict, detail });
  dire(`  ${verdict === 'OK' ? '✅' : verdict === 'CONSTAT' ? 'ℹ️ ' : '❌'} ${nom} — ${detail}`);
}

// ── le code de l'exercice : buggé, encore buggé, puis juste ──
const EX = JSON.parse(readFileSync(`data/exercises/${EXERCICE}.json`, 'utf8'));
const ENTRY = EX.workspace.entry;
const DEPART = EX.workspace.files.find((f) => f.path === ENTRY).content;
const JUSTE = EX.reference[ENTRY];
// Une SECONDE erreur, différente de la première : même score répété dans la
// même seconde, le produit y verrait un rejeu réseau (§ contrôle du rejeu).
const ENCORE_FAUX = `export function rateLimit(limit, windowMs, timestamps) {
  return timestamps.map(() => 'deny');
}
`;
const attendre = (ms) => new Promise((r) => { setTimeout(r, ms); });

async function main() {
  dire(`\n== V77.1 · CP4 — RÉPÉTITION À BLANC ==\n   base ${BASE}\n   progression ${PROGRESS}\n`);

  // ── 0. amorçage : le parcours doit exister ──
  await http('/api/progress');
  dire('— les onze étapes —');

  // ── 1. PRETEST (prérequis) — 2 amorces ──
  await etape('PRETEST', 'recallAttempts', async () => {
    await commande({ type: 'RECORD_RECALL', conceptId: PREREQUIS, outcome: 'recalled', format: 'discrim', sourceRef: '/retention' });
    return commande({ type: 'RECORD_RECALL', conceptId: PREREQUIS, outcome: 'recalled', format: 'cued', sourceRef: '/retention' });
  });

  // ── 1bis. PRETEST_FOCAL — l'apprenant synthétique ne sait pas encore ──
  await etape('PRETEST_FOCAL', 'recallAttempts', async () => {
    await commande({ type: 'RECORD_RECALL', conceptId: FOCAL, outcome: 'failed', format: 'free', sourceRef: '/retention' });
    return commande({ type: 'RECORD_RECALL', conceptId: FOCAL, outcome: 'failed', format: 'discrim', sourceRef: '/retention' });
  });

  // ── 2. LESSON — une lecture, qui ne doit RIEN écrire ──
  await etape('LESSON', null, () => http(`/doc/lessons/${FOCAL}`));

  // ── 3. ÉCHEC — le code de départ porte un bug d'origine ──
  const echec = await etape('EXERCISE_ATTEMPT_FAIL', 'exerciseAttempts', () => http(`/api/lab/${EXERCICE}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'run', files: { [ENTRY]: DEPART } }),
  }));
  controle(
    'l’échec est réel, pas fabriqué',
    echec.corps?.attempt?.allPassed === false ? 'OK' : 'ÉCART',
    `allPassed=${echec.corps?.attempt?.allPassed} passed=${echec.corps?.attempt?.passed}/${echec.corps?.attempt?.total}`,
  );

  // ── 4. AIDE — écrite par le produit lui-même, pas par ce script ──
  const p4 = parcours();
  const aides = (p4.hintViews ?? []).filter((h) => h.exerciseId === EXERCICE);
  rapport.etapes.push({
    etape: 'HINT_VIEW', faitAttendu: 'hintViews',
    delta: { hintViews: aides.length }, conforme: aides.length >= 1,
    dernierFait: aides.slice(-1)[0] ?? null,
    note: 'écrite par la route du laboratoire pendant l’étape 3 — le script n’a rien demandé',
  });
  dire(`  ${aides.length >= 1 ? '✅' : '❌'} HINT_VIEW${' '.repeat(18)} attendu=hintViews delta={"hintViews":${aides.length}}`);
  controle(
    'l’aide a été servie par le produit, pas déclenchée par le script',
    aides.length >= 1 ? 'OK' : 'ÉCART',
    aides.length ? `action=${aides.slice(-1)[0].action} niveau=${aides.slice(-1)[0].niveau} déclenchée=${aides.slice(-1)[0].declenchee}` : 'aucune aide',
  );

  // ── LE REJEU — deux tentatives IDENTIQUES dans la même seconde ──
  //
  // La clé métier d'une tentative est `exerciseId | seconde | passed/total`.
  // Deux essais réellement distincts, au même score, dans la même seconde, sont
  // donc indiscernables d'un rejeu réseau — et le second n'est pas écrit.
  // Mesuré ici plutôt que supposé, puis énoncé comme limite.
  const avantRejeu = (parcours().exerciseAttempts ?? []).length;
  await http(`/api/lab/${EXERCICE}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'run', files: { [ENTRY]: DEPART } }),
  });
  const apresRejeu = (parcours().exerciseAttempts ?? []).length;
  controle(
    'deux tentatives identiques dans la même seconde : une seule est écrite',
    apresRejeu === avantRejeu ? 'CONSTAT' : 'CONSTAT',
    apresRejeu === avantRejeu
      ? 'la seconde est traitée comme un rejeu — limite à énoncer, pas un défaut'
      : `la seconde a été écrite (${avantRejeu} → ${apresRejeu})`,
  );

  // ── 5. NOUVELLE TENTATIVE — fausse AUTREMENT, et plus d'une seconde après ──
  await attendre(1100);
  await etape('EXERCISE_ATTEMPT_RETRY', 'exerciseAttempts', () => http(`/api/lab/${EXERCICE}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'run', files: { [ENTRY]: ENCORE_FAUX } }),
  }));

  // ── 6. RÉUSSITE — la preuve ──
  await attendre(1100);
  const succes = await etape('EXERCISE_ATTEMPT_SUCCESS', 'evidence', () => http(`/api/lab/${EXERCICE}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'run', files: { [ENTRY]: JUSTE } }),
  }));
  controle(
    'la réussite est réelle',
    succes.corps?.attempt?.allPassed === true ? 'OK' : 'ÉCART',
    `allPassed=${succes.corps?.attempt?.allPassed}`,
  );

  // ── 7. RAPPEL IMMÉDIAT ──
  await attendre(1100);
  await etape('IMMEDIATE_RETRIEVAL', 'recallAttempts', () => commande({
    type: 'RECORD_RECALL', conceptId: FOCAL, outcome: 'recalled', format: 'free', sourceRef: '/retention',
  }));

  // ── LE DÉLAI — mesuré par sa propriété, pas par une horloge avancée ──
  await attendre(1100);
  const menteur = '2019-01-01T00:00:00.000Z';
  const avantMensonge = (parcours().recallAttempts ?? []).length;
  await commande({
    type: 'RECORD_RECALL', conceptId: FOCAL, outcome: 'recalled', format: 'discrim',
    sourceRef: '/retention', at: menteur, timestamp: menteur, now: menteur,
  });
  const listeApres = parcours().recallAttempts ?? [];
  const nouveau = listeApres.slice(avantMensonge);
  const aMenti = nouveau.some((f) => String(f.at).startsWith('2019'));
  controle(
    'un horodatage fourni par le client n’a AUCUN effet sur l’instant du fait',
    aMenti ? 'ÉCART' : 'OK',
    aMenti ? `un fait porte ${menteur}` : `le fait porte l’instant serveur (${nouveau[0]?.at ?? '—'})`,
  );

  // ── 8. RAPPEL DIFFÉRÉ ──
  // Le fait vient d'être écrit par la sonde ci-dessus : il TIENT LIEU de rappel
  // différé pour la répétition à blanc, et le rapport le dit — sans quoi ce
  // script prétendrait avoir attendu.
  rapport.etapes.push({
    etape: 'DELAYED_RETRIEVAL', faitAttendu: 'recallAttempts',
    delta: { recallAttempts: nouveau.length }, conforme: nouveau.length >= 1,
    dernierFait: nouveau.slice(-1)[0] ?? null,
    note: 'à blanc : joué immédiatement. Le DÉLAI n’est pas simulé — sa propriété est mesurée séparément.',
  });
  dire(`  ${nouveau.length >= 1 ? '✅' : '❌'} DELAYED_RETRIEVAL${' '.repeat(10)} attendu=recallAttempts delta={"recallAttempts":${nouveau.length}} (délai NON simulé)`);

  // ── 9. TRANSFERT ──
  await attendre(1100);
  await etape('TRANSFER', 'transferAttempts', () => http(`/api/transfer/${TRANSFERT}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ responses: { q1: 0, q2: [0, 1, 3], q3: 'refusé' }, record: true }),
  }));

  // ── 10. RAPPORT DE CONFUSION — hors produit, par construction ──
  rapport.etapes.push({
    etape: 'CONFUSION_REPORT', faitAttendu: null, delta: {}, conforme: true,
    note: 'hors produit par contrat : aucune surface ne le recueille',
  });
  dire('  ✅ CONFUSION_REPORT           attendu=null (hors produit)');

  // ── EFFET D'OBSERVATION — lire ne doit rien changer ──
  const avantLecture = empreinteDuDisque();
  await http('/api/progress/export-all');
  const apresExport = empreinteDuDisque();
  await http('/retention');
  const apresRetention = empreinteDuDisque();
  await http(`/doc/lessons/${FOCAL}`);
  const apresLecon = empreinteDuDisque();
  controle(
    'exporter l’archive ne modifie pas ce qu’elle observe',
    avantLecture === apresExport ? 'OK' : 'ÉCART',
    `${avantLecture} → ${apresExport}`,
  );
  controle(
    'ouvrir la station de rappel ne modifie rien',
    apresExport === apresRetention ? 'OK' : 'ÉCART',
    `${apresExport} → ${apresRetention}`,
  );
  controle(
    'ouvrir la leçon ne modifie rien',
    apresRetention === apresLecon ? 'OK' : 'ÉCART',
    `${apresRetention} → ${apresLecon}`,
  );

  // ── RISQUE R8 — la station propose-t-elle le concept focal ? ──
  const station = await http('/retention');
  const html = typeof station.corps === 'string' ? station.corps : '';
  const focalPropose = html.includes(FOCAL);
  // Le chemin de repli existe-t-il ? La commande directe a déjà écrit six faits
  // de rappel dans cette répétition : elle fonctionne. C'est ce que la
  // procédure du CP5 devra nommer si la station ne propose pas le concept.
  rapport.risques.push({
    id: 'R8',
    question: 'la station de rappel propose-t-elle le concept focal au moment voulu ?',
    mesure: focalPropose ? 'le concept apparaît dans la page' : 'le concept N’APPARAÎT PAS dans la page',
    consequence: focalPropose
      ? 'le chemin nominal existe'
      : 'le facilitateur devra passer par la commande directe — à écrire dans la procédure du CP5',
    repli: 'POST /api/progress { command: { type: RECORD_RECALL, … } } — exercé six fois dans cette répétition, il fonctionne',
  });
  controle('R8 — /retention propose le concept focal', focalPropose ? 'OK' : 'CONSTAT',
    focalPropose ? 'le concept est dans la page' : 'le concept est absent de la page rendue');

  // ── 11. EXPORT DE SESSION, puis RECONSTRUCTION ──
  const archive = (await http('/api/progress/export-all')).corps;
  const r = reconstruireLaSession(archive, FIXTURE);
  const h = delaiEnHeures(r.etapes, 'IMMEDIATE_RETRIEVAL', 'DELAYED_RETRIEVAL');
  rapport.reconstruction = {
    reconstructible: r.reconstructible,
    identite: r.identite,
    etapes: r.etapes,
    manques: r.manques,
    delaiHeures: h,
    verdictDuDelai: verdictDuDelai(h, FIXTURE.delayedRetrievalWindowHours),
  };

  dire('\n— reconstruction à partir du SEUL export —');
  dire(`  identité   session=${r.identite.sessionId} protocole=${r.identite.protocolVersion} scope=${r.identite.scopeId}`);
  for (const e of r.etapes) {
    dire(`  ${String(e.n).padStart(2)} ${e.id.padEnd(26)} ${String(e.at ?? '—').padEnd(26)} ${String(e.concept ?? '—').padEnd(26)} ${e.resultat ?? '—'}`);
  }
  dire(`  concepts dérivés de la fixture (pas du fait) : ${r.conceptsDerivesDeLaFixture.join(', ') || 'aucun'}`);
  dire(`  manques    ${r.manques.length}`);
  for (const m of r.manques) dire(`     · [${m.genre}] ${m.etape ?? '—'} : ${m.quoi}`);
  dire(`  délai rappel immédiat → différé : ${h === null ? 'NON MESURABLE' : `${h.toFixed(4)} h`} → ${rapport.reconstruction.verdictDuDelai}`);
  dire(`\n  SESSION_TRACE_RECONSTRUCTABILITY = ${r.reconstructible ? 'OUI' : 'NON'}`);

  const ecarts = rapport.controles.filter((c) => c.verdict === 'ÉCART').length;
  const etapesNonConformes = rapport.etapes.filter((e) => !e.conforme).length;
  rapport.resume = {
    etapes: rapport.etapes.length,
    etapesNonConformes,
    controles: rapport.controles.length,
    ecarts,
    manques: r.manques.length,
    reconstructible: r.reconstructible,
  };
  dire(`\n  ${rapport.etapes.length} étapes · ${etapesNonConformes} non conformes · ${rapport.controles.length} contrôles · ${ecarts} écarts\n`);

  if (JSON_SEUL) console.log(JSON.stringify(rapport, null, 2));
  process.exit(etapesNonConformes === 0 && ecarts === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(2); });
