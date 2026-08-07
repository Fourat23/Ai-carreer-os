import Link from 'next/link';
import { publicCloudSummaries } from '@/lib/cloud-server';
import { listPlaybooks } from '@/lib/security-server';
import CloudCatalogue from './CloudCatalogue';
import PlaybookBrowser from '../security/PlaybookBrowser';

export const dynamic = 'force-dynamic';

const CLOUD_PB_DOMAINS = new Set(['finops', 'network', 'compute', 'storage', 'database', 'iam', 'resilience', 'observability', 'cloud']);

export default function CloudFoundationsPage() {
  const architectures = publicCloudSummaries();
  const playbooks = listPlaybooks().filter((p) => String(p.id ?? '').startsWith('cloud-') && CLOUD_PB_DOMAINS.has(p.domain as string));
  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <h1 className="page-title">Cloud Architecture Lab</h1>
          <p className="page-sub">
            Laboratoire <strong>déterministe</strong> de raisonnement d’architecture cloud (AWS &amp; Azure) sur
            fixtures locales — IAM, réseau, compute, stockage, données, résilience, observabilité et FinOps.
            Ce n’est ni AWS, ni Azure, ni Terraform, ni un scanner cloud, ni un outil FinOps réel : aucun appel
            fournisseur, aucune credential réelle, aucune exécution. L’estimation de coût est <strong>factice</strong>
            (barème local, non officiel).
          </p>
        </div>
      </div>
      {architectures.length === 0
        ? <p className="muted">Aucune architecture pour le moment.</p>
        : <CloudCatalogue architectures={architectures} />}
      {playbooks.length > 0 && (
        <div style={{ marginTop: 'var(--sp-5)' }}>
          <PlaybookBrowser playbooks={playbooks} />
        </div>
      )}
      <p className="muted" style={{ marginTop: 'var(--sp-4)' }}>
        Pour aller plus loin : <Link href="/cloud-lab">Cloud Topology Lab</Link> · <Link href="/day/78">architecture</Link> · <Link href="/day/79">observabilité</Link> · <Link href="/security">Security Lab</Link> · <Link href="/glossary">Glossaire</Link>.
      </p>
    </div>
  );
}
