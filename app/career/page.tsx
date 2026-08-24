import Link from 'next/link';
import { getDocHtml } from '@/lib/program';
import { SurfaceHead, EditorialShell } from '@/app/ui';
import { extractSections } from '@/lib/doc-sections';
import { annotateProseA11y } from '@/lib/section-family';

export const dynamic = 'force-dynamic';

const DOCS = [
  { id: 'cv-linkedin-strategy', label: 'CV / LinkedIn / GitHub' },
  { id: 'interview-prep', label: 'Préparation entretiens' },
];

// V58 · CP3 — La page ne rendait qu'un `article.prose` nu : 3 fonds, 0 ombre,
// aucun bloc structurant (CP0). Elle adopte la coquille éditoriale partagée.
// Les faits affichés sont dérivés du document réellement rendu — nombre de
// mots, temps de lecture, sections — et non déclarés à la main.
export default async function CareerPage({ searchParams }: { searchParams: Promise<{ doc?: string }> }) {
  const { doc } = await searchParams;
  const selected = DOCS.some((d) => d.id === doc) ? doc! : DOCS[0].id;
  const raw = getDocHtml(`career/${selected}.md`);
  const current = DOCS.find((d) => d.id === selected)!;

  if (!raw) {
    return (
      <SurfaceHead kind="editorial" eyebrow="Débouché" title="Carrière"
        lead="Document introuvable." />
    );
  }

  const { html, sections } = extractSections(annotateProseA11y(raw));
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

  return (
    <EditorialShell
      head={
        <SurfaceHead
          kind="editorial"
          eyebrow={<>Débouché <span className="sep">/</span> mois 12 <span className="sep">/</span> {current.label}</>}
          title="Carrière"
          lead="Transformer douze mois de travail en un poste. À travailler surtout au mois 12 — mais à lire une première fois bien avant, pour savoir ce qu'on doit pouvoir montrer."
          facts={[
            { k: 'Mots', v: words.toLocaleString('fr-FR') },
            { k: 'Lecture', v: `~${Math.max(1, Math.round(words / 220))} min` },
            sections.length > 0 && { k: 'Sections', v: sections.length },
          ]}
        />
      }
      nav={DOCS.map((d) => (
        <Link key={d.id} href={`/career?doc=${d.id}`} aria-current={selected === d.id ? 'page' : undefined}>
          {d.label}
        </Link>
      ))}
      html={html}
      sections={sections}
    />
  );
}
