export type DocSection = { id: string; label: string; level: number; items: number };
export function extractSections(html: string): { html: string; sections: DocSection[]; title: string | null };
export function decodeEntities(s: string): string;
export function demoteDocTitle(html: string): string;
