// Export de la progression : sauvegarde JSON versionnée V9 (multi-parcours +
// workspaces du Laboratoire). GET → ai-career-os-backup-AAAA-MM-JJ.json
import { NextResponse } from 'next/server';
import { readProgressV3 } from '@/lib/progress-server';
import { listExercises } from '@/lib/exercises-server';
import { exportAllWorkspaces } from '@/lib/workspace-server';
import { serializeBackupV3 } from '@/lib/backup';

export const dynamic = 'force-dynamic';

export async function GET() {
  const v3 = readProgressV3();
  const workspaces = exportAllWorkspaces(listExercises());
  const backup = serializeBackupV3(v3, workspaces, new Date());
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="ai-career-os-backup-${date}.json"`,
    },
  });
}
