// Types pour lib/grid-nav.mjs (navigation clavier de grille creuse).
export interface GridCell { day: number; col: number; row: number }
export interface GridIndex {
  byDay: Map<number, GridCell>;
  byPos: Map<string, number>;
  cols: number; rows: number;
  minDay: number | null; maxDay: number | null;
}
export function indexCells(cells: GridCell[]): GridIndex;
export function nextDay(cells: GridCell[], currentDay: number, key: string): number;
export const NAV_KEYS: Set<string>;
