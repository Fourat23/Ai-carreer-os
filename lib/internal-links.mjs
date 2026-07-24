// Normalisation des liens internes du contenu Markdown vers les routes réelles de l'app.
// Logique PURE (aucun fs, aucun DOM) — partagée entre le rendu (lib/program.ts) et les tests.
//
// Le contenu généré référence des chemins Markdown relatifs (ex. `../week-35.md`,
// `../month-09.md`, `../days/day-241.md`, `../solutions/day-241-solution.md`,
// `projects/project-01.md`). Ces chemins n'existent pas comme routes web et renvoient 404.
// Cette fonction convertit UNIQUEMENT les familles connues et sans ambiguïté vers leur route :
//   week-<N>.md            → /week/<N>
//   month-<N>.md           → /month/<N>
//   day-<N>.md             → /day/<N>
//   day-<N>-solution.md    → /day/<N>   (la correction est affichée sur la page du jour)
//   project-<id>.md        → /projects?p=<id>
// Tout le reste est laissé INCHANGÉ :
//   - liens externes (http:, https:, mailto:, …) ;
//   - ancres locales (#section) ;
//   - routes déjà absolues (/…) ;
//   - chemins Markdown non reconnus (ex. year-overview.md) — jamais transformés vers une
//     route arbitraire (on préfère un lien inchangé à une mauvaise redirection silencieuse).

// Familles documentaires servies par la route /doc/[...slug] (miroir de ALLOWED dans
// app/doc/[...slug]/page.tsx). year-overview est un fichier racine, traité à part.
const DOC_DIRS = new Set(['methodology', 'rubrics', 'resources', 'career', 'lessons']);

/**
 * @param {string} href
 * @returns {string}
 */
export function normalizeInternalHref(href) {
  if (typeof href !== 'string' || href === '') return href;

  // Lien avec schéma/protocole (http:, https:, mailto:, tel:, data:, …) → externe, inchangé.
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return href;
  // Ancre pure → inchangée.
  if (href.startsWith('#')) return href;
  // Route déjà absolue de l'app → inchangée.
  if (href.startsWith('/')) return href;

  // Sépare le chemin d'un éventuel suffixe (#ancre ou ?requête).
  const m = /^([^#?]*)([#?].*)?$/.exec(href);
  const path = m ? m[1] : href;
  const suffix = (m && m[2]) ? m[2] : '';

  // Segments du chemin (ignore ./, ../, sous-dossiers). `base` = dernier segment ;
  // `parentDir` = segment précédent (pour les documents doc-family <dossier>/<nom>.md).
  const segs = path.replace(/\/+$/, '').split('/');
  const base = segs[segs.length - 1] || '';
  const parentDir = segs.length >= 2 ? segs[segs.length - 2] : '';

  let route = null;
  let mm;
  if ((mm = /^week-0*(\d+)\.md$/i.exec(base))) route = `/week/${parseInt(mm[1], 10)}`;
  else if ((mm = /^month-0*(\d+)\.md$/i.exec(base))) route = `/month/${parseInt(mm[1], 10)}`;
  else if ((mm = /^day-0*(\d+)-solution\.md$/i.exec(base))) route = `/day/${parseInt(mm[1], 10)}`;
  else if ((mm = /^day-0*(\d+)\.md$/i.exec(base))) route = `/day/${parseInt(mm[1], 10)}`;
  else if ((mm = /^project-([a-z0-9]+)\.md$/i.exec(base))) route = `/projects?p=${mm[1]}`;
  // Vue d'ensemble annuelle : fichier racine servi par la route documentaire.
  else if (/^year-overview\.md$/i.test(base)) route = '/doc/year-overview';
  // Documents « doc-family » <dossier>/<nom>.md → /doc/<dossier>/<nom>, UNIQUEMENT pour les
  // familles réellement servies par la route documentaire (miroir de ALLOWED dans app/doc).
  else if (
    (mm = /^([a-z0-9-]+)\.md$/i.exec(base)) &&
    DOC_DIRS.has(parentDir.toLowerCase())
  ) route = `/doc/${parentDir}/${mm[1]}`;

  // Chemin non reconnu (dont les .md sans route dédiée) → inchangé.
  if (route === null) return href;

  // La route projet contient déjà un '?': on n'y rajoute qu'une ancre (#…), jamais un 2e '?'.
  if (route.includes('?')) return suffix.startsWith('#') ? route + suffix : route;
  return route + suffix;
}

/**
 * Réécrit les href des balises <a> d'un fragment HTML via normalizeInternalHref.
 * Sûr : marked n'émet pas de <a href> pour le contenu des blocs de code (échappé),
 * donc seuls de vrais liens sont transformés.
 * @param {string} html
 * @returns {string}
 */
export function rewriteHtmlLinks(html) {
  if (typeof html !== 'string') return html;
  return html.replace(/(<a\b[^>]*?\bhref=")([^"]*)(")/gi, (_match, pre, href, post) =>
    pre + normalizeInternalHref(href) + post);
}
