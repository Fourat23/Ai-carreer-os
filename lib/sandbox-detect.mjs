// V76 · CP5 — DÉTECTION DES FRONTIÈRES D'EXÉCUTION. Côté serveur (I/O).
//
// ── LA RÈGLE QUE CE FICHIER APPLIQUE ────────────────────────────────────
//
// Contrat gelé §3.4 : *« Si une frontière d'exécution n'est pas disponible, le
// runtime concerné est déclaré INDISPONIBLE. Il n'y a jamais de repli
// silencieux vers l'exécution hôte. »*
//
// Ce module **mesure** ce qui est disponible sur l'installation — il ne suppose
// rien, et il ne contourne rien. Les sondes sont réelles : on ne demande pas au
// noyau s'il *pourrait* créer un espace de noms, on en crée un.
//
// Le modèle vient de `lib/terminal-docker.mjs`, qui déclare honnêtement
// `unavailable` quand Docker manque plutôt que de simuler un succès. C'est le
// meilleur précédent du dépôt, et le CP0 avait relevé qu'il n'avait jamais été
// appliqué au runner d'exercices.
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync, symlinkSync, rmSync, lstatSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** Sondes exécutées UNE fois par processus : elles créent de vrais espaces de noms. */
let cache = null;

/** Dernière raison d'échec de chaque sonde — pour ne pas avoir à deviner. */
const raisons = {};

const essayer = (nom, file, args, timeout = 4000) => {
  try {
    execFileSync(file, args, { stdio: 'pipe', timeout, shell: false });
    delete raisons[nom];
    return true;
  } catch (e) {
    // La RAISON est conservée : une sonde qui échoue sans dire pourquoi force à
    // deviner, et le CP5 a perdu une demi-heure à cela.
    raisons[nom] = String(e.stderr?.toString?.() || e.message || e).slice(0, 300);
    return false;
  }
};

/** Un espace de noms réseau vide est-il créable ? (`SEC4` pour tous les runtimes) */
function sondeNetns() {
  return essayer('netns', 'unshare', ['--net', '/bin/true']);
}

/**
 * Le modèle de permissions de Node borne-t-il réellement le système de fichiers ?
 *
 * **On ne se contente pas de vérifier la version.** La sonde tente une lecture
 * interdite et exige qu'elle échoue : c'est la différence entre « l'option
 * existe » et « l'option protège ».
 */
function sondePermission() {
  try {
    const sortie = execFileSync(process.execPath, [
      '--permission', `--allow-fs-read=${tmpdir()}`, '-e',
      "try{require('node:fs').readFileSync('/etc/hostname');console.log('LU')}catch(e){console.log(e.code)}",
    ], { stdio: 'pipe', timeout: 5000, shell: false }).toString();
    return sortie.includes('ERR_ACCESS_DENIED');
  } catch { return false; }
}

/**
 * ── LA RACINE MINIMALE ───────────────────────────────────────────────────
 *
 * Un squelette de répertoires, préparé une fois. Il ne CONTIENT rien : les
 * montages se font à l'intérieur de l'espace de noms, à chaque exécution, et
 * disparaissent avec lui — c'est ce qui rend le nettoyage déterministe.
 *
 * `lib`, `lib64` et `bin` sont des liens vers `usr/…` : sur une distribution
 * fusionnée, l'éditeur de liens dynamique cherche `/lib64/ld-linux…`, et sans
 * ces liens l'interpréteur ne démarre pas du tout.
 */
export function preparerRacine() {
  const racine = join(tmpdir(), 'aicos-sandbox-root');
  try {
    for (const d of ['usr', 'ws', 'proc']) mkdirSync(join(racine, d), { recursive: true });
    for (const [lien, cible] of [['lib', 'usr/lib'], ['lib64', 'usr/lib64'], ['bin', 'usr/bin']]) {
      const chemin = join(racine, lien);
      // ── LE PIÈGE QUI A COÛTÉ LE PLUS AU CP5 ──
      //
      // Ces liens pointent vers `usr/lib`, qui n'existe QUE dans l'espace de
      // noms, une fois `/usr` monté. Vus depuis l'hôte, ils sont donc
      // **cassés** — et `existsSync` suit le lien, donc rend `false` sur un lien
      // cassé qui existe pourtant bel et bien.
      //
      // La première version reposait sur `existsSync` : au deuxième démarrage,
      // `symlinkSync` levait `EEXIST`, la préparation échouait, et le produit
      // déclarait Python « indisponible » pour une raison entièrement fausse.
      // `lstatSync` ne suit pas le lien : c'est la bonne question à poser.
      let present = false;
      try { lstatSync(chemin); present = true; } catch { present = false; }
      if (!present) symlinkSync(cible, chemin);
    }
    return racine;
  } catch (e) {
    raisons.racine = String(e.message ?? e).slice(0, 200);
    return null;
  }
}

/** La racine minimale est-elle utilisable ? Sonde RÉELLE : on y entre. */
function sondeChroot(racine, aide) {
  // Une sonde qui abandonne doit dire POURQUOI : « aide introuvable » et
  // « le noyau refuse » demandent des correctifs opposés.
  if (!racine) { raisons.chroot = `racine minimale non préparée : ${raisons.racine ?? 'raison inconnue'}`; return false; }
  if (!existsSync(aide)) { raisons.chroot = `aide d’entrée introuvable : ${aide}`; return false; }
  return essayer('chroot', 'unshare', [
    '--user', '--map-root-user', '--mount', '--net', '--propagation', 'private',
    '/bin/sh', aide, racine, racine, '/usr/bin/env', 'true',
    // Un espace de noms d'utilisateur est plus lent à créer qu'un espace réseau,
    // et la première sonde tombe pendant le démarrage du serveur : 20 s, pas 8.
  ], 20_000);
}

/**
 * Ce que cette installation sait isoler. Mesuré une fois, puis mémorisé —
 * les sondes créent de vrais espaces de noms et ne sont pas gratuites.
 */
export function capacitesDIsolation({ aide, force = false } = {}) {
  if (cache && !force) return cache;
  const racine = preparerRacine();
  const netns = sondeNetns();
  cache = {
    netns,
    permission: sondePermission(),
    // Inutile de sonder la racine si l'espace de noms réseau est déjà refusé :
    // le mode complet en dépend.
    chroot: netns ? sondeChroot(racine, aide) : false,
    racine,
    /** Pourquoi une sonde a échoué. Vide quand tout tient. */
    raisons: { ...raisons },
    mesureAt: new Date().toISOString(),
  };
  return cache;
}

/**
 * ── LES RÉPERTOIRES DE BIBLIOTHÈQUES PYTHON HORS `/usr` ──────────────────
 *
 * Interrogés à l'interpréteur lui-même, jamais devinés. Seuls ceux qui sortent
 * de `/usr` nous intéressent : le reste est déjà monté.
 *
 * **Filtre de sécurité** : on ne retient qu'un chemin qui ressemble à un
 * répertoire de paquets (`site-packages` / `dist-packages`). Monter `/root`
 * parce que `dateutil` s'y trouve rouvrirait `SEC1` pour une commodité.
 */
export function bibliothequesPython(binaire) {
  try {
    const sortie = execFileSync(binaire, ['-c',
      'import site,sys,json;p=set(sys.path);'
      + 'p.update(getattr(site,"getsitepackages",lambda:[])());'
      + 'p.add(site.getusersitepackages() if hasattr(site,"getusersitepackages") else "");'
      + 'print(json.dumps([x for x in p if x]))',
    ], { stdio: 'pipe', timeout: 5000, shell: false }).toString();
    return JSON.parse(sortie)
      .filter((d) => typeof d === 'string' && d.startsWith('/') && !d.startsWith('/usr/'))
      .filter((d) => /(site|dist)-packages\/?$/.test(d))
      .filter((d) => existsSync(d));
  } catch { return []; }
}

/** Remet la mesure à zéro — réservé aux tests. */
export function oublierLesCapacites() { cache = null; }

/** Supprime le squelette de racine. Sans effet sur un run en cours. */
export function nettoyerRacine() {
  const racine = join(tmpdir(), 'aicos-sandbox-root');
  try { rmSync(racine, { recursive: true, force: true }); } catch { /* rien à nettoyer */ }
}
