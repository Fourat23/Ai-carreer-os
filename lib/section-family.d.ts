// Types pour lib/section-family.mjs (sémantique pédagogique pure).
export interface FamilyMeta {
  key: string;
  label: string;
  icon: string;
  color: string;
}
export const FAMILIES: Record<string, FamilyMeta>;
export function normalizeHeading(text: string): string;
export function classifyHeading(text: string): string | null;
export function cleanHeadingText(inner: string): string;
export function familyMeta(key: string | null | undefined): FamilyMeta | null;
export function annotateDayHtml(html: string): string;
export const ANSWERABLE_FAMILIES: Set<string>;
export interface Activity { id: string; family: string; label: string }
export function deriveActivities(html: string): Activity[];
