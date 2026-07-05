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
      <h1>Projets portfolio</h1>
      <p className="subtitle">7 projets progressifs. Chacun prouve quelque chose de précis à un recruteur.</p>
      <div className="row" style={{ marginBottom: 16 }}>
        {PROJECTS.map((pr) => (
          <Link
            key={pr.id}
            href={`/projects?p=${pr.id}`}
            className={`btn small ${selected === pr.id ? 'primary' : ''}`}
          >
            {pr.name}
          </Link>
        ))}
      </div>
      {html ? (
        <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className="card">Fiche projet introuvable.</div>
      )}
    </>
  );
}
