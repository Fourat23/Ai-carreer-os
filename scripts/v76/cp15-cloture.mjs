// V76 · CP15 — LES DEUX DERNIÈRES MESURES AVANT DE RENDRE UN VERDICT.
//
// ── POURQUOI CE SCRIPT EXISTE ───────────────────────────────────────────
//
// Le contrat gelé du CP1 laissait deux choses en suspens, et il les nommait :
//
//   · **`W15` — le déterminisme**, « deux exécutions identiques ». Le CP12 a
//     montré que les scores n'avaient pas bougé entre le CP0 et aujourd'hui,
//     ce qui est un déterminisme DANS LE TEMPS. Ce n'est pas la même chose que
//     deux lancements consécutifs du même code ;
//
//   · **`T18` — XSS dans l'aperçu web**, déclarée « non mesurée au CP0 », « à
//     sonder au CP14 ». Le CP14 a rejoué les seize sondes d'attaque du CP0 et
//     n'a pas mesuré celle-là.
//
// Rendre un verdict `READY` en laissant une menace déclarée « à mesurer » sans
// l'avoir mesurée serait exactement le genre de ligne verte que ce sprint passe
// son temps à refuser. On la mesure donc, et le résultat compte — quel qu'il
// soit.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const BASE = process.env.V76_BASE ?? 'http://127.0.0.1:3302';
const jlire = (p) => JSON.parse(readFileSync(p, 'utf8'));
const EX = (id) => jlire(join(ROOT, 'data/exercises', `${id}.json`));

const post = (id, body) => fetch(`${BASE}/api/lab/${id}`, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
}).then((r) => r.json().catch(() => null));

const depart = (id) => {
  const out = {};
  for (const f of EX(id).workspace?.files ?? []) if (!f.hidden && !f.readOnly) out[f.path] = f.content ?? '';
  return out;
};
const reference = (id) => ({ ...depart(id), ...(EX(id).reference ?? {}) });

/**
 * ── ANOMALIE DE SONDE V76 n° 8, CORRIGÉE ICI ─────────────────────────────
 *
 * La première version cherchait `allow-same-origin` **dans tout le fichier** et
 * criait au défaut sur les deux aperçus. C'était faux : les deux portent
 * `sandbox="allow-scripts"`, sans `allow-same-origin`, c'est-à-dire exactement
 * la configuration sûre. La chaîne trouvée était dans le COMMENTAIRE qui
 * explique pourquoi elle est absente :
 *
 *   « iframe SANDBOXÉE (allow-scripts uniquement, pas de allow-same-origin) »
 *
 * Une sonde qui lit la documentation d'une protection et la prend pour son
 * contraire est la même famille que les anomalies n° 1 et n° 3 : **chercher la
 * bonne chose au mauvais endroit**. On ne lit donc plus que la VALEUR de
 * l'attribut.
 */
function attributsSandbox(chemin) {
  const ui = readFileSync(join(ROOT, chemin), 'utf8');
  const code = ui.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
  const m = code.match(/sandbox="([^"]*)"/);
  const attrs = m?.[1] ?? '';
  const jetons = attrs.split(/\s+/).filter(Boolean);
  return { attrs, aSandbox: !!m, memeOrigine: jetons.includes('allow-same-origin'), jetons };
}

export const SONDES = [
  {
    id: 'F1', nom: 'W15 · DÉTERMINISME : deux lancements identiques donnent le même verdict',
    async run() {
      // Sur les six familles de runtime, pas seulement sur la plus simple :
      // c'est la compilation TSX et l'import de `pandas` qui pourraient
      // introduire une variation, pas `console.log`.
      const cibles = ['a11y-accessible-name', 'agent-detect-loop', 'ds-stack', 'react-counter', 'web-card', 'dl-forward-2layer'];
      const ecarts = [];
      for (const id of cibles) {
        const a = await post(id, { action: 'run', files: depart(id) });
        await new Promise((r) => setTimeout(r, 1100));
        const b = await post(id, { action: 'run', files: depart(id) });
        const cle = (x) => JSON.stringify((x?.attempt?.results ?? []).map((t) => [t.testId, t.passed]));
        if (cle(a) !== cle(b) || a?.attempt?.passed !== b?.attempt?.passed) {
          ecarts.push(`${id} : ${a?.attempt?.passed}/${a?.attempt?.total} puis ${b?.attempt?.passed}/${b?.attempt?.total}`);
        }
      }
      return {
        ok: ecarts.length === 0,
        detail: ecarts.length ? `❌ ${ecarts.join(' · ')}` : `${cibles.length} runtimes · verdicts identiques deux fois`,
      };
    },
  },
  {
    id: 'F2', nom: 'W15 · le même code corrigé réussit deux fois de suite',
    async run() {
      // La moitié qu'on oublie : un runner qui échouerait TOUJOURS serait
      // parfaitement déterministe, et parfaitement inutile.
      const ecarts = [];
      for (const id of ['a11y-accessible-name', 'ds-stack', 'web-card']) {
        const a = await post(id, { action: 'run', files: reference(id) });
        await new Promise((r) => setTimeout(r, 1100));
        const b = await post(id, { action: 'run', files: reference(id) });
        if (a?.attempt?.allPassed !== true || b?.attempt?.allPassed !== true) {
          ecarts.push(`${id} : ${a?.attempt?.allPassed} puis ${b?.attempt?.allPassed}`);
        }
      }
      return { ok: ecarts.length === 0, detail: ecarts.length ? `❌ ${ecarts.join(' · ')}` : '3/3 réussissent deux fois' };
    },
  },
  {
    id: 'F3', nom: 'T18 · l’aperçu web est-il CLOISONNÉ ? (menace déclarée non mesurée au CP0)',
    async run() {
      // L'aperçu rend du HTML et du JavaScript écrits par l'apprenant. La
      // question n'est pas « peut-on y exécuter du script » — c'est le but —
      // mais **ce que ce script peut atteindre** : la page du produit, ses
      // données, son origine.
      const { attrs, aSandbox, memeOrigine } = attributsSandbox('app/lab/[exerciseId]/FrontendPreview.tsx');
      return {
        // `allow-scripts` est nécessaire ; `allow-same-origin` avec lui
        // annulerait le cloisonnement — la combinaison des deux redonne à
        // l'iframe l'accès à l'origine du produit.
        ok: aSandbox && !memeOrigine,
        detail: aSandbox
          ? `sandbox = « ${attrs} » · allow-same-origin : ${memeOrigine ? '❌ OUI' : 'non'}`
          : '❌ aucun attribut `sandbox` sur l’aperçu',
      };
    },
  },
  {
    id: 'F4', nom: 'T18 · l’aperçu REACT est cloisonné lui aussi',
    async run() {
      const { attrs, aSandbox, memeOrigine } = attributsSandbox('app/lab/[exerciseId]/ReactPreview.tsx');
      return {
        ok: aSandbox && !memeOrigine,
        detail: aSandbox ? `sandbox = « ${attrs} » · allow-same-origin : ${memeOrigine ? '❌ OUI' : 'non'}`
          : '❌ aucun attribut `sandbox`',
      };
    },
  },
  {
    id: 'F5', nom: 'T18 · le document d’aperçu ne transporte aucune donnée du produit',
    async run() {
      // L'aperçu WEB est construit côté client (`lib/frontend-preview`) ; seul
      // l'aperçu REACT passe par le serveur. On mesure donc celui-là, sur un
      // exercice `react-tsx` — interroger `web-card` rendait un document vide,
      // et un document vide ne prouve rien.
      const ex = EX('react-counter');
      const fichiers = {};
      for (const f of ex.workspace?.files ?? []) if (!f.hidden) fichiers[f.path] = f.content ?? '';
      const r = await post('react-counter', { action: 'preview', files: fichiers });
      const doc = String(r?.srcDoc ?? '');
      // Le document d'aperçu ne doit pas embarquer de jeton, de cookie ni
      // d'adresse d'API du produit.
      const fuites = ['/api/progress', '/api/lab', 'document.cookie'].filter((s) => doc.includes(s));
      return {
        ok: doc.length > 0 && fuites.length === 0,
        detail: doc.length
          ? (fuites.length ? `❌ le document d’aperçu contient : ${fuites.join(' ')}` : `document de ${doc.length} o, aucune adresse d’API ni cookie`)
          : '❌ aucun aperçu produit',
      };
    },
  },
];

if (process.argv[1] && process.argv[1].endsWith('cp15-cloture.mjs')) {
  console.log('# V76 · CP15 — Les deux dernières mesures\n');
  console.log(`> Serveur : \`${BASE}\`. \`W15\` (déterminisme) et \`T18\` (XSS dans l’aperçu),`);
  console.log('> la seule menace du modèle que le CP14 n’avait pas rejouée.\n');
  console.log('| # | sonde | résultat | observation |');
  console.log('|---|---|---|---|');
  const res = [];
  for (const s of SONDES) {
    let r;
    try { r = await s.run(); } catch (e) { r = { ok: false, detail: `sonde en erreur : ${String(e.message ?? e).slice(0, 90)}` }; }
    res.push({ id: s.id, nom: s.nom, ...r });
    console.log(`| ${s.id} | ${s.nom} | ${r.ok === null ? '⚪' : r.ok ? '✅' : '❌'} | ${r.detail} |`);
  }
  const ko = res.filter((r) => r.ok === false);
  console.log(`\n**Sondes en échec** : ${ko.length === 0 ? '✅ aucune' : `❌ ${ko.map((r) => r.id).join(' ')}`}`);
  writeFileSync(join(ROOT, 'docs', 'v76', 'cp15-cloture.json'), `${JSON.stringify(res, null, 1)}\n`);
  console.log('\nécrit : docs/v76/cp15-cloture.json');
  if (ko.length) process.exitCode = 1;
}
