import { notFound } from 'next/navigation';
import { getManifest, publicManifest } from '@/lib/manifests-server';
import { analyzeManifests } from '@/lib/manifest-analysis.mjs';
import type { Analysis } from '@/lib/manifest-analysis';
import { kubectlAvailability } from '@/lib/manifest-kubectl.mjs';
import type { KubectlAvailability } from '@/lib/manifest-kubectl';
import { WorkbenchShell } from '@/app/ui';
import ManifestAnalyzer from './ManifestAnalyzer';

export const dynamic = 'force-dynamic';

// V58 · CP4 — Coquille de poste de travail partagée. Le CP0 mesurait ici
// 3 fonds, ZÉRO ombre, aucune section, et un panneau de diagnostic sans
// priorité visuelle malgré son rôle de sortie principale.
export default async function ManifestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const set = getManifest(id);
  if (!set) notFound();
  const view = publicManifest(set);
  const analysis = analyzeManifests(set) as Analysis;
  const availability = await kubectlAvailability() as KubectlAvailability;
  const kinds = [...new Set((set.resources ?? []).map((r: { kind: string }) => r.kind))];

  return (
    <WorkbenchShell
      backHref="/kubernetes"
      backLabel="Kubernetes & Orchestration Lab"
      title={set.title}
      lead={set.description}
      facts={[
        { k: 'Ressources', v: set.resources?.length ?? 0 },
        kinds.length > 0 && { k: 'Types', v: kinds.length },
      ]}
      systemState={[
        {
          k: 'kubectl',
          // `KubectlAvailability` expose `state` et `canExecute`, pas
          // `available` : on lit le contrat réel du module.
          v: availability.state === 'absent'
            ? 'absent — analyse locale seule'
            : `${availability.version ?? availability.state}${availability.canExecute ? '' : ' — CLI seule'}`,
          tone: availability.state === 'absent' ? 'warn' : 'ok',
        },
        { k: 'Format', v: 'JSON, équivalent au YAML de production' },
        { k: 'Exécution', v: 'aucune : rien n’est déployé' },
      ]}
      severity={analysis.summary?.bySeverity}
      severityNote={analysis.summary?.total === 0
        ? 'Ce manifest ne déclenche aucune règle. Il sert de référence « saine » à comparer.'
        : undefined}
      limits={[
        'Aucun cluster n’est contacté : les incidents sont rejoués, pas observés.',
        'Aucun accès réseau, aucun secret, aucun déploiement réel.',
      ]}
      days={set.dayRefs ?? []}
      related={[{ href: '/cloud-lab', label: 'Cloud Topology Lab' }]}
    >
      <ManifestAnalyzer id={set.id} initialManifest={view} initialAnalysis={analysis}
        availability={availability} dayRefs={set.dayRefs ?? []} />
    </WorkbenchShell>
  );
}
