// V77.1 · CP2 — Liant applicatif des droits sur les données de l'apprenant.
//
// Il ne fait qu'UNE chose : fixer les racines réelles, en les prenant aux
// modules qui les possèdent déjà. Aucune racine n'est recalculée ici — un
// `join(process.cwd(), 'data', 'lab-journals')` recopié serait une seconde
// source de vérité, et une suppression qui viserait un chemin voisin du vrai
// laisserait des données derrière elle en annonçant le contraire.

import { progressFilePath, progressSnapshotPath } from './progress-server';
import { workspacesRoot } from './workspace-server';
import { journalsRoot } from './attempt-journal-server';
import {
  supprimerToutesLesDonnees, inventaireDesDonnees, exporterTousLesJournaux, lireInstantane,
} from './learner-data-fs';
import type { RacinesDonneesApprenant } from './learner-data';

export function racinesDesDonneesApprenant(): RacinesDonneesApprenant {
  return {
    progress: progressFilePath(),
    snapshot: progressSnapshotPath(),
    workspaces: workspacesRoot(),
    journals: journalsRoot(),
  };
}

export type RapportDeSuppression = {
  ok: boolean;
  violations: string[];
  supprime: {
    id: string; chemin: string; etaitPresent: boolean;
    fichiersSupprimes: number; resteSurLeDisque: boolean; erreur: string | null;
  }[];
};

/** L'état sur disque avant suppression — ce qui sera rendu à l'apprenant. */
export function inventaireDonneesApprenant() {
  return inventaireDesDonnees(racinesDesDonneesApprenant()) as {
    id: string; chemin: string; forme: string; present: boolean; fichiers: number;
  }[];
}

/** Suppression totale, sans filet. Voir `learner-data-fs.mjs`. */
export function supprimerDonneesApprenant(): RapportDeSuppression {
  return supprimerToutesLesDonnees(racinesDesDonneesApprenant(), process.cwd()) as RapportDeSuppression;
}

/** Tous les journaux de tentatives (le code de chaque essai). */
export function tousLesJournaux(): Record<string, unknown[]> {
  return exporterTousLesJournaux(journalsRoot()) as Record<string, unknown[]>;
}

/** L'instantané de secours, ou `null`. */
export function instantaneDeSecours(): unknown {
  return lireInstantane(progressSnapshotPath());
}
