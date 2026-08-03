// API du Kubernetes Manifest Lab (V23 CP4). GET → manifest public + analyse +
// disponibilité honnête. POST { action:'analyze'|'simulate'|'rollout'|'validate' }
// → analyse/simulation PURE déterministe (aucun cluster, aucun réseau, aucun
// secret réel). Un manifest posté est VALIDÉ avant analyse (jamais exécuté).
import { NextRequest, NextResponse } from 'next/server';
import { getManifest, publicManifest } from '@/lib/manifests-server';
import { validateManifestSet, publicManifestView } from '@/lib/manifest.mjs';
import { analyzeManifests } from '@/lib/manifest-analysis.mjs';
import { simulateIncident, simulateRollout, INCIDENTS } from '@/lib/manifest-reconcile.mjs';
import { kubectlAvailability } from '@/lib/manifest-kubectl.mjs';
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
  const set = getManifest(id);
  if (!set) return NextResponse.json({ error: 'Scénario introuvable.' }, { status: 404 });
  return NextResponse.json({ manifest: publicManifest(set), analysis: analyzeManifests(set), availability: await kubectlAvailability() });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const base = getManifest(id);
  if (!base) return NextResponse.json({ error: 'Scénario introuvable.' }, { status: 404 });

  let body: { action?: string; manifest?: unknown; scenario?: { kind?: string; target?: string }; options?: { newImageHealthy?: boolean }; deployment?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 }); }
  const action = String(body.action ?? '');

  if (action === 'reset') {
    return NextResponse.json({ manifest: publicManifest(base), analysis: analyzeManifests(base) });
  }

  if (action === 'analyze' || action === 'validate') {
    const candidate = (body.manifest && typeof body.manifest === 'object')
      ? { ...(body.manifest as Record<string, unknown>), id: base.id, skills: base.skills, dayRefs: base.dayRefs, trackScope: base.trackScope }
      : base;
    const v = validateManifestSet(candidate as never, validationCtx());
    if (!v.ok) return NextResponse.json({ error: 'Manifest invalide.', errors: v.errors }, { status: 422 });
    if (action === 'validate') return NextResponse.json({ ok: true });
    return NextResponse.json({ manifest: publicManifestView(candidate as never), analysis: analyzeManifests(candidate) });
  }

  if (action === 'simulate') {
    const kind = String(body.scenario?.kind ?? '');
    if (!INCIDENTS.includes(kind as never)) return NextResponse.json({ error: `Incident inconnu « ${kind} ».` }, { status: 400 });
    const target = typeof body.scenario?.target === 'string' ? body.scenario.target.slice(0, 80) : undefined;
    const result = simulateIncident(base, { kind, target });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ incident: result });
  }

  if (action === 'rollout') {
    const name = typeof body.deployment === 'string' ? body.deployment : null;
    const dep = base.resources.find((r) => r.kind === 'Deployment' && (!name || r.metadata?.name === name));
    if (!dep) return NextResponse.json({ error: 'Aucun Deployment ciblable.' }, { status: 400 });
    const healthy = body.options?.newImageHealthy !== false;
    return NextResponse.json({ rollout: simulateRollout(dep, { newImageHealthy: healthy }) });
  }

  return NextResponse.json({ error: `Action inconnue « ${action} ».` }, { status: 400 });
}
