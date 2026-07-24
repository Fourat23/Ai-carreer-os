// Helpers PURS de la Vue Jour (aucun DOM, aucun fs) — partagés rendu/tests.

const DIFF_LABEL = ['', 'Débutant', 'Facile', 'Intermédiaire', 'Avancé', 'Difficile'];

/** Libellé de difficulté (1-5) → texte ; hors bornes → le nombre. */
export function difficultyLabel(n) {
  return DIFF_LABEL[n] ?? String(n);
}

/** Slug ancre stable à partir d'un titre de section (retire emojis/accents/ponctuation). */
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'section';
}

/** Retire l'en-tête redondant du HTML rendu d'un jour : le premier <h1>, le
 *  blockquote de métadonnées, et la rangée de liens « ← Dashboard · … » — car ces
 *  informations sont désormais présentées par le composant DayHeader. Ne touche
 *  PAS le fichier Markdown source (transformation d'affichage uniquement). */
export function stripDayLeadHtml(html) {
  if (typeof html !== 'string') return html;
  return html
    .replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/, '')
    .replace(/^\s*<blockquote>[\s\S]*?<\/blockquote>\s*/, '')
    .replace(/^\s*<p>[\s\S]*?(?:←\s*Dashboard)[\s\S]*?<\/p>\s*/, '');
}
