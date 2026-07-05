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
      <h1>Mode d'emploi</h1>
      <p className="subtitle">Comment utiliser la plateforme pendant 12 mois — et le standard de qualité du contenu.</p>
      <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
