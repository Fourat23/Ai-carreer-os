// Catalogue de parcours & modules — PUR, validé au chargement. Un module est
// défini une fois et RÉFÉRENCÉ par les parcours (jamais copié). Le programme
// actuel (365 jours) devient le premier parcours « ai-engineer-foundations-v1 »,
// dont les modules sont dérivés des mois du programme (références de jours, pas
// de duplication de contenu). Aucune donnée pédagogique n'est modifiée ici.

export const DEFAULT_TRACK_ID = 'ai-engineer-foundations-v1';

// Taxonomie initiale (non exhaustive). Un id stable ≠ libellé affiché.
export const TECHNOLOGIES = [
  { id: 'git', name: 'Git', area: 'foundations' },
  { id: 'linux', name: 'Terminal / Linux', area: 'foundations' },
  { id: 'javascript', name: 'JavaScript', area: 'foundations' },
  { id: 'typescript', name: 'TypeScript', area: 'foundations' },
  { id: 'node', name: 'Node.js', area: 'backend' },
  { id: 'react', name: 'React', area: 'frontend' },
  { id: 'nextjs', name: 'Next.js', area: 'frontend' },
  { id: 'api', name: 'API / HTTP', area: 'backend' },
  { id: 'sql', name: 'SQL / PostgreSQL', area: 'data' },
  { id: 'testing', name: 'Tests', area: 'engineering' },
  { id: 'architecture', name: 'Architecture logicielle', area: 'engineering' },
  { id: 'docker', name: 'Docker', area: 'devops' },
  { id: 'cloud', name: 'Cloud', area: 'devops' },
  { id: 'python', name: 'Python', area: 'data' },
  { id: 'llm', name: 'LLM', area: 'ai' },
  { id: 'rag', name: 'RAG', area: 'ai' },
  { id: 'agents', name: 'Agents', area: 'ai' },
  { id: 'evaluation', name: 'Évaluation IA', area: 'ai' },
  { id: 'ai-security', name: 'Sécurité IA', area: 'ai' },
];

// Parcours annoncés (pas encore implémentés — non activables).
export const ANNOUNCED_TRACKS = [
  { id: 'ai-fullstack-v1', title: 'Full-stack orienté IA', goal: 'Concevoir des produits web dopés à l’IA.', technologies: ['react', 'nextjs', 'node', 'api', 'llm'] },
  { id: 'backend-engineer-v1', title: 'Backend Engineer', goal: 'APIs robustes, bases de données, production.', technologies: ['node', 'api', 'sql', 'docker', 'architecture'] },
  { id: 'frontend-engineer-v1', title: 'Frontend Engineer', goal: 'Interfaces modernes, accessibles, performantes.', technologies: ['javascript', 'typescript', 'react', 'nextjs', 'testing'] },
  { id: 'cloud-devops-v1', title: 'Cloud / DevOps', goal: 'CI/CD, conteneurs, infrastructure.', technologies: ['docker', 'cloud', 'linux', 'testing'] },
  { id: 'data-ml-v1', title: 'Data / ML', goal: 'Données, modèles, pipelines ML.', technologies: ['python', 'sql', 'evaluation', 'llm'] },
];

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const uniq = (a) => [...new Set(a)];

/** Dérive les modules du parcours fondations depuis les mois du programme. */
function foundationsModules(program) {
  const days = program?.days ?? [];
  const months = [...(program?.months ?? [])].sort((a, b) => a.month - b.month);
  return months.map((m) => {
    const mdays = days.filter((d) => d.month === m.month).sort((a, b) => a.day - b.day);
    return {
      id: `mod-m${m.month}`,
      title: m.title ?? `Mois ${m.month}`,
      summary: m.summary ?? '',
      dayRefs: mdays.map((d) => d.day),
      skills: uniq(mdays.map((d) => d.skill).filter(Boolean)),
      projectRef: m.project?.id != null ? String(m.project.id) : null,
    };
  });
}

/**
 * Construit le catalogue complet à partir du programme, PUIS le valide.
 * Lance une erreur explicite si une référence est cassée ou un id dupliqué.
 * @returns {{ technologies, modules: Record<string,object>, tracks: object[] }}
 */
export function buildCatalogue(program) {
  const dayNums = new Set((program?.days ?? []).map((d) => d.day));
  const modList = foundationsModules(program);
  const modules = {};
  for (const m of modList) modules[m.id] = m;

  const foundations = {
    id: DEFAULT_TRACK_ID,
    version: '1',
    status: 'available',
    title: 'AI Engineer — Fondations',
    goal: 'Devenir employable sur des rôles IA appliquée en 12 mois : fondations, ingénierie, IA appliquée.',
    moduleRefs: modList.map((m) => m.id),
    // Le parcours fondations couvre l'ensemble de la taxonomie (référence les ids
    // de TECHNOLOGIES, pas les ids de compétences internes des modules).
    technologies: TECHNOLOGIES.map((t) => t.id),
    totalDays: (program?.days ?? []).length,
  };

  const announced = ANNOUNCED_TRACKS.map((t) => ({
    ...t, version: '1', status: 'announced', moduleRefs: [], totalDays: 0,
  }));

  const catalogue = { technologies: TECHNOLOGIES, modules, tracks: [foundations, ...announced] };
  validateCatalogue(catalogue, dayNums);
  return catalogue;
}

/** Validation stricte : ids uniques, refs résolues, jours existants. Lance sinon. */
export function validateCatalogue(catalogue, dayNums = null) {
  if (!isObj(catalogue) || !Array.isArray(catalogue.tracks) || !isObj(catalogue.modules)) {
    throw new Error('Catalogue invalide : structure attendue { modules, tracks }.');
  }
  const trackIds = new Set();
  const moduleIds = Object.keys(catalogue.modules);
  if (new Set(moduleIds).size !== moduleIds.length) throw new Error('Catalogue : id de module dupliqué.');

  for (const mid of moduleIds) {
    const m = catalogue.modules[mid];
    if (m.id !== mid) throw new Error(`Catalogue : id de module incohérent (${mid}).`);
    if (dayNums) for (const d of m.dayRefs ?? []) {
      if (!dayNums.has(d)) throw new Error(`Catalogue : jour inexistant ${d} référencé par le module ${mid}.`);
    }
  }
  for (const t of catalogue.tracks) {
    if (!t.id) throw new Error('Catalogue : parcours sans id.');
    if (trackIds.has(t.id)) throw new Error(`Catalogue : id de parcours dupliqué (${t.id}).`);
    trackIds.add(t.id);
    for (const ref of t.moduleRefs ?? []) {
      if (!catalogue.modules[ref]) throw new Error(`Catalogue : référence de module cassée « ${ref} » dans le parcours « ${t.id} ».`);
    }
  }
  return true;
}

export function getTrack(catalogue, id) {
  return (catalogue?.tracks ?? []).find((t) => t.id === id) ?? null;
}

/** Résout les modules d'un parcours (lance si une référence est cassée). */
export function getTrackModules(catalogue, track) {
  return (track?.moduleRefs ?? []).map((ref) => {
    const m = catalogue.modules[ref];
    if (!m) throw new Error(`Référence de module cassée « ${ref} ».`);
    return m;
  });
}

export function isTrackAvailable(track) {
  return !!track && track.status === 'available';
}
