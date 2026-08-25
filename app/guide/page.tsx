import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDocHtml } from '@/lib/program';
import { SurfaceHead, EditorialShell } from '@/app/ui';
import { extractSections } from '@/lib/doc-sections';
import { annotateProseA11y } from '@/lib/section-family';

export const dynamic = 'force-dynamic';

const DOCS = [
  { id: 'use', file: 'how-to-use-12-months.md', label: 'Mode d’emploi 12 mois' },
  { id: 'quality', file: 'QUALITY_STANDARD.md', label: 'Standard de qualité' },
];

// V58 · CP3 — Même famille éditoriale que /career et /resources : le document
// ne flotte plus dans le canvas, il est tenu par une coquille qui porte le
// contexte, la navigation locale réelle et un sommaire de lecture.
export default async function GuidePage({ searchParams }: { searchParams: Promise<{ doc?: string }> }) {
  const { doc } = await searchParams;
  const current = DOCS.find((d) => d.id === doc) ?? DOCS[0];
  const raw = getDocHtml(current.file);
  if (!raw) notFound();

  const { html, sections, title } = extractSections(annotateProseA11y(raw));
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

  return (
    <EditorialShell
      head={
        <SurfaceHead
          kind="editorial"
          eyebrow={<>Manuel <span className="sep">/</span> 12 mois <span className="sep">/</span> {current.label}</>}
          title="Mode d’emploi"
          lead="Comment utiliser la plateforme pendant douze mois, et le standard de qualité auquel le contenu se tient."
          facts={[
            { k: 'Mots', v: words.toLocaleString('fr-FR') },
            { k: 'Lecture', v: `~${Math.max(1, Math.round(words / 220))} min` },
            sections.length > 0 && { k: 'Sections', v: sections.length },
          ]}
        />
      }
      nav={DOCS.map((d) => (
        <Link key={d.id} href={`/guide?doc=${d.id}`} aria-current={current.id === d.id ? 'page' : undefined}>
          {d.label}
        </Link>
      ))}
      html={html}
      sections={sections}
      // V59 · CP11 — Même correction que /career : un seul `h1` par page.
      docTitle={title && title !== 'Mode d’emploi' ? title : undefined}
    />
  );
}
