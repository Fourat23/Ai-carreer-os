import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTopology, publicTopology } from '@/lib/topologies-server';
import { analyzeTopology } from '@/lib/topology-analysis.mjs';
import type { Analysis } from '@/lib/topology-analysis';
import TopologyAnalyzer from './TopologyAnalyzer';

export const dynamic = 'force-dynamic';

export default async function TopologyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topo = getTopology(id);
  if (!topo) notFound();
  const view = publicTopology(topo);
  const analysis = analyzeTopology(topo) as Analysis;
  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <p className="crumb"><Link href="/cloud-lab">← Cloud Topology Lab</Link></p>
          <h1 className="page-title">{topo.title}</h1>
          <p className="page-sub">{topo.description}</p>
        </div>
      </div>
      <TopologyAnalyzer id={topo.id} initialTopology={view} initialAnalysis={analysis} dayRefs={topo.dayRefs ?? []} />
    </div>
  );
}
