// Import/restauration de la progression depuis une sauvegarde.
// POST /api/progress/import  body = le contenu d'un progress.json exporté.
// Valide la forme minimale avant d'écraser, pour ne pas corrompre l'état.

import { NextRequest, NextResponse } from 'next/server';
import { writeProgress } from '@/lib/progress-server';
import type { Progress } from '@/lib/types';

export const dynamic = 'force-dynamic';

function isValid(p: unknown): p is Progress {
  if (!p || typeof p !== 'object') return false;
  const o = p as Record<string, unknown>;
  return (
    (o.startDate === null || typeof o.startDate === 'string') &&
    typeof o.days === 'object' && o.days !== null &&
    typeof o.skills === 'object' && o.skills !== null
  );
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
  }
  if (!isValid(body)) {
    return NextResponse.json({ error: 'Format de sauvegarde invalide' }, { status: 400 });
  }
  // Normalise les champs optionnels.
  const p = body as Progress;
  writeProgress({
    startDate: p.startDate ?? null,
    days: p.days ?? {},
    skills: p.skills ?? {},
    weeklyReviews: p.weeklyReviews ?? {},
    monthlyReviews: p.monthlyReviews ?? {},
  });
  return NextResponse.json({ ok: true });
}
