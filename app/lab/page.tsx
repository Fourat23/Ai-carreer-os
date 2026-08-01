import { listExercises } from '@/lib/exercises-server';
import { getRuntimeAdapter, DEFAULT_RUNTIME_ID } from '@/lib/runtime.mjs';
import { runtimeStatus } from '@/lib/runtime-detect.mjs';
import { getDayExerciseIndex } from '@/lib/day-exercises-server';
import { daysForExercise } from '@/lib/day-exercises';
import { normalizeExerciseFiles } from '@/lib/exercise-files';
import { readProgress, getActiveTrackId } from '@/lib/progress-server';
import { getCatalogue } from '@/lib/catalogue-server';
import { getTrack, isTrackAvailable } from '@/lib/catalogue';
import { trackDaySets, classifyExercise, contextBadge } from '@/lib/exercise-context.mjs';
import { hasLabEvidence } from '@/lib/lab-progress';
import { Suspense } from 'react';
import { workspaceExists } from '@/lib/workspace-server';
import LabCatalog, { type CatalogItem } from './LabCatalog';

export const dynamic = 'force-dynamic';

function exerciseType(ex: { id: string; tags?: string[]; skills?: string[]; tests: { private?: boolean }[]; workspace: unknown }): string {
  if ((ex.tags ?? []).includes('debug') || /debug/.test(ex.id)) return 'debugging';
  if ((ex.skills ?? []).includes('async') || /async/.test(ex.id)) return 'async';
  if (ex.tests.some((t) => t.private)) return 'tests privés';
  const files = normalizeExerciseFiles(ex as never).filter((f) => !f.test && !f.hidden);
  if (files.length > 1) return 'multi-fichiers';
  return 'simple';
}

export default function LabPage() {
  const exercises = listExercises();
  const idx = getDayExerciseIndex();
  const progress = readProgress();
  // Contexte de parcours : classification PURE côté serveur (métadonnées publiques
  // seulement). Le catalogue mémoïsé fournit les jours de chaque parcours actif.
  const catalogue = getCatalogue();
  const activeTrackId = getActiveTrackId();
  const activeTrackObj = getTrack(catalogue, activeTrackId) ?? catalogue.tracks[0];
  const sets = trackDaySets(catalogue);
  const trackTitle = new Map(catalogue.tracks.map((t) => [t.id, t.title]));
  const availableTracks = catalogue.tracks.filter(isTrackAvailable).map((t) => ({ id: t.id, title: t.title }));
  const rtCache = new Map<string, ReturnType<typeof runtimeStatus>>();
  const rtStatus = (id: string) => {
    if (!rtCache.has(id)) rtCache.set(id, runtimeStatus(id));
    return rtCache.get(id)!;
  };

  const items: CatalogItem[] = exercises.map((ex) => {
    const runtimeId = ex.runtime ?? DEFAULT_RUNTIME_ID;
    const adapter = getRuntimeAdapter(runtimeId);
    const status = rtStatus(runtimeId);
    const days = daysForExercise(idx, ex.id);
    const passed = days.some((d) => hasLabEvidence(progress.days[String(d)], ex.id));
    const userStatus = passed ? 'réussi' : (workspaceExists(ex) ? 'en cours' : 'non commencé');
    const ctx = classifyExercise(days, sets, activeTrackId);
    const badge = contextBadge(ctx);
    return {
      id: ex.id,
      title: ex.title,
      summary: ex.summary ?? '',
      language: ex.language ?? adapter?.language ?? runtimeId,
      runtimeLabel: adapter?.label ?? runtimeId,
      runtimeAvailable: status.available,
      difficulty: typeof ex.difficulty === 'number' ? ex.difficulty : 0,
      skills: ex.skills ?? [],
      testCount: ex.tests.length,
      type: exerciseType(ex),
      execKind: (adapter as { preview?: boolean } | null)?.preview ? 'preview' : 'exécution',
      status: userStatus,
      day: days[0] ?? null,
      // Contexte de parcours (métadonnées publiques : ids + numéros de jours).
      scope: ctx.scope,
      activeDays: ctx.activeDays,
      reachableTracks: ctx.reachableTracks,
      otherTrackTitles: ctx.inActive ? [] : ctx.reachableTracks.map((id) => trackTitle.get(id) ?? id),
      badgeLabel: badge.label,
      badgeKind: badge.kind,
    };
  });

  return (
    <>
      <div className="page-head page-wide">
        <div className="page-head-main">
          <p className="page-eyebrow">Laboratoire <span className="sep">/</span> exécution locale sécurisée</p>
          <h1 className="page-title">Laboratoire de code</h1>
          <p className="page-sub">
            Écris du code, lance les tests et vois le résultat immédiatement. Tout s’exécute
            localement en bac à sable (timeout, sortie bornée, aucun accès réseau requis).
          </p>
        </div>
      </div>
      <Suspense fallback={<div className="lab-count">Chargement…</div>}>
        <LabCatalog items={items} activeTrack={{ id: activeTrackObj.id, title: activeTrackObj.title }} availableTracks={availableTracks} />
      </Suspense>
    </>
  );
}
