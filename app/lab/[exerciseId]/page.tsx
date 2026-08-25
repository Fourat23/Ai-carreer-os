import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Target, Terminal, CheckCheck, FileCode2 } from 'lucide-react';
import { skillLabel } from '@/lib/skill-taxonomy.mjs';
import { getExercise } from '@/lib/exercises-server';
import { readWorkspaceTree } from '@/lib/workspace-server';
import { resolveActiveFile } from '@/lib/exercise-files';
import { getRuntimeAdapter, DEFAULT_RUNTIME_ID } from '@/lib/runtime.mjs';
import { runtimeStatus } from '@/lib/runtime-detect.mjs';
import { getDayExerciseIndex } from '@/lib/day-exercises-server';
import { daysForExercise } from '@/lib/day-exercises';
import { tasksForDays, publicTerminalTask } from '@/lib/terminal-tasks-server';
import { SurfaceHead } from '@/app/ui';
import LabWorkspace from './LabWorkspace';

export const dynamic = 'force-dynamic';

export default async function LabExercisePage({ params }: { params: Promise<{ exerciseId: string }> }) {
  const { exerciseId } = await params;
  const ex = getExercise(exerciseId);
  if (!ex) notFound();

  const files = readWorkspaceTree(ex);
  const initialActive = resolveActiveFile(files, (ex as { activeFile?: string }).activeFile ?? null) ?? files[0]?.path ?? '';
  const runtimeId = ex.runtime ?? DEFAULT_RUNTIME_ID;
  const adapter = getRuntimeAdapter(runtimeId);
  const status = runtimeStatus(runtimeId);
  const runtime = {
    id: runtimeId,
    label: adapter?.label ?? runtimeId,
    available: status.available,
    version: status.version,
    error: status.error,
    compiles: !!(adapter as { compile?: boolean } | null)?.compile,
    preview: !!(adapter as { preview?: boolean } | null)?.preview,
    previewKind: (adapter as { kind?: string } | null)?.kind ?? null,
  };
  const meta = {
    id: ex.id, title: ex.title, summary: ex.summary ?? '',
    // Anti-fuite : jamais le nom d'un test privé (il pourrait suggérer l'attendu).
    tests: ex.tests.filter((t) => !(t as { private?: boolean }).private).map((t) => ({ id: t.id, name: t.name })),
    testCount: ex.tests.length,
  };

  // Tâches de terminal reliées aux journées de l'exercice (dérivé, borné).
  const exDays = daysForExercise(getDayExerciseIndex(), ex.id);
  const terminalTasks = tasksForDays(exDays).map(publicTerminalTask);

  const difficulty = typeof (ex as { difficulty?: number }).difficulty === 'number'
    ? (ex as { difficulty: number }).difficulty : 0;
  const skills: string[] = (ex as { skills?: string[] }).skills ?? [];
  // Fichier à produire : le fichier actif non-test, c'est l'artefact attendu.
  const editables = files.filter((f) => f.editable && !f.hidden);
  const artefact = editables.find((f) => f.path === initialActive) ?? editables[0] ?? null;

  return (
    <div className="page-workspace lab-ex">
      {/* ── V57 · CP6 — La page d'exercice devient un POSTE DE TRAVAIL.
          Elle ne rendait qu'un titre, un résumé et l'éditeur : 0 ombre,
          1 carte, aucune structure (CP0). Elle expose maintenant, dans
          l'ordre où l'on en a besoin, ce que le corpus contient déjà —
          contexte, objectif, environnement, artefact, validation. Rien
          n'est inventé : aucun nom de test privé n'est révélé. */}
      {/* V58 · CP10 — bande d'identité partagée, famille « workbench » : on
          vient ici pour écrire du code et lancer des tests. C'était la dernière
          copie manuelle du bloc (`lab-ex-head`). */}
      <SurfaceHead
        kind="workbench"
        eyebrow={<>
          <Link href="/lab"><ChevronLeft size={12} /> Laboratoire</Link>
          {skills.length > 0 && <> <span className="sep">/</span> {skills.map(skillLabel).join(' · ')}</>}
          {difficulty > 0 && <> <span className="sep">/</span> difficulté {difficulty}/5</>}
        </>}
        title={ex.title}
        lead={<><Target size={14} strokeWidth={2} /> {ex.summary}</>}
      />

      <section className="lab-ex-brief" aria-label="Conditions de travail">
        <div className="lab-ex-cell">
          <span className="lab-ex-k"><Terminal size={13} strokeWidth={2} /> Environnement</span>
          <p className="lab-ex-v">{runtime.label}{runtime.version ? ` · ${runtime.version}` : ''}</p>
          <p className="lab-ex-d">
            {runtime.available
              ? <>disponible localement{runtime.compiles ? ' · compilation' : ''}{runtime.preview ? ' · aperçu' : ''}</>
              : <>indisponible sur cette machine{runtime.error ? ` — ${runtime.error}` : ''}</>}
          </p>
        </div>
        <div className="lab-ex-cell">
          <span className="lab-ex-k"><FileCode2 size={13} strokeWidth={2} /> Artefact attendu</span>
          <p className="lab-ex-v">{artefact ? artefact.path : '—'}</p>
          <p className="lab-ex-d">
            {editables.length} fichier(s) éditable(s) dans l’espace de travail
          </p>
        </div>
        <div className="lab-ex-cell">
          <span className="lab-ex-k"><CheckCheck size={13} strokeWidth={2} /> Validation</span>
          <p className="lab-ex-v">{meta.testCount} test{meta.testCount > 1 ? 's' : ''}</p>
          <p className="lab-ex-d">
            {meta.tests.length < meta.testCount
              ? <>dont {meta.testCount - meta.tests.length} privé(s), non listés</>
              : <>tous publics, exécutés localement</>}
          </p>
        </div>
        {exDays.length > 0 && (
          <div className="lab-ex-cell">
            <span className="lab-ex-k">Contexte</span>
            <p className="lab-ex-v">
              {exDays.slice(0, 3).map((d, i) => (
                <span key={d}>{i > 0 ? ', ' : ''}<Link href={`/day/${d}`}>jour {d}</Link></span>
              ))}
            </p>
            <p className="lab-ex-d">
              {exDays.length > 3 ? `et ${exDays.length - 3} autre(s) journée(s)` : 'journée(s) du curriculum'}
            </p>
          </div>
        )}
      </section>

      <section className="lab-ex-work" aria-label="Exécution et vérification">
        <LabWorkspace exercise={meta} initialFiles={files} initialActive={initialActive} runtime={runtime} terminalTasks={terminalTasks} />
      </section>
    </div>
  );
}
