import { notFound } from 'next/navigation';
import { getDocHtml } from '@/lib/program';

export const dynamic = 'force-dynamic';

export default function ResourcesPage() {
  const html = getDocHtml('resources/resources.md');
  if (!html) notFound();
  return (
    <>
      <h1>Ressources</h1>
      <p className="subtitle">Sélection de ressources gratuites et de qualité. Lis peu, code beaucoup.</p>
      <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
