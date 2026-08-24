'use client';

// Rendu interactif + accessible de la Trajectoire 365. Pattern grille clavier :
// un seul tabstop (roving tabindex), flèches pour naviguer, Home/End, Entrée ou
// Espace pour ouvrir la journée. ARIA grid/row/gridcell aligné sur le DOM réel
// (rangées = jours de la semaine, colonnes = semaines ; creux = cellules vides).
import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { nextDay, NAV_KEYS } from '@/lib/grid-nav';

export type TCell = {
  day: number; col: number; row: number;
  status: string; title: string; isReview: boolean; href: string;
};

const STATUS_FR: Record<string, string> = {
  done: 'terminé', 'in-progress': 'en cours', 'to-review': 'à revoir', 'not-started': 'à venir',
};

export default function TrajectoryGrid({
  rows, cols, months, currentDay, currentWeek,
}: {
  rows: (TCell | null)[][];
  cols: number;
  months: { label: string; col: number }[];
  currentDay: number;
  currentWeek: number;
}) {
  const router = useRouter();
  const [focusDay, setFocusDay] = useState(currentDay);
  const refs = useRef(new Map<number, HTMLAnchorElement>());

  const cells = useMemo(
    () => rows.flat().filter((c): c is TCell => c !== null).map((c) => ({ day: c.day, col: c.col, row: c.row })),
    [rows],
  );

  function onKeyDown(e: React.KeyboardEvent) {
    const key = e.key;
    if (NAV_KEYS.has(key)) {
      e.preventDefault();
      const nd = nextDay(cells, focusDay, key);
      if (nd !== focusDay) { setFocusDay(nd); refs.current.get(nd)?.focus(); }
    } else if (key === 'Enter' || key === ' ') {
      e.preventDefault();
      const cell = rows.flat().find((c) => c?.day === focusDay);
      if (cell) router.push(cell.href);
    }
  }

  return (
    <div className="traj" style={{ ['--cols' as string]: cols }}>
      <div className="traj-scroll">
        <div className="traj-inner">
          <div className="traj-months" aria-hidden="true">
            {months.map((m) => <span key={m.label} className="traj-mlabel" style={{ gridColumn: m.col }}>{m.label}</span>)}
          </div>
          <div
            className="traj-grid" role="grid"
            aria-label="Trajectoire sur 365 jours. Flèches pour naviguer, Entrée pour ouvrir."
            aria-rowcount={rows.length} aria-colcount={cols}
            onKeyDown={onKeyDown}
          >
            {rows.map((rowCells, r) => (
              <div className="traj-row" role="row" key={r}>
                {rowCells.map((c, ci) =>
                  c ? (
                    // V54.2 — `gridcell` n'est pas un rôle autorisé sur <a> (axe-core).
                    // La cellule est le CONTENEUR ; le lien garde sa sémantique propre.
                    <span key={c.day} role="gridcell" className="tcell-wrap">
                      <a
                        ref={(el) => { if (el) refs.current.set(c.day, el); else refs.current.delete(c.day); }}
                        href={c.href}
                        className={`tcell s-${c.status}${c.day === currentDay ? ' now' : ''}${c.isReview ? ' rev' : ''}`}
                        data-family={undefined}
                        tabIndex={c.day === focusDay ? 0 : -1}
                        aria-label={`Jour ${c.day}, ${c.title}, ${STATUS_FR[c.status] ?? c.status}`}
                        aria-current={c.day === currentDay ? 'date' : undefined}
                        onClick={() => setFocusDay(c.day)}
                      />
                    </span>
                  ) : (
                    <span key={`e${r}-${ci}`} className="tcell-empty" role="gridcell" aria-hidden="true" />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="traj-foot">
        <div className="legend traj-legend">
          <span><i className="tsw s-done" /> Terminé</span>
          <span><i className="tsw s-in-progress" /> En cours</span>
          <span><i className="tsw s-to-review" /> À revoir</span>
          <span><i className="tsw s-not-started" /> À venir</span>
          <span><i className="tsw rev" /> Revue hebdo</span>
        </div>
        <span className="traj-now-note">Semaine {currentWeek} · jour {currentDay} · <span className="traj-kbd">↑↓←→</span> naviguer · <span className="traj-kbd">↵</span> ouvrir</span>
      </div>
    </div>
  );
}
