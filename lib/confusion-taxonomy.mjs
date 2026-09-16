// V77.1 · CP5 — LA TAXONOMIE DE CONFUSION. Module PUR.
//
// Sept catégories, décidées AVANT le pilote. Pourquoi avant : une catégorie
// inventée après avoir lu les rapports est une catégorie taillée sur mesure, et
// le décompte qu'elle produit ne dit plus rien.
//
// ── LA SEULE DISTINCTION QUI COMPTE VRAIMENT ────────────────────────────────
//
//   INSTRUCTION_UNCLEAR  « je ne comprends pas ce qu'on me DEMANDE »
//   CONCEPT_CONFUSION    « je comprends la demande, je ne sais pas la FAIRE »
//
// Les confondre rendrait le pilote muet : la première dit qu'un énoncé est
// mauvais, la seconde qu'un apprentissage n'a pas eu lieu. `H6` du contrat gelé
// pose que ces deux-là doivent rester distinguables — et déclare la
// falsification : **plus d'un tiers des rapports en `OTHER`, ou deux
// catégorisateurs qui divergent sur plus d'un tiers**.

/** Les sept catégories. Vocabulaire FERMÉ. */
export const CATEGORIES_DE_CONFUSION = Object.freeze([
  {
    id: 'INSTRUCTION_UNCLEAR',
    libelle: 'Consigne peu claire',
    question: 'La personne sait-elle ce qu’on lui demande de produire ?',
    exemple: '« Je dois renvoyer quoi exactement, un tableau ou une chaîne ? »',
    porte: 'le TEXTE de l’énoncé',
    action: 'noter la phrase exacte qui bloque, ne pas la reformuler',
  },
  {
    id: 'UI_CONFUSION',
    libelle: 'Interface',
    question: 'La personne sait-elle OÙ cliquer, ou ce que le produit vient de faire ?',
    exemple: '« J’ai cliqué sur Lancer, il ne s’est rien passé — ou si ? »',
    porte: 'la SURFACE',
    action: 'noter l’écran, l’élément visé, ce qui était attendu',
  },
  {
    id: 'CONCEPT_CONFUSION',
    libelle: 'Notion',
    question: 'La personne comprend la demande, mais ne sait pas la satisfaire ?',
    exemple: '« Je vois ce qu’il faut renvoyer, je ne sais pas faire glisser la fenêtre. »',
    porte: 'la NOTION',
    action: 'noter la notion et le moment ; ne rien expliquer',
  },
  {
    id: 'TOOL_CONFUSION',
    libelle: 'Outil',
    question: 'Le blocage vient-il de l’éditeur, du clavier, du navigateur, du système ?',
    exemple: '« Je n’arrive pas à coller », « mon clavier ne fait pas les accolades »',
    porte: 'l’OUTILLAGE, pas le produit',
    action: 'aider, et le noter — une aide d’outillage n’invalide pas la session',
  },
  {
    id: 'BUG',
    libelle: 'Défaut du produit',
    question: 'Le produit fait-il quelque chose de contraire à ce qu’il annonce ?',
    exemple: 'un test annoncé public dont le détail ne s’affiche pas',
    porte: 'le PRODUIT',
    action: 'noter, capturer l’écran, et appliquer la règle d’arrêt si cela bloque',
  },
  {
    id: 'FATIGUE',
    libelle: 'Fatigue',
    question: 'La personne décroche-t-elle sans que rien ne soit incompris ?',
    exemple: '« Je relis la même ligne depuis cinq minutes. »',
    porte: 'la PERSONNE',
    action: 'proposer une pause ; si elle persiste, arrêter en ABORTED',
  },
  {
    id: 'OTHER',
    libelle: 'Autre',
    question: 'Aucune des six précédentes, honnêtement ?',
    exemple: '—',
    porte: 'rien de classable',
    action: 'écrire le verbatim COMPLET — c’est la catégorie qui sert à corriger la taxonomie, pas à la sauver',
  },
]);

export const IDS_DE_CONFUSION = Object.freeze(CATEGORIES_DE_CONFUSION.map((c) => c.id));

/** Le seuil de falsification de `H6`, gelé au CP1. */
export const PART_MAX_EN_AUTRE = 1 / 3;

/** Les moments du protocole où une confusion peut être consignée. */
export const MOMENTS = Object.freeze([
  'PRETEST', 'LESSON', 'EXERCISE', 'HINT', 'RETRIEVAL', 'TRANSFER', 'EXPORT', 'HORS_ETAPE',
]);

const tab = (v) => (Array.isArray(v) ? v : []);

/** Un rapport valide, ou `null`. Refuser vaut mieux que ranger de force. */
export function normaliserRapportDeConfusion(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (!IDS_DE_CONFUSION.includes(raw.categorie)) return null;
  if (!MOMENTS.includes(raw.moment)) return null;
  const verbatim = typeof raw.verbatim === 'string' ? raw.verbatim.trim().slice(0, 1000) : '';
  // `OTHER` sans verbatim est un décompte sans contenu : il ne sert à rien,
  // donc il est refusé plutôt que collecté.
  if (raw.categorie === 'OTHER' && !verbatim) return null;
  return {
    categorie: raw.categorie,
    moment: raw.moment,
    verbatim,
    at: typeof raw.at === 'string' ? raw.at : null,
    sessionId: typeof raw.sessionId === 'string' ? raw.sessionId : null,
  };
}

/** Le décompte par catégorie, les sept toujours présentes — un zéro est une information. */
export function decompteParCategorie(rapports) {
  const out = Object.fromEntries(IDS_DE_CONFUSION.map((id) => [id, 0]));
  for (const r of tab(rapports)) {
    const n = normaliserRapportDeConfusion(r);
    if (n) out[n.categorie] += 1;
  }
  return out;
}

/**
 * `H6` est-elle falsifiée ? Rend un verdict et son chiffre — jamais un booléen
 * nu, parce qu'un seuil franchi doit pouvoir être relu.
 */
export function verdictH6(rapports) {
  const valides = tab(rapports).map(normaliserRapportDeConfusion).filter(Boolean);
  if (valides.length === 0) return { verdict: 'NOT_OBSERVED', part: null, total: 0 };
  const autres = valides.filter((r) => r.categorie === 'OTHER').length;
  const part = autres / valides.length;
  return {
    verdict: part > PART_MAX_EN_AUTRE ? 'H6_FALSIFIEE' : 'H6_TIENT',
    part,
    total: valides.length,
    autres,
  };
}
