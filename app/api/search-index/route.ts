// Index de recherche local, servi à la palette de commandes (Ctrl/Cmd+K).
// Construit depuis le programme + la progression réelle. Pas de service externe.
import { NextResponse } from 'next/server';
import { getProgram } from '@/lib/program';
import { getSearchIndex } from '@/lib/search-server';
import { readProgress } from '@/lib/progress-server';
import { resolveResume } from '@/lib/resume';
import { reviewSummary } from '@/lib/review';

export const dynamic = 'force-dynamic';

export async function GET() {
  const program = getProgram();
  const progress = readProgress();
  const resume = resolveResume(program.days, progress);
  // items = index STATIQUE (construit une fois, mis en cache client). resumeDay +
  // dueReviews = métadonnées dynamiques (compteurs uniquement — jamais le contenu
  // privé des réponses), fusionnées côté client et revalidées après mutation.
  return NextResponse.json({
    items: getSearchIndex(),
    resumeDay: resume.day,
    dueReviews: reviewSummary(progress.days).dueToday,
  });
}
