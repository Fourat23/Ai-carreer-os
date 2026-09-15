// Liant applicatif du journal des tentatives (V76 · CP10) : fixe la racine
// data/lab-journals/ (jamais versionnée) et expose l'API à Next.
//
// Séparé de data/lab-workspaces/ à dessein : `resetWorkspace` efface son
// répertoire entier, et le contrat §1.11 interdit qu'un `RESET` emporte
// l'histoire d'une tentative.
import { join } from 'node:path';
import { lireJournal, consignerTentative } from './attempt-journal-fs.mjs';
import { vueDeLHistorique } from './attempt-journal.mjs';
import type { EntreeJournal, LigneHistorique } from './attempt-journal';

const ROOT = join(process.cwd(), 'data', 'lab-journals');

export function journalDe(exerciseId: string): EntreeJournal[] {
  return lireJournal(ROOT, exerciseId) as EntreeJournal[];
}

export function consigner(exerciseId: string, donnees: {
  at: string; passed: number; total: number; phase?: string; durationMs?: number;
  resultats?: unknown[]; fichiers?: Record<string, string>; aides?: string[];
}): boolean {
  return consignerTentative(ROOT, exerciseId, donnees);
}

/**
 * L'historique servi à la surface : le FAIT (autorité) enrichi du JOURNAL
 * (complément). Une tentative dont le journal est parti reste listée, avec
 * `conserve: false`.
 */
export function historiqueDe(exerciseId: string, faits: unknown[]): LigneHistorique[] {
  return vueDeLHistorique(faits, journalDe(exerciseId));
}
