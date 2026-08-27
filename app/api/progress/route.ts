// API de progression — V64 · Learning Engine (ADR-064).
//
// GET  : lit data/progress.json. NE MUTE JAMAIS RIEN.
// POST : applique UNE commande nommée. Il n'existe plus de « patch libre » :
//        avant V64 cette route faisait `{ ...existing, ...patch }`, acceptait
//        n'importe quel corps JSON et autorisait `not-started → done`.
//
// La route est un ADAPTATEUR MINCE : elle parse, délègue au moteur pur, et
// n'écrit QUE si le moteur a dit oui. Une commande refusée ne touche pas le
// disque — c'est l'invariant INVALID_TRANSITION_DOES_NOT_MUTATE_PROGRESS.
//
// Usage local mono-utilisateur, pas d'authentification.

import { NextRequest, NextResponse } from 'next/server';
import { readProgress, writeProgress } from '@/lib/progress-server';
import { applyCommand } from '@/lib/learning-engine';
import type { Progress } from '@/lib/types';

export const dynamic = 'force-dynamic';

const MAX_BODY = 256 * 1024; // une soumission est du texte, pas un dépôt

export async function GET() {
  return NextResponse.json(readProgress());
}

export async function POST(req: NextRequest) {
  const raw = await req.text().catch(() => null);
  if (raw === null) return NextResponse.json({ ok: false, code: 'BAD_BODY', error: 'Corps illisible.' }, { status: 400 });
  if (raw.length > MAX_BODY) {
    return NextResponse.json({ ok: false, code: 'BODY_TOO_LARGE', error: 'Requête trop volumineuse.' }, { status: 413 });
  }

  let body: unknown;
  try { body = JSON.parse(raw); } catch {
    return NextResponse.json({ ok: false, code: 'BAD_JSON', error: 'JSON invalide.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, code: 'BAD_JSON', error: 'JSON invalide.' }, { status: 400 });
  }

  const command = (body as { command?: unknown }).command;
  if (!command || typeof command !== 'object') {
    return NextResponse.json(
      { ok: false, code: 'NO_COMMAND', error: 'Cette API attend { command: { type, … } }.' },
      { status: 400 },
    );
  }

  const result = applyCommand(readProgress(), command as { type: string }, { now: new Date() });
  if (!result.ok) {
    // Aucune écriture. La progression sur disque est strictement inchangée.
    return NextResponse.json({ ok: false, code: result.code, error: result.error }, { status: 400 });
  }

  // NO-OP STRICT : quand le moteur dit que rien ne change (COMPLETE sur une
  // journée déjà terminée), on N'ÉCRIT PAS. Sans cette garde, `writeProgress`
  // rafraîchit quand même `lastOpenedAt` du parcours, et le fichier bouge à
  // chaque rappel — l'idempotence serait vraie sur `completedAt` et fausse sur
  // le disque. Trouvé par le harnais d'intégrité, pas par relecture.
  if (result.effects.some((e) => e.startsWith('noop:'))) {
    return NextResponse.json({ ok: true, effects: result.effects });
  }

  writeProgress(result.progress as Progress);
  return NextResponse.json({ ok: true, effects: result.effects });
}
