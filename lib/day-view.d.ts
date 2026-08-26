// Types pour lib/day-view.mjs (helpers purs Vue Jour).
export function difficultyLabel(n: number): string;
export function slugify(text: string): string;
export function stripDayLeadHtml(html: string): string;
export const DAY_ACTION_FAMILIES: Set<string>;
export function splitDayHtml(
  annotatedHtml: string,
  actionFamilies?: Set<string>,
): { read: string; act: string; readCount: number; actCount: number };
export function isDayMetaLine(text: string): boolean;
export function bandMarkHeight(difficulty: number | undefined): number | null;
