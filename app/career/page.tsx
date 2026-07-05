import Link from 'next/link';
import { getDocHtml } from '@/lib/program';

export const dynamic = 'force-dynamic';

export default async function CareerPage({ searchParams }: { searchParams: Promise<{ doc?: string }> }) {
  const { doc } = await searchParams;
  const selected = doc ?? 'cv-linkedin-strategy';
  const DOCS = [
    { id: 'cv-linkedin-strategy', label: 'CV / LinkedIn / GitHub' },
    { id: 'interview-prep', label: "Préparation entretiens" },
  ];
  const html = getDocHtml(`career/${selected}.md`);

  return (
    <>
      <h1>Carrière</h1>
      <p className="subtitle">Transformer 12 mois de travail en un poste. À travailler surtout au mois 12.</p>
      <div className="row" style={{ marginBottom: 16 }}>
        {DOCS.map((d) => (
          <Link key={d.id} href={`/career?doc=${d.id}`} className={`btn small ${selected === d.id ? 'primary' : ''}`}>
            {d.label}
          </Link>
        ))}
      </div>
      {html ? (
        <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className="card">Document introuvable.</div>
      )}
    </>
  );
}
