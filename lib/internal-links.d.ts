// Déclarations de types pour lib/internal-links.mjs (logique pure, partagée JS/TS).

/** Normalise un href de lien interne Markdown vers la route réelle de l'app.
 *  Laisse inchangés : liens externes, ancres, routes absolues, chemins non reconnus. */
export function normalizeInternalHref(href: string): string;

/** Réécrit les href de toutes les balises <a> d'un fragment HTML via normalizeInternalHref. */
export function rewriteHtmlLinks(html: string): string;
