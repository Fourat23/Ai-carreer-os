import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getScenario, publicScenario, getCveDb, getPlaybook } from '@/lib/security-server';
import { analyzeScenario } from '@/lib/security-analysis.mjs';
import type { Analysis } from '@/lib/security-analysis';
import SecurityAnalyzer from './SecurityAnalyzer';

export const dynamic = 'force-dynamic';

export default async function ScenarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scn = getScenario(id);
  if (!scn) notFound();
  const view = publicScenario(scn);
  const analysis = analyzeScenario(scn, getCveDb()) as Analysis;
  const playbook = scn.playbookRef ? getPlaybook(scn.playbookRef) : null;
  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <p className="crumb"><Link href="/security">← Security &amp; Incident Lab</Link></p>
          <h1 className="page-title">{scn.title}</h1>
          <p className="page-sub">{scn.description}</p>
        </div>
      </div>
      <SecurityAnalyzer
        id={scn.id} initialScenario={view} initialAnalysis={analysis}
        hasFixed={!!scn.fixedArtifacts} incident={scn.incident ?? null}
        playbook={playbook as Record<string, unknown> | null} dayRefs={scn.dayRefs ?? []}
      />
    </div>
  );
}
