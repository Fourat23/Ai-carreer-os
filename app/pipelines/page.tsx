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
  // Les résumés publics n'exposent PAS les tableaux internes : ils portent des
  // compteurs (`stageCount`, `jobCount`). Compter `p.stages.length` rendait 0 —
  // un chiffre faux affiché comme un fait, trouvé en ouvrant la capture.
  const stages = pipelines.reduce((n, p) => n + (p.stageCount ?? 0), 0);
  const jobs = pipelines.reduce((n, p) => n + (p.jobCount ?? 0), 0);
  const skills = new Set(pipelines.flatMap((p) => (p as { skills?: string[] }).skills ?? [])).size;

  // V62 · CP2 — La suite logique de cette page est son PREMIER SCÉNARIO,
  // pris dans le catalogue réel. Aucune invention : si le catalogue est
  // vide, `next` reste absent et la coquille n'affiche aucune action.
  const first = pipelines[0];
  const next = first
    ? { href: `/pipelines/${first.id}`, label: first.title,
        hint: (first as { summary?: string }).summary }
    : undefined;

  return (
    <TechBench
      contextLabel="État du laboratoire de livraison"
      next={next}
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
        { k: 'Jobs', v: jobs },
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
