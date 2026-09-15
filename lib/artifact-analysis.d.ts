// V77 · CP7 — types du fait « artefact analysé » (`lib/artifact-analysis.mjs`).
//
// Le type ne porte AUCUN champ d'issue. Un compte de diagnostics n'est pas un
// verdict, et `0 diagnostic` ne veut pas dire « c'est juste » : l'analyseur
// signale ce qu'il sait reconnaître. La promesse est vérifiable ici, à la
// compilation.
export type SurfaceAnalytique = 'kubernetes' | 'cloud-lab' | 'cloud-foundations' | 'security';
export type Severite = 'blocking' | 'risk' | 'warning' | 'observation';

export const SURFACES_ANALYTIQUES: readonly SurfaceAnalytique[];
export const SEVERITES: readonly Severite[];
export const MAX_ARTIFACT_ANALYSES: number;
export const CHAMPS_INTERDITS: readonly string[];

export type ArtifactAnalysis = {
  at: string;
  grain: 'project';
  surface: SurfaceAnalytique;
  artifactId: string;
  /** Toujours `true` : sans artefact posté par l'apprenant, le fait n'existe pas. */
  artefactFourni: true;
  diagnostics: number;
  parSeverite: Partial<Record<Severite, number>>;
  dimensions: string[];
  /** Constante structurelle : la surface ne sait pas juger, donc elle ne juge pas. */
  niveau: 'OBSERVED';
  /** Constante structurelle : aucun cluster, aucun réseau, aucune credential réelle. */
  simulation: true;
  empreinte: string;
  tailleArtefact: number;
  provenance: { producer: string; method: string };
  schemaVersion: number;
};

export type LectureDesAnalyses = {
  surface: string;
  artifactId: string;
  soumissions: number;
  diagnostics: number[];
  premier: string | null;
  dernier: string | null;
  /** Toujours `false` : un artefact analysé ne vaut jamais une réussite. */
  vautReussite: false;
  lecture: string;
};

export function normalizeArtifactAnalysis(raw: unknown, o?: { now?: string | null; legacy?: boolean }): ArtifactAnalysis | null;
export function empreinteDArtefact(artefact: unknown): string;
export function artifactAnalysisKey(a: ArtifactAnalysis): string;
export function normalizeArtifactAnalyses(list: unknown): ArtifactAnalysis[];
export function historiqueDeLArtefact(list: unknown, surface: string, artifactId: string): ArtifactAnalysis[];
export function lectureDesAnalyses(list: unknown, surface: string, artifactId: string): LectureDesAnalyses;
