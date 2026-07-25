// Recherche globale PURE et locale (aucun service externe, aucune dépendance).
// Index construit depuis le programme + routes statiques ; requête classée par
// pertinence. Pensé pour ~365 journées : quelques fonctions suffisent.

/** minuscule, sans accents, espaces normalisés. */
export function normalize(s) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(s) {
  return normalize(s).split(/[^a-z0-9]+/).filter(Boolean);
}

// Routes fixes de l'application (toujours accessibles).
const PAGES = [
  ['Tableau de bord', '/', 'dashboard accueil pilotage'],
  ['Calendrier', '/calendar', '365 jours vue ensemble'],
  ['Leçons de fond', '/lessons', 'theorie cours'],
  ['Compétences', '/skills', 'scorecard niveaux'],
  ['Projets', '/projects', 'portfolio'],
  ['Évaluations', '/reviews', 'revues hebdo mensuel entretien'],
  ['Notes', '/notes', 'journal personnel'],
  ['Ressources', '/resources', 'references liens'],
  ['Glossaire IT', '/glossary', 'termes vocabulaire'],
  ['Carrière', '/career', 'emploi poste cv'],
  ['Mode d\'emploi', '/guide', 'aide manuel'],
];

/**
 * Construit l'index de recherche depuis le programme.
 * @param {object} program  { days, weeks, months, skills, lessons }
 * @param {object} [opts]    { resumeDay?: number }
 * @returns {Array<{id,type,title,subtitle,href,keywords}>}
 */
export function buildIndex(program, opts = {}) {
  const items = [];
  const push = (type, title, href, subtitle = '', keywords = '') =>
    items.push({ id: `${type}:${href}`, type, title, subtitle, href, keywords: normalize(`${title} ${subtitle} ${keywords}`) });

  // Commandes rapides (en tête).
  if (opts.resumeDay) push('command', `Reprendre le jour ${opts.resumeDay}`, `/day/${opts.resumeDay}`, 'Continuer mon parcours', 'reprendre continuer resume');
  push('command', 'Aller au tableau de bord', '/', 'Pilotage', 'dashboard');
  push('command', 'Ouvrir le calendrier', '/calendar', '365 jours', 'calendrier');

  for (const [title, href, kw] of PAGES) push('page', title, href, '', kw);

  for (const d of program?.days ?? [])
    push('day', `Jour ${d.day} — ${d.title}`, `/day/${d.day}`, `${d.skillName ?? ''} · Semaine ${d.week} · Mois ${d.month}`, `jour ${d.day} ${d.skillName ?? ''}`);

  for (const w of program?.weeks ?? [])
    push('week', `Semaine ${w.week}`, `/week/${w.week}`, w.theme ?? '', `semaine ${w.week}`);

  for (const m of program?.months ?? []) {
    push('month', `Mois ${m.month} — ${m.title}`, `/month/${m.month}`, m.summary ?? '', `mois ${m.month}`);
    if (m.project?.name) push('project', m.project.name, '/projects', `Projet · mois ${m.month}`, `projet ${m.project.name}`);
  }

  for (const s of program?.skills ?? [])
    push('skill', s.name, '/skills', 'Compétence', `competence ${s.name}`);

  for (const l of program?.lessons ?? [])
    push('lesson', l.title, `/doc/lessons/${l.slug}`, `Leçon${l.cat ? ' · ' + l.cat : ''}`, `lecon ${l.title} ${l.cat ?? ''}`);

  return items;
}

// Détecte "jour 241" / "semaine 35" / "mois 9" → destination directe prioritaire.
const JUMP = [
  [/^j(?:our)?\s*0*(\d{1,3})$/, (n) => n >= 1 && n <= 365 && { type: 'day', title: `Aller au jour ${n}`, href: `/day/${n}` }],
  [/^s(?:emaine)?\s*0*(\d{1,2})$/, (n) => n >= 1 && n <= 52 && { type: 'week', title: `Aller à la semaine ${n}`, href: `/week/${n}` }],
  [/^m(?:ois)?\s*0*(\d{1,2})$/, (n) => n >= 1 && n <= 12 && { type: 'month', title: `Aller au mois ${n}`, href: `/month/${n}` }],
];

export function parseJump(query) {
  const q = normalize(query);
  for (const [re, make] of JUMP) {
    const m = q.match(re);
    if (m) { const hit = make(Number(m[1])); if (hit) return { id: `jump:${hit.href}`, subtitle: 'Accès direct', keywords: '', ...hit }; }
  }
  return null;
}

/** Score d'un item pour une requête normalisée (0 = pas de correspondance). */
function score(item, q, qTokens) {
  const title = normalize(item.title);
  if (title === q) return 100;
  if (title.startsWith(q)) return 80;
  const hay = item.keywords;
  let s = 0;
  if (hay.includes(q)) s = Math.max(s, 55);
  // Tous les tokens présents ?
  const all = qTokens.every((t) => hay.includes(t));
  if (all) {
    const anyPrefix = qTokens.some((t) => hay.split(' ').some((w) => w.startsWith(t)));
    s = Math.max(s, anyPrefix ? 45 : 30);
  }
  return s;
}

const TYPE_ORDER = { command: 0, day: 1, week: 2, month: 3, skill: 4, project: 5, lesson: 6, page: 7 };

/**
 * Recherche : renvoie les résultats classés. Une correspondance « jump » exacte
 * (jour/semaine/mois N) est toujours placée en tête.
 */
export function search(items, query, limit = 24) {
  const q = normalize(query);
  if (!q) return (items ?? []).filter((i) => i.type === 'command').slice(0, limit);
  const qTokens = tokenize(query);
  const jump = parseJump(query);

  const scored = [];
  for (const it of items ?? []) {
    if (jump && it.href === jump.href) continue; // évite le doublon avec le jump
    const sc = score(it, q, qTokens);
    if (sc > 0) scored.push({ item: it, sc });
  }
  scored.sort((a, b) =>
    b.sc - a.sc ||
    (TYPE_ORDER[a.item.type] ?? 9) - (TYPE_ORDER[b.item.type] ?? 9) ||
    a.item.title.localeCompare(b.item.title));

  const out = scored.map((s) => s.item);
  if (jump) out.unshift(jump);
  return out.slice(0, limit);
}
