// V64 · Correction SERVEUR d'un diagnostic, et conservation du résultat.
//
// Avant V64, `/diagnostics` corrigeait dans le navigateur et gardait tout dans
// `useState` : un rechargement effaçait le diagnostic (anomalie A9 du CP0).
//
// Deux raisons de corriger côté serveur :
//   1. la persistance — un résultat qui disparaît n'est pas un résultat ;
//   2. l'intégrité — un score persisté doit être CALCULÉ par le produit, jamais
//      transmis par le client. `gradeAssessment` est une fonction pure, déjà
//      testée ; elle reste la seule autorité.
//
// Réserve pédagogique, tenue dans le libellé de la preuve elle-même :
// un score est un INDICE, pas une preuve de maîtrise.

import { NextRequest, NextResponse } from 'next/server';
import { getAssessment } from '@/lib/assessments-server';
import { gradeAssessment } from '@/lib/assessment';
import { readProgress, writeProgress } from '@/lib/progress-server';
import { applyCommand, openSessions } from '@/lib/learning-engine';
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

  // ── Conservation explicite du résultat ──
  // Une preuve vit dans une journée. On la rattache à la session OUVERTE ; s'il
  // n'y en a aucune, on ne devine pas une journée : on le dit.
  const progress = readProgress();
  const open = openSessions(progress);
  if (open.length === 0) {
    return NextResponse.json({
      ok: true, result, recorded: false,
      reason: 'Aucune journée ouverte : commence une journée pour y rattacher ce résultat.',
    });
  }
  const day = open[open.length - 1].day; // la plus avancée des sessions ouvertes

  const passed = result.passedOverall;
  const r = applyCommand(progress, {
    type: 'SUBMIT',
    day,
    stepId: `diag-${assessment.id}`,
    kind: 'assessment',
    content: `Diagnostic « ${assessment.title} » — ${result.passed}/${result.total}.`,
    validation: {
      status: passed ? 'passed' : 'failed',
      kind: 'assessment-grade',
      checkedAt: new Date().toISOString(),
      detail: `${result.passed}/${result.total} · un score est un indice, pas une preuve de maîtrise`,
      score: { passed: result.passed, total: result.total },
    },
    evidenceId: `diag-${assessment.id}`,
    evidenceTitle: `Diagnostic réussi : ${assessment.title}`,
    evidenceUrl: '/diagnostics',
    skills: assessment.skills ?? [],
  }, { now: new Date() });

  if (!r.ok) {
    return NextResponse.json({ ok: true, result, recorded: false, reason: r.error });
  }
  writeProgress(r.progress as Progress);
  return NextResponse.json({ ok: true, result, recorded: true, day, evidence: passed });
}
