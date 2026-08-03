// API du Cloud Topology Lab (V22 CP4). GET → topologie publique + analyse.
// POST { action:'analyze'|'scenario'|'reset', topology?, scenario? } → analyse
// PURE déterministe (aucun réseau, aucun provisioning, aucun secret réel).
// Une topologie postée est VALIDÉE avant analyse (jamais exécutée).
import { NextRequest, NextResponse } from 'next/server';
import { getTopology, publicTopology } from '@/lib/topologies-server';
import { validateTopology, publicTopologyView } from '@/lib/topology.mjs';
import { analyzeTopology } from '@/lib/topology-analysis.mjs';
import { runScenario, SCENARIOS } from '@/lib/topology-scenario.mjs';
import { getProgram } from '@/lib/program';
import { buildCatalogue } from '@/lib/catalogue.mjs';
import { isKnownSkill } from '@/lib/skill-taxonomy.mjs';

export const dynamic = 'force-dynamic';

function validationCtx() {
  const program = getProgram();
  const validDays = new Set<number>((program.days ?? []).map((d: { day: number }) => d.day));
  const trackIds = new Set<string>((buildCatalogue(program).tracks as { id: string }[]).map((t) => t.id));
  return { skillIds: { has: (s: string) => isKnownSkill(s) }, validDays, trackIds };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topo = getTopology(id);
  if (!topo) return NextResponse.json({ error: 'Topologie introuvable.' }, { status: 404 });
  return NextResponse.json({ topology: publicTopology(topo), analysis: analyzeTopology(topo) });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const base = getTopology(id);
  if (!base) return NextResponse.json({ error: 'Topologie introuvable.' }, { status: 404 });

  let body: { action?: string; topology?: unknown; scenario?: { kind?: string; target?: string } };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 }); }
  const action = String(body.action ?? '');

  if (action === 'reset') {
    return NextResponse.json({ topology: publicTopology(base), analysis: analyzeTopology(base) });
  }

  if (action === 'analyze') {
    // Topologie éditée par l'utilisateur : VALIDÉE d'abord (jamais exécutée).
    const candidate = (body.topology && typeof body.topology === 'object')
      ? { ...(body.topology as Record<string, unknown>), id: base.id, skills: base.skills, dayRefs: base.dayRefs, trackScope: base.trackScope }
      : base;
    const v = validateTopology(candidate as never, validationCtx());
    if (!v.ok) return NextResponse.json({ error: 'Topologie invalide.', errors: v.errors }, { status: 422 });
    return NextResponse.json({ topology: publicTopologyView(candidate as never), analysis: analyzeTopology(candidate) });
  }

  if (action === 'scenario') {
    const kind = String(body.scenario?.kind ?? '');
    if (!SCENARIOS.includes(kind)) return NextResponse.json({ error: `Scénario inconnu « ${kind} ».` }, { status: 400 });
    const target = typeof body.scenario?.target === 'string' ? body.scenario.target.slice(0, 80) : undefined;
    const result = runScenario(base, { kind, target });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ scenario: result });
  }

  return NextResponse.json({ error: `Action inconnue « ${action} ».` }, { status: 400 });
}
