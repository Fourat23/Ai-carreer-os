// V77.1 · CP2 — LES DONNÉES QUI APPARTIENNENT À L'APPRENANT.
//
// Décision pure : QUOI est à l'apprenant, QUOI est au produit, et ce que chaque
// opération fait à chacun. Aucune I/O ici — le liant `learner-data-server.ts`
// fournit les chemins réels et exécute.
//
// ── POURQUOI UNE LISTE BLANCHE DE CHEMINS EXACTS, ET JAMAIS UN BALAYAGE ──────
//
// `data/` contient le CURRICULUM : `data/exercises/`, `data/assessments/`,
// `data/capstones/`, `data/missions/`, `data/program.json`, et une douzaine
// d'autres. Une suppression écrite comme « efface `data/` » emporterait le
// programme de 365 jours avec la progression d'un participant.
//
// La suppression totale ne connaît donc QUE des chemins nommés un par un, et un
// garde-fou (`violationsDuPlan`) refuse le plan si l'un d'eux tombe dans un
// répertoire du produit. Deux verrous pour la même porte, parce que celui qui
// se trompe ici détruit le travail de quelqu'un d'autre.

/**
 * Le mot que l'apprenant doit saisir pour confirmer une suppression totale.
 * Vit ici, avec la décision, et pas dans la route : une route Next.js ne peut
 * exporter que ses propres champs, et surtout ce mot est aussi celui que
 * l'interface affiche — une seule source pour les deux.
 */
export const CONFIRMATION_DE_SUPPRESSION = 'SUPPRIMER';

/** Version du format de l'archive complète. */
export const VERSION_ARCHIVE_COMPLETE = 1;

/** Ce que fait chaque opération, par catégorie de donnée. Vocabulaire fermé. */
export const EFFETS = ['VIDÉ', 'CRÉÉ', 'CONSERVÉ', 'SUPPRIMÉ', 'INCLUS', 'ABSENT'];

/**
 * Les quatre catégories de données appartenant à l'apprenant, et le sort que
 * chaque opération leur réserve. Ce tableau est la SOURCE : l'interface, la
 * documentation et les tests le lisent, personne ne le recopie.
 */
export const CATEGORIES_DONNEES_APPRENANT = [
  {
    id: 'progress',
    libelle: 'Progression (les 9 faits du produit, jours, compétences, revues)',
    forme: 'fichier',
    contientDuCodeApprenant: false,
    reset: 'VIDÉ',
    deleteAll: 'SUPPRIMÉ',
    sauvegardeRestaurable: 'INCLUS',
    archiveComplete: 'INCLUS',
  },
  {
    id: 'progress-snapshot',
    libelle: 'Instantané de secours créé avant une opération destructive',
    forme: 'fichier',
    contientDuCodeApprenant: false,
    reset: 'CRÉÉ',
    deleteAll: 'SUPPRIMÉ',
    sauvegardeRestaurable: 'ABSENT',
    // INCLUS dans l'archive : l'instantané peut contenir une progression que la
    // progression courante n'a plus. L'exclure rendrait fausse la phrase
    // « toutes mes données », qui est précisément ce que le CP2 répare.
    archiveComplete: 'INCLUS',
  },
  {
    id: 'lab-workspaces',
    libelle: 'Espaces de travail du Laboratoire (le code en cours)',
    forme: 'répertoire',
    contientDuCodeApprenant: true,
    reset: 'CONSERVÉ',
    deleteAll: 'SUPPRIMÉ',
    sauvegardeRestaurable: 'INCLUS',
    archiveComplete: 'INCLUS',
  },
  {
    id: 'lab-journals',
    libelle: 'Journaux de tentatives (le code de chaque essai, réussi ou raté)',
    forme: 'répertoire',
    contientDuCodeApprenant: true,
    reset: 'CONSERVÉ',
    deleteAll: 'SUPPRIMÉ',
    sauvegardeRestaurable: 'ABSENT',
    archiveComplete: 'INCLUS',
  },
];

/** L'ordre de suppression. Fixe, pour que le rapport soit reproductible. */
export const ORDRE_DE_SUPPRESSION = ['progress', 'progress-snapshot', 'lab-workspaces', 'lab-journals'];

/**
 * Ce qui n'appartient PAS à l'apprenant et qu'aucune suppression ne touche.
 * Chaque entrée est un segment de chemin relatif à la racine du projet.
 */
export const REPERTOIRES_DU_PRODUIT = [
  '.git',
  'app',
  'curriculum',
  'data/assessments',
  'data/capstones',
  'data/cloud',
  'data/exercises',
  'data/manifests',
  'data/missions',
  'data/pilot',
  'data/pipelines',
  'data/playbooks',
  'data/security',
  'data/terminal-tasks',
  'data/topologies',
  'data/transfer-challenges',
  'docs',
  'lib',
  'node_modules',
  'prompts',
  'scripts',
  'tests',
];

/** Fichiers du produit, nommés un par un. */
export const FICHIERS_DU_PRODUIT = [
  'data/program.json',
  'data/day-exercises.json',
  'data/external-tasks.json',
  'data/progress.example.json',
];

/** Normalise un chemin absolu : sépare en segments, sans vide ni `.`. */
function segments(chemin) {
  return String(chemin).split('/').filter((s) => s !== '' && s !== '.');
}

/** `enfant` est-il `parent` lui-même ou situé dessous ? Comparaison par segments. */
export function estSousLeChemin(parent, enfant) {
  const p = segments(parent);
  const e = segments(enfant);
  if (p.length === 0 || e.length < p.length) return false;
  return p.every((s, i) => s === e[i]);
}

/**
 * Le plan de suppression : les chemins nommés, dans l'ordre gelé.
 * @param {{progress:string, snapshot:string, workspaces:string, journals:string}} racines
 */
export function planDeSuppression(racines) {
  const parId = {
    progress: racines.progress,
    'progress-snapshot': racines.snapshot,
    'lab-workspaces': racines.workspaces,
    'lab-journals': racines.journals,
  };
  return ORDRE_DE_SUPPRESSION.map((id) => {
    const cat = CATEGORIES_DONNEES_APPRENANT.find((c) => c.id === id);
    return { id, chemin: parId[id], forme: cat.forme, libelle: cat.libelle };
  });
}

/**
 * Le garde-fou. Rend la liste des raisons de REFUSER le plan — vide si le plan
 * est sûr. Un plan qui porte une violation n'est pas corrigé : il est refusé.
 *
 * @param {{id:string, chemin:string}[]} plan
 * @param {string} racineProjet chemin absolu de la racine du dépôt
 */
export function violationsDuPlan(plan, racineProjet) {
  const v = [];
  const projet = segments(racineProjet);
  for (const etape of plan) {
    const c = etape.chemin;
    if (typeof c !== 'string' || c.trim() === '') {
      v.push(`${etape.id} — chemin vide`);
      continue;
    }
    const s = segments(c);
    if (s.length === 0) {
      v.push(`${etape.id} — chemin racine du système (« ${c} »)`);
      continue;
    }
    if (s.length === projet.length && projet.every((x, i) => x === s[i])) {
      v.push(`${etape.id} — chemin égal à la racine du projet`);
      continue;
    }
    // Un chemin HORS du projet est légitime : `AICOS_PROGRESS_FILE` peut
    // pointer ailleurs. On ne contrôle les répertoires du produit que pour les
    // chemins situés DANS le projet.
    if (!estSousLeChemin(racineProjet, c)) continue;
    const relatif = s.slice(projet.length).join('/');
    if (relatif === 'data') {
      v.push(`${etape.id} — « data » entier : contient le curriculum`);
      continue;
    }
    for (const rep of REPERTOIRES_DU_PRODUIT) {
      if (estSousLeChemin(rep, relatif)) v.push(`${etape.id} — « ${relatif} » est dans « ${rep} » (produit)`);
    }
    for (const f of FICHIERS_DU_PRODUIT) {
      if (relatif === f) v.push(`${etape.id} — « ${relatif} » est un fichier du produit`);
    }
  }
  return v;
}

/**
 * Le VERDICT d'une suppression, dérivé des lignes du rapport. Pur, et à part :
 * `ok` ne doit jamais être une constante écrite à la main. Le CP6 a mesuré
 * qu'un `return { ok: true }` posé dans le module d'I/O survivait à tous les
 * tests, parce qu'aucun ne reliait le verdict à ce que le disque montrait.
 *
 * Une ligne en erreur, ou un chemin qui reste, suffit à refuser.
 */
export function verdictDeSuppression(lignes) {
  const l = Array.isArray(lignes) ? lignes : [];
  return l.every((x) => x && x.resteSurLeDisque === false && !x.erreur);
}

/**
 * Ce que l'interface a le droit de promettre pour une opération donnée.
 * Rendu à partir du tableau des catégories — jamais recopié à la main.
 * @param {'reset'|'deleteAll'|'sauvegardeRestaurable'|'archiveComplete'} operation
 */
export function porteeDe(operation) {
  const touche = [];
  const epargne = [];
  for (const c of CATEGORIES_DONNEES_APPRENANT) {
    const effet = c[operation];
    if (effet === 'SUPPRIMÉ' || effet === 'VIDÉ' || effet === 'INCLUS' || effet === 'CRÉÉ') touche.push({ id: c.id, effet, libelle: c.libelle });
    else epargne.push({ id: c.id, effet, libelle: c.libelle });
  }
  return { operation, touche, epargne };
}

/**
 * VRAI si l'opération couvre TOUTES les catégories appartenant à l'apprenant.
 * C'est la seule condition sous laquelle un texte a le droit de dire « toutes
 * mes données ».
 */
export function couvreToutesLesDonnees(operation) {
  return CATEGORIES_DONNEES_APPRENANT.every((c) => {
    const e = c[operation];
    return e === 'SUPPRIMÉ' || e === 'INCLUS';
  });
}
