// API du Pipeline Lab (V21 CP5). GET → pipeline public + disponibilité.
// POST { action:'run'|'reset', event } → exécute l'orchestrateur PUR déterministe
// (aucun réseau, aucune commande système, aucun secret réel). La vue de sortie est
// bornée et masquée. Actions typées ; entrée validée ; aucune fixture exposée.
import { NextRequest, NextResponse } from 'next/server';
import { getPipeline, publicPipeline } from '@/lib/pipelines-server';
import { runPipeline } from '@/lib/pipeline-engine.mjs';
import { TRIGGER_KINDS } from '@/lib/pipeline.mjs';
import { availability } from '@/lib/pipeline-local.mjs';
import { readProgressFresh, writeProgress } from '@/lib/progress-server';
import { applyCommand } from '@/lib/learning-engine';
import type { Progress } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pipeline = getPipeline(id);
  if (!pipeline) return NextResponse.json({ error: 'Pipeline introuvable.' }, { status: 404 });
  return NextResponse.json({ pipeline: publicPipeline(pipeline), availability: await availability() });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pipeline = getPipeline(id);
  if (!pipeline) return NextResponse.json({ error: 'Pipeline introuvable.' }, { status: 404 });

  let body: { action?: string; event?: { kind?: string; branch?: string; tag?: string }; approved?: boolean };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 }); }
  const action = String(body.action ?? '');

  if (action === 'reset') return NextResponse.json({ ok: true });
  if (action !== 'run') return NextResponse.json({ error: `Action inconnue « ${action} ».` }, { status: 400 });

  // Événement simulé, borné et validé (jamais de webhook réel).
  const rawEvent = body.event ?? {};
  const kind = String(rawEvent.kind ?? pipeline.trigger[0] ?? 'manual');
  if (!TRIGGER_KINDS.includes(kind)) return NextResponse.json({ error: `Trigger invalide « ${kind} ».` }, { status: 400 });
  const event = {
    kind,
    branch: typeof rawEvent.branch === 'string' ? rawEvent.branch.slice(0, 80) : undefined,
    tag: typeof rawEvent.tag === 'string' ? rawEvent.tag.slice(0, 80) : undefined,
  };
  // Contexte : approbation manuelle simulée. Aucun secret réel n'est fourni.
  const ctx = { approved: body.approved === true, branch: event.branch };
  const run = runPipeline(pipeline, event, ctx, { clock: () => 0 });

  // ── V77 · CP7 — `USAGE_ONLY`, ET POUR UNE AUTRE RAISON QUE LE TERMINAL ──
  //
  // Le brief demandait de ne pas jeter le verdict objectif de cette route
  // (`success` / `failed` / `blocked`). Le CP1 l'a renversé après lecture du
  // code, et la raison tient en une phrase :
  //
  //   > la route n'accepte **aucun pipeline candidat**.
  //
  // Le corps est `{ action, event, approved }`. L'apprenant choisit un
  // déclencheur et coche une approbation ; le pipeline, lui, est **fourni par le
  // produit**. Deux apprenants qui choisissent le même déclencheur obtiennent
  // exactement le même résultat. *Le statut mesure la fixture, pas la personne.*
  //
  // C'est la différence avec les quatre surfaces voisines, qui acceptent un
  // artefact RÉDIGÉ par l'apprenant et méritent donc `ArtifactAnalysis`. Et
  // c'est une raison DIFFÉRENTE de celle du terminal, qui n'a aucun critère de
  // réussite du tout : deux chemins distincts vers le même fait pauvre.
  //
  // On écrit donc l'usage — « ce participant est allé ici » — et jamais l'issue.
  try {
    const res = applyCommand(readProgressFresh(), {
      type: 'RECORD_USAGE_EVENT',
      surface: 'pipelines',
      action: 'run',
      ref: pipeline.id,
      detail: { adapter: kind },
      provenance: { producer: 'pipeline-route', method: 'POST /api/pipelines/[id] action=run' },
    }, { now: new Date() });
    if (res.ok) writeProgress(res.progress as Progress);
  } catch { /* au mieux : l'usage est un bonus, jamais une dépendance */ }

  return NextResponse.json({ run });
}
