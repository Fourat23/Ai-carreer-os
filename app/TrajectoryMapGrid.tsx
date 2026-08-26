'use client';

// Rendu interactif + accessible de la carte de trajectoire (V55).
// Pattern grille clavier repris de `TrajectoryGrid` : un seul tabstop (roving
// tabindex), flèches, Home/End, Entrée/Espace. La sémantique ARIA suit le DOM
// réel — une rangée par MOIS, une cellule par journée, emplacements creux
// marqués vides.
import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { nextDay, NAV_KEYS } from '@/lib/grid-nav';

export type TCellM = {
  day: number; row: number; col: number;
  status: string; title: string; isReview: boolean; href: string;
};
export type TLane = {
  month: number; title: string; done: number; total: number; cells: TCellM[];
};

const STATUS_FR: Record<string, string> = {
  done: 'terminé', 'in-progress': 'en cours', 'to-review': 'à revoir', 'not-started': 'à venir',
};

/**
 * ── CONTRAT V61 · TrajectoryMap = LE CHEMIN, PAS LA CARTE ──────────────────
 *
 * Mesuré au CP0 de V61 : `.tmap` rendait 730 × 431 px, ratio 1,7, douze pistes
 * INDÉPENDANTES — rien ne reliait la fin du mois 1 au début du mois 2. On y
 * lisait une distribution : c'était une carte. Or la carte est le rôle de
 * YearBand, et le rôle de TrajectoryMap est l'inverse : « où j'en suis ».
 *
 * Trois corrections, et trois seulement :
 *
 *  1. une ÉPINE continue relie les douze mois, de « départ » à « fin de
 *     programme ». Le regard suit un trajet, il ne compare plus douze barres ;
 *  2. la TÊTE DE POSITION devient la marque dominante de l'objet — plus large,
 *     plus contrastée, portant un repère nommé. Aucune autre marque ne la
 *     concurrence ;
 *  3. le PARCOURU et le À-VENIR se lisent différemment. Avec zéro journée
 *     enregistrée, tout est à venir, et l'objet doit le dire — c'est
 *     précisément le cas honnête, pas celui qu'on masque.
 *
 * Aucune donnée nouvelle. Aucun sixième motif.
 */
export default function TrajectoryMapGrid({
  lanes, width, currentDay,
}: { lanes: TLane[]; width: number; currentDay: number }) {
  const router = useRouter();
  const [focusDay, setFocusDay] = useState(currentDay);
  const refs = useRef(new Map<number, HTMLAnchorElement>());

  const cells = useMemo(
    () => lanes.flatMap((l) => l.cells.map((c) => ({ day: c.day, col: c.col, row: c.row }))),
    [lanes],
  );
  const all = useMemo(() => lanes.flatMap((l) => l.cells), [lanes]);

  function onKeyDown(e: React.KeyboardEvent) {
    const key = e.key;
    if (NAV_KEYS.has(key)) {
      e.preventDefault();
      const nd = nextDay(cells, focusDay, key);
      if (nd !== focusDay) { setFocusDay(nd); refs.current.get(nd)?.focus(); }
    } else if (key === 'Enter' || key === ' ') {
      e.preventDefault();
      const cell = all.find((c) => c.day === focusDay);
      if (cell) router.push(cell.href);
    }
  }

  // Le mois qui porte la position. C'est lui qui reçoit le nœud plein de
  // l'épine : le trajet s'arrête là, visiblement.
  const hereLane = lanes.find((l) => l.cells.some((c) => c.day === currentDay))?.month ?? lanes[0]?.month;
  const totalDays = lanes.reduce((s, l) => s + l.total, 0);
  const doneDays = lanes.reduce((s, l) => s + l.done, 0);

  return (
    <div className="tmap" style={{ ['--tmap-cols' as string]: width }}>
      {/* Orientation du trajet. Deux mots, en tête et en pied de l'épine :
          sans eux, douze pistes empilées n'ont aucun sens de lecture. */}
      <p className="tmap-orient tmap-orient-start" aria-hidden="true">
        <span className="tmap-orient-k">Départ</span> jour 1
      </p>

      <div
        className="tmap-grid" role="grid"
        aria-label={`Trajectoire du parcours : un trajet de ${totalDays} journées en ${lanes.length} mois, ${doneDays} parcourues, position actuelle jour ${currentDay}. Flèches pour naviguer, Entrée pour ouvrir.`}
        aria-rowcount={lanes.length} aria-colcount={width}
        onKeyDown={onKeyDown}
      >
        {lanes.map((l) => {
          const state = l.month < (hereLane ?? 0) ? 'behind'
            : l.month === hereLane ? 'here' : 'ahead';
          return (
            <div className={`tmap-lane is-${state}`} role="row" key={l.month}>
              {/* ÉPINE — le segment qui relie ce mois au suivant. C'est ce qui
                  fait d'une pile de barres un trajet continu. */}
              <span className="tmap-spine" aria-hidden="true">
                <i className="tmap-spine-node" />
              </span>
              <span className="tmap-lane-head" role="rowheader">
                <span className="tmap-lane-m">M{l.month}</span>
                <span className="tmap-lane-t">{l.title}</span>
              </span>
              <span className="tmap-cells">
                {l.cells.map((c) => (
                  <span key={c.day} role="gridcell" className="tmap-cell-wrap">
                    <a
                      ref={(el) => { if (el) refs.current.set(c.day, el); else refs.current.delete(c.day); }}
                      href={c.href}
                      className={`tmap-cell s-${c.status}${c.day === currentDay ? ' now' : ''}${c.isReview ? ' rev' : ''}${c.day < currentDay ? ' behind' : ''}`}
                      tabIndex={c.day === focusDay ? 0 : -1}
                      aria-label={`Jour ${c.day}, ${c.title}, ${STATUS_FR[c.status] ?? c.status}`}
                      aria-current={c.day === currentDay ? 'date' : undefined}
                      onClick={() => setFocusDay(c.day)}
                    />
                    {/* TÊTE DE POSITION — la marque dominante de l'objet. Elle
                        est nommée : un point fort sans nom n'oriente pas. */}
                    {c.day === currentDay && (
                      <span className="tmap-here" aria-hidden="true">J{c.day}</span>
                    )}
                  </span>
                ))}
                {/* Emplacements creux : le mois est plus court que la piste. */}
                {Array.from({ length: Math.max(0, width - l.cells.length) }, (_, i) => (
                  <span key={`e${i}`} role="gridcell" className="tmap-cell-empty" aria-hidden="true" />
                ))}
              </span>
              <span className="tmap-lane-n" aria-hidden="true">{l.done}/{l.total}</span>
            </div>
          );
        })}
      </div>

      <p className="tmap-orient tmap-orient-end" aria-hidden="true">
        <span className="tmap-orient-k">Fin de programme</span> jour {totalDays}
      </p>

      <div className="tmap-foot">
        <div className="legend tmap-legend">
          <span><i className="tsw s-done" /> Terminé</span>
          <span><i className="tsw s-in-progress" /> En cours</span>
          <span><i className="tsw s-to-review" /> À revoir</span>
          <span><i className="tsw s-not-started" /> À venir</span>
          <span><i className="tsw rev" /> Revue hebdo</span>
        </div>
        <span className="tmap-hint">
          <span className="traj-kbd">↑↓←→</span> naviguer · <span className="traj-kbd">↵</span> ouvrir
        </span>
      </div>
    </div>
  );
}
