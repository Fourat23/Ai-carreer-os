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
  // `tabIndex={0}` : la ligne défile latéralement et ne contient aucun élément
  // focalisable. Sans point d'entrée clavier, son contenu est inatteignable
  // autrement qu'à la souris — relevé par axe-core au CP12
  // (`scrollable-region-focusable`).
  return (
    <div className="cw-sys" tabIndex={0} role="group" aria-label="État du parcours">
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
    <div className="cw-facts" tabIndex={0} role="group" aria-label="Faits de l’écran">
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

/**
 * SÉLECTEUR DE VOLET — le modèle étroit du produit.
 *
 * Sous 900 px, une station de travail à deux ou trois colonnes n'a que deux
 * issues : tout empiler (le Day de la direction A faisait 9 331 px, celui de
 * C 11 720 px — mesuré au CP0), ou n'afficher qu'un volet à la fois. V60.1
 * choisit la seconde : la page reste BORNÉE à la hauteur de la fenêtre, comme
 * en grand écran, et le sélecteur remplace la colonne absente.
 *
 * Il est SANS JAVASCRIPT — de vrais liens sur un paramètre d'URL — donc il
 * fonctionne aussi au clavier et sans script. Il n'apparaît qu'en écran
 * étroit : en grand écran, tous les volets sont visibles à la fois et le
 * sélecteur est retiré du flux.
 *
 * C'est le même objet, à la même place, sur les trois surfaces : c'est un des
 * signes qui font que le produit étroit est reconnaissable comme le même
 * produit que le produit large.
 */
export function PaneSwitch({ panes, current, base }: {
  panes: { v: string; label: string; n?: ReactNode }[];
  current: string;
  base: string;
}) {
  return (
    <nav className="cw-panes" aria-label="Volet affiché">
      {panes.map((p) => (
        <a key={p.v} href={`${base}${base.includes('?') ? '&' : '?'}v=${p.v}`}
           className={`cw-pane-b${p.v === current ? ' cw-on' : ''}`}
           aria-current={p.v === current ? 'true' : undefined}>
          {p.label}
          {p.n != null && <span className="cw-mono">{p.n}</span>}
        </a>
      ))}
    </nav>
  );
}

/** Volet demandé dans l'URL, ramené à une valeur connue. */
export function paneOf(
  sp: Record<string, string | string[] | undefined> | undefined,
  allowed: string[],
): string {
  const raw = sp?.v;
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v && allowed.includes(v) ? v : allowed[0];
}

/** Progression réellement enregistrée : aucune. Dite, jamais dessinée. */
export function NoProgress({ recorded }: { recorded: number }) {
  if (recorded > 0) return null;
  return <span className="cw-na">progression non enregistrée · 0 journée</span>;
}
