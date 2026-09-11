// V75 · CP9 — CORRECTION SERVEUR D'UN DÉFI DE TRANSFERT → PREUVE CANONIQUE.
//
// ── LA DETTE QUE CETTE ROUTE PAIE ────────────────────────────────────────
//
// Le CP0 a mesuré **D10** : route `app/transfer` **absente**, navigation
// **absente**, **0/365** journées citant un défi, **0** référence dans
// `program.json`. Les 25 défis existaient dans `data/transfer-challenges/`, le
// correcteur existait dans `lib/transfer-challenge.mjs`, le type de preuve
// existait depuis V74 · CP11 — et **rien ne pouvait les atteindre**.
//
// Conséquence mesurable, écrite noir sur blanc dans `lib/learner-memory.mjs` :
// le compteur `transfers` *« vaut 0 tant que les 25 défis ne sont pas
// atteignables »*. Le moteur de rétention était **structurellement incapable
// d'observer un transfert**.
//
// ── POURQUOI LA CORRECTION EST CÔTÉ SERVEUR ─────────────────────────────
//
// Mêmes deux raisons qu'au CP de V65 pour les diagnostics :
//   1. la persistance — un résultat qui disparaît n'est pas un résultat ;
//   2. l'intégrité — **un verdict persisté doit être CALCULÉ par le produit**,
//      jamais transmis par le client. `gradeTransferChallenge` reste la seule
//      autorité, et le client ne peut pas s'auto-décerner une preuve.
//
// ── RÉSERVE PÉDAGOGIQUE, PORTÉE PAR LA PREUVE ELLE-MÊME ─────────────────
//
// En-tête de `lib/transfer-challenge.mjs`, inchangé : *« réussir un défi est un
// INDICE de transfert, pas une maîtrise prouvée »*. La preuve le redit dans son
// `detail`, pour que personne ne relise le chiffre sans la réserve.
import { NextRequest, NextResponse } from 'next/server';
import { getTransferChallenge } from '@/lib/transfer-challenges-server';
import { gradeTransferChallenge } from '@/lib/transfer-challenge';
import { readProgress, writeProgress } from '@/lib/progress-server';
import { makeEvidence, appendEvidence } from '@/lib/evidence';
import type { Progress } from '@/lib/types';

export const dynamic = 'force-dynamic';

const MAX_BODY = 64 * 1024;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const challenge = getTransferChallenge(id);
  if (!challenge) return NextResponse.json({ ok: false, error: 'Défi introuvable.' }, { status: 404 });

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

  // Corriger ne MUTE RIEN. Conserver est une action explicite et séparée.
  const result = gradeTransferChallenge(challenge, responses);
  if (body.record !== true) {
    return NextResponse.json({ ok: true, result, recorded: false });
  }

  const progress = readProgress();
  const now = new Date().toISOString();

  const ev = makeEvidence({
    // Le type ajouté par V74 · CP11, enfin produit par quelque chose.
    sourceType: 'transfer-challenge',
    sourceId: challenge.id,
    competencyIds: challenge.skills ?? [],
    // V75 · CP3 — les concepts, quand le défi les déclare. `lessonRefs` désigne
    // des leçons du catalogue : c'est exactement le grain de `conceptIds`.
    conceptIds: challenge.lessonRefs ?? [],
    validation: {
      status: result.passedOverall ? 'passed' : 'failed',
      // `assessment-grade` et non un cinquième vocabulaire : la correction
      // RÉUTILISE littéralement `gradeQuestion` du modèle d'évaluation
      // (`lib/transfer-challenge.mjs` le dit dans son en-tête). Inventer un
      // `transfer-grade` ajouterait un mot que rien d'autre ne sait valider —
      // c'est le `sourceType` qui distingue un transfert d'un diagnostic, et
      // c'est lui que `learner-memory` lit.
      kind: 'assessment-grade',
      checkedAt: now,
      detail: `${result.passed}/${result.total} · réussir un défi est un indice de transfert, pas une maîtrise prouvée`,
      score: { passed: result.passed, total: result.total },
    },
    title: `Défi de transfert : ${challenge.title}`,
    provenance: {
      producer: 'transfer-grader',
      method: 'transfer-challenge',
      note: `Correction déterministe côté serveur (gradeTransferChallenge, seuil ${challenge.passThreshold ?? 0.7}).`,
    },
    // AUCUN dayId : un défi n'appartient à aucune journée. Lui en emprunter une
    // serait la dette que V65 a justement corrigée pour les diagnostics.
  }, { now });

  if (!ev.ok) {
    return NextResponse.json({ ok: true, result, recorded: false, reason: ev.error });
  }

  const appended = appendEvidence(progress.evidence ?? [], ev.evidence);
  if (!appended.added) {
    // Rejouer le même défi ne crée pas une seconde preuve du même fait.
    return NextResponse.json({
      ok: true, result, recorded: false, duplicate: true,
      reason: 'Ce résultat est déjà enregistré.',
    });
  }

  writeProgress({ ...progress, evidence: appended.evidence } as Progress);
  return NextResponse.json({
    ok: true, result, recorded: true,
    qualifying: result.passedOverall,
  });
}
