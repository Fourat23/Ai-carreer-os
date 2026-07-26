// Import / restauration V9 : accepte une sauvegarde multi-parcours + workspaces,
// OU tout format antérieur (V4/V5/V6 plat, V7/V8). Valide et migre via
// lib/backup ; supporte un APERÇU ({ preview:true }) sans écrire ; snapshot avant
// remplacement ; restauration atomique (rollback du snapshot en cas d'échec).
import { NextRequest, NextResponse } from 'next/server';
import { readProgressV3, writeProgressV3, snapshotProgress } from '@/lib/progress-server';
import { parseBackupV3 } from '@/lib/backup';
import { listExercises } from '@/lib/exercises-server';
import { workspaceAllowlist, restoreWorkspaces } from '@/lib/workspace-server';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Fichier JSON illisible ou corrompu.' }, { status: 400 }); }

  const wrapper = (body && typeof body === 'object') ? (body as { preview?: boolean; backup?: unknown }) : {};
  const preview = wrapper.preview === true;
  const raw = 'backup' in wrapper ? wrapper.backup : body; // UI peut envelopper {backup} ou envoyer brut

  const exercises = listExercises();
  const parsed = parseBackupV3(raw, workspaceAllowlist(exercises));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const tracks = Object.keys(parsed.v3.tracks);
  const stats = {
    trackCount: tracks.length,
    activeTrackId: parsed.v3.activeTrackId,
    tracks,
    workspaceCount: Object.keys(parsed.workspaces).length,
    version: parsed.version,
    warnings: parsed.warnings,
  };

  // Aperçu : ne rien écrire, renvoyer ce qui SERAIT restauré.
  if (preview) return NextResponse.json({ ok: true, preview: true, stats });

  // Restauration atomique : snapshot, écrit v3, restaure workspaces ; rollback si échec.
  const before = readProgressV3();
  snapshotProgress();
  try {
    writeProgressV3(parsed.v3);
    const byId = new Map(exercises.map((e) => [e.id, e]));
    restoreWorkspaces(byId, parsed.workspaces);
  } catch (e) {
    try { writeFileSync(join(process.cwd(), 'data', 'progress.json'), JSON.stringify(before, null, 2)); } catch { /* rollback best-effort */ }
    return NextResponse.json({ error: `Échec de la restauration : ${(e as Error).message}. État précédent conservé.` }, { status: 500 });
  }
  return NextResponse.json({ ok: true, stats });
}
