import { notFound } from 'next/navigation';
import { getTopology, publicTopology } from '@/lib/topologies-server';
import { analyzeTopology } from '@/lib/topology-analysis.mjs';
import type { Analysis } from '@/lib/topology-analysis';
import { WorkbenchShell } from '@/app/ui';
import TopologyAnalyzer from './TopologyAnalyzer';

export const dynamic = 'force-dynamic';

// V58 · CP4 — Même coquille, même grammaire, contenu propre au domaine.
// Le CP0 mesurait 2 fonds et zéro ombre sur cette route.
export default async function TopologyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topo = getTopology(id);
  if (!topo) notFound();
  const view = publicTopology(topo);
  const analysis = analyzeTopology(topo) as Analysis;
  const envs = topo.environments ?? [];

  return (
    <WorkbenchShell
      backHref="/cloud-lab"
      backLabel="Cloud Topology Lab"
      title={topo.title}
      lead={topo.description}
      facts={[
        { k: 'Composants', v: topo.nodes?.length ?? 0 },
        { k: 'Liaisons', v: topo.edges?.length ?? 0 },
        envs.length > 0 && { k: 'Environnements', v: envs.length },
      ]}
      systemState={[
        { k: 'Analyse', v: 'locale et déterministe' },
        { k: 'Provisioning', v: 'aucun — rien n’est créé chez un fournisseur', tone: 'warn' },
        envs.length > 0 ? { k: 'Cible', v: envs.join(' · ') } : { k: 'Cible', v: 'non précisée' },
      ]}
      severity={analysis.summary?.bySeverity}
      severityNote={analysis.summary?.total === 0
        ? 'Cette topologie ne déclenche aucune règle sur les dimensions analysées.'
        : undefined}
      limits={[
        'Aucun appel AWS, Azure ou GCP : la topologie est un schéma, pas une infrastructure.',
        'Les coûts et latences décrits sont ceux du scénario, pas une facturation réelle.',
      ]}
      days={topo.dayRefs ?? []}
      related={[{ href: '/kubernetes', label: 'Kubernetes Lab' }]}
    >
      <TopologyAnalyzer id={topo.id} initialTopology={view} initialAnalysis={analysis} dayRefs={topo.dayRefs ?? []} />
    </WorkbenchShell>
  );
}
