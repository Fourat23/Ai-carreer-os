// Activation de parcours. POST /api/track { trackId }.
// N'active QUE des parcours réellement disponibles dans le catalogue ; refuse
// explicitement un parcours annoncé (non implémenté). Aucune perte : la
// progression des autres parcours est conservée par le store v3.
import { NextRequest, NextResponse } from 'next/server';
import { getCatalogue } from '@/lib/catalogue-server';
import { getTrack, isTrackAvailable } from '@/lib/catalogue';
import { enrollAndActivate } from '@/lib/progress-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: { trackId?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const trackId = String(body.trackId ?? '');
  const track = getTrack(getCatalogue(), trackId);
  if (!track) return NextResponse.json({ error: 'Parcours inconnu.' }, { status: 404 });
  if (!isTrackAvailable(track)) return NextResponse.json({ error: 'Ce parcours n’est pas encore disponible.' }, { status: 409 });
  enrollAndActivate(track.id, track.version);
  return NextResponse.json({ ok: true, activeTrackId: track.id });
}
