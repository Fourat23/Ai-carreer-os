import Link from 'next/link';
import { publicTopologySummaries } from '@/lib/topologies-server';
import CloudLabCatalogue from './CloudLabCatalogue';

export const dynamic = 'force-dynamic';

export default function CloudLabPage() {
  const topologies = publicTopologySummaries();
  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <h1 className="page-title">Cloud Topology Lab</h1>
          <p className="page-sub">
            Laboratoire <strong>déterministe</strong> d’analyse d’architecture de déploiement — compose ou
            analyse une topologie, détecte les défauts, simule un incident, compare les compromis. Ce n’est
            pas une console cloud : aucun appel AWS/Azure/GCP, aucun provisioning, aucun réseau, aucun secret.
          </p>
        </div>
      </div>
      {topologies.length === 0
        ? <p className="muted">Aucune topologie pour le moment.</p>
        : <CloudLabCatalogue topologies={topologies} />}
      <p className="muted" style={{ marginTop: 'var(--sp-4)' }}>
        Pour aller plus loin : <Link href="/day/78">jour architecture</Link> · <Link href="/pipelines">Pipeline Lab</Link> · <Link href="/missions">Missions</Link> · <Link href="/glossary">Glossaire</Link>.
      </p>
    </div>
  );
}
