// V77 · CP5 — types du fait « livrable de mission rendu ».
//
// Le type ne porte AUCUN champ capable d'affirmer que le travail est juste :
// `niveau` se dérive du MODE de constat, et `structureOk` ne parle que de la
// FORME. Une mission documente un travail, elle ne l'évalue pas.
export type ModeDeLivrable = 'auto' | 'structural' | 'review';
export type StatutDeLivrable = 'submitted' | 'structure-valid' | 'self-assessed' | 'validated' | 'rejected';
export type NiveauDePreuve = 'DECLARED' | 'OBSERVED' | 'VALIDATED';

export const MODES_DE_LIVRABLE: readonly ModeDeLivrable[];
export const STATUTS_DE_LIVRABLE: readonly StatutDeLivrable[];
export const NIVEAU_PAR_MODE: Readonly<Record<ModeDeLivrable, NiveauDePreuve>>;
export const MAX_MISSION_SUBMISSIONS: number;

export type MissionSubmission = {
  at: string;
  grain: 'project';
  missionId: string;
  deliverableId: string;
  mode: ModeDeLivrable;
  statut: StatutDeLivrable;
  /** Dérivé du MODE, jamais du résultat. */
  niveau: NiveauDePreuve;
  /** Conformité de FORME. `null` hors du mode `structural` : non mesurée. */
  structureOk: boolean | null;
  manques: string[];
  tailleContenu: number;
  provenance: { producer: string; method: string };
  schemaVersion: number;
};

export type LectureDeMission = {
  missionId: string;
  /** Livrables DISTINCTS touchés — ce dont parle la phrase rendue. */
  livrables: number;
  /** Faits enregistrés, reprises comprises. Toujours ≥ `livrables`. */
  soumissions: number;
  parNiveau: Record<NiveauDePreuve, number>;
  plafond: NiveauDePreuve;
  maillonFaible: NiveauDePreuve | null;
  lecture: string;
};

export function maillonFaibleDeLaMission(missionDef: unknown): NiveauDePreuve | null;
export function niveauDeLaMission(missionDef: unknown): NiveauDePreuve;
export function normalizeMissionSubmission(raw: unknown, o?: { now?: string | null; legacy?: boolean }): MissionSubmission | null;
export function missionSubmissionKey(s: MissionSubmission): string;
export function normalizeMissionSubmissions(list: unknown): MissionSubmission[];
export function historiqueDeLaMission(subs: unknown, missionId: string): MissionSubmission[];
export function lectureDeLaMission(subs: unknown, missionDef: unknown): LectureDeMission;
