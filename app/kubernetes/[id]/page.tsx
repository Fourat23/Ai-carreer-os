import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getManifest, publicManifest } from '@/lib/manifests-server';
import { analyzeManifests } from '@/lib/manifest-analysis.mjs';
import type { Analysis } from '@/lib/manifest-analysis';
import { kubectlAvailability } from '@/lib/manifest-kubectl.mjs';
import type { KubectlAvailability } from '@/lib/manifest-kubectl';
import ManifestAnalyzer from './ManifestAnalyzer';

export const dynamic = 'force-dynamic';

export default async function ManifestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const set = getManifest(id);
  if (!set) notFound();
  const view = publicManifest(set);
  const analysis = analyzeManifests(set) as Analysis;
  const availability = await kubectlAvailability() as KubectlAvailability;
  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <p className="crumb"><Link href="/kubernetes">← Kubernetes &amp; Orchestration Lab</Link></p>
          <h1 className="page-title">{set.title}</h1>
          <p className="page-sub">{set.description}</p>
        </div>
      </div>
      <ManifestAnalyzer id={set.id} initialManifest={view} initialAnalysis={analysis} availability={availability} dayRefs={set.dayRefs ?? []} />
    </div>
  );
}
