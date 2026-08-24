import { publicPipelineSummaries } from '@/lib/pipelines-server';
import PipelineCatalogue from './PipelineCatalogue';
import TechBench from '../tech/TechBench';

export const dynamic = 'force-dynamic';

// V57 · CP9 — Le CP0 mesurait ZÉRO bloc structurant sur cette route. Elle
// reçoit la grammaire de poste de travail (contexte → limites → inventaire →
// travail → prolongements). Les faits sont comptés sur le catalogue réel :
// aucun chiffre n'est écrit à la main.
export default function PipelinesPage() {
  const pipelines = publicPipelineSummaries();
  const stages = pipelines.reduce((n, p) => n + ((p as { stages?: unknown[] }).stages?.length ?? 0), 0);
  const skills = new Set(pipelines.flatMap((p) => (p as { skills?: string[] }).skills ?? [])).size;

  return (
    <TechBench
      eyebrow="Laboratoire · livraison continue"
      title="Pipeline Lab"
      lead={<>Construis, déclenche, diagnostique et évalue une chaîne de livraison en local.
        La simulation est <strong>déterministe</strong> : les mêmes entrées produisent
        toujours le même résultat, ce qui rend le diagnostic apprenable.</>}
      limits={[
        'Ce n’est pas un runner CI réel : rien n’est exécuté sur une machine distante.',
        'Aucun accès réseau, aucun secret, aucun jeton.',
        'Aucun déploiement : les environnements sont des états simulés.',
      ]}
      facts={[
        { k: 'Pipelines', v: pipelines.length },
        { k: 'Étapes au total', v: stages },
        { k: 'Compétences couvertes', v: skills },
      ]}
      related={[
        { href: '/day/326', label: 'Jour CI' },
        { href: '/lab', label: 'Laboratoire' },
        { href: '/missions', label: 'Missions' },
        { href: '/glossary', label: 'Glossaire' },
      ]}
    >
      {pipelines.length === 0
        ? <p className="muted">Aucun pipeline pour le moment.</p>
        : <PipelineCatalogue pipelines={pipelines} />}
    </TechBench>
  );
}
