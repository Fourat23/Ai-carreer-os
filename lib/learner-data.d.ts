// Types de `lib/learner-data.mjs` (V77.1 · CP2).

export type EffetSurLaDonnee = 'VIDÉ' | 'CRÉÉ' | 'CONSERVÉ' | 'SUPPRIMÉ' | 'INCLUS' | 'ABSENT';

export type OperationSurLesDonnees =
  | 'reset'
  | 'deleteAll'
  | 'sauvegardeRestaurable'
  | 'archiveComplete';

export type CategorieDonneeApprenant = {
  id: 'progress' | 'progress-snapshot' | 'lab-workspaces' | 'lab-journals';
  libelle: string;
  forme: 'fichier' | 'répertoire';
  contientDuCodeApprenant: boolean;
  reset: EffetSurLaDonnee;
  deleteAll: EffetSurLaDonnee;
  sauvegardeRestaurable: EffetSurLaDonnee;
  archiveComplete: EffetSurLaDonnee;
};

export type RacinesDonneesApprenant = {
  progress: string;
  snapshot: string;
  workspaces: string;
  journals: string;
};

export type EtapeDeSuppression = {
  id: CategorieDonneeApprenant['id'];
  chemin: string;
  forme: 'fichier' | 'répertoire';
  libelle: string;
};

export declare const CONFIRMATION_DE_SUPPRESSION: string;
export declare const VERSION_ARCHIVE_COMPLETE: number;
export declare const EFFETS: readonly EffetSurLaDonnee[];
export declare const CATEGORIES_DONNEES_APPRENANT: readonly CategorieDonneeApprenant[];
export declare const ORDRE_DE_SUPPRESSION: readonly CategorieDonneeApprenant['id'][];
export declare const REPERTOIRES_DU_PRODUIT: readonly string[];
export declare const FICHIERS_DU_PRODUIT: readonly string[];

export declare function estSousLeChemin(parent: string, enfant: string): boolean;
export declare function planDeSuppression(racines: RacinesDonneesApprenant): EtapeDeSuppression[];
export declare function violationsDuPlan(plan: { id: string; chemin: string }[], racineProjet: string): string[];
export declare function porteeDe(operation: OperationSurLesDonnees): {
  operation: OperationSurLesDonnees;
  touche: { id: string; effet: EffetSurLaDonnee; libelle: string }[];
  epargne: { id: string; effet: EffetSurLaDonnee; libelle: string }[];
};
export declare function couvreToutesLesDonnees(operation: OperationSurLesDonnees): boolean;
