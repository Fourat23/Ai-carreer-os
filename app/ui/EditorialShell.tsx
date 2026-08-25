'use client';

// V58 · CP3 — COQUILLE ÉDITORIALE PARTAGÉE.
//
// Constat du CP0 V58 : `/career`, `/guide` et `/resources` rendaient un
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
//
// ── V59 · CP2 — CE QUE LE SOMMAIRE DEVIENT, ET POURQUOI ────────────────────
//
// Constat sur capture 1440 au CP0 V59 : sur un document de 3 270 px, le
// sommaire s'arrêtait après 430 px et laissait ~700 px de canvas vide sur
// toute la hauteur restante. Il indiquait la section courante mais pas la
// PROGRESSION dans la lecture — or c'est la question qu'on se pose au milieu
// d'un document long, et c'est exactement celle à laquelle le produit répond
// partout ailleurs (PhaseRail sur la Journée, TrajectoryMap sur le pilotage).
//
// Le sommaire devient donc un RAIL DE LECTURE : il occupe la hauteur de la
// fenêtre, marque la position réelle, et affiche pour chaque section ce
// qu'elle contient quand le document est un catalogue (`items`, dérivé).
//
// Ce n'est PAS un sixième motif propriétaire : c'est la même table des
// matières, tenue à la hauteur du document qu'elle sert. Aucun `data-family`
// n'existe sur ces documents — PhaseRail y serait un ornement, il n'est donc
// pas employé.
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import type { DocSection } from '@/lib/doc-sections';

export function EditorialShell({
  head, nav, html, sections, footNote, itemLabel, docTitle,
}: {
  /** La bande d'identité (SurfaceHead), fournie par la page. */
  head: ReactNode;
  /** Navigation locale entre documents d'une même famille, si elle existe. */
  nav?: ReactNode;
  html: string;
  sections: DocSection[];
  /** Titre propre du document affiché, quand il dit autre chose que le titre
      de surface. Rendu au rang h2 : le `h1` de la page est celui de la bande
      d'identité, et il n'y en a qu'un. */
  docTitle?: string;
  footNote?: ReactNode;
  /** Nom de l'unité comptée par section, quand le document est un catalogue.
      Omis ⇒ les compteurs ne sont pas affichés. */
  itemLabel?: string;
}) {
  const [active, setActive] = useState<string | null>(sections[0]?.id ?? null);
  const [read, setRead] = useState(0);
  const docRef = useRef<HTMLElement | null>(null);

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

      // Part réellement parcourue du document. Dérivée des positions, pas du
      // défilement de la page : le document ne commence pas en haut de page et
      // ne finit pas en bas.
      const doc = docRef.current;
      if (doc) {
        const r = doc.getBoundingClientRect();
        const span = r.height - window.innerHeight;
        const done = span > 0 ? (-r.top) / span : 1;
        setRead(Math.max(0, Math.min(1, done)));
      }
    };
    window.addEventListener('scroll', recompute, { passive: true });
    window.addEventListener('resize', recompute, { passive: true });
    recompute();
    return () => {
      window.removeEventListener('scroll', recompute);
      window.removeEventListener('resize', recompute);
    };
  }, [sections]);

  const pct = Math.round(read * 100);

  return (
    <div className="ed">
      {head}
      {nav && <nav className="ed-nav" aria-label="Documents de cette section">{nav}</nav>}
      <div className="ed-body">
        <div className="ed-col">
          {docTitle && <h2 className="ed-doctitle">{docTitle}</h2>}
          <article ref={docRef} className="prose reading ed-doc" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        {sections.length >= 2 && (
          <aside className="ed-toc" aria-label="Sommaire du document">
            <div className="ed-toc-head">
              <p className="ed-toc-h">Sommaire</p>
              <span className="ed-toc-pct" aria-hidden="true">{pct} %</span>
            </div>
            <span className="ed-toc-bar" aria-hidden="true">
              <span className="ed-toc-fill" style={{ height: `${pct}%` }} />
            </span>
            <ol className="ed-toc-list">
              {sections.map((s) => (
                <li key={s.id} className={`ed-toc-i lvl-${s.level}${active === s.id ? ' is-current' : ''}`}>
                  <a href={`#${s.id}`} aria-current={active === s.id ? 'true' : undefined}>
                    <span className="ed-toc-lab">{s.label}</span>
                    {itemLabel && s.items > 0 && (
                      <span className="ed-toc-n" aria-label={`${s.items} ${itemLabel}`}>{s.items}</span>
                    )}
                  </a>
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
