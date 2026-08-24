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

  return (
    <div className="tmap" style={{ ['--tmap-cols' as string]: width }}>
      <div
        className="tmap-grid" role="grid"
        aria-label="Trajectoire du parcours, une rangée par mois. Flèches pour naviguer, Entrée pour ouvrir."
        aria-rowcount={lanes.length} aria-colcount={width}
        onKeyDown={onKeyDown}
      >
        {lanes.map((l) => (
          <div className="tmap-lane" role="row" key={l.month}>
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
                    className={`tmap-cell s-${c.status}${c.day === currentDay ? ' now' : ''}${c.isReview ? ' rev' : ''}`}
                    tabIndex={c.day === focusDay ? 0 : -1}
                    aria-label={`Jour ${c.day}, ${c.title}, ${STATUS_FR[c.status] ?? c.status}`}
                    aria-current={c.day === currentDay ? 'date' : undefined}
                    onClick={() => setFocusDay(c.day)}
                  />
                </span>
              ))}
              {/* Emplacements creux : le mois est plus court que la piste. */}
              {Array.from({ length: Math.max(0, width - l.cells.length) }, (_, i) => (
                <span key={`e${i}`} role="gridcell" className="tmap-cell-empty" aria-hidden="true" />
              ))}
            </span>
            <span className="tmap-lane-n" aria-hidden="true">{l.done}/{l.total}</span>
          </div>
        ))}
      </div>
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
