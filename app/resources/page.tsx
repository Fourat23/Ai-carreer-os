import { notFound } from 'next/navigation';
import { getDocHtml } from '@/lib/program';

export const dynamic = 'force-dynamic';

export default function ResourcesPage() {
  const html = getDocHtml('resources/resources.md');
  if (!html) notFound();
  return (
    <>
      <div className="page-head">
        <div className="page-head-main">
          <p className="page-eyebrow">Références <span className="sep">/</span> gratuit &amp; ciblé</p>
          <h1 className="page-title">Ressources</h1>
          <p className="page-sub">Sélection de ressources gratuites et de qualité. Lis peu, code beaucoup.</p>
        </div>
      </div>
      <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
