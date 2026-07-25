// Réinitialisation de la progression. POST /api/progress/reset
// Snapshot de l'état précédent (filet de sécurité), puis remise à zéro.
import { NextResponse } from 'next/server';
import { writeProgress, snapshotProgress, emptyProgress } from '@/lib/progress-server';

export const dynamic = 'force-dynamic';

export async function POST() {
  snapshotProgress();
  writeProgress(emptyProgress());
  return NextResponse.json({ ok: true });
}
