import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getExercise } from '@/lib/exercises-server';
import { readWorkspaceTree } from '@/lib/workspace-server';
import { resolveActiveFile } from '@/lib/exercise-files';
import { getRuntimeAdapter, DEFAULT_RUNTIME_ID } from '@/lib/runtime.mjs';
import { runtimeStatus } from '@/lib/runtime-detect.mjs';
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
  };
  const meta = {
    id: ex.id, title: ex.title, summary: ex.summary ?? '',
    tests: ex.tests.map((t) => ({ id: t.id, name: t.name })),
  };

  return (
    <div className="page-workspace">
      <div className="page-head">
        <div className="page-head-main">
          <p className="page-eyebrow"><Link href="/lab"><ChevronLeft size={12} /> Laboratoire</Link></p>
          <h1 className="page-title">{ex.title}</h1>
          <p className="page-sub">{ex.summary}</p>
        </div>
      </div>
      <LabWorkspace exercise={meta} initialFiles={files} initialActive={initialActive} runtime={runtime} />
    </div>
  );
}
