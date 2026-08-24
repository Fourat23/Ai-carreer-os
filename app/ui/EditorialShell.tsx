'use client';

// V58 · CP3 — COQUILLE ÉDITORIALE PARTAGÉE.
//
// Constat du CP0 : `/career`, `/guide` et `/resources` rendaient un
// `article.prose` nu dans le canvas — 1 à 3 fonds, **zéro ombre**, aucun bloc
// structurant. Le document flottait, sans contexte ni repère de progression
// dans la lecture.
//
// Grammaire retenue, propre à la famille éditoriale et différente du
// pilotage : contexte → titre → intention → navigation locale → SOMMAIRE +
// contenu long → métadonnées réelles.
//
// Ce n'est pas un tableau de bord : la priorité est la lisibilité longue
// durée. La colonne de lecture reste bornée, le sommaire est un support, et
// aucun chiffre n'est fabriqué — mots, temps de lecture et sections sont
// dérivés du document rendu.
//
// Le sommaire est un composant STANDARD (table des matières), pas un motif
// propriétaire : l'ensemble reste fermé à cinq.
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import type { DocSection } from '@/lib/doc-sections';

export function EditorialShell({
  head, nav, html, sections, footNote,
}: {
  /** La bande d'identité (SurfaceHead), fournie par la page. */
  head: ReactNode;
  /** Navigation locale entre documents d'une même famille, si elle existe. */
  nav?: ReactNode;
  html: string;
  sections: DocSection[];
  footNote?: ReactNode;
}) {
  const [active, setActive] = useState<string | null>(sections[0]?.id ?? null);

  // Position de lecture : recalculée à partir des positions réelles, comme le
  // rail de la Journée depuis V57. Un sommaire bloqué sur la première section
  // au milieu d'un document est décoratif.
  useEffect(() => {
    if (sections.length < 2) return;
    const nodes = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;
    const recompute = () => {
      const mark = window.innerHeight * 0.22;
      let current = nodes[0];
      for (const n of nodes) {
        if (n.getBoundingClientRect().top <= mark) current = n;
        else break;
      }
      if (current?.id) setActive(current.id);
    };
    window.addEventListener('scroll', recompute, { passive: true });
    window.addEventListener('resize', recompute, { passive: true });
    recompute();
    return () => {
      window.removeEventListener('scroll', recompute);
      window.removeEventListener('resize', recompute);
    };
  }, [sections]);

  return (
    <div className="ed">
      {head}
      {nav && <nav className="ed-nav" aria-label="Documents de cette section">{nav}</nav>}
      <div className="ed-body">
        <article className="prose reading ed-doc" dangerouslySetInnerHTML={{ __html: html }} />
        {sections.length >= 2 && (
          <aside className="ed-toc" aria-label="Sommaire du document">
            <p className="ed-toc-h">Sommaire</p>
            <ol className="ed-toc-list">
              {sections.map((s) => (
                <li key={s.id} className={`ed-toc-i lvl-${s.level}${active === s.id ? ' is-current' : ''}`}>
                  <a href={`#${s.id}`} aria-current={active === s.id ? 'true' : undefined}>{s.label}</a>
                </li>
              ))}
            </ol>
          </aside>
        )}
      </div>
      {footNote && <p className="ed-foot">{footNote}</p>}
    </div>
  );
}
