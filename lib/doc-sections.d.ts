export type DocSection = { id: string; label: string; level: number };
export function extractSections(html: string): { html: string; sections: DocSection[] };
