// Index de recherche STATIQUE, construit UNE fois depuis le programme et le
// catalogue (tous deux immuables). Les métadonnées dynamiques (jour à reprendre,
// révisions dues) ne sont jamais mises en cache ici : elles sont fusionnées par
// requête dans la route, pour rester cohérentes après chaque mutation.
import { getProgram } from './program';
import { getCatalogue } from './catalogue-server';
import { listExercises } from './exercises-server';
import { listMissions } from './missions-server';
import { publicPipelineSummaries } from './pipelines-server';
import { publicTopologySummaries } from './topologies-server';
import { publicManifestSummaries } from './manifests-server';
import { publicScenarioSummaries, publicPlaybookSummaries } from './security-server';
import { getGlossary } from './glossary';
import { getRuntimeAdapter, DEFAULT_RUNTIME_ID } from './runtime.mjs';
import { buildIndex } from './search';
import type { SearchItem } from './search';

let cached: SearchItem[] | null = null;

// Projection PUBLIQUE et sûre d'un exercice pour l'index : uniquement titre,
// compétences, runtime et difficulté. JAMAIS le workspace, les fichiers, la
// solution de référence, les tests (encore moins privés) ni les diagnostics.
function publicExerciseSummaries() {
  return listExercises().map((ex) => {
    const adapter = getRuntimeAdapter(ex.runtime ?? DEFAULT_RUNTIME_ID);
    return {
      id: ex.id,
      title: ex.title,
      skills: ex.skills ?? [],
      language: ex.language ?? adapter?.language ?? ex.runtime ?? DEFAULT_RUNTIME_ID,
      runtimeLabel: adapter?.label ?? ex.runtime ?? DEFAULT_RUNTIME_ID,
      difficulty: typeof ex.difficulty === 'number' ? ex.difficulty : 0,
    };
  });
}

// Projection PUBLIQUE d'une mission pour l'index : titre, catégorie, compétences.
// JAMAIS le contexte interne de notation, les docSpec, les exerciseRef internes,
// ni les livrables de l'apprenant.
function publicMissionSummaries() {
  return listMissions()
    .filter((m) => m.status === 'published')
    .map((m) => ({ id: m.id, title: m.title, category: m.category, skills: m.skills ?? [] }));
}

// Projection PUBLIQUE des entrées de glossaire pour l'index : uniquement les champs
// « forts » (terme, forme, français, alias). Aucune définition n'est indexée : le
// résultat renvoie vers le glossaire filtré sur le terme.
function publicGlossarySummaries() {
  return getGlossary().map((g) => ({
    id: g.id, term: g.term, fullForm: g.fullForm ?? null,
    frenchMeaning: g.frenchMeaning ?? '', aliases: g.aliases ?? [],
  }));
}

export function getSearchIndex(): SearchItem[] {
  if (!cached) cached = buildIndex(
    getProgram(), getCatalogue(), publicExerciseSummaries(), publicMissionSummaries(),
    publicPipelineSummaries(), publicTopologySummaries(), publicManifestSummaries(),
    publicScenarioSummaries(), publicPlaybookSummaries(), publicGlossarySummaries(),
  );
  return cached;
}
