// V76 · CP5 — LA FRONTIÈRE D'EXÉCUTION. Module PUR (aucune E/S, aucun spawn).
//
// ── LE DÉFAUT QUE CE MODULE EXISTE POUR CORRIGER ────────────────────────
//
// Le CP0 a mesuré, contre le produit en marche, que le code de l'apprenant
// pouvait : lire `/etc/passwd`, lire la CORRECTION d'un autre exercice, écrire
// un fichier dans le dépôt, exécuter `id` en `uid=0(root)`, et joindre
// `/api/progress` par la boucle locale.
//
// La cause n'était pas une faute de configuration. Le runner faisait :
//
//   execFile(binaire, [harnais], { cwd, shell: false, env: {...}, timeout, maxBuffer })
//
// **Chacun de ces réglages est correct, et aucun n'isole.** `cwd` fixe un
// dossier de DÉPART, pas une RACINE : un chemin absolu le contourne en un
// caractère. Le processus hérite de l'identité du serveur et de sa pile réseau.
//
// ── CE QUE CE MODULE FAIT, ET NE FAIT PAS ───────────────────────────────
//
// Il **décide** de la ligne de commande d'un run isolé, et **déclare** ce que
// chaque frontière contient réellement. Il n'exécute rien : le spawn reste dans
// `lib/workspace-fs.mjs`, et la détection des mécanismes dans
// `lib/sandbox-detect.mjs`.
//
// Cette séparation n'est pas cosmétique : elle permet de TESTER la décision
// d'isolation sans lancer de processus, donc de la vérifier par mutation.
//
// ── LA RÈGLE QUI COMMANDE TOUT LE FICHIER ───────────────────────────────
//
// Contrat gelé, §3.4 :
//
//   > Si une frontière d'exécution n'est pas disponible, le runtime concerné est
//   > déclaré INDISPONIBLE. Il n'y a jamais de repli silencieux vers
//   > l'exécution hôte.
//
// `MODE_HOTE` existe donc comme *valeur nommée et refusée*, pas comme repli.

/** Les cinq interdits du contrat gelé, dans l'ordre où le CP0 les a mesurés. */
export const INTERDITS = Object.freeze(['SEC1', 'SEC2', 'SEC3', 'SEC4', 'SEC5']);

/** Ce que chaque interdit signifie. Publié pour qu'aucune surface ne le réinvente. */
export const SENS_DES_INTERDITS = Object.freeze({
  SEC1: 'le code de l’apprenant ne lit aucun fichier hors de son espace de travail',
  SEC2: 'il n’écrit nulle part hors de son espace de travail',
  SEC3: 'il ne crée aucun processus sur l’hôte',
  SEC4: 'il n’atteint ni la boucle locale, ni un réseau interne, ni l’extérieur',
  SEC5: 'il ne lit ni les corrections, ni les tests privés, ni le corpus',
});

/**
 * ── LES TROIS MODES D'EXÉCUTION ──────────────────────────────────────────
 *
 * Nommés, et **classés par ce qu'ils contiennent réellement** — jamais par ce
 * qu'on aimerait qu'ils contiennent.
 */
export const MODES = Object.freeze(['PERMISSION_NET', 'NAMESPACE_CHROOT', 'HOTE']);

/**
 * Ce que chaque mode contient, **mesuré au CP5** et non supposé.
 *
 * `partiel` n'est pas une politesse : un interdit partiellement tenu est écrit
 * comme tel, avec la raison. Le contrat interdit de prétendre isoler.
 */
export const CONTENU_PAR_MODE = Object.freeze({
  // Node, TypeScript, React/Web : modèle de permissions de Node 20+ (lecture et
  // écriture bornées à l'espace de travail, processus enfants refusés) combiné à
  // un espace de noms réseau vide.
  PERMISSION_NET: Object.freeze({
    SEC1: 'total', SEC2: 'total', SEC3: 'total', SEC4: 'total', SEC5: 'total',
    mecanisme: 'node --permission (fs bornée, child_process refusé) + unshare --net',
  }),
  // Python : espaces de noms utilisateur/montage/réseau + racine minimale.
  // `SEC3` est PARTIEL et la nuance compte : un processus peut naître, mais il
  // naît dans la même prison — pas de réseau, pas d'hôte, pas de privilège.
  NAMESPACE_CHROOT: Object.freeze({
    SEC1: 'total', SEC2: 'total', SEC3: 'partiel', SEC4: 'total', SEC5: 'total',
    mecanisme: 'unshare --user --map-root-user --mount --net + racine minimale',
    note: 'SEC3 partiel : un processus enfant reste possible, mais confiné à la '
      + 'même racine, sans réseau et sans privilège sur l’hôte. Aucune commande '
      + 'de l’hôte n’est atteignable.',
  }),
  // Aucune frontière. **Jamais utilisé comme repli** : présent pour être refusé.
  HOTE: Object.freeze({
    SEC1: 'aucun', SEC2: 'aucun', SEC3: 'aucun', SEC4: 'aucun', SEC5: 'aucun',
    mecanisme: 'aucune frontière — exécution directe sur l’hôte',
  }),
});

/** Familles de runtime, et le mode que chacune exige. */
export const MODE_REQUIS = Object.freeze({
  'node-js': 'PERMISSION_NET',
  typescript: 'PERMISSION_NET',
  'react-tsx': 'PERMISSION_NET',
  web: 'PERMISSION_NET',
  python3: 'NAMESPACE_CHROOT',
  'python-ds': 'NAMESPACE_CHROOT',
});

/** Un mode tient-il un interdit donné, complètement ? */
export function tient(mode, interdit) {
  return CONTENU_PAR_MODE[mode]?.[interdit] === 'total';
}

/**
 * ── LA DÉCISION ──────────────────────────────────────────────────────────
 *
 * Pour un runtime donné et un état de disponibilité mesuré, quelle frontière
 * utiliser — ou faut-il déclarer le runtime indisponible ?
 *
 * @param runtimeId        identifiant du runtime (`node-js`, `python3`, …)
 * @param dispo.permission le modèle de permissions de Node est-il utilisable
 * @param dispo.netns      un espace de noms réseau est-il créable
 * @param dispo.chroot     une racine minimale est-elle montable
 * @returns {{ok:boolean, mode:string|null, raison:string, contenu:object|null}}
 */
export function choisirFrontiere(runtimeId, dispo = {}) {
  const requis = MODE_REQUIS[runtimeId] ?? null;
  if (!requis) {
    return { ok: false, mode: null, contenu: null, raison: `runtime inconnu : « ${runtimeId} »` };
  }
  if (requis === 'PERMISSION_NET') {
    if (!dispo.permission) {
      return { ok: false, mode: null, contenu: null, raison: 'le modèle de permissions de Node est indisponible' };
    }
    if (!dispo.netns) {
      return { ok: false, mode: null, contenu: null, raison: 'aucun espace de noms réseau n’est créable' };
    }
    return { ok: true, mode: 'PERMISSION_NET', contenu: CONTENU_PAR_MODE.PERMISSION_NET, raison: '' };
  }
  // NAMESPACE_CHROOT
  if (!dispo.netns) {
    return { ok: false, mode: null, contenu: null, raison: 'aucun espace de noms réseau n’est créable' };
  }
  if (!dispo.chroot) {
    return { ok: false, mode: null, contenu: null, raison: 'aucune racine minimale n’est montable' };
  }
  return { ok: true, mode: 'NAMESPACE_CHROOT', contenu: CONTENU_PAR_MODE.NAMESPACE_CHROOT, raison: '' };
}

/**
 * ── LA LIGNE DE COMMANDE, CONSTRUITE SANS SHELL ──────────────────────────
 *
 * Tous les éléments variables (chemins, binaire) sont passés en **arguments
 * séparés** (`argv`), jamais concaténés dans une chaîne. Aucune entrée
 * d'apprenant n'entre ici : `dir` est un chemin que le serveur a construit, et
 * `binaire` est résolu par la détection de runtime.
 *
 * @returns {{file:string, args:string[]}}
 */
export function ligneDeCommande({ mode, binaire, argsRuntime = [], dir, aide = null, racine = null, lectures = [] }) {
  if (mode === 'PERMISSION_NET') {
    // `--permission` borne les lectures ET les écritures, et refuse
    // `child_process` et les workers. `unshare --net` vide la pile réseau : ni
    // boucle locale, ni sortant.
    //
    // ── POURQUOI DES LECTURES SUPPLÉMENTAIRES, ET LESQUELLES ──
    //
    // L'ÉCRITURE reste bornée au seul espace de travail — c'est `SEC2`, et il
    // n'admet aucune exception. La LECTURE, elle, doit couvrir les
    // bibliothèques dont le harnais a besoin : le harnais React importe
    // `react` et `react-dom/server` depuis `node_modules`, et sans cette
    // autorisation les 15 exercices `react-tsx` cessent simplement de
    // fonctionner.
    //
    // **Ce que `lectures` ne contient jamais** : `data/exercises` (les
    // corrections, `SEC5`), la progression de l'apprenant, ni la racine du
    // dépôt. L'appelant les choisit explicitement, et un test le vérifie —
    // une allowlist qu'on peut élargir en silence n'est pas une allowlist.
    return {
      file: 'unshare',
      args: ['--net', binaire,
        '--permission',
        `--allow-fs-read=${dir}`,
        ...lectures.map((l) => `--allow-fs-read=${l}`),
        `--allow-fs-write=${dir}`,
        ...argsRuntime],
    };
  }
  if (mode === 'NAMESPACE_CHROOT') {
    // Le modèle de permissions de Node ne s'applique pas à Python : `import os`
    // ne traverse aucun crochet JavaScript. On construit donc la frontière au
    // niveau du noyau — espaces de noms + racine minimale.
    //
    // L'aide est un FICHIER du dépôt, relu et figé ; les chemins arrivent en
    // `argv`, jamais dans une chaîne interprétée.
    return {
      file: 'unshare',
      args: ['--user', '--map-root-user', '--mount', '--net', '--propagation', 'private',
        '/bin/sh', aide, racine, dir, binaire, ...argsRuntime],
    };
  }
  throw new Error(`Mode d’exécution refusé : « ${mode} ». Aucun repli vers l’hôte n’est autorisé.`);
}

/**
 * Le message rendu à l'apprenant quand aucune frontière n'est disponible.
 *
 * **Il dit la vérité et ne propose rien d'autre.** Le contrat interdit le repli
 * silencieux ; le repli bruyant serait le même défaut avec un message.
 */
export function messageIndisponible(runtimeId, raison, detail = '') {
  return `Le runtime « ${runtimeId} » est indisponible sur cette installation : ${raison}. `
    + 'Le produit n’exécute pas de code sans frontière d’isolation — il préfère ne rien faire '
    + `plutôt que d’exécuter ton code sans protection.${detail ? ` [${detail.slice(0, 200)}]` : ''}`;
}
