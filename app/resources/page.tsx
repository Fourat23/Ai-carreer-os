import { notFound } from 'next/navigation';
import { getDocHtml } from '@/lib/program';
import { SurfaceHead, EditorialShell } from '@/app/ui';
import { extractSections } from '@/lib/doc-sections';
import { annotateProseA11y } from '@/lib/section-family';

export const dynamic = 'force-dynamic';

// V58 · CP3 — La plus dépouillée des trois au CP0 : UN seul fond, zéro ombre.
// Même coquille éditoriale, mêmes faits dérivés du document réel.
export default function ResourcesPage() {
  const raw = getDocHtml('resources/resources.md');
  if (!raw) notFound();

  const { html, sections } = extractSections(annotateProseA11y(raw));
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  // Liens externes réellement présents dans le document — compté, pas estimé.
  const links = (html.match(/<a\s[^>]*href="https?:/g) ?? []).length;

  return (
    <EditorialShell
      head={
        <SurfaceHead
          kind="editorial"
          eyebrow={<>Références <span className="sep">/</span> gratuit et ciblé</>}
          title="Ressources"
          lead="Une sélection de ressources gratuites et de qualité. Lis peu, code beaucoup : cette page existe pour éviter de chercher, pas pour remplacer la pratique."
          facts={[
            { k: 'Mots', v: words.toLocaleString('fr-FR') },
            { k: 'Lecture', v: `~${Math.max(1, Math.round(words / 220))} min` },
            links > 0 && { k: 'Liens', v: links },
            sections.length > 0 && { k: 'Sections', v: sections.length },
          ]}
        />
      }
      html={html}
      sections={sections}
      footNote="Aucun lien n’est affilié ni sponsorisé. Rien n’est envoyé à l’extérieur : la page est un document local."
    />
  );
}
