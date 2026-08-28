// V65 · Correction SERVEUR d'un diagnostic → PREUVE CANONIQUE.
//
// Dette V64 corrigée ici : un diagnostic devait emprunter « la session ouverte
// la plus avancée » pour exister, parce qu'une preuve ne pouvait pas vivre hors
// d'une journée. Le rattachement était une commodité de stockage, pas un fait.
//
// Depuis V65, une preuve est un objet autonome : un diagnostic pris hors de
// toute journée a `dayId: null`, et c'est un FAIT, pas un trou.
//
// Deux raisons de corriger côté serveur :
//   1. la persistance — un résultat qui disparaît n'est pas un résultat ;
//   2. l'intégrité — un score persisté doit être CALCULÉ par le produit, jamais
//      transmis par le client. `gradeAssessment` reste la seule autorité.
//
// Réserve pédagogique, portée par la preuve elle-même :
// un score est un INDICE, pas une preuve de maîtrise.

import { NextRequest, NextResponse } from 'next/server';
import { getAssessment } from '@/lib/assessments-server';
import { gradeAssessment } from '@/lib/assessment';
import { readProgress, writeProgress } from '@/lib/progress-server';
import { makeEvidence, appendEvidence } from '@/lib/evidence';
import type { Progress } from '@/lib/types';

export const dynamic = 'force-dynamic';

const MAX_BODY = 64 * 1024;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const assessment = getAssessment(id);
  if (!assessment) return NextResponse.json({ ok: false, error: 'Diagnostic introuvable.' }, { status: 404 });

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
  const result = gradeAssessment(assessment, responses);
  if (body.record !== true) {
    return NextResponse.json({ ok: true, result, recorded: false });
  }

  // ── Conservation explicite du résultat, SANS journée d'emprunt ──
  const progress = readProgress();
  const now = new Date().toISOString();

  const ev = makeEvidence({
    sourceType: 'assessment',
    sourceId: assessment.id,
    competencyIds: assessment.skills ?? [],
    // Le seuil est celui de la fixture (`passThreshold`, défaut 0,7) — déjà en
    // vigueur avant V65 et déjà testé. Aucun seuil n'est inventé ici.
    validation: {
      status: result.passedOverall ? 'passed' : 'failed',
      kind: 'assessment-grade',
      checkedAt: now,
      detail: `${result.passed}/${result.total} · un score est un indice, pas une preuve de maîtrise`,
      score: { passed: result.passed, total: result.total },
    },
    title: `Diagnostic : ${assessment.title}`,
    provenance: {
      producer: 'assessment-grader',
      method: 'assessment-grade',
      note: 'Correction déterministe côté serveur (gradeAssessment).',
    },
    assessmentId: assessment.id,
    // AUCUN dayId : ce diagnostic n'appartient à aucune journée, et le produit
    // le dit au lieu d'en fabriquer un.
  }, { now });

  if (!ev.ok) {
    return NextResponse.json({ ok: true, result, recorded: false, reason: ev.error });
  }

  const before = (progress.evidence ?? []).length;
  const appended = appendEvidence(progress.evidence ?? [], ev.evidence);
  if (!appended.added) {
    // Rejouer le même diagnostic ne crée pas une seconde preuve.
    return NextResponse.json({ ok: true, result, recorded: false, reason: 'Ce résultat est déjà enregistré.', duplicate: true });
  }

  writeProgress({ ...progress, evidence: appended.evidence } as Progress);
  return NextResponse.json({
    ok: true, result, recorded: true,
    evidenceId: ev.evidence.id,
    qualifying: result.passedOverall,
    ledgerSize: before + 1,
  });
}
