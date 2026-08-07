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
  ['Pipeline Lab', '/pipelines', 'ci cd pipeline livraison deploiement simulateur'],
  ['Cloud Topology Lab', '/cloud-lab', 'cloud topologie architecture deploiement haute disponibilite'],
  ['Kubernetes & Orchestration Lab', '/kubernetes', 'kubernetes k8s orchestration pod deployment manifest rollout'],
  ['Carrière', '/career', 'emploi poste cv'],
  ['Mode d\'emploi', '/guide', 'aide manuel'],
  ['Révisions', '/revisions', 'a revoir revision spaced repetition memorisation'],
  ['Sauvegarde des données', '/settings', 'export import backup reset donnees parametres'],
];

/**
 * Construit l'index de recherche STATIQUE depuis le programme (jamais périmé :
 * jours, titres, semaines, mois, compétences, leçons, projets, pages, commandes
 * fixes). Les métadonnées dynamiques (jour à reprendre) sont ajoutées séparément
 * via resumeCommand()/mergeIndex() pour rester cohérentes après une mutation.
 * Le catalogue (facultatif) ajoute parcours, modules et technologies. Les
 * exercices (facultatif) ajoutent les cartes du Laboratoire — UNIQUEMENT des
 * métadonnées PUBLIQUES (titre, compétences, runtime, difficulté). AUCUNE donnée
 * privée n'est jamais indexée : ni réponses, ni notes, ni CODE utilisateur, ni
 * solution de référence, ni tests privés, ni diagnostics, ni preuves privées.
 * @param {object} program  { days, weeks, months, skills, lessons }
 * @param {object} [catalogue]  { tracks, modules, technologies }
 * @param {Array<{id,title,skills?,language?,runtimeLabel?,difficulty?}>} [exercises]
 * @returns {Array<{id,type,title,subtitle,href,keywords}>}
 */
export function buildIndex(program, catalogue = null, exercises = null, missions = null, pipelines = null, topologies = null, manifests = null, scenarios = null, playbooks = null, glossaryEntries = null, cloudArchitectures = null) {
  const items = [];
  const push = (type, title, href, subtitle = '', keywords = '') =>
    items.push({ id: `${type}:${href}`, type, title, subtitle, href, keywords: normalize(`${title} ${subtitle} ${keywords}`) });

  // Commandes rapides statiques (en tête).
  push('command', 'Aller au tableau de bord', '/', 'Pilotage', 'dashboard');
  push('command', 'Ouvrir le calendrier', '/calendar', '365 jours', 'calendrier');
  push('command', 'Sauvegarder / restaurer', '/settings', 'Export · import · réinitialiser', 'backup sauvegarde export import reset');

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

  // Catalogue multi-parcours (facultatif) : parcours, modules, technologies.
  if (catalogue) {
    const techName = (id) => (catalogue.technologies ?? []).find((t) => t.id === id)?.name ?? id;
    for (const t of catalogue.tracks ?? []) {
      const soon = t.status !== 'available';
      push('track', t.title, `/parcours#${t.id}`, soon ? 'Parcours · à venir' : 'Parcours', `parcours ${t.title} ${(t.technologies ?? []).map(techName).join(' ')}`);
    }
    for (const mid of Object.keys(catalogue.modules ?? {})) {
      const m = catalogue.modules[mid];
      const first = (m.dayRefs ?? [])[0];
      if (first == null) continue;
      push('module', m.title, `/day/${first}`, `Module · jours ${first}–${m.dayRefs[m.dayRefs.length - 1]}`, `module ${m.title}`);
    }
    for (const tech of catalogue.technologies ?? [])
      push('technology', tech.name, `/parcours#tech-${tech.id}`, 'Technologie', `technologie ${tech.name} ${tech.id}`);
  }

  // Exercices du Laboratoire — métadonnées PUBLIQUES uniquement (jamais le code,
  // la solution, les tests privés ni les diagnostics).
  for (const ex of exercises ?? []) {
    if (!ex || typeof ex.id !== 'string') continue;
    const bits = [];
    if (ex.runtimeLabel) bits.push(ex.runtimeLabel);
    if (Number.isFinite(ex.difficulty) && ex.difficulty > 0) bits.push(`difficulté ${ex.difficulty}`);
    const subtitle = `Exercice${bits.length ? ' · ' + bits.join(' · ') : ''}`;
    push('exercise', ex.title, `/lab/${ex.id}`, subtitle, `exercice lab ${ex.title} ${(ex.skills ?? []).join(' ')} ${ex.language ?? ''}`);
  }

  // Missions d'ingénierie — métadonnées PUBLIQUES uniquement (jamais la solution,
  // les tests privés, les seuils cachés, ni les livrables de l'apprenant).
  const MISSION_KW = {
    'debt-maintenance': 'dette technique maintenance refactoring legacy',
    performance: 'performance optimisation profiling bottleneck latence',
    documentation: 'documentation adr hsd tsd lld rfc runbook changelog',
    incident: 'incident post-mortem observabilite runbook sre',
  };
  for (const m of missions ?? []) {
    if (!m || typeof m.id !== 'string') continue;
    push('mission', m.title, `/missions/${m.id}`, `Mission · ${m.category ?? ''}`,
      `mission ${m.title} ${(m.skills ?? []).join(' ')} ${MISSION_KW[m.category] ?? ''}`);
  }

  // Pipelines du Pipeline Lab — métadonnées PUBLIQUES uniquement (jamais les
  // fixtures « with », ni les secrets : la vue publique les a déjà retirés).
  for (const p of pipelines ?? []) {
    if (!p || typeof p.id !== 'string') continue;
    push('pipeline', p.title ?? p.name ?? p.id, `/pipelines/${p.id}`, 'Pipeline CI/CD',
      `pipeline ci cd ${p.title ?? ''} ${p.description ?? p.summary ?? ''}`);
  }

  // Topologies du Cloud Topology Lab — métadonnées PUBLIQUES uniquement (la vue
  // publique a déjà retiré tout champ interne sensible).
  for (const t of topologies ?? []) {
    if (!t || typeof t.id !== 'string') continue;
    push('topology', t.title ?? t.name ?? t.id, `/cloud-lab/${t.id}`, 'Topologie cloud',
      `topologie cloud architecture deploiement ${t.title ?? ''} ${t.description ?? ''}`);
  }

  // Scénarios du Kubernetes Manifest Lab — métadonnées PUBLIQUES uniquement (la
  // vue publique a déjà retiré tout champ interne sensible).
  for (const m of manifests ?? []) {
    if (!m || typeof m.id !== 'string') continue;
    push('manifest', m.title ?? m.name ?? m.id, `/kubernetes/${m.id}`, 'Scénario Kubernetes',
      `kubernetes k8s manifest orchestration ${m.title ?? ''} ${m.description ?? ''}`);
  }

  // Scénarios du Security & Incident Lab — métadonnées PUBLIQUES uniquement (jamais
  // les secrets, artefacts vulnérables, diagnostics ni la remédiation de référence).
  for (const s of scenarios ?? []) {
    if (!s || typeof s.id !== 'string') continue;
    push('scenario', s.title ?? s.id, `/security/${s.id}`, 'Scénario de sécurité',
      `securite security scenario incident ${s.title ?? ''} ${s.domain ?? ''} ${(s.skills ?? []).join(' ')}`);
  }

  // Architectures du Cloud Architecture Lab — métadonnées PUBLIQUES uniquement (jamais
  // les identités/policies détaillées ni les credentials).
  for (const a of cloudArchitectures ?? []) {
    if (!a || typeof a.id !== 'string') continue;
    push('cloud-arch', a.title ?? a.id, `/cloud-foundations/${a.id}`, `Architecture cloud${a.provider ? ' · ' + String(a.provider).toUpperCase() : ''}`,
      `cloud architecture aws azure ${a.title ?? ''} ${a.provider ?? ''} ${a.region ?? ''} ${(a.skills ?? []).join(' ')}`);
  }

  // Playbooks « Que faire dans ce cas ? » — métadonnées PUBLIQUES (situation, domaine).
  // Les playbooks sont publics par nature (procédures) ; on n'indexe que titre/domaine.
  // Les playbooks cloud (id « cloud-… ») vivent sur /cloud-foundations, les autres sur /security.
  for (const p of playbooks ?? []) {
    if (!p || typeof p.id !== 'string') continue;
    const base = p.id.startsWith('cloud-') ? '/cloud-foundations' : '/security';
    push('playbook', p.situation ?? p.title ?? p.id, `${base}#playbook-${p.id}`, 'Que faire dans ce cas ?',
      `que faire playbook procedure incident cloud ${p.situation ?? p.title ?? ''} ${p.domain ?? ''}`);
  }

  // Termes du glossaire — métadonnées PUBLIQUES (terme, forme, français, alias).
  // Aucune définition indexée ici : le lien mène au glossaire filtré sur le terme.
  for (const g of glossaryEntries ?? []) {
    if (!g || typeof g.id !== 'string' || !g.term) continue;
    const extra = [g.fullForm, g.frenchMeaning, ...(g.aliases ?? [])].filter(Boolean).join(' ');
    push('glossary', g.term, `/glossary?q=${encodeURIComponent(g.term)}`, `Glossaire${g.fullForm ? ' · ' + g.fullForm : ''}`,
      `glossaire terme definition ${g.term} ${extra}`);
  }

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

const TYPE_ORDER = { command: 0, day: 1, exercise: 2, mission: 2, pipeline: 2, topology: 2, manifest: 2, scenario: 2, playbook: 2, 'cloud-arch': 2, track: 3, module: 4, week: 5, month: 6, skill: 7, technology: 8, glossary: 9, project: 10, lesson: 11, page: 12 };

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

/**
 * Commande dynamique « Reprendre le jour N » — dépend de la progression, donc
 * recalculée après chaque mutation (jamais mise en cache avec l'index statique).
 * @returns {object|null}
 */
export function resumeCommand(resumeDay) {
  if (!Number.isInteger(resumeDay) || resumeDay < 1) return null;
  return {
    id: 'command:resume', type: 'command',
    title: `Reprendre le jour ${resumeDay}`, subtitle: 'Continuer mon parcours',
    href: `/day/${resumeDay}`, keywords: normalize(`reprendre continuer resume jour ${resumeDay}`),
  };
}

/**
 * Commande dynamique « Révisions dues (N) » — ne divulgue qu'un COMPTEUR, jamais
 * le contenu privé des réponses. Null si rien n'est dû.
 */
export function reviewsCommand(dueCount) {
  if (!Number.isInteger(dueCount) || dueCount < 1) return null;
  return {
    id: 'command:reviews-due', type: 'command',
    title: `Révisions dues (${dueCount})`, subtitle: 'À revoir aujourd’hui',
    href: '/revisions', keywords: normalize('revisions dues a revoir aujourdhui'),
  };
}

/** Fusionne les commandes dynamiques (en tête) avec l'index statique mis en cache. */
export function mergeIndex(staticItems, dynamic = []) {
  return [...dynamic.filter(Boolean), ...(staticItems ?? [])];
}
