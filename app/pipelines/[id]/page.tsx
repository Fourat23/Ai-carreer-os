import { notFound } from 'next/navigation';
import { getPipeline, publicPipeline } from '@/lib/pipelines-server';
import { WorkbenchShell } from '@/app/ui';
import PipelineRunner from './PipelineRunner';

export const dynamic = 'force-dynamic';

// V58 · CP4 — Même coquille que les autres postes de travail techniques, MAIS
// sans bloc diagnostic : contrairement aux quatre autres, cette route n'a pas
// de moteur d'analyse statique — le verdict naît de l'EXÉCUTION du pipeline,
// et il est produit par le runner. Afficher une échelle de sévérité vide
// serait du bruit, donc `severity` est omis. La coquille tolère l'absence.
export default async function PipelineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pipeline = getPipeline(id);
  if (!pipeline) notFound();
  const view = publicPipeline(pipeline) as {
    title: string; description: string;
    stages?: unknown[]; jobs?: unknown[]; trigger?: string[];
    // `environment` est un OBJET {name, requiresApproval}, pas une chaîne :
    // le rendre directement levait « Objects are not valid as a React child ».
    // Contrat lu dans les données, pas supposé.
    environment?: { name?: string; requiresApproval?: boolean } | null;
  };
  const trigger = Array.isArray(view.trigger) ? view.trigger : [];

  return (
    <WorkbenchShell
      backHref="/pipelines"
      backLabel="Pipeline Lab"
      title={view.title}
      lead={view.description}
      facts={[
        { k: 'Étapes', v: view.stages?.length ?? 0 },
        { k: 'Jobs', v: view.jobs?.length ?? 0 },
        trigger.length > 0 && { k: 'Déclencheur', v: trigger.join(' · ') },
      ]}
      systemState={[
        { k: 'Exécution', v: 'simulée localement, déterministe' },
        { k: 'Runner', v: 'aucun : rien ne tourne sur une machine distante', tone: 'warn' },
        {
          k: 'Environnement',
          v: view.environment?.name
            ? `${view.environment.name}${view.environment.requiresApproval ? ' — approbation requise' : ''}`
            : 'aucun déploiement réel',
        },
      ]}
      limits={[
        'Ce n’est pas un runner CI : aucun job n’est exécuté ailleurs qu’ici.',
        'Aucun accès réseau, aucun secret, aucun jeton, aucun déploiement.',
      ]}
      days={(pipeline.dayRefs as number[] | undefined) ?? []}
      related={[{ href: '/lab', label: 'Laboratoire' }, { href: '/missions', label: 'Missions' }]}
    >
      <PipelineRunner pipeline={view as never} />
    </WorkbenchShell>
  );
}
