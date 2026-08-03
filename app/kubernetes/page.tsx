import Link from 'next/link';
import { publicManifestSummaries } from '@/lib/manifests-server';
import KubernetesCatalogue from './KubernetesCatalogue';

export const dynamic = 'force-dynamic';

export default function KubernetesPage() {
  const scenarios = publicManifestSummaries();
  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <h1 className="page-title">Kubernetes &amp; Orchestration Lab</h1>
          <p className="page-sub">
            Laboratoire <strong>déterministe</strong> d’analyse de manifests Kubernetes — analyse la
            configuration, détecte les défauts, simule un incident (CrashLoopBackOff, OOMKilled…) ou un
            rollout. Ce n’est pas une console kubectl : aucun cluster, aucun réseau, aucun secret, aucun
            déploiement réel. Les manifests sont en JSON (équivalents à du YAML).
          </p>
        </div>
      </div>
      {scenarios.length === 0
        ? <p className="muted">Aucun scénario pour le moment.</p>
        : <KubernetesCatalogue scenarios={scenarios} />}
      <p className="muted" style={{ marginTop: 'var(--sp-4)' }}>
        Pour aller plus loin : <Link href="/day/320">jour conteneurs</Link> · <Link href="/cloud-lab">Cloud Topology Lab</Link> · <Link href="/pipelines">Pipeline Lab</Link> · <Link href="/missions">Missions</Link> · <Link href="/glossary">Glossaire</Link>.
      </p>
    </div>
  );
}
