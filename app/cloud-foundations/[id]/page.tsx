import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCloudArchitecture, publicCloudArchitecture, getPriceBook, getProviderMap } from '@/lib/cloud-server';
import { getPlaybook } from '@/lib/security-server';
import { analyzeCloud } from '@/lib/cloud-analysis.mjs';
import CloudAnalyzer from './CloudAnalyzer';

export const dynamic = 'force-dynamic';

export default async function CloudArchitecturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const arch = getCloudArchitecture(id);
  if (!arch) notFound();
  const view = publicCloudArchitecture(arch);
  const analysis = analyzeCloud(arch as never, getPriceBook() as never);
  const playbook = arch.playbookRef ? getPlaybook(arch.playbookRef) : null;
  const map = (getProviderMap() as { mappings?: { concept: string; aws: string; azure: string }[] }).mappings ?? [];
  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <p className="crumb"><Link href="/cloud-foundations">← Cloud Architecture Lab</Link></p>
          <h1 className="page-title">{arch.title}</h1>
          <p className="page-sub">{arch.description}</p>
        </div>
      </div>
      <CloudAnalyzer
        id={arch.id} initialArchitecture={view as never} initialAnalysis={analysis as never}
        hasFixed={Boolean(arch.fixedResources || arch.fixedIdentities || arch.fixedNetwork)}
        need={arch.need ?? null} constraints={arch.constraints ?? []}
        playbook={playbook as Record<string, unknown> | null} dayRefs={arch.dayRefs ?? []}
        providerMap={map}
      />
    </div>
  );
}
