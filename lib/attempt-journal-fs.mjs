// V76 · CP10 — LE JOURNAL SUR DISQUE. Opérations I/O uniquement.
//
// Toute la décision (forme d'une entrée, bornes, fusion avec le fait) vit dans
// `lib/attempt-journal.mjs`, qui est pur et testable sans disque. Ce module-ci
// ne fait que lire et écrire, exactement comme `workspace-fs.mjs` par rapport à
// `workspace.mjs`.
//
// ── POURQUOI LE JOURNAL N'EST PAS DANS L'ESPACE DE TRAVAIL ──────────────
//
// Parce que `resetWorkspace` fait `rmSync(dir, { recursive: true })`. Un journal
// rangé là serait effacé par une réinitialisation — et le contrat gelé §1.11
// dit exactement l'inverse :
//
//   > Aucun `RESET` n'efface jamais un `ATTEMPT`, une `SUBMISSION` ou une
//   > `EVIDENCE`. Effacer l'histoire d'un échec est le contournement `R4`.
//
// Le code d'une tentative passée n'est pas la preuve elle-même, mais il en est
// l'histoire. Le ranger à un endroit qu'un bouton « Reset » balaie aurait été
// la même faute, prise par la porte de derrière.
//
// Il vit donc dans `data/lab-journals/`, à côté de `data/lab-workspaces/` et
// ignoré par git pour la même raison : contenu volatil, propre à la machine.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { resolveWithinRoot } from './workspace.mjs';
import { ajouterAuJournal, entreeDeJournal } from './attempt-journal.mjs';

function fichierDuJournal(root, exerciseId) {
  const p = resolveWithinRoot(root, `${exerciseId}.json`);
  if (!p) throw new Error('Identifiant d’exercice non sûr.');
  return p;
}

/** Le journal d'un exercice, ou une liste vide. Un journal illisible n'est jamais fatal. */
export function lireJournal(root, exerciseId) {
  try {
    const p = fichierDuJournal(root, exerciseId);
    if (!existsSync(p)) return [];
    const j = JSON.parse(readFileSync(p, 'utf8'));
    return Array.isArray(j) ? j : [];
  } catch {
    // Un journal corrompu fait perdre des comparaisons, jamais une tentative :
    // le FAIT vit ailleurs. On repart d'une liste vide plutôt que de casser le
    // laboratoire pour un fichier de confort.
    return [];
  }
}

/**
 * Consigne une tentative. **Ne jette jamais** : une écriture de journal ratée
 * ne doit pas faire échouer un lancement d'exercice réussi.
 * @returns {boolean} vrai si l'entrée a été écrite
 */
export function consignerTentative(root, exerciseId, donnees) {
  try {
    const entree = entreeDeJournal({ ...donnees, exerciseId });
    if (!entree) return false;
    const p = fichierDuJournal(root, exerciseId);
    const suivant = ajouterAuJournal(lireJournal(root, exerciseId), entree);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, `${JSON.stringify(suivant)}\n`, 'utf8');
    return true;
  } catch {
    return false;
  }
}
