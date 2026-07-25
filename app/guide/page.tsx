import { notFound } from 'next/navigation';
import { getDocHtml } from '@/lib/program';

export const dynamic = 'force-dynamic';

// Mode d'emploi 12 mois + standard de qualité.
export default async function GuidePage({ searchParams }: { searchParams: Promise<{ doc?: string }> }) {
  const { doc } = await searchParams;
  const file = doc === 'quality' ? 'QUALITY_STANDARD.md' : 'how-to-use-12-months.md';
  const html = getDocHtml(file);
  if (!html) notFound();
  return (
    <>
      <div className="page-head">
        <div className="page-head-main">
          <p className="page-eyebrow">Manuel <span className="sep">/</span> 12 mois</p>
          <h1 className="page-title">Mode d'emploi</h1>
          <p className="page-sub">Comment utiliser la plateforme pendant 12 mois — et le standard de qualité du contenu.</p>
        </div>
      </div>
      <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
