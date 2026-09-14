// V76 · CP4 — LES TROIS EXERCICES MULTI-FICHIERS, UN PAR UN.
//
// ── POURQUOI TROIS, ET PAS UNE ARCHITECTURE ─────────────────────────────
//
// Le CP0 a compté : **3 exercices sur 376** ont plus d'un fichier éditable, et
// tous les trois sont des exercices `web`. Le brief est explicite :
//
//   > Ne construis pas multi-file si aucun exercice ne le nécessite.
//   > Si tout fonctionne : NE RIEN RECONSTRUIRE.
//
// Ce script ne conçoit donc rien : il joue la séquence complète demandée par le
// brief sur chacun des trois, par HTTP, et rapporte ce qui casse.
//
//   départ → éditer A → éditer B → (éditer C) → lancer → échec → reprise
//          → réussite → reset → recharger
//
// ── CE QU'IL VÉRIFIE EN PLUS, ET QUI COMPTE AUTANT ──────────────────────
//
// La séparation des trois natures de fichier gelée au CP1 :
//   · `USER_FILE`      → modifiable ;
//   · `READ_ONLY_FILE` → servi, jamais modifiable ;
//   · `HIDDEN_TEST_FILE` → jamais servi, jamais modifiable.
//
// Un multi-fichier qui laisserait écrire le fichier protégé serait pire qu'un
// mono-fichier : l'apprenant pourrait réussir en changeant l'énoncé.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const BASE = process.env.V76_BASE ?? 'http://127.0.0.1:3303';
const jlire = (p) => JSON.parse(readFileSync(p, 'utf8'));

/** Les exercices réellement multi-fichiers, DÉDUITS du corpus. */
export function multiFichiers() {
  return readdirSync(join(ROOT, 'data/exercises')).filter((f) => f.endsWith('.json'))
    .map((f) => jlire(join(ROOT, 'data/exercises', f)))
    .filter((e) => (e.workspace?.files ?? []).filter((x) => !x.hidden && !x.readOnly).length > 1);
}

const appel = async (id, body) => {
  const r = await fetch(`${BASE}/api/lab/${id}`, body
    ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }
    : undefined);
  let j = null;
  try { j = await r.json(); } catch { /* corps non-JSON : information */ }
  return { status: r.status, body: j };
};

const editables = (ex) => (ex.workspace?.files ?? []).filter((f) => !f.hidden && !f.readOnly);
const proteges = (ex) => (ex.workspace?.files ?? []).filter((f) => f.hidden || f.readOnly);
const depart = (ex) => Object.fromEntries(editables(ex).map((f) => [f.path, f.content ?? '']));
const reference = (ex) => ({ ...depart(ex), ...(ex.reference ?? {}) });

export async function sequence(ex) {
  const r = { id: ex.id, runtime: ex.runtime, fichiers: editables(ex).map((f) => f.path), proteges: proteges(ex).map((f) => f.path) };

  // 1 · DÉPART — l'arborescence est-elle servie en entier ?
  const g = await appel(ex.id, null);
  const servis = (g.body?.files ?? []);
  r.ouvre = g.status === 200;
  r.fichiersServis = servis.map((f) => f.path);
  r.tousEditablesServis = editables(ex).every((f) => r.fichiersServis.includes(f.path));
  r.lectureSeuleServie = proteges(ex).filter((f) => f.readOnly && !f.hidden).every((f) => r.fichiersServis.includes(f.path));
  // Un test caché ne doit JAMAIS apparaître dans l'arborescence servie.
  r.testsCachesNonServis = proteges(ex).filter((f) => f.hidden).every((f) => !r.fichiersServis.includes(f.path));
  // Les drapeaux d'édition sont-ils transmis au client ?
  r.drapeauxCorrects = servis.every((f) => {
    const src = (ex.workspace?.files ?? []).find((x) => x.path === f.path);
    return !src || (f.editable === !(src.readOnly || src.hidden));
  });
  r.langagesDistincts = [...new Set(servis.map((f) => f.language))];

  // 2 · ÉDITER CHAQUE FICHIER, UN PAR UN — et vérifier que chacun survit
  const marques = {};
  r.editionParFichier = [];
  for (const f of editables(ex)) {
    marques[f.path] = `${f.content ?? ''}\n/* V76-CP4 ${f.path} */\n`;
    const s = await appel(ex.id, { action: 'save', files: { [f.path]: marques[f.path] } });
    const relu = await appel(ex.id, null);
    const trouve = (relu.body?.files ?? []).find((x) => x.path === f.path);
    r.editionParFichier.push({
      fichier: f.path, statut: s.status,
      conserve: !!trouve && trouve.content.includes(`V76-CP4 ${f.path}`),
      // Éditer un fichier ne doit pas écraser les autres.
      autresIntacts: editables(ex).filter((o) => o.path !== f.path && marques[o.path])
        .every((o) => (relu.body?.files ?? []).find((x) => x.path === o.path)?.content.includes(`V76-CP4 ${o.path}`)),
    });
  }
  r.toutesEditionsConservees = r.editionParFichier.every((e) => e.conserve);
  r.editionsIndependantes = r.editionParFichier.every((e) => e.autresIntacts !== false);

  // 3 · UN FICHIER PROTÉGÉ EST-IL REFUSÉ ?
  const p0 = proteges(ex)[0];
  if (p0) {
    const t = await appel(ex.id, { action: 'run', files: { ...depart(ex), [p0.path]: '/* neutralisé */' } });
    r.protegeRefuse = t.status >= 400 || !!t.body?.error;
    r.protegeMessage = String(t.body?.error ?? '').slice(0, 80);
  } else { r.protegeRefuse = null; }

  // 4 · LANCER AVEC LE DÉPART → doit ÉCHOUER
  const echec = await appel(ex.id, { action: 'run', files: depart(ex) });
  r.echoue = echec.body?.attempt ? echec.body.attempt.allPassed === false : null;
  r.echecScore = echec.body?.attempt ? `${echec.body.attempt.passed}/${echec.body.attempt.total}` : null;

  // 5 · REPRISE AVEC LA CORRECTION → doit RÉUSSIR, TOUS FICHIERS ENVOYÉS
  const bon = await appel(ex.id, { action: 'run', files: reference(ex) });
  r.reussit = bon.body?.attempt ? bon.body.attempt.allPassed === true : null;
  r.reussiteScore = bon.body?.attempt ? `${bon.body.attempt.passed}/${bon.body.attempt.total}` : null;

  // 6 · RESET → tous les fichiers reviennent au départ, ENSEMBLE
  await appel(ex.id, { action: 'reset' });
  const apres = await appel(ex.id, null);
  r.resetToutRestaure = editables(ex).every((f) => {
    const t = (apres.body?.files ?? []).find((x) => x.path === f.path);
    return t && t.content === (f.content ?? '');
  });

  // 7 · RECHARGER (nouveau GET) → l'état est stable
  const relu2 = await appel(ex.id, null);
  r.rechargementStable = JSON.stringify((relu2.body?.files ?? []).map((f) => [f.path, f.content]))
    === JSON.stringify((apres.body?.files ?? []).map((f) => [f.path, f.content]));

  return r;
}

if (process.argv[1] && process.argv[1].endsWith('cp4-multifile.mjs')) {
  const ex = multiFichiers();
  console.log('# V76 · CP4 — Les exercices multi-fichiers, un par un\n');
  console.log(`> **${ex.length} exercices sur 376** ont plus d'un fichier éditable. Le brief interdit de`);
  console.log('> construire une architecture multi-fichier si rien ne l’exige : ce script vérifie');
  console.log('> donc que l’existant tient, et ne conçoit rien.\n');

  const res = [];
  for (const e of ex) res.push(await sequence(e));

  console.log('## Les exercices concernés\n');
  console.log('| exercice | runtime | fichiers éditables | fichiers protégés | langages servis |');
  console.log('|---|---|---|---|---|');
  for (const r of res) {
    console.log(`| \`${r.id}\` | ${r.runtime} | ${r.fichiers.map((f) => `\`${f}\``).join(' ')} | ${r.proteges.map((f) => `\`${f}\``).join(' ') || '—'} | ${r.langagesDistincts.join(' · ')} |`);
  }

  const ok = (b) => (b === null ? '—' : b ? '✅' : '❌');
  console.log('\n## La séquence complète du brief\n');
  console.log('| exercice | ouvre | tous servis | édition conservée | éditions indépendantes | échoue | réussit | reset | rechargement |');
  console.log('|---|---|---|---|---|---|---|---|---|');
  for (const r of res) {
    console.log(`| \`${r.id}\` | ${ok(r.ouvre)} | ${ok(r.tousEditablesServis)} | ${ok(r.toutesEditionsConservees)} | ${ok(r.editionsIndependantes)} | ${ok(r.echoue)} ${r.echecScore ?? ''} | ${ok(r.reussit)} ${r.reussiteScore ?? ''} | ${ok(r.resetToutRestaure)} | ${ok(r.rechargementStable)} |`);
  }

  console.log('\n## Les trois natures de fichier, gelées au CP1\n');
  console.log('| exercice | lecture seule servie | test caché NON servi | drapeaux transmis | écriture sur protégé refusée |');
  console.log('|---|---|---|---|---|');
  for (const r of res) {
    console.log(`| \`${r.id}\` | ${ok(r.lectureSeuleServie)} | ${ok(r.testsCachesNonServis)} | ${ok(r.drapeauxCorrects)} | ${ok(r.protegeRefuse)}${r.protegeMessage ? ` — « ${r.protegeMessage} »` : ''} |`);
  }

  const casses = res.filter((r) => !r.ouvre || !r.tousEditablesServis || !r.toutesEditionsConservees
    || r.echoue === false || !r.reussit || !r.resetToutRestaure || !r.rechargementStable || r.protegeRefuse === false);
  console.log('\n## Verdict\n');
  console.log(`**Exercices multi-fichiers en défaut** : ${casses.length === 0 ? '✅ aucun — rien à reconstruire' : `❌ ${casses.map((r) => r.id).join(' ')}`}`);

  writeFileSync(join(ROOT, 'docs', 'v76', 'cp4-multifile.json'), `${JSON.stringify(res, null, 1)}\n`);
  console.log('\nécrit : docs/v76/cp4-multifile.json');
  if (casses.length) process.exitCode = 1;
}
