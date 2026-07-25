// Navigation clavier PURE d'une grille creuse (semaines × jours) — testable sans
// DOM. Les cellules ont une position (col = semaine, row = jour dans la semaine).
// Les emplacements vides sont traversés : on cherche la prochaine cellule réelle
// dans la direction demandée, sinon on reste sur place.

/** Indexe les cellules pour un accès O(1) par jour et par position. */
export function indexCells(cells) {
  const byDay = new Map();
  const byPos = new Map();
  let cols = 0, rows = 0, minDay = Infinity, maxDay = -Infinity;
  for (const c of cells ?? []) {
    byDay.set(c.day, c);
    byPos.set(`${c.col},${c.row}`, c.day);
    cols = Math.max(cols, c.col + 1);
    rows = Math.max(rows, c.row + 1);
    minDay = Math.min(minDay, c.day);
    maxDay = Math.max(maxDay, c.day);
  }
  return { byDay, byPos, cols, rows, minDay: minDay === Infinity ? null : minDay, maxDay: maxDay === -Infinity ? null : maxDay };
}

function seek(idx, col, row, dc, dr) {
  let c = col + dc, r = row + dr;
  while (c >= 0 && c < idx.cols && r >= 0 && r < idx.rows) {
    const d = idx.byPos.get(`${c},${r}`);
    if (d != null) return d;
    c += dc; r += dr;
  }
  return null;
}

/**
 * Jour cible pour une touche depuis `currentDay`. Renvoie toujours un jour valide
 * (reste sur place si le déplacement sort de la grille).
 * Touches gérées : ArrowUp/Down/Left/Right, Home, End.
 */
export function nextDay(cells, currentDay, key) {
  const idx = indexCells(cells);
  const cur = idx.byDay.get(currentDay);
  if (!cur) return idx.minDay ?? currentDay;
  switch (key) {
    case 'Home': return idx.minDay ?? currentDay;
    case 'End': return idx.maxDay ?? currentDay;
    case 'ArrowUp': return seek(idx, cur.col, cur.row, 0, -1) ?? currentDay;
    case 'ArrowDown': return seek(idx, cur.col, cur.row, 0, 1) ?? currentDay;
    case 'ArrowLeft': return seek(idx, cur.col, cur.row, -1, 0) ?? currentDay;
    case 'ArrowRight': return seek(idx, cur.col, cur.row, 1, 0) ?? currentDay;
    default: return currentDay;
  }
}

export const NAV_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End']);
