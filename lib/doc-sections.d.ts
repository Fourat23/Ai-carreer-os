export type DocSection = { id: string; label: string; level: number; items: number };
export function extractSections(html: string): { html: string; sections: DocSection[] };
export function decodeEntities(s: string): string;
