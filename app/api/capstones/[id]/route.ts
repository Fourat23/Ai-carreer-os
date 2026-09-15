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
import { readProgressFresh, writeProgress } from '@/lib/progress-server';
import { makeEvidence, appendEvidence } from '@/lib/evidence';
import { applyCommand } from '@/lib/learning-engine';
import { empreinteReponses } from '@/lib/transfer-attempt';
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

  // Correction déterministe.
  const result = gradeCapstone(capstone, responses);

  // ── V77 · CP6 — LA SOUMISSION EST UN FAIT, COMME POUR UN DIAGNOSTIC ──
  //
  // Un capstone est observationnellement un diagnostic : un questionnaire
  // corrigé côté serveur contre un corrigé déclaré. Le CP2 l'a tranché ainsi, et
  // c'est pourquoi il écrit le MÊME fait avec `kind: 'capstone'` plutôt qu'un
  // jumeau. La différence pédagogique — sept phases d'incident — vit dans le
  // genre ; l'environnement simulé dans `simulation`.
  //
  // Écrit AVANT la branche `record`, pour la raison mesurée au CP4 : n'écrire
  // que sous `record` n'observerait que les tentatives dont l'apprenant est
  // assez content pour les garder.
  try {
    const rt = applyCommand(readProgressFresh(), {
      type: 'RECORD_ASSESSMENT_ATTEMPT',
      assessmentId: capstone.id,
      kind: 'capstone',
      competencyIds: capstone.skills ?? [],
      passed: result.passed,
      total: result.total,
      seuil: typeof capstone.passThreshold === 'number' ? capstone.passThreshold : undefined,
      // Réussir une simulation professionnelle est un indice fort ; ce n'est
      // pas une expérience réelle. Le champ le dit, le texte ne le dirait pas.
      simulation: true,
      empreinte: empreinteReponses(responses),
      sourceRef: `/capstones/${capstone.id}`,
      provenance: { producer: 'capstone-grader', method: 'POST /api/capstones/[id]' },
    }, { now: new Date() });
    if (rt.ok) writeProgress(rt.progress as Progress);
  } catch { /* au mieux : le fait ne doit jamais bloquer la correction */ }

  // Une simple correction NE MUTE AUCUNE PREUVE.
  if (body.record !== true) {
    return NextResponse.json({ ok: true, result, recorded: false });
  }

  // `readProgressFresh` : la tentative vient d'être écrite juste au-dessus, et
  // `readProgress` est mémoïsé par requête — elle serait silencieusement perdue.
  const progress = readProgressFresh();
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
    // V77 · CP6 — la marque de simulation devient un CHAMP (dette `D9`). Elle
    // ne dégrade pas le niveau : `VALIDATED` et `simulation: true` tiennent
    // ensemble, et c'est exactement ce qu'un capstone est.
    simulation: true,
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
