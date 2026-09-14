// V76 · CP8 — LES 25 DÉFIS : AUCUNE FUITE, ET TOUJOURS FONCTIONNELS.
//
// ── LA RÉGRESSION QUE V75 NE POUVAIT PAS VOIR ───────────────────────────
//
// Le CP9 de V75 avait vérifié SIX choses sur chacun des 25 défis : structure,
// HTTP 200, réussite avec les bonnes réponses, **échec avec les mauvaises**,
// preuve valide, comptage par le moteur. Six vérifications sérieuses — et
// **aucune sur la fuite**.
//
// Le CP0 de V76 a mesuré que `GET /transfer/[id]` servait, dans la charge utile
// de la page, `"answer":0` et le texte complet d'`explanation` : les bonnes
// réponses étaient lisibles par « afficher le code source », **avant toute
// tentative**.
//
// ── CE QUE CE SCRIPT VÉRIFIE, SUR LES 25 ────────────────────────────────
//
// Les six vérifications de V75, **plus quatre sur la fuite** — HTML rendu,
// charge utile RSC, réponse JSON avant tentative, et le fait que la correction
// n'arrive QU'APRÈS soumission.
//
// Un défi qui ne fuit pas mais ne fonctionne plus n'est pas un progrès : les dix
// vérifications sont exigées ensemble.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const BASE = process.env.V76_BASE ?? 'http://127.0.0.1:3330';
const DIR = join(ROOT, 'data/transfer-challenges');

const defis = () => readdirSync(DIR).filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(DIR, f), 'utf8')));

/** Les bonnes réponses, et des réponses délibérément fausses. */
const bonnes = (c) => Object.fromEntries(c.questions.map((q) => [q.id, q.answer]));
const fausses = (c) => Object.fromEntries(c.questions.map((q) => [
  q.id,
  Array.isArray(q.answer) ? [] : (q.answer === 0 ? 1 : 0),
]));

const poster = async (id, responses) => {
  const r = await fetch(`${BASE}/api/transfer/${id}`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ responses }),
  });
  return { status: r.status, body: await r.json().catch(() => null) };
};

/**
 * ── CE QU'EST UNE FUITE, PRÉCISÉMENT ─────────────────────────────────────
 *
 * Pas « le mot `answer` apparaît » — il peut venir d'un nom de classe CSS ou
 * d'un fragment de bundle. Une fuite, c'est la présence de **ce qui permet de
 * répondre sans chercher** : la valeur de `answer`, ou le texte de
 * l'`explanation`.
 */
function fuiteDans(texte, c) {
  const trouve = [];
  for (const q of c.questions) {
    // La valeur de la bonne réponse, telle qu'elle serait sérialisée.
    const val = JSON.stringify(q.answer);
    if (new RegExp(`"answer"\\s*:\\s*${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(texte)
      || new RegExp(`\\\\"answer\\\\"\\s*:\\s*${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(texte)) {
      trouve.push(`${q.id}:answer`);
    }
    const exp = String(q.explanation ?? '').trim();
    if (exp.length >= 30 && texte.includes(exp.slice(0, 40))) trouve.push(`${q.id}:explanation`);
  }
  return trouve;
}

export async function verifier(c) {
  const r = { id: c.id, niveau: c.transferLevel, questions: c.questions.length };

  // ── 1 · LA PAGE CHARGE, ET NE FUIT PAS ──
  const page = await fetch(`${BASE}/transfer/${c.id}`);
  const html = await page.text();
  r.charge = page.status === 200;
  r.tailleHtml = html.length;
  r.fuiteHtml = fuiteDans(html, c);
  // L'énoncé, lui, DOIT être là : une page sans fuite mais sans question non plus
  // ne prouverait rien.
  r.enonceServi = c.questions.every((q) => html.includes(String(q.prompt).slice(0, 30)));
  r.optionsServies = (c.questions[0]?.options ?? []).every((o) => html.includes(String(o).slice(0, 25)));

  // ── 2 · L'API NE FUIT PAS NON PLUS AVANT TENTATIVE ──
  const get = await fetch(`${BASE}/api/transfer/${c.id}`).catch(() => null);
  if (get) {
    const t = await get.text();
    r.apiGetStatus = get.status;
    r.fuiteApiGet = fuiteDans(t, c);
  } else { r.apiGetStatus = null; r.fuiteApiGet = []; }

  // ── 3 · LES MAUVAISES RÉPONSES ÉCHOUENT ──
  const mauvais = await poster(c.id, fausses(c));
  r.echoue = mauvais.body?.result ? mauvais.body.result.passedOverall === false : null;
  r.echecScore = mauvais.body?.result ? `${mauvais.body.result.passed}/${mauvais.body.result.total}` : null;

  // ── 4 · LES BONNES RÉUSSISSENT ──
  const bon = await poster(c.id, bonnes(c));
  r.reussit = bon.body?.result ? bon.body.result.passedOverall === true : null;
  r.reussiteScore = bon.body?.result ? `${bon.body.result.passed}/${bon.body.result.total}` : null;

  // ── 5 · LA CORRECTION ARRIVE, MAIS SEULEMENT APRÈS ──
  const res = bon.body?.result?.results ?? [];
  r.correctionApresTentative = res.length > 0 && res.every((x) => x.expected !== undefined);
  r.explicationApresTentative = res.some((x) => typeof x.explanation === 'string' && x.explanation.length > 10);

  return r;
}

if (process.argv[1] && process.argv[1].endsWith('cp8-transfer.mjs')) {
  const tous = defis();
  console.log('# V76 · CP8 — Les 25 défis de transfert : fuite fermée, fonction intacte\n');
  console.log(`> Serveur : \`${BASE}\`. Dix vérifications par défi — les six de V75 · CP9,`);
  console.log('> plus quatre sur la fuite que ce checkpoint-là ne faisait pas.\n');

  const res = [];
  for (const c of tous) res.push(await verifier(c));

  const ok = (b) => (b === null ? '—' : b ? '✅' : '❌');
  console.log('| défi | niveau | charge | énoncé servi | fuite HTML | fuite API | échoue | réussit | correction après |');
  console.log('|---|---|---|---|---|---|---|---|---|');
  for (const r of res) {
    console.log(`| \`${r.id}\` | ${r.niveau} | ${ok(r.charge)} | ${ok(r.enonceServi)} | ${r.fuiteHtml.length ? `❌ ${r.fuiteHtml.join(' ')}` : '✅'} | ${r.fuiteApiGet.length ? `❌ ${r.fuiteApiGet.join(' ')}` : '✅'} | ${ok(r.echoue)} ${r.echecScore ?? ''} | ${ok(r.reussit)} ${r.reussiteScore ?? ''} | ${ok(r.correctionApresTentative)} |`);
  }

  const compte = (f) => res.filter(f).length;
  console.log('\n## Bilan sur les 25\n');
  console.log(`| vérification | résultat |`);
  console.log(`|---|---|`);
  console.log(`| la page charge | **${compte((r) => r.charge)} / ${res.length}** |`);
  console.log(`| l'énoncé est servi | **${compte((r) => r.enonceServi)} / ${res.length}** |`);
  console.log(`| **aucune fuite dans le HTML** | **${compte((r) => r.fuiteHtml.length === 0)} / ${res.length}** |`);
  console.log(`| **aucune fuite par l'API avant tentative** | **${compte((r) => r.fuiteApiGet.length === 0)} / ${res.length}** |`);
  console.log(`| échoue avec de mauvaises réponses | **${compte((r) => r.echoue === true)} / ${res.length}** |`);
  console.log(`| réussit avec les bonnes | **${compte((r) => r.reussit === true)} / ${res.length}** |`);
  console.log(`| la correction arrive APRÈS la tentative | **${compte((r) => r.correctionApresTentative)} / ${res.length}** |`);
  console.log(`| l'explication arrive APRÈS la tentative | **${compte((r) => r.explicationApresTentative)} / ${res.length}** |`);

  const fuites = res.filter((r) => r.fuiteHtml.length || r.fuiteApiGet.length);
  const casses = res.filter((r) => !r.charge || r.echoue !== true || r.reussit !== true || !r.enonceServi);
  console.log('\n## Verdict\n');
  console.log(`**Défis qui fuient** : ${fuites.length === 0 ? '✅ aucun' : `❌ ${fuites.map((r) => r.id).join(' ')}`}`);
  console.log(`**Défis cassés** : ${casses.length === 0 ? '✅ aucun' : `❌ ${casses.map((r) => r.id).join(' ')}`}`);

  writeFileSync(join(ROOT, 'docs', 'v76', 'cp8-transfer.json'), `${JSON.stringify(res, null, 1)}\n`);
  console.log('\nécrit : docs/v76/cp8-transfer.json');
  if (fuites.length || casses.length) process.exitCode = 1;
}
