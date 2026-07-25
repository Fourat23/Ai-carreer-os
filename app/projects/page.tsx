import Link from 'next/link';
import { getProjectHtml } from '@/lib/program';

export const dynamic = 'force-dynamic';

const PROJECTS = [
  { id: '01', name: 'TaskFlow CLI', tag: 'Fondations · mois 2' },
  { id: '02', name: 'LivreAPI', tag: 'API + Postman · mois 3' },
  { id: '03', name: 'BiblioApp', tag: 'Full-stack · mois 4' },
  { id: '04', name: 'DataPulse', tag: 'Data + dashboard · mois 5' },
  { id: '05', name: 'ChurnScope', tag: 'ML classique · mois 6' },
  { id: '06', name: 'DocQA', tag: 'RAG évalué · mois 8-9' },
  { id: 'final', name: 'DocSense (projet final)', tag: 'Assistant documentaire · mois 11-12' },
];

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  const selected = p ?? '01';
  const html = getProjectHtml(selected);

  return (
    <>
      <div className="page-head">
        <div className="page-head-main">
          <p className="page-eyebrow">Portfolio <span className="sep">/</span> 7 projets</p>
          <h1 className="page-title">Projets</h1>
          <p className="page-sub">7 projets progressifs. Chacun prouve quelque chose de précis à un recruteur.</p>
        </div>
      </div>
      <nav className="subnav" aria-label="Projets">
        {PROJECTS.map((pr) => (
          <Link
            key={pr.id}
            href={`/projects?p=${pr.id}`}
            className={selected === pr.id ? 'active' : ''}
          >
            {pr.name}
          </Link>
        ))}
      </nav>
      {html ? (
        <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className="card">Fiche projet introuvable.</div>
      )}
    </>
  );
}
