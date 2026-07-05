import { notFound } from 'next/navigation';
import { getDocHtml } from '@/lib/program';

export const dynamic = 'force-dynamic';

// Rend n'importe quel document du curriculum : /doc/methodology/how-to-learn,
// /doc/rubrics/skills-scorecard, etc. Restreint aux dossiers de contenu connus.
const ALLOWED = new Set(['methodology', 'rubrics', 'resources', 'career']);

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (!slug || slug.length < 1 || !ALLOWED.has(slug[0])) notFound();
  // Empêche la traversée de répertoire.
  if (slug.some((s) => s.includes('..') || s.includes('/') || s.includes('\\'))) notFound();
  const rel = slug.join('/') + '.md';
  const html = getDocHtml(rel);
  if (!html) notFound();
  return <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
