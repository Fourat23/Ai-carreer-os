// ── V61 · PRIMITIVE : LIGNE DE CONTEXTE ────────────────────────────────────
//
// C'est l'objet que le prototype de référence V60.1 appelait « ligne de
// système », et c'est le signe d'identité le plus fort qu'il ait produit : au
// test aveugle, sans logo ni barre latérale, c'est lui qui faisait reconnaître
// trois écrans très différents comme un seul produit.
//
// Une ligne, bord à bord, en tête de surface : des couples clé/valeur en
// monospace, séparés par un filet, et une queue alignée à droite qui se
// tronque. Elle ne porte que des FAITS déjà présents dans les données — jamais
// un calcul nouveau, jamais une estimation.
//
// Elle est créée comme primitive parce que quatre routes en ont besoin
// immédiatement (`/day/[id]`, `/month/[id]`, `/week/[id]`, `/calendar`) et
// qu'elle capture une sémantique commune : « où suis-je, dans quoi, à quelle
// échelle ». Son API tient en trois propriétés.
import type { ReactNode } from 'react';

export type ContextFact = {
  /** Étiquette courte, affichée en capitales espacées. */
  k: string;
  /** Valeur réelle. */
  v: ReactNode;
  /** Marque la valeur qui répond à « où suis-je ». Une seule par ligne. */
  here?: boolean;
};

export function ContextLine({
  facts, tail, label = 'Contexte',
}: {
  facts: ContextFact[];
  /** Texte de queue, aligné à droite, tronqué s'il ne tient pas. */
  tail?: ReactNode;
  label?: string;
}) {
  if (!facts.length) return null;
  return (
    // `tabIndex` : la ligne défile latéralement en écran étroit et ne contient
    // aucun élément focalisable — sans point d'entrée clavier son contenu
    // serait inatteignable autrement qu'à la souris (axe-core,
    // `scrollable-region-focusable`).
    <div className="ctx-line" role="group" aria-label={label} tabIndex={0}>
      {facts.map((f) => (
        <div key={f.k} className="ctx-cell">
          <span className="ctx-k">{f.k}</span>
          <span className={`ctx-v${f.here ? ' is-here' : ''}`}>{f.v}</span>
        </div>
      ))}
      {tail != null && <span className="ctx-tail">{tail}</span>}
    </div>
  );
}
