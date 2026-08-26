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

/**
 * ── V61 · SÉPARATION LECTURE / ACTION ──────────────────────────────────────
 *
 * Mesuré au CP0 de V61 : `/day/80` rendait 14 340 px en UN bloc, dominance
 * 0,941. Et sur ces 14 340 px, la journée disait la pratique DEUX FOIS — une
 * fois dans les sections `Pratique autonome`, `Mini-quiz`, `Livrable attendu`,
 * `Critères de validation`, `Cas métier` et `Question d'entretien` noyées dans
 * l'article de lecture (2 102 px mesurés sur J80), une seconde fois dans la
 * zone « Le travail du jour » placée 11 000 px plus bas.
 *
 * Cette fonction sépare les deux registres SANS TOUCHER AU CONTENU : elle lit
 * `data-family`, la taxonomie que `annotateDayHtml` pose déjà à partir des
 * intitulés réels du corpus. Aucune seconde taxonomie n'est créée, aucun texte
 * n'est réécrit, aucune section n'est supprimée — elles changent de colonne.
 *
 * @param {string} annotatedHtml  sortie de `annotateDayHtml`
 * @returns {{ read: string, act: string, readCount: number, actCount: number }}
 */
export const DAY_ACTION_FAMILIES = new Set(['practice', 'apply', 'verify', 'prepare']);

export function splitDayHtml(annotatedHtml, actionFamilies = DAY_ACTION_FAMILIES) {
  const html = String(annotatedHtml || '');
  const hits = [];
  const re = /<h2\b([^>]*)>[\s\S]*?<\/h2>/g;
  let m;
  while ((m = re.exec(html))) hits.push({ start: m.index, attrs: m[1] });
  if (!hits.length) return { read: html, act: '', readCount: 0, actCount: 0 };

  // Ce qui précède le premier h2 (chapeau éventuel) appartient à la lecture.
  const readParts = [html.slice(0, hits[0].start)];
  const actParts = [];
  let readCount = 0, actCount = 0;

  for (let i = 0; i < hits.length; i += 1) {
    const end = i + 1 < hits.length ? hits[i + 1].start : html.length;
    const chunk = html.slice(hits[i].start, end);
    const fam = /data-family="([^"]+)"/.exec(hits[i].attrs)?.[1] ?? null;
    if (fam && actionFamilies.has(fam)) { actParts.push(chunk); actCount += 1; }
    else { readParts.push(chunk); readCount += 1; }
  }
  return { read: readParts.join(''), act: actParts.join(''), readCount, actCount };
}

/**
 * ── V61 · LA LIGNE DE MÉTADONNÉES DU CORPUS N'EST PAS UNE ACCROCHE ─────────
 *
 * Chaque journée du corpus commence par une citation de métadonnées, de forme
 * strictement constante :
 *
 *   > **Mois 3** · **Semaine 12** · Compétence : **Architecture** ·
 *     Difficulté : Intermédiaire/5 · Durée : 4.5 h
 *
 * Le produit l'extrayait comme « première phrase du contenu » et l'affichait
 * en chapeau éditorial sous le titre — sur les 365 journées. Elle y répétait
 * mot pour mot ce que le pavé de faits disait juste en dessous, et ce que la
 * ligne de contexte dit désormais au-dessus : le même fait, trois fois, sur un
 * seul écran.
 *
 * La détection est STRUCTURELLE, pas heuristique : on exige la présence
 * conjointe des quatre étiquettes du gabarit. Une vraie phrase d'accroche,
 * si le corpus en produisait une un jour, ne les porterait pas.
 *
 * Le contenu n'est pas modifié : la ligne reste dans le document, à sa place.
 * Elle cesse seulement d'être promue en chapeau.
 */
export function isDayMetaLine(text) {
  const t = String(text || '');
  return /\bMois\s*\d/i.test(t)
    && /\bSemaine\s*\d/i.test(t)
    && /Compétence\s*:/i.test(t)
    && /Difficult[ée]\s*:/i.test(t);
}

/**
 * ── V61 · LE RELIEF DE YearBand, EN FONCTION PURE ─────────────────────────
 *
 * Extraite du composant pour être VÉRIFIABLE. Le gate V61 vérifiait d'abord la
 * simple présence des chaînes « difficulty » et « has-relief » dans le fichier
 * du composant ; le test négatif a montré qu'on pouvait neutraliser le relief
 * (`const hasRelief = false && …`) sans que le gate bronche. Un contrôle de
 * présence n'est pas un contrôle de comportement.
 *
 * La hauteur va de 20 % (difficulté 1) à 100 % (difficulté 5). C'est cette
 * amplitude qui distingue le motif « relief » du motif « chemin ».
 */
export function bandMarkHeight(difficulty) {
  const d = Number(difficulty);
  if (!Number.isFinite(d) || d <= 0) return null;
  const clamped = Math.max(1, Math.min(5, d));
  return 20 + (clamped - 1) * 20;
}
