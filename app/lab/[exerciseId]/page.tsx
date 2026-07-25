import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getExercise } from '@/lib/exercises-server';
import { readWorkspaceTree } from '@/lib/workspace-server';
import LabWorkspace from './LabWorkspace';

export const dynamic = 'force-dynamic';

export default async function LabExercisePage({ params }: { params: Promise<{ exerciseId: string }> }) {
  const { exerciseId } = await params;
  const ex = getExercise(exerciseId);
  if (!ex) notFound();

  const files = readWorkspaceTree(ex);
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
      <LabWorkspace exercise={meta} initialFiles={files} />
    </div>
  );
}
