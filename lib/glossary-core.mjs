// Logique pure du glossaire IT (sans fs ni JSON) — partagée entre :
//   - l'app Next (lib/glossary.ts, app/glossary/*)   via les types de glossary-core.d.ts
//   - le script de validation (scripts/glossary-check.mjs)
//   - les tests (tests/glossary.test.mjs)
// Aucune dépendance : ES module pur. Toute logique de recherche/validation vit ici,
// pour qu'app, script et tests partagent EXACTEMENT le même comportement.

/** Catégories contrôlées (id stable + libellé affiché). L'ordre = ordre d'affichage. */
export const CATEGORIES = [
  { id: 'dev', label: 'Développement' },
  { id: 'git', label: 'Git et collaboration' },
  { id: 'test', label: 'Tests et qualité' },
  { id: 'arch', label: 'Architecture logicielle' },
  { id: 'agile', label: 'Agile et produit' },
  { id: 'pm', label: 'Gestion de projet' },
  { id: 'devops', label: 'DevOps et CI/CD' },
  { id: 'cloud', label: 'Cloud et infrastructure' },
  { id: 'network', label: 'Réseau et protocoles' },
  { id: 'db', label: 'Bases de données' },
  { id: 'data', label: 'Data et analytics' },
  { id: 'ai', label: 'IA et machine learning' },
  { id: 'security', label: 'Sécurité' },
  { id: 'prod', label: 'Production et exploitation' },
  { id: 'itsm', label: 'ITSM et support' },
  { id: 'business', label: 'Entreprise et monde du travail' },
  { id: 'career', label: 'Carrière et recrutement' },
];

/** Niveaux contrôlés. */
export const LEVELS = ['débutant', 'intermédiaire', 'avancé'];

/** Champs obligatoires d'une entrée. */
export const REQUIRED_FIELDS = [
  'id', 'term', 'frenchMeaning', 'category', 'level',
  'shortDefinition', 'detailedDefinition', 'usageContext',
  'meetingExample', 'plainTranslation',
];

const CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));

/** Normalise un texte pour la recherche : minuscules + suppression des accents/diacritiques. */
export function normalizeText(s) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // marques combinantes (accents)
    .trim();
}

/** Concatène les champs recherchables d'une entrée (déjà normalisés) : terme, forme complète,
 *  français, alias, tags. Sert la recherche insensible casse/accents. */
export function searchableText(entry) {
  const parts = [
    entry.term,
    entry.fullForm,
    entry.frenchMeaning,
    ...(entry.aliases ?? []),
    ...(entry.tags ?? []),
  ];
  return parts.filter(Boolean).map(normalizeText).join(' ␟ ');
}

/** true si l'entrée correspond à la requête (recherche sur terme/forme/français/alias/tags). */
export function entryMatches(entry, query) {
  const q = normalizeText(query);
  if (!q) return true;
  return searchableText(entry).includes(q);
}

/** Filtre + recherche combinés. Options : { query, category, level }. */
export function filterEntries(entries, { query = '', category = '', level = '' } = {}) {
  return entries.filter((e) => {
    if (category && e.category !== category) return false;
    if (level && e.level !== level) return false;
    if (query && !entryMatches(e, query)) return false;
    return true;
  });
}

/** Tri alphabétique stable par terme (insensible casse/accents). */
export function sortEntries(entries) {
  return [...entries].sort((a, b) =>
    normalizeText(a.term).localeCompare(normalizeText(b.term), 'fr'));
}

/** Une entrée est « ambiguë » si elle documente plusieurs sens ou porte une note d'ambiguïté. */
export function isAmbiguous(entry) {
  return Boolean((entry.senses && entry.senses.length > 1) || entry.ambiguityNote);
}

/** Première lettre (majuscule, sans accent) d'un terme — pour la navigation alphabétique. */
export function firstLetter(entry) {
  const c = normalizeText(entry.term).charAt(0).toUpperCase();
  return /[A-Z]/.test(c) ? c : '#';
}

/**
 * Valide un tableau d'entrées. Retourne { errors: string[] } (vide = valide).
 * Détecte : id/terme dupliqués, définition manquante, catégorie/niveau invalides,
 * relations vers des ids inexistants, alias en collision, champs obligatoires manquants.
 */
export function validateGlossary(entries) {
  const errors = [];
  if (!Array.isArray(entries)) return { errors: ['Le glossaire doit être un tableau JSON.'] };

  const ids = new Map();          // id -> index
  const terms = new Map();        // terme normalisé -> id
  const aliasOwner = new Map();   // alias normalisé -> id

  entries.forEach((e, i) => {
    const where = `entrée #${i}${e && e.id ? ` (${e.id})` : ''}`;

    // Champs obligatoires
    for (const f of REQUIRED_FIELDS) {
      if (e[f] === undefined || e[f] === null || String(e[f]).trim() === '') {
        errors.push(`${where} : champ obligatoire manquant ou vide : "${f}".`);
      }
    }
    if (!e || !e.id) return; // sans id, on ne peut pas aller plus loin

    // id unique
    if (ids.has(e.id)) errors.push(`${where} : id dupliqué "${e.id}" (déjà vu à #${ids.get(e.id)}).`);
    else ids.set(e.id, i);

    // terme unique (insensible casse/accents)
    const nt = normalizeText(e.term);
    if (nt) {
      if (terms.has(nt) && terms.get(nt) !== e.id) {
        errors.push(`${where} : terme dupliqué "${e.term}" (déjà porté par "${terms.get(nt)}").`);
      } else terms.set(nt, e.id);
    }

    // définition présente
    if (!e.shortDefinition || String(e.shortDefinition).trim() === '') {
      errors.push(`${where} : définition courte manquante.`);
    }
    if (!e.detailedDefinition || String(e.detailedDefinition).trim() === '') {
      errors.push(`${where} : définition détaillée manquante.`);
    }

    // catégorie / niveau contrôlés
    if (!CATEGORY_IDS.has(e.category)) errors.push(`${where} : catégorie invalide "${e.category}".`);
    if (!LEVELS.includes(e.level)) errors.push(`${where} : niveau invalide "${e.level}".`);

    // alias : collision avec un autre id
    for (const a of e.aliases ?? []) {
      const na = normalizeText(a);
      if (!na) continue;
      if (aliasOwner.has(na) && aliasOwner.get(na) !== e.id) {
        errors.push(`${where} : alias "${a}" déjà utilisé par "${aliasOwner.get(na)}".`);
      } else aliasOwner.set(na, e.id);
    }
  });

  // relations vers des ids existants (2e passe, une fois tous les ids connus)
  entries.forEach((e, i) => {
    if (!e || !e.id) return;
    for (const rel of e.relatedTerms ?? []) {
      if (!ids.has(rel)) {
        errors.push(`entrée #${i} (${e.id}) : relatedTerms pointe vers un id inexistant "${rel}".`);
      }
      if (rel === e.id) {
        errors.push(`entrée #${i} (${e.id}) : relatedTerms se référence lui-même.`);
      }
    }
  });

  return { errors };
}
