// API d'état des missions (V18) — mutations dans le PARCOURS ACTIF uniquement
// (isolation native). Réutilise la progression v3 (readProgress/writeProgress),
// le système de preuves et les compétences. Aucun second moteur.
import { NextRequest, NextResponse } from 'next/server';
import { getMission, publicMission, reconcileAutoDeliverables } from '@/lib/missions-server';
import { readProgress, writeProgress } from '@/lib/progress-server';
import {
  startMission, submitDeliverable, readMissionState, computeMissionStatus,
  recordMissionCompletion, missionProgress,
} from '@/lib/mission-state.mjs';
import { validateDocumentStructure } from '@/lib/mission.mjs';
import type { Mission, DocSpec } from '@/lib/mission';
import type { Progress } from '@/lib/types';

const MAX_CONTENT = 20000;

type MissionFlat = Progress & { missions?: Record<string, unknown> };

function snapshot(flat: MissionFlat, mission: Mission) {
  return {
    mission: publicMission(mission),
    state: readMissionState(flat, mission.id),
    progress: missionProgress(flat, mission),
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

  flat = reconcileAutoDeliverables(flat, mission);
  if (computeMissionStatus(mission, readMissionState(flat, mission.id)) === 'done') {
    flat = recordMissionCompletion(flat, mission) as MissionFlat;
  }
  writeProgress(flat);

  return NextResponse.json({ ...snapshot(flat, mission), ...(structureResult ? { structure: structureResult } : {}) });
}
