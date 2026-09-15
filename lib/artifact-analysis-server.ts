// V77 · CP7 — l'écriture du fait `ArtifactAnalysis`, en UN seul endroit.
//
// Les quatre surfaces analytiques (`kubernetes`, `cloud-lab`,
// `cloud-foundations`, `security`) partagent exactement la même forme : un
// artefact posté, validé contre un schéma, puis analysé en diagnostics classés
// par sévérité. Quatre copies de la même écriture divergeraient, et l'une
// d'elles finirait par compter ce que les trois autres refusent.
//
// C'est la leçon du CP3 sur les listes blanches, appliquée avant d'en payer le
// prix.
import { readProgressFresh, writeProgress } from './progress-server';
import { applyCommand } from './learning-engine';
import { empreinteDArtefact } from './artifact-analysis';
import type { Progress } from './types';
import type { SurfaceAnalytique } from './artifact-analysis';

// Les quatre analyseurs rendent la MÊME forme de résumé, mais leurs types
// déclarés diffèrent (`object` chez l'un, `Record` chez l'autre). On accepte la
// forme large et on valide champ par champ à l'écriture : le module pur refuse
// de toute façon ce qu'il ne reconnaît pas.
type Analyse = {
  summary?: { total?: number; bySeverity?: unknown; dimensions?: unknown };
};

/**
 * Écrit le fait, **au mieux** : un échec de persistance ne doit jamais faire
 * échouer l'analyse que l'apprenant attend.
 *
 * `artefactFourni` est le paramètre décisif. Les quatre routes acceptent
 * `analyze` SANS artefact et retombent alors sur la fixture du produit :
 * enregistrer cette analyse reviendrait à compter une page vue comme du
 * travail. Le module pur refuse d'ailleurs le fait dans ce cas — ceci est la
 * seconde garde, pas la seule.
 */
export function noterAnalyse(
  surface: SurfaceAnalytique,
  artifactId: string,
  artefactFourni: boolean,
  artefact: unknown,
  analyse: Analyse | null | undefined,
): void {
  if (!artefactFourni) return;
  try {
    const s = analyse?.summary ?? {};
    const res = applyCommand(readProgressFresh(), {
      type: 'RECORD_ARTIFACT_ANALYSIS',
      surface,
      artifactId,
      artefactFourni: true,
      diagnostics: typeof s.total === 'number' ? s.total : 0,
      parSeverite: (s.bySeverity ?? {}) as Record<string, number>,
      dimensions: (Array.isArray(s.dimensions) ? s.dimensions : []) as string[],
      // Deux versions différentes d'un artefact sont deux productions ; la même
      // livrée deux fois n'en est qu'une. L'empreinte est calculée sur un JSON
      // à clés triées, donc insensible à l'ordre des champs.
      empreinte: empreinteDArtefact(artefact),
      tailleArtefact: JSON.stringify(artefact ?? {}).length,
      provenance: { producer: 'artifact-analyzer', method: `POST /api/${surface}/[id] action=analyze` },
    }, { now: new Date() });
    if (res.ok) writeProgress(res.progress as Progress);
  } catch { /* au mieux : le fait ne doit jamais bloquer l'analyse */ }
}
