// Types de `lib/learner-data-fs.mjs` (V77.1 · CP2).
import type { RacinesDonneesApprenant } from './learner-data';

export type EtatSurDisque = {
  id: string;
  chemin: string;
  forme: 'fichier' | 'répertoire';
  present: boolean;
  fichiers: number;
};

export type LigneDeSuppression = {
  id: string;
  chemin: string;
  etaitPresent: boolean;
  fichiersSupprimes: number;
  resteSurLeDisque: boolean;
  erreur: string | null;
};

export declare function compterFichiers(chemin: string): number;
export declare function inventaireDesDonnees(racines: RacinesDonneesApprenant): EtatSurDisque[];
export declare function supprimerToutesLesDonnees(
  racines: RacinesDonneesApprenant,
  racineProjet: string,
): { ok: boolean; violations: string[]; supprime: LigneDeSuppression[] };
export declare function exporterTousLesJournaux(racineJournaux: string): Record<string, unknown[]>;
export declare function lireInstantane(chemin: string): unknown;
