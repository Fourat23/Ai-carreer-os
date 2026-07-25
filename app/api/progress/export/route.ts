// Export de la progression : télécharge une sauvegarde JSON versionnée.
// GET /api/progress/export → ai-career-os-backup-AAAA-MM-JJ.json
import { NextResponse } from 'next/server';
import { readProgress, listTracks, getActiveTrackId } from '@/lib/progress-server';
import { serializeBackup } from '@/lib/backup';

export const dynamic = 'force-dynamic';

export async function GET() {
  const backup = serializeBackup(readProgress(), new Date(), {
    activeTrackId: getActiveTrackId(),
    trackCount: listTracks().length,
  });
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="ai-career-os-backup-${date}.json"`,
    },
  });
}
