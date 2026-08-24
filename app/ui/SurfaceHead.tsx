// V58 · CP2 — BANDE D'IDENTITÉ PARTAGÉE.
//
// V55 à V57 ont posé la même bande d'identité onze fois, sous onze noms de
// classes différents (`period-head`, `rv-head`, `proj-head`, `tb-head`,
// `lab-head`, `gl-head`…). Le résultat est correct à l'écran mais ce n'est pas
// un système : chaque nouvelle surface recopiait 15 lignes de CSS, et une
// correction devait être appliquée onze fois.
//
// Cette primitive est la grammaire commune du produit, sous une seule forme :
//
//   ÉTIQUETTE DE SECTION  (où l'on est dans le produit)
//   TITRE                 (cran display, ce qu'est cette surface)
//   INTENTION             (à quoi elle sert, en une phrase)
//   FAITS                 (chiffres RÉELS, jamais de remplissage)
//   ASIDE                 (motif propriétaire ou action, quand il y en a un)
//
// Elle ne rend PAS toutes les pages identiques : `kind` porte la différence
// fonctionnelle exigée par le sprint — pilotage, catalogue, détail, workbench,
// éditorial — et cette différence est visible (accent latéral, densité, place
// des faits), sans casser l'appartenance au même produit.
//
// Aucun fait n'est affiché s'il n'existe pas : `facts` accepte `null` pour une
// entrée, qui est alors omise plutôt que rendue comme du bruit.
import type { ReactNode } from 'react';

export type SurfaceFact = { k: string; v: ReactNode } | null | false;

export type SurfaceKind = 'pilot' | 'catalog' | 'detail' | 'workbench' | 'editorial';

export function SurfaceHead({
  kind = 'catalog', eyebrow, title, lead, facts = [], aside, actions, id,
}: {
  /** Famille fonctionnelle : porte la distinction, pas la décoration. */
  kind?: SurfaceKind;
  eyebrow: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  /** Faits réels. Une entrée `null`/`false` est OMISE, jamais rendue à zéro. */
  facts?: SurfaceFact[];
  /** Motif propriétaire ou visuel porteur de donnée. Exclusif avec `facts` larges. */
  aside?: ReactNode;
  actions?: ReactNode;
  id?: string;
}) {
  const real = facts.filter(Boolean) as { k: string; v: ReactNode }[];
  return (
    <section className={`sh sh-${kind}`} aria-labelledby={id ? `${id}-t` : undefined}>
      <div className="sh-main">
        <p className="sh-eyebrow">{eyebrow}</p>
        <h1 className="sh-title" id={id ? `${id}-t` : undefined}>{title}</h1>
        {lead && <p className="sh-lead">{lead}</p>}
        {actions && <div className="sh-actions">{actions}</div>}
      </div>
      {aside
        ? <div className="sh-aside">{aside}</div>
        : real.length > 0 && (
          <dl className="sh-facts" data-n={real.length}>
            {real.map((f) => (
              <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>
            ))}
          </dl>
        )}
    </section>
  );
}
