import Link from 'next/link';
import { getDocHtml } from '@/lib/program';
import { SurfaceHead, EditorialShell, ContextLine } from '@/app/ui';
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

  const { html, sections, title } = extractSections(annotateProseA11y(raw));
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

  return (
    <EditorialShell
      context={
        <ContextLine
          label="Position dans les documents de carrière"
          facts={[
            { k: 'Document', v: current.label, here: true },
            { k: 'Sur', v: `${DOCS.length}` },
            { k: 'Mots', v: words.toLocaleString('fr-FR') },
            { k: 'Lecture', v: `~${Math.max(1, Math.round(words / 220))} min` },
          ]}
        />
      }
      /* La suite d'un document de carrière est l'AUTRE document de la même
         famille — ils forment une séquence réelle : préparer le dossier, puis
         préparer l'entretien. Sur le dernier, la suite est le mois 12, où le
         parcours place ce travail. */
      next={(() => {
        const i = DOCS.findIndex((d) => d.id === selected);
        const nxt = DOCS[i + 1];
        return nxt
          ? { href: `/career?doc=${nxt.id}`, label: nxt.label, hint: 'Document suivant de la séquence carrière.' }
          : { href: '/month/12', label: 'Mois 12 — le mois où ce travail se fait', hint: 'Revenir à la séquence du parcours.' };
      })()}
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
      // V59 · CP11 — Le document porte son propre titre (« Stratégie CV /
      // LinkedIn / GitHub »), qui n'est pas celui de la surface (« Carrière ») :
      // il est conservé, mais au rang h2. Deux `h1` sur une page, c'est une
      // hiérarchie fausse, pas une emphase.
      docTitle={title && title !== 'Carrière' ? title : undefined}
    />
  );
}
