// Primitives produit partagées (V53). Présentation pure : aucune source de
// vérité, aucune logique de progression. Adoptées d'abord par les 3 pilotes.
export { Status } from './Status';
export type { Tone } from './Status';
export { PageHeader } from './PageHeader';
export { SectionHeader } from './SectionHeader';
export { Metric } from './Metric';
export { ActionRow } from './ActionRow';
export { EmptyState } from './EmptyState';
export { InlineNotice } from './InlineNotice';
export { Panel } from './Panel';
export { PrimaryFocus } from './PrimaryFocus';
export { ListRow } from './ListRow';
export { ProgressRail } from './ProgressRail';
// V55 — identité visuelle : hero dominant + éléments graphiques porteurs de données.
export { HeroFocus, HeroFact, DifficultyScale } from './HeroFocus';
export { PositionRing } from './PositionRing';
// V56 — signature produit : trois motifs propriétaires supplémentaires,
// plafond de cinq pour tout le produit (ADR-056 §1). Aucun sixième.
export { PhaseRail } from './PhaseRail';
export type { Phase } from './PhaseRail';
export { EvidenceMark, evidenceLabel } from './EvidenceMark';
export { YearBand } from './YearBand';
export type { BandDay } from './YearBand';
export { SurfaceHead } from './SurfaceHead';
export type { SurfaceKind, SurfaceFact } from './SurfaceHead';
export { EditorialShell } from './EditorialShell';
export { WorkbenchShell } from './WorkbenchShell';
export type { SeverityCounts } from './WorkbenchShell';
