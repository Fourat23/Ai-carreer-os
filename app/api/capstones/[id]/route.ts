// V65.1 · CP9 — Correction SERVEUR d'un capstone → PREUVE CANONIQUE.
//
// Trou trouvé au CP2 : `capstone` est un type de source QUALIFIANT au contrat
// V65 §2, `capstoneToEvidence` existe dans `lib/capstone.mjs` depuis V40… et
// n'avait AUCUN appelant. `CapstoneRunner` porte en tête « N'écrit RIEN dans la
// progression ». Un capstone réussi ne laissait donc aucune trace : le jalon
// « Premier capstone terminé » était structurellement inatteignable, et une
// compétence ne pouvait pas être démontrée par cette voie.
//
// Cette route est le miroir exact de `/api/assessments/[id]` :
//   1. la correction est faite PAR LE SERVEUR (`gradeCapstone`), jamais reçue
//      du client — un score transmis n'est pas un score calculé ;
//   2. rien n'est écrit sans `record: true` ;
//   3. rejouer le même capstone ne crée pas une seconde preuve (clé métier).
//
// Réserve pédagogique, portée par la preuve : un capstone est une SIMULATION
// professionnelle. La réussir est un indice fort, pas une expérience réelle.

import { NextRequest, NextResponse } from 'next/server';
import { getCapstone } from '@/lib/capstones-server';
import { gradeCapstone } from '@/lib/capstone';
import { readProgress, writeProgress } from '@/lib/progress-server';
import { makeEvidence, appendEvidence } from '@/lib/evidence';
import type { Progress } from '@/lib/types';

export const dynamic = 'force-dynamic';

const MAX_BODY = 64 * 1024;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const capstone = getCapstone(id);
  if (!capstone) return NextResponse.json({ ok: false, error: 'Capstone introuvable.' }, { status: 404 });

  const raw = await req.text().catch(() => null);
  if (raw === null || raw.length > MAX_BODY) {
    return NextResponse.json({ ok: false, error: 'Requête invalide.' }, { status: 400 });
  }
  let body: { responses?: Record<string, unknown>; record?: boolean };
  try { body = JSON.parse(raw); } catch {
    return NextResponse.json({ ok: false, error: 'JSON invalide.' }, { status: 400 });
  }
  const responses = body.responses && typeof body.responses === 'object' && !Array.isArray(body.responses)
    ? body.responses : {};

  // Correction déterministe. Une simple correction NE MUTE RIEN.
  const result = gradeCapstone(capstone, responses);
  if (body.record !== true) {
    return NextResponse.json({ ok: true, result, recorded: false });
  }

  const progress = readProgress();
  const now = new Date().toISOString();

  const ev = makeEvidence({
    sourceType: 'capstone',
    sourceId: capstone.id,
    competencyIds: capstone.skills ?? [],
    // Le seuil est celui du modèle capstone existant (`passedOverall`), en
    // vigueur depuis V40. Aucun seuil n'est inventé ici.
    validation: {
      status: result.passedOverall ? 'passed' : 'failed',
      kind: 'capstone-grade',
      checkedAt: now,
      detail: `${result.passed}/${result.total} · simulation professionnelle, pas une expérience réelle`,
      score: { passed: result.passed, total: result.total },
    },
    title: `Capstone : ${capstone.title}`,
    provenance: {
      producer: 'capstone-grader',
      method: 'capstone-grade',
      note: 'Correction déterministe côté serveur (gradeCapstone).',
    },
    // AUCUN dayId : un capstone n'appartient à aucune journée, et le produit le
    // dit au lieu d'en emprunter une.
  }, { now });

  if (!ev.ok) {
    return NextResponse.json({ ok: true, result, recorded: false, reason: ev.error });
  }

  const appended = appendEvidence(progress.evidence ?? [], ev.evidence);
  if (!appended.added) {
    return NextResponse.json({
      ok: true, result, recorded: false,
      reason: 'Ce résultat est déjà enregistré.', duplicate: true,
    });
  }

  writeProgress({ ...progress, evidence: appended.evidence } as Progress);
  return NextResponse.json({
    ok: true, result, recorded: true,
    evidenceId: ev.evidence.id,
    qualifying: result.passedOverall,
    ledgerSize: appended.evidence.length,
  });
}
