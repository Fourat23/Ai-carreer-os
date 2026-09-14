// V76 · CP0 — SONDES DE SÉCURITÉ, CONTRE LE PRODUIT QUI TOURNE.
//
// ── LA POSTURE ──────────────────────────────────────────────────────────
//
// Un environnement qui exécute du code écrit par l'utilisateur EST une surface
// d'attaque. Le brief le classe P0 absolu, et ajoute une règle qui compte plus
// que toutes les autres :
//
//   > Si certains runtimes ne peuvent pas être sandboxés correctement,
//   > NE PAS prétendre qu'ils le sont.
//
// Ce script n'audite donc pas le code : **il attaque le produit en marche** et
// note ce qui se passe réellement. Une protection qu'on lit dans une source
// mais qu'on ne voit pas tenir sur une requête n'est pas une protection
// mesurée — c'est une protection supposée.
//
// Toutes les sondes ci-dessous visent le serveur LOCAL de mesure, sur une
// fixture hors dépôt. Aucune ne sort du conteneur, aucune ne vise un tiers.
import { readFileSync, readdirSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const BASE = process.env.V76_BASE ?? 'http://127.0.0.1:3301';
const jlire = (p) => JSON.parse(readFileSync(p, 'utf8'));
const EX = (id) => jlire(join(ROOT, 'data/exercises', `${id}.json`));

/**
 * ── LE CHOIX DE LA CIBLE, ET L'ANOMALIE QU'IL A CAUSÉE ───────────────────
 *
 * ANOMALIE DE SONDE V76 n° 2, et la plus dangereuse du checkpoint : la première
 * version visait `greeting`, dont les tests portent sur la SORTIE STANDARD. La
 * valeur RETOURNÉE par le code n'y apparaît donc jamais dans la réponse — et
 * trois sondes d'évasion (système de fichiers, processus, réseau) se sont
 * déclarées « contenues » alors qu'elles réussissaient toutes.
 *
 * **Une sonde de sécurité qui ne sait pas lire son propre résultat rend un faux
 * négatif**, et un faux négatif de sécurité est pire que pas de sonde du tout :
 * il produit une ligne verte dans un rapport.
 *
 * Les sondes qui observent une valeur retournée visent donc `CIBLE_VALEUR`, un
 * exercice `call-equals` dont le `received` est publié ; celles qui observent un
 * effet de bord (écriture, taille de réponse, statut) peuvent viser n'importe quoi.
 */
const CIBLE = 'greeting';
const CIBLE_VALEUR = 'a11y-accessible-name';
const EXPORT_VALEUR = 'accessibleName';

/** La valeur RETOURNÉE par le code de l'apprenant, telle que le produit la publie. */
function valeurObservee(reponse) {
  const r = (reponse.body?.attempt?.results ?? [])[0];
  return String(r?.received ?? r?.message ?? '');
}

/** Exécute `corps` comme unique export de l'exercice à valeur, et rend ce qu'on observe. */
async function executerEtLire(corps) {
  const code = `${corps}\n`;
  const r = await post(CIBLE_VALEUR, { action: 'run', files: avecCharge(CIBLE_VALEUR, code) });
  return { brut: valeurObservee(r), reponse: r };
}

const post = async (id, body) => {
  const t0 = Date.now();
  try {
    const r = await fetch(`${BASE}/api/lab/${id}`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
    });
    let j = null; let texte = '';
    texte = await r.text();
    try { j = JSON.parse(texte); } catch { /* non-JSON : information utile */ }
    return { status: r.status, ms: Date.now() - t0, body: j, taille: texte.length };
  } catch (e) {
    return { status: 0, ms: Date.now() - t0, body: null, taille: 0, erreur: String(e.message ?? e) };
  }
};

const depart = (id) => {
  const ex = EX(id);
  const out = {};
  for (const f of ex.workspace?.files ?? []) if (!f.hidden && !f.readOnly) out[f.path] = f.content ?? '';
  return out;
};
const entree = (id) => EX(id).workspace?.entry ?? Object.keys(depart(id))[0];

/** Remplace le contenu du fichier principal par une charge utile. */
const avecCharge = (id, code) => ({ ...depart(id), [entree(id)]: code });

// ── LES SONDES ──────────────────────────────────────────────────────────
//
// Chacune déclare ce qu'elle tente, et ce qui constituerait un ÉCHEC DE
// SÉCURITÉ — jamais l'inverse. Une sonde qui ne dit pas d'avance ce qu'elle
// considère comme grave peut se déclarer satisfaite de n'importe quoi.

export const SONDES = [
  {
    id: 'S1', nom: 'boucle infinie · le timeout tient-il ?',
    menace: 'épuisement de ressources',
    async run() {
      const r = await post(CIBLE, { action: 'run', files: avecCharge(CIBLE, 'while (true) {}\nexport function greet(){return "x";}\n') });
      // La borne DÉCLARÉE est 5 000 ms ; on tolère la surcharge d'orchestration.
      return { ok: r.status !== 0 && r.ms < 30_000, detail: `${r.ms} ms, statut ${r.status}`, coupe: r.ms < 30_000 };
    },
  },
  {
    id: 'S2', nom: 'inondation de stdout · la sortie est-elle bornée ?',
    menace: 'épuisement mémoire / réponse géante',
    async run() {
      const code = 'for (let i=0;i<5e6;i++) console.log("X".repeat(200));\nexport function greet(){return "x";}\n';
      const r = await post(CIBLE, { action: 'run', files: avecCharge(CIBLE, code) });
      return { ok: r.taille < 8 * 1024 * 1024, detail: `réponse ${Math.round(r.taille / 1024)} Ko en ${r.ms} ms`, coupe: r.taille < 8 * 1024 * 1024 };
    },
  },
  {
    id: 'S3', nom: 'traversée de chemin · `../../` à l’écriture',
    menace: 'écriture hors du bac à sable',
    async run() {
      const cible = join(ROOT, 'data', '__v76_traversal__.txt');
      const r = await post(CIBLE, { action: 'save', files: { '../../data/__v76_traversal__.txt': 'POSSÉDÉ' } });
      const ecrit = existsSync(cible);
      return { ok: !ecrit, detail: ecrit ? '❌ FICHIER ÉCRIT HORS DU BAC À SABLE' : `refusé (statut ${r.status})`, coupe: !ecrit };
    },
  },
  {
    id: 'S4', nom: 'chemin absolu à l’écriture',
    menace: 'écriture arbitraire sur le disque',
    async run() {
      const cible = '/tmp/__v76_absolute__.txt';
      const r = await post(CIBLE, { action: 'save', files: { [cible]: 'POSSÉDÉ' } });
      const ecrit = existsSync(cible);
      return { ok: !ecrit, detail: ecrit ? '❌ FICHIER ÉCRIT EN CHEMIN ABSOLU' : `refusé (statut ${r.status})`, coupe: !ecrit };
    },
  },
  {
    id: 'S5', nom: 'lecture de secrets d’environnement depuis le code',
    menace: 'fuite de secret',
    async run() {
      const { brut } = await executerEtLire(`export function ${EXPORT_VALEUR}(){ return "ENV:" + Object.keys(process.env).join(","); }`);
      const sensibles = ['AICOS_PROGRESS_FILE', 'GITHUB_TOKEN', 'AWS_', 'ANTHROPIC', 'NPM_TOKEN', 'HTTPS_PROXY', 'HOME'];
      const vus = sensibles.filter((x) => brut.includes(x));
      const n = (/ENV:([^"]*)/.exec(brut) ?? [])[1]?.split(',').filter(Boolean).length ?? null;
      return { ok: vus.length === 0, detail: vus.length ? `❌ visibles : ${vus.join(' ')}` : `${n} variable(s) transmise(s), aucune sensible`, coupe: vus.length === 0 };
    },
  },
  {
    id: 'S6', nom: 'lecture du système de fichiers serveur depuis le code',
    menace: 'évasion du bac à sable en lecture',
    async run() {
      const { brut } = await executerEtLire(
        `import { readFileSync } from 'node:fs';\nexport function ${EXPORT_VALEUR}(){ try { return readFileSync('/etc/passwd','utf8').slice(0,30); } catch(e){ return 'BLOQUÉ:'+e.code; } }`);
      const lu = /root:x:/.test(brut);
      return { ok: !lu, detail: lu ? '❌ `/etc/passwd` LU depuis le code apprenant' : `bloqué (${brut.slice(0, 40)})`, coupe: !lu };
    },
  },
  {
    id: 'S7', nom: 'création de processus depuis le code',
    menace: 'exécution de commandes arbitraires',
    async run() {
      const { brut } = await executerEtLire(
        `import { execSync } from 'node:child_process';\nexport function ${EXPORT_VALEUR}(){ try { return execSync('id').toString().slice(0,30); } catch(e){ return 'BLOQUÉ:'+(e.code??String(e).slice(0,25)); } }`);
      const reussi = /uid=\d+/.test(brut);
      return { ok: !reussi, detail: reussi ? `❌ COMMANDE SHELL EXÉCUTÉE — ${brut.slice(0, 40)}` : `bloqué (${brut.slice(0, 40)})`, coupe: !reussi };
    },
  },
  {
    id: 'S8', nom: 'accès réseau sortant depuis le code',
    menace: 'SSRF / exfiltration',
    async run() {
      // Boucle locale : l'API du produit lui-même. C'est la SSRF qui compte ici,
      // parce qu'elle atteint la progression de l'apprenant.
      const { brut } = await executerEtLire(
        `export async function ${EXPORT_VALEUR}(){ try { const r = await fetch('${BASE}/api/progress'); return 'RESEAU:'+r.status; } catch(e){ return 'BLOQUÉ:'+String(e.cause?.code ?? e.name ?? e).slice(0,25); } }`);
      const reussi = /RESEAU:2\d\d/.test(brut);
      return { ok: !reussi, detail: reussi ? `❌ SSRF : l’API du produit atteinte depuis le code apprenant (${brut.slice(0, 30)})` : `bloqué (${brut.slice(0, 40)})`, coupe: !reussi };
    },
  },
  {
    id: 'S9', nom: 'modification d’un test CACHÉ pour réussir',
    menace: 'falsification du verdict',
    async run() {
      // On cherche un exercice qui possède RÉELLEMENT un fichier protégé : une
      // sonde jouée sur un exercice sans fichier caché ne prouve rien.
      const cible = readdirSync(join(ROOT, 'data/exercises')).map((f) => f.replace(/\.json$/, ''))
        .find((id) => (EX(id).workspace?.files ?? []).some((f) => f.hidden || f.readOnly));
      if (!cible) return { ok: null, detail: 'aucun exercice du corpus n’a de fichier caché ou en lecture seule', coupe: null };
      const ex = EX(cible);
      const caches = (ex.workspace?.files ?? []).filter((f) => f.hidden || f.readOnly);
      const r = await post(cible, { action: 'run', files: { ...depart(cible), [caches[0].path]: '// neutralisé' } });
      const a = r.body?.attempt ?? null;
      return { ok: a ? !a.allPassed : true, detail: `sur \`${cible}\` (${caches[0].path}) : ${a ? `passés ${a.passed}/${a.total}` : 'aucune tentative'}`, coupe: a ? !a.allPassed : true };
    },
  },
  {
    id: 'S10', nom: 'charge utile géante (10 Mo)',
    menace: 'déni de service par la taille',
    async run() {
      const r = await post(CIBLE, { action: 'save', files: { [entree(CIBLE)]: 'x'.repeat(10 * 1024 * 1024) } });
      return { ok: r.status !== 0, detail: `statut ${r.status} en ${r.ms} ms${r.erreur ? ` (${r.erreur})` : ''}`, coupe: r.status >= 400 || r.status === 200 };
    },
  },
  {
    id: 'S11', nom: 'trop de fichiers dans une requête',
    menace: 'épuisement de ressources',
    async run() {
      const files = {}; for (let i = 0; i < 200; i += 1) files[`f${i}.mjs`] = '//';
      const r = await post(CIBLE, { action: 'save', files });
      return { ok: r.status >= 400, detail: `statut ${r.status}`, coupe: r.status >= 400 };
    },
  },
  {
    id: 'S12', nom: 'nom de fichier malveillant (octet nul, échappement)',
    menace: 'traversée / corruption du disque',
    async run() {
      const noms = ['..\\..\\evil.txt', 'a b.mjs', '....//....//evil.txt', '/etc/cron.d/evil'];
      const r = await post(CIBLE, { action: 'save', files: Object.fromEntries(noms.map((n) => [n, 'x'])) });
      const crees = ['/etc/cron.d/evil', join(ROOT, 'evil.txt')].filter((p) => existsSync(p));
      return { ok: crees.length === 0, detail: crees.length ? `❌ créés : ${crees.join(' ')}` : `refusé/ignoré (statut ${r.status})`, coupe: crees.length === 0 };
    },
  },
  {
    id: 'S13', nom: 'le brouillon compte-t-il comme une tentative ?',
    menace: 'fait fabriqué',
    async run() {
      const p = process.env.AICOS_PROGRESS_FILE;
      if (!p) return { ok: null, detail: 'fixture non fournie', coupe: null };
      const n = () => { try { const j = jlire(p); return (j.tracks?.[j.activeTrackId]?.exerciseAttempts ?? []).length; } catch { return -1; } };
      const avant = n();
      await post(CIBLE, { action: 'save', files: avecCharge(CIBLE, 'export function greet(){return "brouillon";}\n') });
      const apres = n();
      return { ok: apres === avant, detail: `tentatives ${avant} → ${apres}`, coupe: apres === avant };
    },
  },
  {
    id: 'S15', nom: 'ÉCRITURE hors du bac à sable depuis le code',
    menace: 'évasion du bac à sable en écriture',
    async run() {
      const temoin = join(ROOT, 'data', '__v76_escape_probe__.txt');
      await executerEtLire(
        `import { writeFileSync } from 'node:fs';\nexport function ${EXPORT_VALEUR}(){ try { writeFileSync('${temoin}','x'); return 'ÉCRIT'; } catch(e){ return 'BLOQUÉ:'+e.code; } }`);
      const ecrit = existsSync(temoin);
      if (ecrit) { try { unlinkSync(temoin); } catch { /* nettoyage au mieux */ } }
      return { ok: !ecrit, detail: ecrit ? '❌ FICHIER ÉCRIT DANS LE DÉPÔT par le code apprenant' : 'écriture refusée', coupe: !ecrit };
    },
  },
  {
    id: 'S16', nom: 'lecture de la SOLUTION d’un autre exercice depuis le code',
    menace: 'fuite pédagogique par le disque',
    async run() {
      const { brut } = await executerEtLire(
        `import { readFileSync } from 'node:fs';\nexport function ${EXPORT_VALEUR}(){ try { const j = JSON.parse(readFileSync('${ROOT}/data/exercises/py-debug-grades.json','utf8')); return String(j.reference['solution.py']).slice(0,30); } catch(e){ return 'BLOQUÉ:'+e.code; } }`);
      const lu = brut.includes('to_letter');
      return { ok: !lu, detail: lu ? '❌ la CORRECTION d’un autre exercice est lisible depuis le code apprenant' : `bloqué (${brut.slice(0, 40)})`, coupe: !lu };
    },
  },
  {
    id: 'S14', nom: 'action inconnue / capacité non autorisée',
    menace: 'invocation de capacité non déclarée',
    async run() {
      const r = await post(CIBLE, { action: 'exec-shell', files: {}, cmd: 'id' });
      return { ok: r.status >= 400 || !r.body?.ok, detail: `statut ${r.status}, corps ${JSON.stringify(r.body).slice(0, 80)}`, coupe: r.status >= 400 || !r.body?.ok };
    },
  },
];

if (process.argv[1] && process.argv[1].endsWith('cp0-security.mjs')) {
  console.log('# V76 · CP0 — SONDES DE SÉCURITÉ, CONTRE LE PRODUIT EN MARCHE\n');
  console.log(`> Serveur : \`${BASE}\`. Chaque sonde déclare d’avance ce qui constituerait un`);
  console.log('> échec de sécurité. Une protection lue dans une source n’est pas une');
  console.log('> protection mesurée.\n');
  console.log('| # | sonde | menace | résultat | observation |');
  console.log('|---|---|---|---|---|');
  const res = [];
  for (const s of SONDES) {
    let r;
    try { r = await s.run(); } catch (e) { r = { ok: false, detail: `sonde en erreur : ${String(e.message ?? e)}`, coupe: false }; }
    res.push({ id: s.id, nom: s.nom, menace: s.menace, ...r });
    const v = r.ok === null ? '⚪ non concluant' : r.ok ? '✅ contenu' : '❌ **NON CONTENU**';
    console.log(`| ${s.id} | ${s.nom} | ${s.menace} | ${v} | ${r.detail} |`);
  }
  const trous = res.filter((r) => r.ok === false);
  const indecis = res.filter((r) => r.ok === null);
  console.log(`\n**Menaces non contenues** : ${trous.length === 0 ? '✅ aucune' : `❌ ${trous.map((r) => r.id).join(' ')}`}`);
  console.log(`**Sondes non concluantes** : ${indecis.length === 0 ? 'aucune' : `⚪ ${indecis.map((r) => r.id).join(' ')} — à instrumenter au CP14`}`);
  writeFileSync(join(ROOT, 'docs', 'v76', 'cp0-security.json'), `${JSON.stringify(res, null, 1)}\n`);
  console.log('\nécrit : docs/v76/cp0-security.json');
}
