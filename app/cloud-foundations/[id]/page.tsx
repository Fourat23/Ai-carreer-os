import { notFound } from 'next/navigation';
import { getCloudArchitecture, publicCloudArchitecture, getPriceBook, getProviderMap } from '@/lib/cloud-server';
import { getPlaybook } from '@/lib/security-server';
import { analyzeCloud } from '@/lib/cloud-analysis.mjs';
import { WorkbenchShell } from '@/app/ui';
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
  const sev = (analysis as { summary?: { bySeverity?: Record<string, number>; total?: number } })
    .summary?.bySeverity;
  const total = (analysis as { summary?: { total?: number } }).summary?.total ?? 0;
  const constraints = arch.constraints ?? [];

  // V58 · CP4 — Coquille de poste de travail partagée. Le CP0 mesurait 3 fonds
  // et ZÉRO ombre. Le besoin métier et les contraintes existaient déjà dans les
  // données : ils remontent en contexte au lieu d'être noyés dans l'analyseur.
  return (
    <WorkbenchShell
      backHref="/cloud-foundations"
      backLabel="Cloud Architecture Lab"
      title={arch.title}
      lead={arch.description}
      facts={[
        { k: 'Ressources', v: (arch.resources as unknown[] | undefined)?.length ?? 0 },
        constraints.length > 0 && { k: 'Contraintes', v: constraints.length },
        !!(arch.fixedResources || arch.fixedIdentities || arch.fixedNetwork) && { k: 'Corrigé', v: 'fourni' },
      ]}
      systemState={[
        { k: 'Analyse', v: 'locale et déterministe' },
        { k: 'Provisioning', v: 'aucun — aucun appel AWS, Azure ou GCP', tone: 'warn' },
        arch.need ? { k: 'Besoin', v: String(arch.need) } : { k: 'Besoin', v: 'non précisé' },
      ]}
      severity={sev}
      severityNote={total === 0 ? 'Cette architecture ne déclenche aucune règle.' : undefined}
      limits={[
        'Le catalogue de prix est local et indicatif : ce n’est pas une facturation.',
        'Aucune ressource n’est créée, modifiée ou supprimée chez un fournisseur.',
      ]}
      days={arch.dayRefs ?? []}
      related={[{ href: '/cloud-lab', label: 'Cloud Topology Lab' }]}
    >
      <CloudAnalyzer
        id={arch.id} initialArchitecture={view as never} initialAnalysis={analysis as never}
        hasFixed={Boolean(arch.fixedResources || arch.fixedIdentities || arch.fixedNetwork)}
        need={arch.need ?? null} constraints={constraints}
        playbook={playbook as Record<string, unknown> | null} dayRefs={arch.dayRefs ?? []}
        providerMap={map}
      />
    </WorkbenchShell>
  );
}
