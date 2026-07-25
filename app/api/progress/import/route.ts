// Import / restauration : accepte une sauvegarde versionnée OU un progress.json
// brut (legacy). Valide et migre via lib/backup ; snapshot de l'état précédent
// avant de remplacer ; ne corrompt jamais l'état sur JSON invalide.
import { NextRequest, NextResponse } from 'next/server';
import { writeProgress, snapshotProgress } from '@/lib/progress-server';
import { parseBackup } from '@/lib/backup';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Fichier JSON illisible ou corrompu.' }, { status: 400 });
  }
  const parsed = parseBackup(raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  snapshotProgress();          // filet de sécurité : conserve l'état précédent
  writeProgress(parsed.progress);
  return NextResponse.json({ ok: true, stats: parsed.stats, version: parsed.version });
}
