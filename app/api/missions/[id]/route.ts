// API d'état des missions (V18) — mutations dans le PARCOURS ACTIF uniquement
// (isolation native). Réutilise la progression v3 (readProgress/writeProgress),
// le système de preuves et les compétences. Aucun second moteur.
import { NextRequest, NextResponse } from 'next/server';
import { getMission, publicMission, reconcileAutoDeliverables } from '@/lib/missions-server';
import { readProgress, writeProgress } from '@/lib/progress-server';
import {
  startMission, submitDeliverable, readMissionState, computeMissionStatus,
  recordMissionCompletion, missionProgress, missionReview,
} from '@/lib/mission-state.mjs';
import { validateDocumentStructure } from '@/lib/mission.mjs';
import { applyCommand } from '@/lib/learning-engine';
import type { Mission, DocSpec } from '@/lib/mission';
import type { Progress } from '@/lib/types';

const MAX_CONTENT = 20000;

type MissionFlat = Progress & { missions?: Record<string, unknown> };

function snapshot(flat: MissionFlat, mission: Mission) {
  return {
    mission: publicMission(mission),
    state: readMissionState(flat, mission.id),
    progress: missionProgress(flat, mission),
    review: missionReview(mission, readMissionState(flat, mission.id)),
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mission = getMission(id);
  if (!mission) return NextResponse.json({ error: 'Mission introuvable.' }, { status: 404 });
  const flat = reconcileAutoDeliverables(readProgress() as MissionFlat, mission);
  return NextResponse.json(snapshot(flat, mission));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mission = getMission(id);
  if (!mission) return NextResponse.json({ error: 'Mission introuvable.' }, { status: 404 });

  let body: { action?: string; deliverableId?: string; content?: string; selfAssessment?: Record<string, unknown> };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 }); }
  const action = String(body.action ?? '');

  let flat = readProgress() as MissionFlat;
  const deliv = mission.deliverables.find((d) => d.id === body.deliverableId);
  let structureResult: ReturnType<typeof validateDocumentStructure> | undefined;

  if (action === 'start') {
    flat = startMission(flat, mission.id);
  } else if (action === 'submit-doc') {
    if (!deliv || deliv.validation !== 'structural') return NextResponse.json({ error: 'Livrable documentaire invalide.' }, { status: 400 });
    const content = String(body.content ?? '').slice(0, MAX_CONTENT);
    structureResult = validateDocumentStructure(content, deliv.docSpec as DocSpec);
    flat = submitDeliverable(flat, mission, deliv.id, { status: structureResult.ok ? 'structure-valid' : 'submitted', content });
  } else if (action === 'self-assess') {
    if (!deliv || deliv.validation !== 'review') return NextResponse.json({ error: 'Livrable de revue invalide.' }, { status: 400 });
    flat = submitDeliverable(flat, mission, deliv.id, { status: 'self-assessed', selfAssessment: body.selfAssessment ?? {} });
  } else if (action === 'validate-review') {
    if (!deliv || deliv.validation !== 'review') return NextResponse.json({ error: 'Livrable de revue invalide.' }, { status: 400 });
    flat = submitDeliverable(flat, mission, deliv.id, { status: 'validated' });
  } else {
    return NextResponse.json({ error: 'Action inconnue.' }, { status: 400 });
  }

  // ── V77 · CP5 — CE QUI A ÉTÉ RENDU, ET COMMENT ON L'A CONSTATÉ ──
  //
  // La preuve de mission ne dit plus `passed` (cf. `recordMissionCompletion`).
  // Pour que rien ne soit perdu au change, ce qu'elle recouvrait abusivement est
  // écrit ici, là où c'est vrai : un livrable, un MODE de constat, et le niveau
  // que ce mode permet d'affirmer. Une revue signée par l'apprenant reste une
  // DÉCLARATION, et le fait le dit.
  if (deliv && action !== 'start') {
    const fait = applyCommand(flat, {
      type: 'RECORD_MISSION_SUBMISSION',
      missionId: mission.id,
      deliverableId: deliv.id,
      mode: deliv.validation,
      statut: action === 'submit-doc'
        ? (structureResult?.ok ? 'structure-valid' : 'submitted')
        : action === 'self-assess' ? 'self-assessed' : 'validated',
      structureOk: structureResult?.ok,
      // Ce que le validateur a réellement signalé — sections absentes et
      // mentions manquantes. Nommer les manques est une observation ; en tirer
      // une note n'en serait plus une.
      manques: [...(structureResult?.missingSections ?? []), ...(structureResult?.missingMentions ?? [])],
      tailleContenu: typeof body.content === 'string' ? body.content.length : 0,
      provenance: { producer: 'mission-engine', method: `POST /api/missions/[id] action=${action}` },
    }, { now: new Date() });
    if (fait.ok) flat = fait.progress as MissionFlat;
  }

  flat = reconcileAutoDeliverables(flat, mission);
  if (computeMissionStatus(mission, readMissionState(flat, mission.id)) === 'done') {
    flat = recordMissionCompletion(flat, mission) as MissionFlat;
  }
  writeProgress(flat);

  return NextResponse.json({ ...snapshot(flat, mission), ...(structureResult ? { structure: structureResult } : {}) });
}
