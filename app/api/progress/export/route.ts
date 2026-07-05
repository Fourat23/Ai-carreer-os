// Export de la progression : télécharge data/progress.json en pièce jointe.
// GET /api/progress/export  → fichier progress-AAAA-MM-JJ.json

import { NextResponse } from 'next/server';
import { readProgress } from '@/lib/progress-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = JSON.stringify(readProgress(), null, 2);
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(data, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="progress-${date}.json"`,
    },
  });
}
