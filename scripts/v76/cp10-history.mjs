// V76 · CP10 — L'HISTORIQUE DES TENTATIVES, ET CE QU'ON PEUT EN FAIRE.
//
// ── CE QUE LE BRIEF DIT, ET CE QU'IL NE FAUT PAS EN DÉDUIRE ─────────────
//
//   > « L'historique existe déjà. Construire uniquement le manque démontré :
//   >   comparaison utile entre tentatives. Pas un Git clone. »
//
// « L'historique existe déjà » est vrai deux fois, et de deux façons qui ne se
// rejoignent pas :
//
//   · le FAIT existe — `ExerciseAttempt`, créé au CP2 de V74, persisté à chaque
//     lancement, réussite comme échec, dédupliqué par clé métier, trié ;
//   · la SURFACE existe — le panneau « Exécutions récentes » du Workbench.
//
// Mais la surface ne lit pas le fait : elle tient sa propre liste en mémoire,
// dans un `useState`, plafonnée à cinq, et affichée seulement à partir de la
// deuxième exécution. Un rechargement de page la vide, alors que le serveur,
// lui, a tout gardé.
//
// Ce script mesure exactement cela, plutôt que de le supposer.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const BASE = process.env.V76_BASE ?? 'http://127.0.0.1:3340';
const PROGRESS = process.env.AICOS_PROGRESS_FILE ?? null;
const CIBLE = 'a11y-accessible-name';

const jlire = (p) => JSON.parse(readFileSync(p, 'utf8'));
const EX = (id) => jlire(join(ROOT, 'data/exercises', `${id}.json`));
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');

const appel = async (id, body) => {
  const r = await fetch(`${BASE}/api/lab/${id}`, body
    ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }
    : undefined);
  let j = null;
  try { j = await r.json(); } catch { /* corps non-JSON */ }
  return { status: r.status, body: j };
};

const depart = (id) => {
  const out = {};
  for (const f of EX(id).workspace?.files ?? []) if (!f.hidden && !f.readOnly) out[f.path] = f.content ?? '';
  return out;
};
const entree = (id) => EX(id).workspace?.entry ?? Object.keys(depart(id))[0];

/** Les tentatives persistées pour cet exercice, telles que le disque les tient. */
function tentativesPersistees(id) {
  if (!PROGRESS) return null;
  try {
    const p = jlire(PROGRESS);
    const t = p.tracks?.[p.activeTrackId] ?? {};
    return (t.exerciseAttempts ?? []).filter((a) => a?.exerciseId === id);
  } catch { return null; }
}

export const SONDES = [
  {
    id: 'H1', nom: 'le FAIT est persisté à chaque lancement, réussite comme échec',
    async run() {
      const avant = (tentativesPersistees(CIBLE) ?? []).length;
      await appel(CIBLE, { action: 'run', files: depart(CIBLE) });               // échec
      await new Promise((r) => setTimeout(r, 1100));                              // clé métier à la seconde
      await appel(CIBLE, { action: 'run', files: { ...depart(CIBLE), ...(EX(CIBLE).reference ?? {}) } }); // réussite
      const apres = (tentativesPersistees(CIBLE) ?? []).length;
      return { ok: apres >= avant + 2, detail: `${avant} → ${apres} tentatives persistées` };
    },
  },
  {
    id: 'H2', nom: 'l’API du laboratoire SERT-ELLE cet historique ?',
    async run() {
      const g = await appel(CIBLE, null);
      const cles = Object.keys(g.body ?? {});
      const sert = Object.hasOwn(g.body ?? {}, 'history');
      return { ok: sert, detail: sert ? `servi (${(g.body.history ?? []).length} entrées)` : `❌ non — la réponse contient : ${cles.join(', ')}` };
    },
  },
  {
    id: 'H3', nom: 'la surface garde-t-elle l’historique après un rechargement ?',
    async run() {
      // Mesure STATIQUE, parce que c'est là que la réponse se lit sans ambiguïté :
      // une liste tenue dans un `useState` initialisé vide ne survit à rien.
      const ui = lire('app/lab/[exerciseId]/LabWorkspace.tsx');
      const memoire = /const \[history, setHistory\] = useState<[^>]*>\(\[\]\)/.test(ui);
      const hydrate = /setHistory\((?:data|j)\.history/.test(ui) || /history:\s*data\.history/.test(ui);
      return {
        ok: hydrate,
        detail: hydrate ? 'hydratée depuis le serveur'
          : `❌ non — liste en mémoire seule${memoire ? ' (`useState([])`)' : ''}, vidée à chaque rechargement`,
      };
    },
  },
  // ── H4 · H5 · H6 — REFORMULÉES APRÈS LA MESURE, ET POURQUOI ────────────
  //
  // Leur première version interrogeait le FAIT `ExerciseAttempt` : elles
  // cherchaient `results`, `hintViews` et `files` parmi SES champs, et
  // rendaient trois ❌ (« absents : tests aides code »). La mesure était juste,
  // la question était mal posée : le CP10 a décidé de **ne pas étendre le
  // fait** — il est gelé au contrat V74 §3.2, il alimente la rétention, et y
  // verser du code source en changerait la nature.
  //
  // Ce que le produit doit offrir, c'est la CAPACITÉ, pas un champ à un endroit
  // donné. Les trois sondes la vérifient donc là où elle vit désormais :
  // l'historique servi, et la comparaison. **Le verdict AVANT reste ❌ pour les
  // trois** — il est conservé dans `docs/v76/V76-CP10-HISTORY-DIFF.md`, et
  // aucune de ces sondes n'a été affaiblie pour passer au vert : elles exigent
  // maintenant plus, pas moins.
  {
    id: 'H4', nom: 'l’historique servi porte-t-il de quoi COMPARER ?',
    async run() {
      const g = await appel(CIBLE, null);
      const h = (g.body?.history ?? []);
      const d = h[0] ?? {};
      const attendus = { outcome: 'outcome', horodatage: 'at', tests: 'tests', aides: 'aides', fichiers: 'fichiers' };
      const absents = Object.entries(attendus).filter(([, k]) => !Object.hasOwn(d, k)).map(([n]) => n);
      return {
        ok: h.length > 0 && absents.length === 0,
        detail: h.length ? `présents : ${Object.keys(attendus).filter((n) => !absents.includes(n)).join(' ')} · absents : ${absents.join(' ') || '—'}`
          : '❌ aucun historique servi',
      };
    },
  },
  {
    id: 'H5', nom: 'le CODE d’une tentative passée est-il retrouvable ?',
    async run() {
      // Sans lui, aucun « diff pertinent » n'est possible : on ne compare pas
      // deux nombres de tests réussis, on compare deux versions d'un fichier.
      //
      // Il n'est PAS servi dans la liste — un historique qui embarquerait douze
      // copies de l'espace de travail pèserait à chaque ouverture de page. Il
      // doit l'être au moment où on en a besoin : la comparaison.
      const g = await appel(CIBLE, null);
      const h = (g.body?.history ?? []).filter((x) => x?.conserve);
      if (h.length < 2) return { ok: false, detail: '❌ moins de deux tentatives conservées' };
      const c = await appel(CIBLE, { action: 'compare', a: h[1].cle, b: h[0].cle });
      const fichiers = c.body?.comparaison?.fichiers ?? [];
      // Une comparaison qui ne connaîtrait aucun fichier ne pourrait pas
      // distinguer « identique » de « code inconnu ».
      return {
        ok: fichiers.length > 0,
        detail: fichiers.length ? `${fichiers.length} fichier(s) retrouvé(s) : ${fichiers.map((f) => f.chemin).join(', ')}`
          : '❌ non — la comparaison ne retrouve aucun fichier',
      };
    },
  },
  {
    id: 'H6', nom: 'sait-on QUELS tests ont changé d’état entre deux tentatives ?',
    async run() {
      const g = await appel(CIBLE, null);
      const h = (g.body?.history ?? []).filter((x) => x?.conserve && (x.tests ?? []).length);
      return {
        ok: h.length >= 2,
        detail: h.length >= 2 ? `${h.length} tentatives portent leurs résultats de test publics`
          : '❌ non — `3/5` puis `4/5` ne dit pas LEQUEL est passé au vert',
      };
    },
  },
  {
    id: 'H7', nom: 'les AIDES consultées sont-elles rattachées à l’historique ?',
    async run() {
      // Le CP7 a créé le fait `hintViews`. Le rattacher à l'historique est ce
      // qui distingue « réussi à la 4ᵉ tentative » de « réussi à la 4ᵉ, après
      // avoir lu la correction entre la 3ᵉ et la 4ᵉ ».
      const g = await appel(CIBLE, null);
      const h = (g.body?.history ?? []);
      const avecAides = h.filter((x) => Array.isArray(x?.aides));
      return {
        ok: avecAides.length > 0,
        detail: avecAides.length ? `${avecAides.length}/${h.length} entrées portent les aides consultées`
          : '❌ non — le fait existe depuis le CP7, il n’atteint pas l’historique',
      };
    },
  },
  {
    id: 'H8', nom: 'une COMPARAISON entre deux tentatives est-elle offerte ?',
    async run() {
      const g = await appel(CIBLE, null);
      const h = (g.body?.history ?? []).filter((x) => x?.conserve);
      if (h.length < 2) return { ok: false, detail: '❌ non — moins de deux tentatives conservées' };
      const c = await appel(CIBLE, { action: 'compare', a: h[1].cle, b: h[0].cle });
      const cmp = c.body?.comparaison;
      const ok = c.status === 200 && cmp?.lisible === true;
      return { ok, detail: ok ? `oui — ${cmp.lecture}` : `❌ non — statut ${c.status} · ${String(c.body?.error ?? cmp?.raison ?? '').slice(0, 60)}` };
    },
  },
  {
    id: 'H11', nom: 'la comparaison dit QUEL test a basculé, pas seulement le score',
    async run() {
      // Le cas décisif : un échec (départ) puis une réussite (correction). Si la
      // comparaison ne sait pas nommer les tests passés au vert, elle n'apporte
      // rien de plus que « 0/3 puis 3/3 ».
      await appel(CIBLE, { action: 'run', files: depart(CIBLE) });
      await new Promise((r) => setTimeout(r, 1100));
      await appel(CIBLE, { action: 'run', files: { ...depart(CIBLE), ...(EX(CIBLE).reference ?? {}) } });
      const g = await appel(CIBLE, null);
      const h = (g.body?.history ?? []).filter((x) => x?.conserve);
      if (h.length < 2) return { ok: false, detail: 'moins de deux tentatives conservées' };
      const c = await appel(CIBLE, { action: 'compare', a: h[1].cle, b: h[0].cle });
      const cmp = c.body?.comparaison;
      const nommes = cmp?.tests?.reussis ?? [];
      const diff = (cmp?.fichiers ?? []).filter((f) => !f.identique);
      return {
        ok: nommes.length > 0 && diff.length > 0,
        detail: nommes.length
          ? `tests passés au vert : ${nommes.join(', ')} · ${diff.length} fichier(s) avec diff (+${diff.reduce((s, f) => s + f.ajoutees, 0)}/−${diff.reduce((s, f) => s + f.retirees, 0)})`
          : '❌ aucun test nommé',
      };
    },
  },
  {
    id: 'H13', nom: 'l’ordre de sélection n’inverse PAS la lecture de la comparaison',
    async run() {
      // L'apprenant coche deux lignes ; rien ne garantit qu'il commence par la
      // plus ancienne. Comparer « du récent vers l'ancien » échangerait ajouts
      // et suppressions, et présenterait un progrès comme une régression — la
      // pire erreur possible pour une surface d'apprentissage.
      const g = await appel(CIBLE, null);
      const h = (g.body?.history ?? []).filter((x) => x?.conserve);
      if (h.length < 2) return { ok: false, detail: 'moins de deux tentatives conservées' };
      const [recent, ancien] = h;
      const droit = (await appel(CIBLE, { action: 'compare', a: ancien.cle, b: recent.cle })).body?.comparaison;
      const inverse = (await appel(CIBLE, { action: 'compare', a: recent.cle, b: ancien.cle })).body?.comparaison;
      const memeLecture = droit?.lecture === inverse?.lecture;
      const memeSens = droit?.de?.at === inverse?.de?.at && droit?.vers?.at === inverse?.vers?.at;
      return {
        ok: !!droit?.lisible && memeLecture && memeSens,
        detail: memeLecture && memeSens ? 'les deux sens donnent la même comparaison'
          : `❌ l’ordre change le résultat — lecture identique : ${memeLecture} · sens identique : ${memeSens}`,
      };
    },
  },
  {
    id: 'H12', nom: 'un `RESET` n’efface PAS le journal des tentatives',
    async run() {
      // Le contrat §1.11 : effacer l'histoire d'un échec est le contournement
      // `R4`. Le journal vit hors de l'espace de travail précisément pour ça.
      const avant = ((await appel(CIBLE, null)).body?.history ?? []).filter((x) => x?.conserve).length;
      await appel(CIBLE, { action: 'reset' });
      await appel(CIBLE, { action: 'reset-file', path: entree(CIBLE) });
      const apres = ((await appel(CIBLE, null)).body?.history ?? []).filter((x) => x?.conserve).length;
      return { ok: apres >= avant && avant > 0, detail: `${avant} → ${apres} tentatives conservées` };
    },
  },
  {
    id: 'H9', nom: 'l’historique servi n’expose AUCUN test privé ni correction',
    async run() {
      const g = await appel(CIBLE, null);
      const h = g.body?.history ?? [];
      const json = JSON.stringify(h);
      const ex = EX(CIBLE);
      const prives = (ex.tests ?? []).filter((t) => t.private).map((t) => t.name);
      const fuitesTests = prives.filter((n) => json.includes(n));
      const ref = Object.values(ex.reference ?? {}).join('\n');
      const lignesRef = ref.split('\n').map((l) => l.trim()).filter((l) => l.length > 25);
      const departTxt = Object.values(depart(CIBLE)).join('\n');
      const distinctives = lignesRef.filter((l) => !departTxt.includes(l));
      const fuitesRef = distinctives.filter((l) => json.includes(l));
      return {
        ok: fuitesTests.length === 0 && fuitesRef.length === 0,
        detail: fuitesTests.length || fuitesRef.length
          ? `❌ ${fuitesTests.length} test(s) privé(s) · ${fuitesRef.length} ligne(s) de correction`
          : `aucune fuite (${prives.length} tests privés, ${distinctives.length} lignes distinctives vérifiées)`,
      };
    },
  },
  {
    id: 'H10', nom: 'l’historique reste BORNÉ (il ne grossit pas sans fin)',
    async run() {
      const g = await appel(CIBLE, null);
      const h = g.body?.history ?? [];
      const taille = JSON.stringify(h).length;
      // Une comparaison exige de garder du code ; garder du code sans borne
      // transforme un espace de travail en dépôt d'archives.
      return {
        ok: h.length <= 20 && taille <= 400_000,
        detail: `${h.length} entrées · ${taille} octets servis`,
      };
    },
  },
];

if (process.argv[1] && process.argv[1].endsWith('cp10-history.mjs')) {
  console.log('# V76 · CP10 — Historique des tentatives et comparaison\n');
  console.log(`> Serveur : \`${BASE}\` · progression : fixture hors dépôt · cible \`${CIBLE}\`.\n`);
  console.log('| # | sonde | résultat | observation |');
  console.log('|---|---|---|---|');
  const res = [];
  for (const s of SONDES) {
    let r;
    try { r = await s.run(); } catch (e) { r = { ok: false, detail: `sonde en erreur : ${String(e.message ?? e).slice(0, 80)}` }; }
    res.push({ id: s.id, nom: s.nom, ...r });
    console.log(`| ${s.id} | ${s.nom} | ${r.ok === null ? '⚪' : r.ok ? '✅' : '❌'} | ${r.detail} |`);
  }
  const ko = res.filter((r) => r.ok === false);
  console.log(`\n**Sondes en échec** : ${ko.length === 0 ? '✅ aucune' : `❌ ${ko.map((r) => r.id).join(' ')}`}`);
  writeFileSync(join(ROOT, 'docs', 'v76', 'cp10-history.json'), `${JSON.stringify(res, null, 1)}\n`);
  console.log('\nécrit : docs/v76/cp10-history.json');
}
