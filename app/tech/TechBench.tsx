// V57 · CP9 — Coquille de POSTE DE TRAVAIL pour les laboratoires techniques.
//
// Constat du CP0 : `/pipelines`, `/kubernetes` et `/cloud-lab` rendaient
// **zéro bloc structurant** (`topBlocks = 0`, `dominance = 0`). Elles avaient
// reçu la palette V55 sans jamais recevoir de composition : un titre, un
// paragraphe, un catalogue, un pied de liens.
//
// La grammaire retenue dérive de la fonction de ces surfaces — ce sont des
// simulateurs déterministes, et la première chose qu'un apprenant doit savoir
// est ce qu'ils simulent ET ce qu'ils ne font pas :
//
//   CONTEXTE (ce que le laboratoire simule)
//   → LIMITES (ce qu'il ne fait pas — information de sécurité, pas un ornement)
//   → INVENTAIRE (les scénarios réellement disponibles, comptés)
//   → TRAVAIL (le catalogue lui-même)
//   → PROLONGEMENTS (les journées et surfaces reliées)
//
// La coquille est partagée par les trois laboratoires : c'est la même fonction
// à trois domaines près. Chaque page fournit son contexte, ses limites réelles
// et ses faits ; rien n'est générique au point d'être vide.
//
// Aucun motif propriétaire : aucun des cinq n'exprime « inventaire de
// scénarios de simulation ». En poser un ici serait un ornement (ADR-057 §4).
import type { ReactNode } from 'react';
import Link from 'next/link';

export type Fact = { k: string; v: ReactNode };

export default function TechBench({
  eyebrow, title, lead, limits, facts, children, related,
}: {
  eyebrow: string;
  title: string;
  lead: ReactNode;
  /** Ce que le laboratoire NE fait pas. Réel, jamais décoratif. */
  limits: string[];
  facts: Fact[];
  children: ReactNode;
  related: { href: string; label: string }[];
}) {
  return (
    <div className="tb">
      <section className="tb-head" aria-label={title}>
        <div className="tb-head-main">
          <p className="tb-eyebrow">{eyebrow}</p>
          <h1 className="tb-title">{title}</h1>
          <p className="tb-lead">{lead}</p>
        </div>
        <dl className="tb-facts">
          {facts.map((f) => (
            <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>
          ))}
        </dl>
      </section>

      <section className="tb-limits" aria-label="Limites de la simulation">
        <h2 className="tb-h">Ce que ce laboratoire ne fait pas</h2>
        <ul className="tb-limit-list">
          {limits.map((l) => <li key={l}>{l}</li>)}
        </ul>
      </section>

      <section className="tb-work" aria-label="Scénarios disponibles">
        <div className="tb-sec-head">
          <h2 className="tb-h">Scénarios</h2>
          <span className="tb-h-note">exécution locale et déterministe</span>
        </div>
        {children}
      </section>

      <nav className="tb-related" aria-label="Pour aller plus loin">
        <span className="tb-related-k">Pour aller plus loin</span>
        {related.map((r) => <Link key={r.href} href={r.href}>{r.label}</Link>)}
      </nav>
    </div>
  );
}
