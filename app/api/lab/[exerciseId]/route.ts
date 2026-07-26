// API du laboratoire de code. GET → arborescence + méta de l'exercice.
// POST { action, files } → save | run | reset. Toute l'exécution passe par le
// gestionnaire sécurisé (CP7) : sandbox, allowlist, timeout, sortie bornée,
// aucun secret transmis. Aucun shell libre.
import { NextRequest, NextResponse } from 'next/server';
import { getExercise } from '@/lib/exercises-server';
import { resolveActiveFile } from '@/lib/exercise-files';
import { getDayExerciseIndex } from '@/lib/day-exercises-server';
import { daysForExercise } from '@/lib/day-exercises';
import { readProgress, writeProgress } from '@/lib/progress-server';
import { recordExerciseSuccess } from '@/lib/lab-progress';
import {
  readWorkspaceTree, writeWorkspaceFile, resetWorkspace, resetWorkspaceFile, runExercise,
} from '@/lib/workspace-server';
import { splitAttempt } from '@/lib/lab-feedback';

export const dynamic = 'force-dynamic';

const MAX_FILES_IN_REQUEST = 40;

function exerciseMeta(ex: { id: string; title: string; summary?: string; runtime?: string; tests: { id: string; name: string; private?: boolean }[] }) {
  return {
    id: ex.id, title: ex.title, summary: ex.summary ?? '', runtime: ex.runtime ?? 'node-js',
    // Anti-fuite : seuls les NOMS des tests publics sont exposés (un nom de test
    // privé pourrait suggérer l'attendu). Le total sert au décompte affiché.
    tests: ex.tests.filter((t) => !t.private).map((t) => ({ id: t.id, name: t.name })),
    testCount: ex.tests.length,
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ exerciseId: string }> }) {
  const { exerciseId } = await params;
  const ex = getExercise(exerciseId);
  if (!ex) return NextResponse.json({ error: 'Exercice introuvable.' }, { status: 404 });
  const files = readWorkspaceTree(ex);
  const activeFile = resolveActiveFile(files, (ex as { activeFile?: string }).activeFile ?? null);
  return NextResponse.json({ exercise: exerciseMeta(ex), files, activeFile });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ exerciseId: string }> }) {
  const { exerciseId } = await params;
  const ex = getExercise(exerciseId);
  if (!ex) return NextResponse.json({ error: 'Exercice introuvable.' }, { status: 404 });

  let body: { action?: string; files?: Record<string, string> };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 }); }
  const action = String(body.action ?? '');
  const files = (body.files && typeof body.files === 'object' && !Array.isArray(body.files)) ? body.files : {};
  if (Object.keys(files).length > MAX_FILES_IN_REQUEST) {
    return NextResponse.json({ error: 'Trop de fichiers.' }, { status: 400 });
  }

  try {
    if (action === 'reset') {
      resetWorkspace(ex);
      return NextResponse.json({ ok: true, files: readWorkspaceTree(ex) });
    }
    if (action === 'reset-file') {
      const path = String((body as { path?: string }).path ?? '');
      resetWorkspaceFile(ex, path);
      return NextResponse.json({ ok: true, files: readWorkspaceTree(ex) });
    }
    if (action === 'save') {
      for (const [path, content] of Object.entries(files)) writeWorkspaceFile(ex, path, String(content));
      return NextResponse.json({ ok: true, files: readWorkspaceTree(ex) });
    }
    if (action === 'run') {
      // Persiste d'abord (les fichiers autorisés) pour que l'état survive au run.
      for (const [path, content] of Object.entries(files)) writeWorkspaceFile(ex, path, String(content));
      const { attempt, stdout, timedOut, error, phase, diagnostics } = await runExercise(ex, files);
      // Anti-fuite : les tests PRIVÉS ne quittent JAMAIS le serveur en détail.
      // On n'expose que les résultats publics + un AGRÉGAT privé (total/réussis),
      // jamais leur nom, attendu, reçu, message ni durée. allPassed/passed/total
      // restent calculés sur l'ensemble (public + privé) pour la preuve.
      const privateIds = new Set(ex.tests.filter((t) => (t as { private?: boolean }).private).map((t) => t.id));
      const { publicResults, privateSummary } = splitAttempt(attempt, privateIds);
      attempt.results = publicResults;
      // Réussite → preuve de compétence dans la progression (jours liés).
      let recorded = false;
      if (attempt.allPassed) {
        const dayRefs = daysForExercise(getDayExerciseIndex(), ex.id);
        if (dayRefs.length) {
          const next = recordExerciseSuccess(readProgress(), {
            exerciseId: ex.id, title: ex.title, skills: ex.skills ?? [], dayRefs,
          });
          writeProgress(next);
          recorded = true;
        }
      }
      return NextResponse.json({ ok: true, attempt, privateSummary, stdout, timedOut, error, phase: phase ?? 'test', diagnostics: diagnostics ?? [], recorded });
    }
    return NextResponse.json({ error: 'Action inconnue.' }, { status: 400 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message ?? 'Erreur.' }, { status: 400 });
  }
}
