import Link from 'next/link';
import { publicScenarioSummaries, listPlaybooks } from '@/lib/security-server';
import SecurityCatalogue from './SecurityCatalogue';
import PlaybookBrowser from './PlaybookBrowser';

export const dynamic = 'force-dynamic';

export default function SecurityPage() {
  const scenarios = publicScenarioSummaries();
  const playbooks = listPlaybooks();
  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <h1 className="page-title">Security &amp; Incident Lab</h1>
          <p className="page-sub">
            Laboratoire <strong>déterministe</strong> d’analyse de sécurité sur fixtures locales — secrets,
            supply chain, RBAC, durcissement Kubernetes, exposition, réponse à incident. Ce n’est ni un SAST,
            ni un scanner de dépendances, ni un audit professionnel : aucune analyse d’Internet, aucune base CVE
            distante (base <strong>factice</strong> locale), aucun secret réel, aucune exécution.
          </p>
        </div>
      </div>
      {scenarios.length === 0
        ? <p className="muted">Aucun scénario pour le moment.</p>
        : <SecurityCatalogue scenarios={scenarios} />}
      {playbooks.length > 0 && (
        <div style={{ marginTop: 'var(--sp-5)' }}>
          <PlaybookBrowser playbooks={playbooks} />
        </div>
      )}
      <p className="muted" style={{ marginTop: 'var(--sp-4)' }}>
        Pour aller plus loin : <Link href="/day/68">jour secrets</Link> · <Link href="/kubernetes">Kubernetes Lab</Link> · <Link href="/pipelines">Pipeline Lab</Link> · <Link href="/missions">Missions</Link> · <Link href="/glossary">Glossaire</Link>.
      </p>
    </div>
  );
}
