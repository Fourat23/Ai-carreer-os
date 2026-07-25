// Index de recherche local, servi à la palette de commandes (Ctrl/Cmd+K).
// Construit depuis le programme + la progression réelle. Pas de service externe.
import { NextResponse } from 'next/server';
import { getProgram } from '@/lib/program';
import { readProgress } from '@/lib/progress-server';
import { resolveResume } from '@/lib/resume';
import { buildIndex } from '@/lib/search';

export const dynamic = 'force-dynamic';

export async function GET() {
  const program = getProgram();
  const progress = readProgress();
  const resume = resolveResume(program.days, progress);
  return NextResponse.json({ items: buildIndex(program, { resumeDay: resume.day }) });
}
