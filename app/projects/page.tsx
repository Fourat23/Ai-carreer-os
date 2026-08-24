import Link from 'next/link';
import { HeroFocus, HeroFact } from '@/app/ui';
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
  const current = PROJECTS.find((x) => x.id === selected);

  return (
    <>
      <HeroFocus
        tone="calm"
        eyebrow="Portfolio"
        title={current?.name ?? 'Projets'}
        lead={current ? `${current.tag} — chaque projet prouve quelque chose de précis à un recruteur.` : undefined}
        meta={
          <>
            <HeroFact k="Projets">{PROJECTS.length} progressifs</HeroFact>
            <HeroFact k="Position">{Math.max(1, PROJECTS.findIndex((x) => x.id === selected) + 1)} sur {PROJECTS.length}</HeroFact>
            <HeroFact k="Nature">livrables portables</HeroFact>
          </>
        }
      />
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
