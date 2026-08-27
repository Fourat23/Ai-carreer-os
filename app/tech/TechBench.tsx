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
//
// V58 · CP10 — La bande d'identité passe sur la primitive partagée. Elle était
// ici la sixième copie manuelle du même bloc (`tb-head` / `tb-eyebrow` /
// `tb-title` / `tb-lead` / `tb-facts`), avec sa propre définition CSS. Famille
// « catalog » : ces pages listent des scénarios ; le poste de travail
// proprement dit est la route de détail, qui porte la famille « workbench ».
// V62 · CP2 — La coquille gagne les deux moitiés manquantes de la grammaire
// CONTEXTE → TRAVAIL COURANT → SUITE.
//
// Mesuré au CP0 : les cinq laboratoires techniques répondaient « où suis-je »
// (surtitre) et « qu'est-ce que je regarde » (titre), mais AUCUN ne répondait
// « quelle est la suite ». Classe B, cinq fois, pour la même raison — donc une
// seule correction, dans la coquille partagée, et non cinq rustines.
//
// La suite n'est pas un bouton décoratif ajouté pour satisfaire une sonde :
// c'est le PREMIER SCÉNARIO RÉEL du laboratoire, nommé, avec son adresse réelle.
// Chaque page la calcule depuis son propre catalogue ; si le catalogue est vide,
// il n'y a pas d'action, et la page le dit au lieu de mentir.
import type { ReactNode } from 'react';
import Link from 'next/link';
import { SurfaceHead, ContextLine } from '@/app/ui';

export type Fact = { k: string; v: ReactNode };
/** L'action suivante, dérivée du catalogue réel. `href` doit exister. */
export type TechNext = { href: string; label: string; hint?: ReactNode };

export default function TechBench({
  eyebrow, title, lead, limits, facts, children, related, after, next, contextLabel,
}: {
  eyebrow: string;
  title: string;
  lead: ReactNode;
  /** Ce que le laboratoire NE fait pas. Réel, jamais décoratif. */
  limits: string[];
  facts: Fact[];
  children: ReactNode;
  related: { href: string; label: string }[];
  /** Zone SECONDAIRE, après le travail : référentiel, annexes, consultation.
      V58 · CP5 — /security avait 45 playbooks dans la même zone que ses
      4 scénarios, ce qui inversait la hiérarchie. */
  after?: ReactNode;
  /** Absente si le catalogue est vide — on n'invente pas une suite. */
  next?: TechNext;
  contextLabel: string;
}) {
  return (
    <div className="tb">
      {/* Même objet, même place, mêmes registres que les quinze surfaces
          migrées en V61 : c'est ce qui fait que ces pages appartiennent au
          même produit. Les faits sont ceux du catalogue, pas des ajouts. */}
      <ContextLine
        label={contextLabel}
        facts={facts.map((f, i) => ({ k: f.k, v: f.v, here: i === 0 }))}
      />
      <SurfaceHead kind="catalog" eyebrow={eyebrow} title={title} lead={lead} facts={facts} />

      {next && (
        <section className="tb-next" aria-label="Prochaine action">
          <div className="tb-next-body">
            <span className="tb-next-k">Par où commencer</span>
            <p className="tb-next-t">{next.label}</p>
            {next.hint ? <p className="tb-next-d">{next.hint}</p> : null}
          </div>
          <Link className="btn cta" href={next.href}>Ouvrir le scénario</Link>
        </section>
      )}

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

      {after}

      <nav className="tb-related" aria-label="Pour aller plus loin">
        <span className="tb-related-k">Pour aller plus loin</span>
        {related.map((r) => <Link key={r.href} href={r.href}>{r.label}</Link>)}
      </nav>
    </div>
  );
}
