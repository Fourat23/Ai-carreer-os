// V76 · CP0 — LE PARCOURS RÉEL, SUR LE PRODUIT QUI TOURNE.
//
// ── POURQUOI CE SCRIPT EXISTE ET PAS SEULEMENT DES TESTS UNITAIRES ──────
//
// Le brief est catégorique, et V75 a payé trois fois pour l'apprendre :
//
//   > Un Workbench ne passe PAS parce qu'un test unitaire appelle le runner
//   > ou qu'une route retourne 200.
//
// Ce script parle donc au produit par HTTP, exactement comme un navigateur, et
// il joue la boucle pédagogique COMPLÈTE sur chaque exercice :
//
//   ouvrir → soumettre une solution FAUSSE → lire le retour → corriger avec la
//   référence → re-soumettre → vérifier que le FAIT a été écrit.
//
// Le passage par une solution fausse n'est pas décoratif : un exercice qu'on ne
// peut pas rater ne mesure rien, et c'est la moitié des dettes que V75 a
// trouvées au CP9.
//
// ── CE QU'IL NE PEUT PAS FAIRE ──────────────────────────────────────────
//
// Il ne clique pas, ne mesure aucun rendu et ne dit rien de l'ergonomie. Il
// mesure la CHAÎNE, pas l'expérience.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const BASE = process.env.V76_BASE ?? 'http://127.0.0.1:3301';
const PROGRESS = process.env.AICOS_PROGRESS_FILE ?? null;

const jlire = (p) => JSON.parse(readFileSync(p, 'utf8'));

/** Les exercices, indexés par id. */
const TOUS = readdirSync(join(ROOT, 'data/exercises'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => jlire(join(ROOT, 'data/exercises', f)));

/**
 * ── LE CHOIX DES DOUZE ───────────────────────────────────────────────────
 *
 * Un par runtime au minimum, puis les cas qui ont une chance de casser :
 * multi-fichier, tests privés, preview, tooling lourd. Le choix est
 * DÉTERMINISTE (premier par ordre alphabétique d'id dans chaque catégorie)
 * pour que la mesure soit rejouable.
 */
export function choisirDouze() {
  const parRuntime = new Map();
  for (const e of [...TOUS].sort((a, b) => a.id.localeCompare(b.id))) {
    const k = e.practiceMode ? `${e.runtime}:${e.practiceMode}` : e.runtime;
    if (!parRuntime.has(k)) parRuntime.set(k, []);
    parRuntime.get(k).push(e);
  }
  const choisis = [];
  const prendre = (e, raison) => { if (e && !choisis.some((c) => c.ex.id === e.id)) choisis.push({ ex: e, raison }); };

  // 1) un par famille de runtime
  for (const [k, l] of [...parRuntime.entries()].sort()) prendre(l[0], `famille ${k}`);
  // 2) les cas structurellement différents
  prendre(TOUS.find((e) => (e.workspace?.files ?? []).filter((f) => !f.hidden && !f.readOnly).length > 1), 'multi-fichier');
  prendre(TOUS.find((e) => (e.tests ?? []).some((t) => t.private)), 'tests privés');
  prendre(TOUS.find((e) => (e.tests ?? []).some((t) => t.kind === 'stdout-equals')), 'sortie standard');
  prendre(TOUS.find((e) => (e.tests ?? []).some((t) => t.kind === 'selector-exists')), 'DOM / preview web');
  prendre(TOUS.find((e) => (e.tests ?? []).some((t) => t.kind === 'component-renders')), 'rendu React');
  prendre([...TOUS].sort((a, b) => (b.difficulty ?? 0) - (a.difficulty ?? 0))[0], 'difficulté maximale');
  prendre(TOUS.find((e) => (e.tests ?? []).some((t) => t.kind === 'event-changes-text')), 'interaction DOM');
  prendre([...TOUS].sort((a, b) => (b.tests?.length ?? 0) - (a.tests?.length ?? 0))[0], 'le plus de tests');
  // Le brief demande DOUZE exercices : si les catégories se recouvrent, on
  // complète par les runtimes les plus fréquents, en ordre déterministe.
  for (const e of [...TOUS].sort((a, b) => a.id.localeCompare(b.id))) {
    if (choisis.length >= 12) break;
    prendre(e, 'complément (ordre déterministe)');
  }
  return choisis.slice(0, 12);
}

const j = async (url, opts) => {
  const t0 = Date.now();
  const r = await fetch(url, opts);
  const ms = Date.now() - t0;
  let body = null;
  try { body = await r.json(); } catch { /* corps non-JSON : c'est une information */ }
  return { status: r.status, ms, body };
};

/**
 * ── CASSER UNE SOLUTION, SANS LA RENDRE ININTELLIGIBLE ────────────────────
 *
 * On ne veut pas une erreur de syntaxe (qui ne teste que le compilateur) mais
 * une solution PLAUSIBLE ET FAUSSE — c'est ce que produit un apprenant. On part
 * donc du fichier de départ, dont l'énoncé garantit qu'il est incorrect : c'est
 * exactement la « mauvaise tentative » du brief, et elle est authentique.
 */
function fichiersDeDepart(ex) {
  const out = {};
  for (const f of ex.workspace?.files ?? []) if (!f.hidden && !f.readOnly) out[f.path] = f.content ?? '';
  return out;
}
function fichiersDeReference(ex) {
  const out = fichiersDeDepart(ex);
  for (const [p, c] of Object.entries(ex.reference ?? {})) out[p] = c;
  return out;
}

/**
 * ── UNE FUITE DE SOLUTION, CORRECTEMENT DÉFINIE ──────────────────────────
 *
 * ANOMALIE DE SONDE V76 n° 1, corrigée ici. La première version cherchait les
 * 60 premiers caractères de la référence dans la réponse — et criait « fuite »
 * pour `a11y-accessible-name` et `react-avatar`. C'était FAUX : dans ces deux
 * exercices, le début du fichier corrigé est **identique au fichier de départ**
 * (le bug est plus loin). La sonde retrouvait donc le fichier de départ, qu'il
 * est parfaitement normal de servir.
 *
 * Une fuite, c'est la présence de ce qui DISTINGUE la correction du départ. On
 * extrait donc les lignes présentes dans la référence et ABSENTES du fichier de
 * départ, et on ne cherche que celles-là.
 */
function fuiteDeReference(ex, texte) {
  const depart = fichiersDeDepart(ex);
  for (const [chemin, corrige] of Object.entries(ex.reference ?? {})) {
    const avant = new Set(String(depart[chemin] ?? '').split('\n').map((l) => l.trim()));
    const distinctives = String(corrige).split('\n').map((l) => l.trim())
      // Les lignes courtes (`}`, `return`) sont trop communes pour signer une fuite.
      .filter((l) => l.length >= 12 && !avant.has(l));
    if (distinctives.some((l) => texte.includes(l))) return true;
  }
  return false;
}

/** Combien de faits la progression contient-elle, par type ? */
function faitsPersistes() {
  if (!PROGRESS) return null;
  try {
    const p = jlire(PROGRESS);
    const t = p.tracks?.[p.activeTrackId] ?? {};
    return {
      exerciseAttempts: (t.exerciseAttempts ?? []).length,
      evidence: (t.evidence ?? []).length,
      recallAttempts: (t.recallAttempts ?? []).length,
      transferAttempts: (t.transferAttempts ?? []).length,
    };
  } catch { return null; }
}

export async function parcours(ex, raison) {
  const url = `${BASE}/api/lab/${ex.id}`;
  const r = { id: ex.id, titre: ex.title, runtime: ex.runtime, raison };

  // 1 · OUVRIR
  const get = await j(url);
  r.ouvre = get.status === 200;
  r.msOuverture = get.ms;
  r.fichiersRecus = (get.body?.files ?? []).length;
  r.testsAffiches = (get.body?.exercise?.tests ?? []).length;
  r.testCountAnnonce = get.body?.exercise?.testCount ?? null;
  // Anti-fuite, mesuré sur la RÉPONSE RÉELLE et pas sur le code.
  const brut = JSON.stringify(get.body ?? {});
  r.fuiteReference = fuiteDeReference(ex, brut);
  r.fuiteAttendus = /"expected"/.test(brut);

  const avant = faitsPersistes();

  // 2 · SOUMETTRE LA SOLUTION DE DÉPART (celle que l'énoncé dit fausse)
  const faux = await j(url, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'run', files: fichiersDeDepart(ex) }),
  });
  r.msEchec = faux.ms;
  r.statutEchec = faux.status;
  const a1 = faux.body?.attempt ?? null;
  r.echoue = a1 ? a1.allPassed === false : null;
  r.echecPasses = a1?.passed ?? null;
  r.echecTotal = a1?.total ?? null;
  // La qualité du retour : que reçoit l'apprenant après son échec ?
  r.aResultatsDeTests = Array.isArray(a1?.results) && a1.results.length > 0;
  r.aMessageParTest = (a1?.results ?? []).some((x) => x.message || x.expected !== undefined || x.received !== undefined);
  r.aRemediation = !!faux.body?.remediation;
  r.niveauRemediation = faux.body?.remediation?.niveau ?? faux.body?.remediation?.echelon ?? null;
  r.aDiagnostics = (faux.body?.diagnostics ?? []).length > 0;
  r.aStdout = typeof faux.body?.stdout === 'string' && faux.body.stdout.length > 0;
  // Fuite : le retour d'échec donne-t-il la réponse ?
  const brutEchec = JSON.stringify(faux.body ?? {});
  r.echecFuiteReference = fuiteDeReference(ex, brutEchec);

  const apresEchec = faitsPersistes();
  r.echecPersiste = avant && apresEchec ? apresEchec.exerciseAttempts > avant.exerciseAttempts : null;

  // 3 · CORRIGER ET RE-SOUMETTRE
  const bon = await j(url, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'run', files: fichiersDeReference(ex) }),
  });
  r.msReussite = bon.ms;
  const a2 = bon.body?.attempt ?? null;
  r.reussit = a2 ? a2.allPassed === true : null;
  r.reussitePasses = a2?.passed ?? null;
  r.reussiteTotal = a2?.total ?? null;

  const apresReussite = faitsPersistes();
  r.reussitePersiste = apresEchec && apresReussite ? apresReussite.exerciseAttempts > apresEchec.exerciseAttempts : null;
  r.preuveEcrite = apresEchec && apresReussite ? apresReussite.evidence > apresEchec.evidence : null;
  r.recorded = bon.body?.recorded ?? null;

  // 4 · REMETTRE À ZÉRO (l'état ne doit pas fuir vers l'exercice suivant)
  const reset = await j(url, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'reset' }),
  });
  r.resetOk = reset.status === 200;

  return r;
}

if (process.argv[1] && process.argv[1].endsWith('cp0-e2e.mjs')) {
  const douze = choisirDouze();
  console.log('# V76 · CP0 — LE PARCOURS RÉEL, SUR LE PRODUIT QUI TOURNE\n');
  console.log(`> Serveur : \`${BASE}\` · progression : fixture hors dépôt.`);
  console.log('> Chaque exercice est joué en entier : ouvrir → soumettre le fichier de DÉPART');
  console.log('> (que l’énoncé déclare faux) → lire le retour → appliquer la référence →');
  console.log('> re-soumettre → vérifier les faits écrits sur le disque.\n');

  const res = [];
  for (const { ex, raison } of douze) {
    const r = await parcours(ex, raison);
    res.push(r);
    console.log(`  ${r.reussit ? '✅' : '❌'} ${r.id} (${r.runtime}) — échec ${r.echecPasses}/${r.echecTotal} → réussite ${r.reussitePasses}/${r.reussiteTotal}`);
  }

  console.log('\n## La boucle, exercice par exercice\n');
  console.log('| exercice | runtime | choisi pour | ouvre | échoue | échec persisté | réussit | réussite persistée | preuve |');
  console.log('|---|---|---|---|---|---|---|---|---|');
  const ok = (b) => (b === null ? '—' : b ? '✅' : '❌');
  for (const r of res) {
    console.log(`| \`${r.id}\` | ${r.runtime} | ${r.raison} | ${ok(r.ouvre)} | ${ok(r.echoue)} | ${ok(r.echecPersiste)} | ${ok(r.reussit)} | ${ok(r.reussitePersiste)} | ${ok(r.preuveEcrite)} |`);
  }

  console.log('\n## La qualité du retour après un échec\n');
  console.log('| exercice | résultats de tests | attendu/reçu | diagnostics | stdout | remédiation | échelon |');
  console.log('|---|---|---|---|---|---|---|');
  for (const r of res) {
    console.log(`| \`${r.id}\` | ${ok(r.aResultatsDeTests)} | ${ok(r.aMessageParTest)} | ${ok(r.aDiagnostics)} | ${ok(r.aStdout)} | ${ok(r.aRemediation)} | ${r.niveauRemediation ?? '—'} |`);
  }

  console.log('\n## Latence réelle (ms)\n');
  console.log('| exercice | ouverture | run (échec) | run (réussite) |');
  console.log('|---|---|---|---|');
  for (const r of res) console.log(`| \`${r.id}\` | ${r.msOuverture} | ${r.msEchec} | ${r.msReussite} |`);

  console.log('\n## Fuite de solution, mesurée sur les RÉPONSES HTTP\n');
  const fuites = res.filter((r) => r.fuiteReference || r.fuiteAttendus || r.echecFuiteReference);
  console.log(`- référence dans la réponse d’ouverture : ${res.filter((r) => r.fuiteReference).length === 0 ? '✅ aucune' : `❌ ${res.filter((r) => r.fuiteReference).map((r) => r.id).join(' ')}`}`);
  console.log(`- attendus (\`expected\`) exposés : ${res.filter((r) => r.fuiteAttendus).length === 0 ? '✅ aucun' : `❌ ${res.filter((r) => r.fuiteAttendus).map((r) => r.id).join(' ')}`}`);
  console.log(`- référence dans le retour d’ÉCHEC : ${res.filter((r) => r.echecFuiteReference).length === 0 ? '✅ aucune' : `❌ ${res.filter((r) => r.echecFuiteReference).map((r) => r.id).join(' ')}`}`);

  console.log('\n## Verdict de la chaîne\n');
  const echouentPas = res.filter((r) => r.echoue === false);
  const reussissentPas = res.filter((r) => !r.reussit);
  const sansPersistance = res.filter((r) => r.echecPersiste === false);
  console.log(`**Exercices qui ne peuvent PAS être ratés** : ${echouentPas.length === 0 ? '✅ aucun' : `⚠️ ${echouentPas.map((r) => r.id).join(' ')}`}`);
  console.log(`**Exercices qui ne réussissent pas avec leur propre référence** : ${reussissentPas.length === 0 ? '✅ aucun' : `❌ ${reussissentPas.map((r) => r.id).join(' ')}`}`);
  console.log(`**Échecs non persistés** : ${sansPersistance.length === 0 ? '✅ aucun' : `❌ ${sansPersistance.map((r) => r.id).join(' ')}`}`);
  console.log(`\n**Faits finaux sur le disque** : ${JSON.stringify(faitsPersistes())}`);

  writeFileSync(join(ROOT, 'docs', 'v76', 'cp0-e2e.json'), `${JSON.stringify(res, null, 1)}\n`);
  console.log('\nécrit : docs/v76/cp0-e2e.json');
  if (fuites.length || reussissentPas.length) process.exitCode = 1;
}
