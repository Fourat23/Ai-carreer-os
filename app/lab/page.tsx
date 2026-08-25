import Link from 'next/link';
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
import { SurfaceHead } from '@/app/ui';
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

  // Agrégats réels du catalogue (aucun chiffre inventé).
  const passedCount = items.filter((x) => x.status === 'réussi').length;
  const inTrackCount = items.filter((x) => x.scope === 'active').length;
  const runtimeCount = new Set(items.map((x) => x.runtimeLabel)).size;

  // Action réelle : le premier exercice non réussi qui tombe sur le parcours
  // actif. Aucun classement inventé — l'ordre est celui du catalogue, filtré
  // sur des champs existants.
  const nextItem = items
    .filter((x) => x.activeDays.length > 0 && x.status !== 'réussi')
    .sort((a, b) => (a.activeDays[0] ?? 0) - (b.activeDays[0] ?? 0))[0] ?? null;

  return (
    <div className="lab-view page-wide">
      {/* ── POSITION : ce qu'est le laboratoire, et où l'on en est ──────────
          V58 · CP10 — bande d'identité partagée (famille « workbench » : on
          vient ici pour exécuter du code, pas pour parcourir un référentiel). */}
      <SurfaceHead
        kind="workbench"
        eyebrow={<>Pratiquer <span className="sep">/</span> exécution locale en bac à sable</>}
        title="Laboratoire de code"
        lead={<>Écris du code, lance les tests, vois le résultat immédiatement. Tout s’exécute
          localement : délai borné, sortie bornée, aucun accès réseau requis.</>}
        facts={[
          { k: 'Exercices', v: items.length },
          { k: 'Réussis', v: passedCount },
          { k: 'Sur ton parcours', v: inTrackCount },
          { k: 'Runtimes', v: runtimeCount },
        ]}
      />

      {/* ── ACTION : la seule frontière justifiée — action autonome ───────── */}
      {nextItem && (
        <section className="lab-next" aria-label="Prochain exercice">
          <div className="lab-next-body">
            <span className="lab-next-k">Prochain exercice non réussi sur ton parcours</span>
            <p className="lab-next-t">{nextItem.title}</p>
            <p className="lab-next-d">
              {nextItem.runtimeLabel}
              {nextItem.difficulty > 0 ? <> <span className="sep">/</span> difficulté {nextItem.difficulty}/5</> : null}
              {nextItem.activeDays.length ? <> <span className="sep">/</span> jour {nextItem.activeDays[0]}</> : null}
            </p>
          </div>
          <Link className="btn cta" href={`/lab/${nextItem.id}`}>Ouvrir l’exercice</Link>
        </section>
      )}

      <Suspense fallback={<div className="lab-count">Chargement…</div>}>
        <LabCatalog items={items} activeTrack={{ id: activeTrackObj.id, title: activeTrackObj.title }} availableTracks={availableTracks} />
      </Suspense>
    </div>
  );
}
