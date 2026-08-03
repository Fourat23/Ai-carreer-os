import Link from 'next/link';
import { publicPipelineSummaries } from '@/lib/pipelines-server';
import PipelineCatalogue from './PipelineCatalogue';

export const dynamic = 'force-dynamic';

export default function PipelinesPage() {
  const pipelines = publicPipelineSummaries();
  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-main">
          <h1 className="page-title">Pipeline Lab</h1>
          <p className="page-sub">
            Simulateur pédagogique <strong>déterministe</strong> de pipelines CI/CD — construis, déclenche,
            diagnostique et évalue une chaîne de livraison en local. Ce n’est pas un runner CI réel, aucun
            réseau, aucun secret, aucun déploiement.
          </p>
        </div>
      </div>
      {pipelines.length === 0
        ? <p className="muted">Aucun pipeline pour le moment.</p>
        : <PipelineCatalogue pipelines={pipelines} />}
      <p className="muted" style={{ marginTop: 'var(--sp-4)' }}>
        Pour aller plus loin : <Link href="/day/326">jour CI</Link> · <Link href="/lab">Laboratoire</Link> · <Link href="/missions">Missions</Link> · <Link href="/glossary">Glossaire</Link>.
      </p>
    </div>
  );
}
