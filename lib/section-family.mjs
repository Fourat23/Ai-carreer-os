// Sémantique pédagogique — CENTRALISÉE et PURE (aucun DOM, aucun fs).
// Classe un titre de section (H2 rendu) dans une « famille » fonctionnelle, pour
// que la Vue Jour distingue immédiatement APPRENDRE / OBSERVER / PRATIQUER /
// APPLIQUER / PRÉPARER / VÉRIFIER / RETENIR (+ CADRER) — sans transformer chaque
// section en carte, et sans jamais toucher le Markdown source. Le contenu reste
// intact : on n'agit que sur le HTML d'AFFICHAGE.

import { slugify } from './day-view.mjs';

// Ordre = ordre pédagogique naturel d'une journée. `icon` = nom d'icône Lucide
// (rendu par le rail React). `color` = variable CSS de la teinte sémantique.
export const FAMILIES = {
  objective: { key: 'objective', label: 'Cadrer',    icon: 'Target',        color: '--fam-objective' },
  learn:     { key: 'learn',     label: 'Apprendre',  icon: 'BookOpen',      color: '--fam-learn' },
  observe:   { key: 'observe',   label: 'Observer',   icon: 'Eye',           color: '--fam-observe' },
  practice:  { key: 'practice',  label: 'Pratiquer',  icon: 'PenLine',       color: '--fam-practice' },
  apply:     { key: 'apply',     label: 'Appliquer',  icon: 'Boxes',         color: '--fam-apply' },
  prepare:   { key: 'prepare',   label: 'Préparer',   icon: 'MessageSquare', color: '--fam-prepare' },
  verify:    { key: 'verify',    label: 'Vérifier',   icon: 'CheckCheck',    color: '--fam-verify' },
  retain:    { key: 'retain',    label: 'Retenir',    icon: 'Lightbulb',     color: '--fam-retain' },
};

// Règles ordonnées (première correspondance gagne). Comparaison sur un texte
// normalisé (minuscules, sans accents, sans emoji/ponctuation de tête).
const RULES = [
  [/\bobjectif\b|\bcadrage\b/, 'objective'],
  [/\bexemple\b|demonstration|\bdemo\b|pas a pas|pas-a-pas/, 'observe'],
  [/\bcours\b|modele mental|\btheorie\b|\bnotions?\b|\bconcepts?\b/, 'learn'],
  [/cas metier|\blivrable\b|\bprojet\b|mise en situation|mise en pratique/, 'apply'],
  [/entretien/, 'prepare'],
  [/correction|\bsolution\b|criteres?|\bgrille\b|evaluation|\bbareme\b/, 'verify'],
  [/\berreurs?\b|\bpieges?\b/, 'verify'],
  [/a retenir|\bsynthese\b|\bresume\b|checklist|reflexion/, 'retain'],
  [/\bpratique\b|\bexercice\b|\bquiz\b|mini-?quiz|entrainement/, 'practice'],
];

/** Normalise un intitulé de section : retire tags, emoji/ponctuation de tête, accents. */
export function normalizeHeading(text) {
  return String(text)
    .replace(/<[^>]+>/g, '')
    .replace(/^[^\p{L}\p{N}]+/u, '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .trim();
}

/** Famille d'un titre de section, ou null si aucune règle ne s'applique (section neutre). */
export function classifyHeading(text) {
  const norm = normalizeHeading(text);
  if (!norm) return null;
  for (const [re, fam] of RULES) if (re.test(norm)) return fam;
  return null;
}

/** Texte visible d'un H2 sans l'emoji de tête (transformation d'affichage). */
export function cleanHeadingText(inner) {
  return String(inner).replace(/^\s*[^\p{L}\p{N}<]+/u, '').trim();
}

/** Métadonnées de famille (label, icône, couleur) ou null. */
export function familyMeta(key) {
  return key && FAMILIES[key] ? FAMILIES[key] : null;
}

// Familles qui appellent une PRODUCTION personnelle (donc un champ de réponse).
// Les familles de lecture (objective/learn/observe) et de vérification (verify)
// n'en génèrent pas : dégradation propre vers un état neutre.
export const ANSWERABLE_FAMILIES = new Set(['practice', 'apply', 'prepare', 'retain']);

/**
 * Chemin de phases du jour : extrait TOUTES les sections annotées (id, famille,
 * libellé) dans l'ordre du contenu rendu. Pur (chaîne → tableau). Sert à afficher
 * le déroulé « Comprendre → Pratiquer → Vérifier → Produire → Réviser » sans jamais
 * toucher au contenu pédagogique (l'ordre du curriculum fait foi).
 */
export function deriveDayPhases(html) {
  if (typeof html !== 'string') return [];
  const out = [];
  const re = /<h2\b[^>]*\bid="([^"]+)"[^>]*\bdata-family="([^"]+)"[^>]*>[\s\S]*?<span class="h2-text">([\s\S]*?)<\/span>/g;
  let m;
  while ((m = re.exec(html))) {
    const [, id, family, rawLabel] = m;
    out.push({ id, family, label: decodeEntities(rawLabel.replace(/<[^>]+>/g, '')).trim() });
  }
  return out;
}

/**
 * Dérive les « activités » (sections à réponse) du HTML déjà annoté par
 * annotateDayHtml : chaque H2 des familles answerable → { id, family, label }.
 * Déterministe et pur ; le Markdown source n'est jamais modifié.
 */
/** Décode les entités HTML courantes produites par le rendu Markdown. */
function decodeEntities(t) {
  return String(t)
    .replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

export function deriveActivities(html) {
  if (typeof html !== 'string') return [];
  const out = [];
  const re = /<h2\b[^>]*\bid="([^"]+)"[^>]*\bdata-family="([^"]+)"[^>]*>[\s\S]*?<span class="h2-text">([\s\S]*?)<\/span>/g;
  let m;
  while ((m = re.exec(html))) {
    const [, id, family, rawLabel] = m;
    if (!ANSWERABLE_FAMILIES.has(family)) continue;
    out.push({ id, family, label: decodeEntities(rawLabel.replace(/<[^>]+>/g, '')).trim() });
  }
  return out;
}

/**
 * Annote le HTML rendu d'un jour : chaque <h2> reçoit un id stable, un
 * data-family, un numéro de séquence, et un « eyebrow » monospace (N · Famille).
 * Le texte visible est nettoyé de son emoji de tête. Purement chaîne → chaîne,
 * testable ; ne modifie jamais les fichiers pédagogiques.
 */
// V57 · CP11 — La passe d'accessibilité était enfermée dans `annotateDayHtml`,
// donc appliquée aux seules journées et leçons. Les documents de mois, de
// semaine et de projet passent par d'autres rendus : axe y a trouvé 9
// violations critiques « Form elements must have labels » — exactement le
// défaut corrigé en V56, sur des routes que V56 n'auditait pas.
// La passe est donc extraite et réutilisable. Elle ne touche PAS au contenu :
// elle corrige ce que Markdown produit mécaniquement.
//   1) Une case à cocher de liste Markdown est décorative et désactivée : elle
//      sort de l'arbre d'accessibilité plutôt que de recevoir une étiquette
//      redondante.
//   2) Un bloc de code peut défiler horizontalement : il doit être atteignable
//      au clavier (WCAG 2.1.1) et annoncé comme région.
//   V59 · CP13 — Les régions doivent aussi être DISTINGUABLES. Tous les blocs
//      de code d'un document portaient la même étiquette : axe signalait
//      `landmark-unique` (modéré) sur /day/80 et /projects, et un lecteur
//      d'écran annonçait n fois « Bloc de code », sans moyen de les
//      différencier dans la liste des régions. Chaque bloc est donc numéroté
//      sur le total réel du document — un compte dérivé, pas déclaré.
export function annotateProseA11y(html) {
  const src = String(html ?? '');
  const total = (src.match(/<pre(?![^>]*tabindex)[^>]*>/g) ?? []).length;
  let i = 0;
  return src
    .replace(/<input([^>]*?)type="checkbox"([^>]*?)>/g,
      (m, a, b) => (/aria-hidden/.test(m) ? m : `<input${a}type="checkbox"${b} aria-hidden="true" tabindex="-1">`))
    .replace(/<pre(?![^>]*tabindex)([^>]*)>/g, (_m, attrs) => {
      i += 1;
      const label = total > 1
        ? `Bloc de code ${i} sur ${total} (défilement horizontal possible)`
        : 'Bloc de code (défilement horizontal possible)';
      return `<pre${attrs} tabindex="0" role="region" aria-label="${label}">`;
    });
}

export function annotateDayHtml(html) {
  if (typeof html !== 'string') return html;
  const used = new Set();
  let n = 0;
  // V56 — deux annotations d'ACCESSIBILITÉ sur le HTML rendu. Elles ne
  // touchent pas au contenu pédagogique : elles corrigent deux défauts que
  // Markdown produit mécaniquement, et que axe-core signalait en critical
  // et serious sur /day et /doc.
  //
  // 1) Les cases à cocher des listes de tâches Markdown sont rendues
  //    `<input disabled type="checkbox">` SANS étiquette : le texte de
  //    l'élément de liste porte déjà le sens, la case n'est que décorative
  //    et n'est pas actionnable. Elle est donc retirée de l'arbre
  //    d'accessibilité plutôt que dotée d'une étiquette redondante.
  // 2) Un bloc de code peut défiler horizontalement : il doit être
  //    atteignable au clavier (WCAG 2.1.1) et annoncé comme région.
  const a11y = annotateProseA11y(html);
  return a11y.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g, (_m, inner) => {
    n += 1;
    const fam = classifyHeading(inner);
    const meta = familyMeta(fam);
    const text = cleanHeadingText(inner);
    let id = slugify(text);
    while (used.has(id)) id += '-x';
    used.add(id);
    const eyebrow = meta
      ? `<span class="h2-eyebrow">${String(n).padStart(2, '0')} · ${meta.label}</span>`
      : `<span class="h2-eyebrow neutral">${String(n).padStart(2, '0')}</span>`;
    const famAttr = fam ? ` data-family="${fam}"` : '';
    return `<h2 id="${id}" class="fam-h2"${famAttr} data-sec="${n}">`
      + eyebrow + `<span class="h2-text">${text}</span></h2>`;
  });
}
