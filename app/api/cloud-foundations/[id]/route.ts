// API du Cloud Architecture Lab (V25 CP3). GET → architecture publique + analyse.
// POST { action:'analyze'|'remediate'|'reset' } → analyse PURE déterministe (aucun
// réseau, aucun appel AWS/Azure, aucune exécution, aucune credential réelle). Une
// architecture postée est VALIDÉE avant analyse (jamais exécutée). Coût FACTICE.
import { NextRequest, NextResponse } from 'next/server';
import { getCloudArchitecture, publicCloudArchitecture, getPriceBook } from '@/lib/cloud-server';
import { validateCloudArchitecture, publicCloudView } from '@/lib/cloud-architecture.mjs';
import { analyzeCloud } from '@/lib/cloud-analysis.mjs';
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

/** Construit l'état corrigé (fixed*) d'une architecture. */
function fixedOf(base: Record<string, unknown>) {
  return {
    ...base,
    resources: base.fixedResources ?? base.resources,
    edges: base.fixedEdges ?? base.edges,
    identities: base.fixedIdentities ?? base.identities,
    network: base.fixedNetwork ?? base.network,
    observability: base.fixedObservability ?? base.observability,
    costHints: base.fixedCostHints ?? base.costHints,
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const arch = getCloudArchitecture(id);
  if (!arch) return NextResponse.json({ error: 'Architecture introuvable.' }, { status: 404 });
  return NextResponse.json({
    architecture: publicCloudArchitecture(arch),
    analysis: analyzeCloud(arch as never, getPriceBook() as never),
    hasFixed: Boolean(arch.fixedResources || arch.fixedIdentities || arch.fixedNetwork),
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const base = getCloudArchitecture(id);
  if (!base) return NextResponse.json({ error: 'Architecture introuvable.' }, { status: 404 });

  let body: { action?: string; architecture?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 }); }
  const action = String(body.action ?? '');
  const priceBook = getPriceBook();

  if (action === 'reset') {
    return NextResponse.json({ architecture: publicCloudArchitecture(base), analysis: analyzeCloud(base as never, priceBook as never) });
  }
  if (action === 'remediate') {
    const fixed = fixedOf(base as unknown as Record<string, unknown>);
    return NextResponse.json({ architecture: publicCloudView(fixed as never), analysis: analyzeCloud(fixed as never, priceBook as never) });
  }
  if (action === 'analyze') {
    const candidate = (body.architecture && typeof body.architecture === 'object')
      ? { ...(body.architecture as Record<string, unknown>), id: base.id, provider: base.provider, region: base.region, skills: base.skills, dayRefs: base.dayRefs, trackScope: base.trackScope }
      : base;
    const v = validateCloudArchitecture(candidate as never, validationCtx());
    if (!v.ok) return NextResponse.json({ error: 'Architecture invalide.', errors: v.errors }, { status: 422 });
    return NextResponse.json({ architecture: publicCloudView(candidate as never), analysis: analyzeCloud(candidate as never, priceBook as never) });
  }
  return NextResponse.json({ error: `Action inconnue « ${action} ».` }, { status: 400 });
}
