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
import { readProgressFresh, writeProgress } from '@/lib/progress-server';
import { makeEvidence, appendEvidence } from '@/lib/evidence';
import { applyCommand } from '@/lib/learning-engine';
import { empreinteReponses } from '@/lib/transfer-attempt';
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

  // Correction déterministe.
  const result = gradeAssessment(assessment, responses);

  // ── V77 · CP4 — LA SOUMISSION EST UN FAIT, MÊME SANS CONSERVATION ──
  //
  // Mesuré avant d'écrire, sur le produit réel : sept soumissions humaines sur
  // le même diagnostic laissaient **2 preuves et 0 tentative** ; et une suite
  // `0/5 → 1/5 → 4/5` gardait `0/5` puis `4/5`, le `1/5` étant refusé comme
  // doublon parce que la clé de preuve ignore le score. **Le produit gardait la
  // première tentative et appelait ça un historique.**
  //
  // Le fait est donc écrit ici, et non dans la branche `record`. L'interface
  // corrige d'abord (`submit`, sans conservation) et ne conserve qu'ensuite
  // (`keep`) : n'écrire que sous `record` reviendrait à n'observer que les
  // tentatives dont l'apprenant est assez content pour les garder — c'est-à-dire
  // exactement la dissymétrie que V74 · CP2 a corrigée pour les exercices.
  //
  // `empreinteReponses` vient de V75 · CP10 : les deux appels de l'interface
  // portent les MÊMES réponses, et `estUnRejeu` les compte donc une seule fois.
  // Une soumission humaine distincte, elle, reste un fait distinct.
  //
  // Écriture au mieux : un échec de persistance du fait ne doit pas faire
  // échouer la correction que l'apprenant attend.
  try {
    const rt = applyCommand(readProgressFresh(), {
      type: 'RECORD_ASSESSMENT_ATTEMPT',
      assessmentId: assessment.id,
      kind: 'assessment',
      competencyIds: assessment.skills ?? [],
      passed: result.passed,
      total: result.total,
      seuil: typeof assessment.passThreshold === 'number' ? assessment.passThreshold : undefined,
      // Un diagnostic se répond dans le produit : rien n'est simulé ici.
      simulation: false,
      empreinte: empreinteReponses(responses),
      sourceRef: `/diagnostics/${assessment.id}`,
      provenance: { producer: 'assessment-grader', method: 'POST /api/assessments/[id]' },
    }, { now: new Date() });
    if (rt.ok) writeProgress(rt.progress as Progress);
  } catch { /* au mieux : le fait ne doit jamais bloquer la correction */ }

  // Une simple correction NE MUTE AUCUNE PREUVE.
  if (body.record !== true) {
    return NextResponse.json({ ok: true, result, recorded: false });
  }

  // ── Conservation explicite du résultat, SANS journée d'emprunt ──
  //
  // V77 · CP4 — `readProgressFresh` et non `readProgress` : ce dernier est
  // mémoïsé par requête, et la tentative vient d'être écrite juste au-dessus.
  // Repartir d'un instantané mémoïsé la reperdrait — silencieusement.
  const progress = readProgressFresh();
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
