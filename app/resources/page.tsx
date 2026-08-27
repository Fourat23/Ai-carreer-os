import { notFound } from 'next/navigation';
import { getDocHtml } from '@/lib/program';
import { SurfaceHead, EditorialShell, ContextLine } from '@/app/ui';
import { extractSections } from '@/lib/doc-sections';
import { annotateProseA11y } from '@/lib/section-family';

export const dynamic = 'force-dynamic';

// V58 · CP3 — La plus dépouillée des trois au CP0 : UN seul fond, zéro ombre.
// Même coquille éditoriale, mêmes faits dérivés du document réel.
export default function ResourcesPage() {
  const raw = getDocHtml('resources/resources.md');
  if (!raw) notFound();

  const { html, sections, title } = extractSections(annotateProseA11y(raw));
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  // Liens externes réellement présents dans le document — compté, pas estimé.
  const links = (html.match(/<a\s[^>]*href="https?:/g) ?? []).length;

  return (
    <EditorialShell
      context={
        <ContextLine
          label="Position dans les références"
          facts={[
            { k: 'Document', v: 'Ressources', here: true },
            { k: 'Mots', v: words.toLocaleString('fr-FR') },
            { k: 'Liens externes', v: `${links}` },
            { k: 'Sections', v: `${sections.length}` },
          ]}
        />
      }
      /* « Lis peu, code beaucoup » : la suite d'une page de ressources ne peut
         pas être une autre page de lecture. C'est le laboratoire. */
      next={{ href: '/lab', label: 'Laboratoire de code',
              hint: 'Lis peu, code beaucoup — la pratique est la suite.' }}
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
      // V59 · CP2 — Ce document n'est pas une prose continue : c'est un
      // CATALOGUE par domaine (14 sections, chacune une liste de références).
      // Le compte par section est dérivé du document rendu, jamais déclaré.
      // « entrées » et non « ressources » : la dernière section liste cinq
      // conseils de méthode, pas cinq références. Compter juste prime sur
      // l'étiquette flatteuse.
      itemLabel="entrées"
      // V59 · CP11 — Le document s'intitule « Ressources », exactement comme
      // la surface : le titre était donc imprimé deux fois, l'un sous l'autre.
      // Il ne l'est plus. La comparaison est faite, pas supposée.
      docTitle={title && title !== 'Ressources' ? title : undefined}
      footNote="Aucun lien n’est affilié ni sponsorisé. Rien n’est envoyé à l’extérieur : la page est un document local."
    />
  );
}
