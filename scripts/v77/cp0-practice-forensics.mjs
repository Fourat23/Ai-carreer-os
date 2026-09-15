// V77 · CP0 — QUELLES SURFACES DE PRATIQUE EXISTENT, ET QUE LAISSENT-ELLES ?
//
// ── LA QUESTION DE CE SPRINT ────────────────────────────────────────────
//
// V76 a répondu « oui » à *« peut-on exécuter du code ? »*. La question de V77
// est autre :
//
//   > Quand l'apprenant FAIT quelque chose d'important, le système sait-il
//   > observer ce travail proprement, quelle que soit la surface ?
//
// ── POURQUOI CE SCRIPT NE PART PAS DE LA LISTE V76 ──────────────────────
//
// Le CP0 de V76 a écrit : « onze surfaces de pratique, deux écrivent un fait
// (`lab` → `ExerciseAttempt`, `transfer` → `TransferAttempt`), neuf n'en
// écrivent aucun. »
//
// Cette phrase est le point de départ du brief V77. **Elle est partiellement
// fausse**, et ce script est construit pour le montrer plutôt que pour le
// répéter : `assessments` et `capstones` écrivent bien quelque chose — une
// `Evidence`. Recopier la liste de V76 aurait reconduit son erreur, et V77
// aurait « comblé » des trous qui n'existent pas pendant que les vrais
// restaient ouverts.
//
// On repart donc du disque : routes, API, données, écritures réelles.
//
// STRICTEMENT EN LECTURE. Aucune écriture produit, aucune mutation.
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
const jlire = (p) => { try { return JSON.parse(lire(p)); } catch { return null; } };
const existe = (p) => existsSync(join(ROOT, p));

/** Fichiers d'un répertoire, récursivement, filtrés par extension. */
function fichiers(dir, exts, acc = []) {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return acc;
  for (const e of readdirSync(abs, { withFileTypes: true })) {
    const rel = join(dir, e.name);
    if (e.isDirectory()) fichiers(rel, exts, acc);
    else if (exts.some((x) => e.name.endsWith(x))) acc.push(rel);
  }
  return acc;
}

const compterJson = (dir) => (existe(dir)
  ? readdirSync(join(ROOT, dir)).filter((f) => f.endsWith('.json')).length : 0);

// ── 1 · LES ÉCRITURES RÉELLES ───────────────────────────────────────────
//
// « Écrire un fait » n'est pas « avoir une route ». On cherche les appels qui
// touchent RÉELLEMENT l'état de l'apprenant, et on distingue les deux natures
// que V76 avait confondues :
//
//   · un ÉVÉNEMENT (`applyCommand` + une commande `RECORD_*`) — un fait daté,
//     non révisable, qui survit à son interprétation ;
//   · une PROJECTION (`makeEvidence` / `appendEvidence`) — une preuve, dérivée.
//
// Une surface qui n'écrit qu'une projection a le défaut nommé par V74 · CP0 :
// *le système persiste la projection et jette le fait.*
const MARQUEURS = {
  evenement: /applyCommand\s*\(|RECORD_[A-Z_]+/,
  preuve: /makeEvidence\s*\(|appendEvidence\s*\(|addEvidence\s*\(/,
  ecritureEtat: /writeProgress\s*\(/,
  lectureEtat: /readProgress\s*\(/,
};

function analyserFichier(p) {
  const src = lire(p);
  const code = src.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
  const out = {};
  for (const [nom, re] of Object.entries(MARQUEURS)) out[nom] = re.test(code);
  out.lignes = src.split('\n').length;
  // Les commandes nommées, le cas échéant.
  out.commandes = [...new Set((code.match(/type:\s*'([A-Z_]+)'/g) ?? [])
    .map((m) => m.match(/'([A-Z_]+)'/)[1]))];
  // Les types de source de preuve.
  out.sourceTypes = [...new Set((code.match(/sourceType:\s*'([a-z-]+)'/g) ?? [])
    .map((m) => m.match(/'([a-z-]+)'/)[1]))];
  return out;
}

// ── 2 · LES SURFACES, DÉDUITES DU DISQUE ────────────────────────────────
//
// Une surface est un endroit où l'apprenant PEUT AGIR. On la reconnaît à la
// conjonction d'une route et d'un moyen d'agir : une API qui accepte `POST`,
// un composant client qui poste, ou un runner.
//
// Les maquettes `design-spike/` sont exclues explicitement : ce sont des essais
// visuels, pas des surfaces de pratique. Les compter gonflerait l'inventaire
// sans rien apprendre.
const EXCLUS = /^app\/design-spike\//;

function surfaces() {
  const pages = fichiers('app', ['page.tsx'])
    .filter((p) => !EXCLUS.test(p))
    .map((p) => ({ fichier: p, route: `/${relative('app', p).replace(/\/page\.tsx$/, '').replace(/page\.tsx$/, '')}` }));
  const apis = fichiers('app/api', ['route.ts'])
    .map((p) => ({ fichier: p, route: `/${relative('app', p).replace(/\/route\.ts$/, '')}` }));

  const parApi = new Map(apis.map((a) => [a.route.replace('/api/', ''), a]));
  const out = [];
  for (const pg of pages) {
    const cle = pg.route.replace(/^\//, '');
    const racine = cle.split('/')[0];
    const api = parApi.get(cle) ?? [...parApi.entries()].find(([k]) => k.split('/')[0] === racine)?.[1] ?? null;
    out.push({
      id: racine || 'accueil',
      route: pg.route || '/',
      page: pg.fichier,
      api: api?.fichier ?? null,
      apiRoute: api?.route ?? null,
    });
  }
  // Les API SANS page : elles existent et sont appelées par un composant.
  for (const [cle, a] of parApi) {
    const racine = cle.split('/')[0];
    if (!out.some((s) => s.id === racine)) {
      out.push({ id: racine, route: null, page: null, api: a.fichier, apiRoute: a.route });
    }
  }
  // Dédupliquer par identifiant de racine, en gardant la variante la plus riche.
  const parId = new Map();
  for (const s of out) {
    const p = parId.get(s.id);
    if (!p || (!p.api && s.api) || (!p.page && s.page)) parId.set(s.id, { ...p, ...s });
  }
  return [...parId.values()].sort((a, b) => a.id.localeCompare(b.id));
}

// ── 3 · LE VOLUME DE PRATIQUE DERRIÈRE CHAQUE SURFACE ───────────────────
//
// Une surface sans contenu n'est pas une surface : le CP0 de V76 avait ainsi
// refusé de construire `SQL_WORKBENCH` pour zéro exercice.
const CONTENU = {
  lab: () => ({ source: 'data/exercises', n: compterJson('data/exercises') }),
  transfer: () => ({ source: 'data/transfer-challenges', n: compterJson('data/transfer-challenges') }),
  assessments: () => ({ source: 'data/assessments', n: compterJson('data/assessments') }),
  capstones: () => ({ source: 'data/capstones', n: compterJson('data/capstones') }),
  missions: () => ({ source: 'data/missions', n: compterJson('data/missions') }),
  terminal: () => ({ source: 'data/terminal-tasks', n: compterJson('data/terminal-tasks') }),
  pipelines: () => ({ source: 'data/pipelines', n: compterJson('data/pipelines') }),
  security: () => ({ source: 'data/security', n: compterJson('data/security') }),
  kubernetes: () => ({ source: 'data/manifests', n: compterJson('data/manifests') }),
  'cloud-lab': () => ({ source: 'data/cloud', n: compterJson('data/cloud') }),
  'cloud-foundations': () => ({ source: 'data/topologies', n: compterJson('data/topologies') }),
  resources: () => ({ source: 'data/playbooks', n: compterJson('data/playbooks') }),
};

// ── 4 · L'INVENTAIRE DES FAITS, RECOMPTÉ ────────────────────────────────
//
// Le brief l'exige : ne pas recopier la liste de V76, la recompter. On lit donc
// les listes blanches du store, qui sont l'autorité réelle sur ce qui survit à
// un aller-retour disque.
function faits() {
  const store = lire('lib/progress-store.mjs');
  const corps = (nom) => {
    const i = store.indexOf(`function ${nom}(`);
    if (i < 0) return '';
    const j = store.indexOf('\n}', i);
    return store.slice(i, j > i ? j : store.length);
  };
  const vide = corps('emptyFlat');
  // Les champs de l'état vide sont la déclaration canonique de ce qui existe.
  const champs = [...new Set((vide.match(/(\w+):\s*(\[\]|\{\})/g) ?? []).map((m) => m.split(':')[0].trim()))];
  const ecriture = corps('flatOf');
  const lecture = corps('activeTrackProgress');
  const moteur = lire('lib/learning-engine.mjs');
  const commandes = (moteur.match(/export const COMMANDS = \[[\s\S]*?\];/)?.[0] ?? '')
    .match(/'[A-Z_]+'/g)?.map((s) => s.replace(/'/g, '')) ?? [];
  return {
    champsDeLEtatVide: champs,
    dansListeEcriture: champs.filter((c) => new RegExp(`\\b${c}\\b`).test(ecriture)),
    dansListeLecture: champs.filter((c) => new RegExp(`\\b${c}\\b`).test(lecture)),
    commandesDuMoteur: commandes,
    commandesRecord: commandes.filter((c) => c.startsWith('RECORD_')),
  };
}

// ── 5 · LES 125 EXERCICES AMBIGUS ───────────────────────────────────────
function ambiguite() {
  const m = jlire('docs/v75/cp4-mapping.json');
  if (!Array.isArray(m)) return null;
  const parClasse = {};
  for (const x of m) parClasse[x.classe] = (parClasse[x.classe] ?? 0) + 1;
  const ambigus = m.filter((x) => x.classe === 'AMBIGUOUS');
  return { total: m.length, parClasse, ambigus: ambigus.map((x) => x.id) };
}

// ── 6 · LA QUALITÉ DES PREUVES DÉCLARABLES ──────────────────────────────
//
// Quels types de source existent, lesquels sont QUALIFIANTS, et lesquels
// peuvent être produits sans qu'aucune validation réelle n'ait eu lieu ?
function preuves() {
  const ev = lire('lib/evidence.mjs');
  const src = (ev.match(/SOURCE_TYPES\s*=\s*(?:Object\.freeze\()?\[([\s\S]*?)\]/)?.[1] ?? '')
    .match(/'[a-z-]+'/g)?.map((s) => s.replace(/'/g, '')) ?? [];
  const qual = (ev.match(/QUALIFYING[_A-Z]*\s*=\s*(?:new Set\()?(?:Object\.freeze\()?\[([\s\S]*?)\]/)?.[1] ?? '')
    .match(/'[a-z-]+'/g)?.map((s) => s.replace(/'/g, '')) ?? [];
  const kinds = [...new Set((ev.match(/'[a-z-]+-(?:grade|tests|review|check)'/g) ?? []).map((s) => s.replace(/'/g, '')))];
  return { sourceTypes: src, qualifiants: qual, validationKinds: kinds };
}

// ── 7 · CE QUI EST EN JEU POUR LA VIE PRIVÉE ────────────────────────────
//
// V78 observera des humains. Ce qui existe déjà décide de ce qui sera possible.
function viePrivee() {
  const exp = existe('app/api/progress/export/route.ts');
  const imp = existe('app/api/progress/import/route.ts');
  const reset = existe('app/api/progress/reset/route.ts');
  const tiers = fichiers('app', ['.tsx', '.ts']).concat(fichiers('lib', ['.ts', '.mjs']))
    .filter((p) => /analytics|gtag|segment|mixpanel|posthog|sentry|datadog/i.test(lire(p)));
  return {
    export: exp, import: imp, reset,
    fichiersAvecAnalytiqueTierce: tiers,
    progressDansLeDepot: existe('data/progress.json'),
    gitignore: lire('.gitignore').split('\n').filter((l) => l.trim() && !l.startsWith('#')),
  };
}

// ── PROGRAMME ───────────────────────────────────────────────────────────

export function inventaire() {
  const s = surfaces();
  for (const x of s) {
    x.contenu = CONTENU[x.id] ? CONTENU[x.id]() : null;
    x.analyseApi = x.api ? analyserFichier(x.api) : null;
    x.analysePage = x.page ? analyserFichier(x.page) : null;
    // Les composants clients de la surface : c'est souvent là que se trouve
    // l'action, pas dans la page.
    const dossier = x.page ? x.page.replace(/\/page\.tsx$/, '') : null;
    x.composants = dossier ? fichiers(dossier, ['.tsx']).filter((f) => !f.endsWith('page.tsx')) : [];
    x.posteVersApi = x.composants.some((c) => /fetch\(`?\/api\//.test(lire(c)))
      || (x.page ? /fetch\(`?\/api\//.test(lire(x.page)) : false);
  }
  return {
    surfaces: s,
    faits: faits(),
    ambiguite: ambiguite(),
    preuves: preuves(),
    viePrivee: viePrivee(),
    corpus: {
      exercices: compterJson('data/exercises'),
      testsExercice: (() => {
        let t = 0;
        for (const f of readdirSync(join(ROOT, 'data/exercises'))) {
          if (!f.endsWith('.json')) continue;
          t += (jlire(`data/exercises/${f}`)?.tests ?? []).length;
        }
        return t;
      })(),
      runtimes: (() => {
        const r = new Set();
        for (const f of readdirSync(join(ROOT, 'data/exercises'))) {
          if (!f.endsWith('.json')) continue;
          r.add(jlire(`data/exercises/${f}`)?.runtime ?? '?');
        }
        return [...r].sort();
      })(),
    },
  };
}

if (process.argv[1] && process.argv[1].endsWith('cp0-practice-forensics.mjs')) {
  const inv = inventaire();

  console.log('# V77 · CP0 — Inventaire des surfaces de pratique (lecture seule)\n');

  console.log('## 1 · Les surfaces trouvées sur le disque\n');
  console.log('| surface | route | API | contenu | événement | preuve | écrit l’état |');
  console.log('|---|---|---|---|---|---|---|');
  for (const s of inv.surfaces) {
    const a = s.analyseApi ?? {};
    const c = s.contenu ? `${s.contenu.n} (\`${s.contenu.source}\`)` : '—';
    console.log(`| \`${s.id}\` | ${s.route ?? '—'} | ${s.apiRoute ?? '—'} | ${c} | ${a.evenement ? '✅' : '—'} | ${a.preuve ? '✅' : '—'} | ${a.ecritureEtat ? '✅' : '—'} |`);
  }

  const ecrivent = inv.surfaces.filter((s) => s.analyseApi?.ecritureEtat);
  const evenement = inv.surfaces.filter((s) => s.analyseApi?.evenement);
  const preuveSeule = ecrivent.filter((s) => s.analyseApi?.preuve && !s.analyseApi?.evenement);
  console.log(`\n**${inv.surfaces.length} surfaces** · **${ecrivent.length} écrivent dans l'état de l'apprenant**`);
  console.log(`· **${evenement.length} écrivent un ÉVÉNEMENT** · **${preuveSeule.length} n'écrivent qu'une PREUVE**`);
  console.log(`\n- écrivent un événement : ${evenement.map((s) => `\`${s.id}\``).join(' ') || '—'}`);
  console.log(`- preuve seulement : ${preuveSeule.map((s) => `\`${s.id}\``).join(' ') || '—'}`);
  console.log(`- n'écrivent rien : ${inv.surfaces.filter((s) => !s.analyseApi?.ecritureEtat).map((s) => `\`${s.id}\``).join(' ')}`);

  console.log('\n## 2 · Les faits du produit, recomptés\n');
  console.log(`| champ de l'état | dans la liste d'ÉCRITURE | dans la liste de LECTURE |`);
  console.log('|---|---|---|');
  for (const c of inv.faits.champsDeLEtatVide) {
    console.log(`| \`${c}\` | ${inv.faits.dansListeEcriture.includes(c) ? '✅' : '❌'} | ${inv.faits.dansListeLecture.includes(c) ? '✅' : '❌'} |`);
  }
  console.log(`\n**${inv.faits.commandesDuMoteur.length} commandes** dans le moteur, dont **${inv.faits.commandesRecord.length}** qui enregistrent un fait :`);
  console.log(inv.faits.commandesRecord.map((c) => `\`${c}\``).join(' · '));

  console.log('\n## 3 · Les preuves\n');
  console.log(`- types de source : ${inv.preuves.sourceTypes.map((s) => `\`${s}\``).join(' ') || '(non extraits)'}`);
  console.log(`- qualifiants : ${inv.preuves.qualifiants.map((s) => `\`${s}\``).join(' ') || '(non extraits)'}`);
  console.log(`- genres de validation : ${inv.preuves.validationKinds.map((s) => `\`${s}\``).join(' ') || '(non extraits)'}`);

  if (inv.ambiguite) {
    console.log('\n## 4 · Le rattachement des exercices aux concepts\n');
    console.log('| classe | n |');
    console.log('|---|---|');
    for (const [k, n] of Object.entries(inv.ambiguite.parClasse).sort((a, b) => b[1] - a[1])) {
      console.log(`| \`${k}\` | ${n} |`);
    }
    console.log(`\n**${inv.ambiguite.parClasse.AMBIGUOUS ?? 0} exercices ambigus** sur ${inv.ambiguite.total}.`);
  }

  console.log('\n## 5 · Vie privée\n');
  const v = inv.viePrivee;
  console.log(`- export : ${v.export ? '✅ `/api/progress/export`' : '❌ absent'}`);
  console.log(`- import : ${v.import ? '✅' : '❌'} · réinitialisation : ${v.reset ? '✅' : '❌'}`);
  console.log(`- **analytique tierce** : ${v.fichiersAvecAnalytiqueTierce.length === 0 ? '✅ aucune' : `❌ ${v.fichiersAvecAnalytiqueTierce.join(' ')}`}`);
  console.log(`- \`data/progress.json\` dans le dépôt : ${v.progressDansLeDepot ? '❌ OUI' : '✅ non'}`);

  console.log('\n## 6 · Corpus\n');
  console.log(`**${inv.corpus.exercices} exercices · ${inv.corpus.testsExercice} tests · ${inv.corpus.runtimes.length} runtimes** (${inv.corpus.runtimes.join(', ')})`);

  writeFileSync(join(ROOT, 'docs', 'v77', 'cp0-inventory.json'), `${JSON.stringify(inv, null, 1)}\n`);
  console.log('\nécrit : docs/v77/cp0-inventory.json');
}
