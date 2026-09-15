// V76 · CP12 — LES MÊMES DOUZE, REJOUÉS APRÈS TOUT.
//
// ── POURQUOI REJOUER PLUTÔT QUE MESURER À NOUVEAU ───────────────────────
//
// Le CP0 a joué douze parcours complets sur le produit en marche et obtenu
// 12/12. Entre-temps, neuf checkpoints ont modifié l'exécution elle-même :
//
//   · CP3  — deux grammaires d'éditeur en plus ;
//   · CP5  — **toute l'exécution passe désormais par `unshare` et, pour Python,
//            par une racine minimale en chroot** ;
//   · CP6  — un diagnostic est calculé sur chaque échec ;
//   · CP7  — chaque aide servie est consignée comme un fait ;
//   · CP8  — la page de transfert ne sert plus les réponses ;
//   · CP9  — une sauvegarde périmée est refusée en 409 ;
//   · CP10 — chaque lancement écrit un journal (code + résultats publics) ;
//   · CP11 — une réussite n'écrit plus qu'UNE preuve.
//
// Chacun de ces changements peut casser un parcours, et le plus dangereux est
// le CP5 : une frontière d'exécution qui fonctionne sur `node-js` peut très
// bien ne pas fonctionner sur `python-ds`, et « ça marchait au CP5 » n'est pas
// une mesure d'aujourd'hui.
//
// **On rejoue donc EXACTEMENT le même script** — `choisirDouze` et `parcours`
// sont importés de `cp0-e2e.mjs`, pas recopiés. Une comparaison n'a de valeur
// que si les deux côtés ont été mesurés par le même instrument.
//
// ── CE QUE CE SCRIPT AJOUTE ─────────────────────────────────────────────
//
// Les propriétés que le CP0 ne pouvait pas mesurer, parce qu'elles n'existaient
// pas : diagnostic rendu, provenance d'une réussite, historique servi, révision
// par fichier, preuve unique.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { choisirDouze, parcours } from './cp0-e2e.mjs';

const ROOT = process.cwd();
const BASE = process.env.V76_BASE ?? 'http://127.0.0.1:3301';
const PROGRESS = process.env.AICOS_PROGRESS_FILE ?? null;

const jlire = (p) => JSON.parse(readFileSync(p, 'utf8'));

const j = async (url, opts) => {
  const r = await fetch(url, opts);
  let body = null;
  try { body = await r.json(); } catch { /* corps non-JSON */ }
  return { status: r.status, body };
};

const depart = (ex) => {
  const out = {};
  for (const f of ex.workspace?.files ?? []) if (!f.hidden && !f.readOnly) out[f.path] = f.content ?? '';
  return out;
};
const reference = (ex) => ({ ...depart(ex), ...(ex.reference ?? {}) });

/** Les preuves du registre qui concernent cet exercice, par source. */
function preuvesDe(id) {
  if (!PROGRESS || !existsSync(PROGRESS)) return null;
  try {
    const p = jlire(PROGRESS);
    const t = p.tracks?.[p.activeTrackId] ?? p;
    return (t.evidence ?? []).filter((e) => e.sourceId === id || e.sourceId === `lab-${id}`);
  } catch { return null; }
}

/**
 * Ce que les CP3 → CP11 ont ajouté, mesuré sur le même exercice, juste après
 * son parcours. On ne remesure PAS ce que `parcours` mesure déjà.
 */
async function acquis(ex) {
  const url = `${BASE}/api/lab/${ex.id}`;
  const a = { id: ex.id };

  // CP9 — chaque fichier servi porte sa révision.
  const get = await j(url);
  const fichiers = get.body?.files ?? [];
  a.revisions = fichiers.length > 0 && fichiers.every((f) => typeof f.rev === 'string' && f.rev.length === 12);

  // CP10 — l'historique est servi, et il porte ce qu'il faut pour comparer.
  const h = get.body?.history ?? [];
  a.historiqueServi = Array.isArray(get.body?.history);
  a.historiqueEntrees = h.length;
  a.historiqueAvecTests = h.filter((x) => (x.tests ?? []).length > 0).length;

  // CP9 — une sauvegarde sur une base périmée est refusée.
  const chemin = fichiers.find((f) => f.editable && !f.hidden)?.path;
  if (chemin) {
    const perime = await j(url, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'save', files: { [chemin]: '// périmé\n' }, revs: { [chemin]: 'ffffffffffff' } }),
    });
    a.refus409 = perime.status === 409;
  } else a.refus409 = null;

  // ── ANOMALIE DE SONDE V76 n° 6, corrigée ici ──
  //
  // La colonne « aide » de ce tableau changeait à chaque exécution : tantôt une
  // marche, tantôt rien, et pas sur les mêmes exercices. Le produit n'y était
  // pour rien.
  //
  // La clé métier d'une tentative (V74 §3.6) est
  // `exerciseId | horodatage à la SECONDE | passed/total`. Ce script rejoue le
  // fichier de départ quelques centaines de millisecondes après que `parcours`
  // l'a déjà fait : **même clé**, donc tentative dédupliquée, donc aucune
  // nouvelle tentative écrite. `remedier` voit alors une dernière tentative
  // RÉUSSIE, une série d'échecs à zéro, et rend `null` — ce qui est correct.
  //
  // Autrement dit : ma sonde allait plus vite que la résolution temporelle du
  // modèle de faits. Un humain ne relance pas deux fois le même échec dans la
  // même seconde ; une boucle de script, si. On attend donc une seconde pleine,
  // comme les sondes du CP10 et du CP11 le font déjà.
  await new Promise((r) => setTimeout(r, 1100));

  // CP6 — un échec produit un diagnostic exploitable (ou le dit franchement).
  const faux = await j(url, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'run', files: depart(ex) }),
  });
  a.diagnosticRendu = faux.body?.diagnostic !== undefined;
  a.diagnosticClasse = faux.body?.diagnostic?.classe ?? null;
  a.diagnosticExploitable = faux.body?.diagnostic?.exploitable ?? null;
  // CP7 — l'aide servie est consignée : l'échelle ne repropose pas à l'identique.
  a.aideServie = faux.body?.remediation?.action ?? null;

  // CP11 — une réussite n'écrit qu'UNE preuve.
  await new Promise((r) => setTimeout(r, 1100));
  const bon = await j(url, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'run', files: reference(ex) }),
  });
  a.provenanceRendue = bon.body?.provenance != null;
  a.provenanceLecture = bon.body?.provenance?.lecture ?? null;
  const p = preuvesDe(ex.id);
  a.preuves = p ? p.length : null;
  a.sourcesDePreuve = p ? [...new Set(p.map((e) => e.sourceId))] : null;

  // CP10 — le journal a bien enregistré ces lancements.
  const apres = await j(url);
  const h2 = apres.body?.history ?? [];
  a.journalConserve = h2.filter((x) => x.conserve).length;

  await j(url, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'reset' }),
  });
  return a;
}

if (process.argv[1] && process.argv[1].endsWith('cp12-e2e.mjs')) {
  const douze = choisirDouze();
  const avant = existsSync(join(ROOT, 'docs/v76/cp0-e2e.json'))
    ? new Map(jlire(join(ROOT, 'docs/v76/cp0-e2e.json')).map((r) => [r.id, r]))
    : new Map();

  console.log('# V76 · CP12 — Les douze parcours, rejoués après les CP3 → CP11\n');
  console.log(`> Serveur : \`${BASE}\` · progression : fixture hors dépôt.`);
  console.log('> **Même script que le CP0** (`choisirDouze` et `parcours` importés, pas recopiés) :');
  console.log('> une comparaison n’a de valeur que si les deux côtés ont été mesurés par le');
  console.log('> même instrument.\n');

  const res = [];
  for (const { ex, raison } of douze) {
    const r = await parcours(ex, raison);
    r.acquis = await acquis(ex);
    res.push(r);
  }

  const ok = (b) => (b === null || b === undefined ? '—' : b ? '✅' : '❌');

  console.log('## 1 · La boucle pédagogique, exercice par exercice\n');
  console.log('| exercice | runtime | ouvre | échoue | échec persisté | réussit | réussite persistée | preuve | reset |');
  console.log('|---|---|---|---|---|---|---|---|---|');
  for (const r of res) {
    console.log(`| \`${r.id}\` | ${r.runtime} | ${ok(r.ouvre)} | ${ok(r.echoue)} ${r.echecPasses}/${r.echecTotal} | ${ok(r.echecPersiste)} | ${ok(r.reussit)} ${r.reussitePasses}/${r.reussiteTotal} | ${ok(r.reussitePersiste)} | ${ok(r.preuveEcrite)} | ${ok(r.resetOk)} |`);
  }

  console.log('\n## 2 · CP0 → CP12 : ce qui a bougé\n');
  console.log('| exercice | ouverture | échec | réussite | scores | fuite |');
  console.log('|---|---|---|---|---|---|');
  for (const r of res) {
    const a = avant.get(r.id);
    const d = (apres, av) => (av == null ? `${apres} ms` : `${av} → ${apres} ms${Math.abs(apres - av) > 500 ? ' ⚠' : ''}`);
    const scores = a
      ? (a.echecPasses === r.echecPasses && a.reussitePasses === r.reussitePasses && a.reussiteTotal === r.reussiteTotal
        ? 'identiques' : `❌ ${a.echecPasses}/${a.echecTotal}→${r.echecPasses}/${r.echecTotal} · ${a.reussitePasses}/${a.reussiteTotal}→${r.reussitePasses}/${r.reussiteTotal}`)
      : '—';
    console.log(`| \`${r.id}\` | ${d(r.msOuverture, a?.msOuverture)} | ${d(r.msEchec, a?.msEchec)} | ${d(r.msReussite, a?.msReussite)} | ${scores} | ${ok(!r.fuiteReference && !r.echecFuiteReference)} |`);
  }

  console.log('\n## 3 · Ce que le CP0 ne pouvait pas mesurer\n');
  console.log('| exercice | révisions | historique | refus 409 | diagnostic | aide | provenance | preuves |');
  console.log('|---|---|---|---|---|---|---|---|');
  for (const r of res) {
    const a = r.acquis;
    console.log(`| \`${r.id}\` | ${ok(a.revisions)} | ${ok(a.historiqueServi)} ${a.historiqueEntrees} | ${ok(a.refus409)} | ${a.diagnosticClasse ?? '—'}${a.diagnosticExploitable === false ? ' (non exploitable)' : ''} | ${a.aideServie ?? '—'} | ${ok(a.provenanceRendue)} | ${a.preuves === null ? '—' : `**${a.preuves}**`} |`);
  }

  const compte = (f) => res.filter(f).length;
  console.log('\n## 4 · Bilan sur les douze\n');
  console.log('| vérification | CP0 | CP12 |');
  console.log('|---|---|---|');
  const av = [...avant.values()];
  const cmp = (f) => `${av.length ? av.filter(f).length : '—'} / ${av.length || 12}`;
  console.log(`| la boucle complète passe | ${cmp((r) => r.ouvre && r.echoue && r.reussit && r.echecPersiste && r.reussitePersiste && r.preuveEcrite)} | **${compte((r) => r.ouvre && r.echoue && r.reussit && r.echecPersiste && r.reussitePersiste && r.preuveEcrite)} / ${res.length}** |`);
  console.log(`| aucune fuite de correction | ${cmp((r) => !r.fuiteReference && !r.echecFuiteReference)} | **${compte((r) => !r.fuiteReference && !r.echecFuiteReference)} / ${res.length}** |`);
  console.log(`| aucun attendu servi à l'ouverture | ${cmp((r) => !r.fuiteAttendus)} | **${compte((r) => !r.fuiteAttendus)} / ${res.length}** |`);
  console.log(`| la remédiation est servie après l'échec | ${cmp((r) => r.aRemediation)} | **${compte((r) => r.aRemediation)} / ${res.length}** |`);
  console.log(`| révisions servies (CP9) | — | **${compte((r) => r.acquis.revisions)} / ${res.length}** |`);
  console.log(`| historique servi (CP10) | — | **${compte((r) => r.acquis.historiqueServi)} / ${res.length}** |`);
  console.log(`| sauvegarde périmée refusée (CP9) | — | **${compte((r) => r.acquis.refus409 === true)} / ${compte((r) => r.acquis.refus409 !== null)}** |`);
  console.log(`| diagnostic rendu (CP6) | — | **${compte((r) => r.acquis.diagnosticRendu)} / ${res.length}** |`);
  console.log(`| provenance rendue (CP7) | — | **${compte((r) => r.acquis.provenanceRendue)} / ${res.length}** |`);
  console.log(`| **une seule preuve par réussite (CP11)** | — | **${compte((r) => r.acquis.preuves === 1)} / ${compte((r) => r.acquis.preuves !== null)}** |`);

  const casses = res.filter((r) => !(r.ouvre && r.echoue && r.reussit && r.echecPersiste && r.reussitePersiste && r.preuveEcrite));
  const fuites = res.filter((r) => r.fuiteReference || r.echecFuiteReference || r.fuiteAttendus);
  const doubles = res.filter((r) => r.acquis.preuves !== null && r.acquis.preuves !== 1);
  console.log('\n## 5 · Verdict\n');
  console.log(`**Parcours cassés** : ${casses.length === 0 ? '✅ aucun' : `❌ ${casses.map((r) => r.id).join(' ')}`}`);
  console.log(`**Fuites** : ${fuites.length === 0 ? '✅ aucune' : `❌ ${fuites.map((r) => r.id).join(' ')}`}`);
  console.log(`**Preuves en double** : ${doubles.length === 0 ? '✅ aucune' : `❌ ${doubles.map((r) => `${r.id} (${r.acquis.preuves})`).join(' ')}`}`);

  writeFileSync(join(ROOT, 'docs', 'v76', 'cp12-e2e.json'), `${JSON.stringify(res, null, 1)}\n`);
  console.log('\nécrit : docs/v76/cp12-e2e.json');
  if (casses.length || fuites.length || doubles.length) process.exitCode = 1;
}
