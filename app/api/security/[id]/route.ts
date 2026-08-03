// API du Security & Incident Lab (V24 CP3). GET → scénario public + analyse. POST
// { action:'analyze'|'simulate'|'remediate'|'reset' } → analyse/simulation PURE
// déterministe (aucun réseau, aucune exécution, aucun secret réel). Un scénario
// posté est VALIDÉ avant analyse (jamais exécuté). Base CVE FACTICE locale.
import { NextRequest, NextResponse } from 'next/server';
import { getScenario, publicScenario, getCveDb } from '@/lib/security-server';
import { validateScenario, publicScenarioView } from '@/lib/security.mjs';
import { analyzeScenario } from '@/lib/security-analysis.mjs';
import { simulateIncident, INCIDENTS } from '@/lib/security-incident.mjs';
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
  const scn = getScenario(id);
  if (!scn) return NextResponse.json({ error: 'Scénario introuvable.' }, { status: 404 });
  return NextResponse.json({ scenario: publicScenario(scn), analysis: analyzeScenario(scn, getCveDb()) });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const base = getScenario(id);
  if (!base) return NextResponse.json({ error: 'Scénario introuvable.' }, { status: 404 });

  let body: { action?: string; scenario?: unknown; incident?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 }); }
  const action = String(body.action ?? '');
  const cve = getCveDb();

  if (action === 'reset') {
    return NextResponse.json({ scenario: publicScenario(base), analysis: analyzeScenario(base, cve) });
  }
  if (action === 'remediate') {
    // Renvoie l'état CORRIGÉ et sa réanalyse (comparaison vulnérable↔corrigé).
    const fixed = { ...base, artifacts: base.fixedArtifacts ?? base.artifacts };
    return NextResponse.json({ scenario: publicScenarioView(fixed as never), analysis: analyzeScenario(fixed, cve) });
  }
  if (action === 'analyze') {
    const candidate = (body.scenario && typeof body.scenario === 'object')
      ? { ...(body.scenario as Record<string, unknown>), id: base.id, domain: base.domain, skills: base.skills, dayRefs: base.dayRefs, trackScope: base.trackScope }
      : base;
    const v = validateScenario(candidate as never, validationCtx());
    if (!v.ok) return NextResponse.json({ error: 'Scénario invalide.', errors: v.errors }, { status: 422 });
    return NextResponse.json({ scenario: publicScenarioView(candidate as never), analysis: analyzeScenario(candidate, cve) });
  }
  if (action === 'simulate') {
    const kind = String(body.incident ?? base.incident ?? '');
    if (!INCIDENTS.includes(kind as never)) return NextResponse.json({ error: `Incident inconnu « ${kind} ».` }, { status: 400 });
    const result = simulateIncident(base, kind);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ incident: result });
  }
  return NextResponse.json({ error: `Action inconnue « ${action} ».` }, { status: 400 });
}
