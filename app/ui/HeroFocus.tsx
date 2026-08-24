import type { ReactNode } from 'react';

// V55 — HERO : le point focal dominant d'une page.
//
// Différence assumée avec `PrimaryFocus` (V53) : celui-ci n'était qu'un panneau
// un peu plus haut que les autres. La mesure CP0 le montrait — le rapport de
// surface entre le 1er et le 2e bloc du Dashboard valait 1,20, autrement dit
// aucun élément ne dominait. Le HERO occupe la pleine largeur, porte le cran
// typographique `display`, et réserve une colonne d'aparté (`aside`) à une
// donnée réellement dérivée.
//
// Deux usages réels (règle de création de primitive) : le Dashboard et la page
// Parcours. Présentation pure : aucune source de vérité, aucun calcul.
export function HeroFocus({
  eyebrow, status, title, lead, meta, actions, aside, tone = 'accent',
}: {
  eyebrow?: ReactNode;
  status?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  /** `accent` = focus d'action (halo) · `calm` = hero éditorial (sans halo). */
  tone?: 'accent' | 'calm';
}) {
  return (
    <section className={`ui-hero tone-${tone}`} aria-label="Focus principal">
      <div className="ui-hero-main">
        <div className="ui-hero-top">
          {eyebrow && <p className="ui-hero-eyebrow">{eyebrow}</p>}
          {status && <div className="ui-hero-status">{status}</div>}
        </div>
        <h2 className="ui-hero-title">{title}</h2>
        {lead && <p className="ui-hero-lead">{lead}</p>}
        {meta && <div className="ui-hero-meta">{meta}</div>}
        {actions && <div className="ui-hero-actions">{actions}</div>}
      </div>
      {aside && <div className="ui-hero-aside">{aside}</div>}
    </section>
  );
}

/** Fait dense du hero : micro-libellé + valeur. Lisible en une saccade. */
export function HeroFact({ k, children }: { k: ReactNode; children: ReactNode }) {
  return (
    <span className="ui-hero-fact">
      <span className="ui-hero-fact-k">{k}</span>
      <span className="ui-hero-fact-v">{children}</span>
    </span>
  );
}

/** Échelle de difficulté RÉELLE (n sur max), jamais une note inventée. */
export function DifficultyScale({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="ui-diff" role="img" aria-label={`Difficulté ${value} sur ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`ui-diff-step${i < value ? ' on' : ''}`} aria-hidden="true" />
      ))}
    </span>
  );
}
