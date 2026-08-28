// Déclarations pour le résolveur de taxonomie de compétences (pur, additif).
export function normalizeSkillId(id: unknown): string;
export function canonicalSkill(id: unknown): string;
export function canonicalizeSkills(skills: unknown): string[];
export function skillLabel(id: unknown): string;
export function isKnownSkill(id: unknown): boolean;
export const SKILL_ALIASES: Record<string, string>;
export const SKILL_LABELS: Record<string, string>;

// Projection FINE → PROGRAMME (V65). Ne devine jamais : une étiquette
// inconnue donne `null` et disparaît de la liste projetée.
export function programSkill(id: unknown): string | null;
export function programSkills(skills: unknown): string[];
export function isProgramSkill(id: unknown): boolean;
