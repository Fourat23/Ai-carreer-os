// V60.1 · CAREER WORKSTATION — la coquille partagée.
//
// C'est ELLE qui fait que trois écrans très différents appartiennent au même
// produit : même ligne de système en tête, même ligne de faits en pied, même
// grammaire de zones entre les deux. Le corps change ; le cadre jamais.
//
// MODE AVEUGLE (`?blind=1`) : retire le nom du produit, le bandeau de
// prototype et toute étiquette révélant l'origine A/B/C. Les prototypes n'ont
// de toute façon ni logo ni barre latérale produit.
import type { ReactNode } from 'react';

export type Blind = boolean;

/** Lit `?blind=1` sur les searchParams d'une route serveur. */
export function isBlind(sp: Record<string, string | string[] | undefined> | undefined): Blind {
  const v = sp?.blind;
  return (Array.isArray(v) ? v[0] : v) === '1';
}

/** Mention obligatoire du contrat. Masquée en mode aveugle. */
export function ProtoNotice({ blind, screen }: { blind: Blind; screen: string }) {
  if (blind) return null;
  return (
    <div className="cw-proto">
      <b>V60.1 · prototype</b>
      <span>Career Workstation</span>
      <span>{screen}</span>
      <span className="cw-sp">Prototype de comparaison — aucune écriture de progression</span>
    </div>
  );
}

/** Ligne de système. Héritée de A : mono, bord à bord, fine. */
export function SystemLine({ items, tail }: {
  items: { k: string; v: ReactNode; pos?: boolean }[];
  tail?: ReactNode;
}) {
  return (
    <div className="cw-sys">
      {items.map((it) => (
        <div key={it.k}>
          <span className="cw-k">{it.k}</span>
          <span className={`cw-v${it.pos ? ' cw-pos' : ''}`}>{it.v}</span>
        </div>
      ))}
      <div className="cw-grow">{tail}</div>
    </div>
  );
}

/** Ligne de faits. Héritée de B : le bas de l'écran dit l'état réel. */
export function FactsLine({ facts, band, tail }: {
  facts: ReactNode[]; band?: ReactNode; tail?: ReactNode;
}) {
  return (
    <div className="cw-facts">
      {facts.map((f, i) => <span key={i}>{f}</span>)}
      {band && <span className="cw-band">{band}</span>}
      <span className="cw-grow">{tail}</span>
    </div>
  );
}

/**
 * Le corpus écrit ses livrables en Markdown : `ia-lab/`, `commandes.md`.
 * Défaut relevé en V60 sur les trois directions — les accents graves
 * s'affichaient en toutes lettres. Le texte n'est pas modifié, il est rendu.
 */
export function Inline({ text }: { text: string }) {
  const bits = String(text).split(/(`[^`]+`)/g);
  return (
    <>
      {bits.map((b, i) =>
        b.startsWith('`') && b.endsWith('`') && b.length > 2
          ? <code key={i} className="cw-mono cw-code">{b.slice(1, -1)}</code>
          : <span key={i}>{b}</span>,
      )}
    </>
  );
}

/** Progression réellement enregistrée : aucune. Dite, jamais dessinée. */
export function NoProgress({ recorded }: { recorded: number }) {
  if (recorded > 0) return null;
  return <span className="cw-na">progression non enregistrée · 0 journée</span>;
}
