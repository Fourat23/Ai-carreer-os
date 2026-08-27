import { publicTopologySummaries } from '@/lib/topologies-server';
import CloudLabCatalogue from './CloudLabCatalogue';
import TechBench from '../tech/TechBench';

export const dynamic = 'force-dynamic';

// V57 · CP9 — Troisième surface mesurée à zéro bloc structurant au CP0.
export default function CloudLabPage() {
  const topologies = publicTopologySummaries();
  // Même correction : le résumé public porte `nodeCount` et `edgeCount`.
  const nodes = topologies.reduce((n, t) => n + (t.nodeCount ?? 0), 0);
  const edges = topologies.reduce((n, t) => n + (t.edgeCount ?? 0), 0);
  const skills = new Set(topologies.flatMap((t) => (t as { skills?: string[] }).skills ?? [])).size;

  // V62 · CP2 — La suite logique de cette page est son PREMIER SCÉNARIO,
  // pris dans le catalogue réel. Aucune invention : si le catalogue est
  // vide, `next` reste absent et la coquille n'affiche aucune action.
  const first = topologies[0];
  const next = first
    ? { href: `/cloud-lab/${first.id}`, label: first.title,
        hint: (first as { summary?: string }).summary }
    : undefined;

  return (
    <TechBench
      contextLabel="État du laboratoire de topologie"
      next={next}
      eyebrow="Laboratoire · architecture de déploiement"
      title="Cloud Topology Lab"
      lead={<>Compose ou analyse une topologie, détecte les défauts, simule un incident,
        compare les compromis. Chaque analyse est <strong>déterministe</strong> : le même
        schéma donne toujours le même diagnostic.</>}
      limits={[
        'Ce n’est pas une console cloud : aucun appel AWS, Azure ou GCP.',
        'Aucun provisioning, aucun réseau, aucun secret.',
        'Les coûts et latences décrits sont ceux du scénario, pas une facturation réelle.',
      ]}
      facts={[
        { k: 'Topologies', v: topologies.length },
        { k: 'Composants décrits', v: nodes },
        { k: 'Liaisons', v: edges },
        { k: 'Compétences couvertes', v: skills },
      ]}
      related={[
        { href: '/day/78', label: 'Jour architecture' },
        { href: '/kubernetes', label: 'Kubernetes Lab' },
        { href: '/pipelines', label: 'Pipeline Lab' },
        { href: '/glossary', label: 'Glossaire' },
      ]}
    >
      {topologies.length === 0
        ? <p className="muted">Aucune topologie pour le moment.</p>
        : <CloudLabCatalogue topologies={topologies} />}
    </TechBench>
  );
}
