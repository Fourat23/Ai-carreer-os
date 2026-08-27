import { publicCloudSummaries } from '@/lib/cloud-server';
import { listPlaybooks } from '@/lib/security-server';
import TechBench from '../tech/TechBench';
import CloudCatalogue from './CloudCatalogue';
import PlaybookBrowser from '../security/PlaybookBrowser';

export const dynamic = 'force-dynamic';

const CLOUD_PB_DOMAINS = new Set(['finops', 'network', 'compute', 'storage', 'database', 'iam', 'resilience', 'observability', 'cloud']);

// V58 · CP5 — TechBench, même correction que /security. Le CP0 mesurait ici
// UNE section englobante : topBlocks 1, dominance 1 (dégénérée), 3 fonds,
// 1 ombre, 19 cartes. Les playbooks cloud passent en zone secondaire.
export default function CloudFoundationsPage() {
  const architectures = publicCloudSummaries();
  const playbooks = listPlaybooks().filter(
    (p) => String(p.id ?? '').startsWith('cloud-') && CLOUD_PB_DOMAINS.has(p.domain as string),
  );
  const providers = new Set(
    architectures.flatMap((a) => (a as { providers?: string[] }).providers ?? []),
  ).size;
  const resources = architectures.reduce(
    (n, a) => n + ((a as { resourceCount?: number }).resourceCount ?? 0), 0,
  );

  // V62 · CP2 — La suite logique de cette page est son PREMIER SCÉNARIO,
  // pris dans le catalogue réel. Aucune invention : si le catalogue est
  // vide, `next` reste absent et la coquille n'affiche aucune action.
  const first = architectures[0];
  const next = first
    ? { href: `/cloud-foundations/${first.id}`, label: first.title,
        hint: (first as { summary?: string }).summary }
    : undefined;

  return (
    <TechBench
      contextLabel="État du laboratoire cloud"
      next={next}
      eyebrow="Laboratoire · architecture cloud"
      title="Cloud Architecture Lab"
      lead={<>Raisonnement d’architecture cloud sur fixtures locales — IAM, réseau, compute,
        stockage, données, résilience, observabilité et FinOps. Chaque analyse est
        <strong> déterministe</strong> : la même architecture donne toujours le même diagnostic.</>}
      limits={[
        'Ce n’est ni AWS, ni Azure, ni Terraform, ni un scanner cloud, ni un outil FinOps réel.',
        'Aucun appel fournisseur, aucune credential réelle, aucune exécution.',
        'L’estimation de coût est factice : barème local, non officiel.',
      ]}
      facts={[
        { k: 'Architectures', v: architectures.length },
        resources > 0 ? { k: 'Ressources', v: resources } : { k: 'Playbooks', v: playbooks.length },
        providers > 0 ? { k: 'Fournisseurs', v: providers } : { k: 'Playbooks', v: playbooks.length },
      ]}
      related={[
        { href: '/day/78', label: 'Jour architecture' },
        { href: '/cloud-lab', label: 'Cloud Topology Lab' },
        { href: '/kubernetes', label: 'Kubernetes Lab' },
        { href: '/glossary', label: 'Glossaire' },
      ]}
      after={playbooks.length > 0 ? (
        <section className="tb-ref" aria-label="Playbooks cloud">
          <div className="tb-sec-head">
            <h2 className="tb-h">Playbooks cloud</h2>
            <span className="tb-h-note">{playbooks.length} cas · référentiel de consultation</span>
          </div>
          <PlaybookBrowser playbooks={playbooks} />
        </section>
      ) : null}
    >
      {architectures.length === 0
        ? <p className="muted">Aucune architecture pour le moment.</p>
        : <CloudCatalogue architectures={architectures} />}
    </TechBench>
  );
}
