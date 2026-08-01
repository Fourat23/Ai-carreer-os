// Trajectoire 365 — signature du Dashboard. Ce composant serveur construit le
// modèle (rangées jour-de-semaine × colonnes-semaine, à partir des VRAIES
// données) puis délègue le rendu interactif et accessible à TrajectoryGrid.
import { dayStatus } from '@/lib/resume';
import type { Program, Progress } from '@/lib/types';
import TrajectoryGrid, { type TCell } from './TrajectoryGrid';

export default function Trajectory365({
  days, progress, currentDay,
}: {
  days: Program['days']; progress: Progress; currentDay: number;
}) {
  const byWeek = new Map<number, Program['days']>();
  for (const d of days) {
    const arr = byWeek.get(d.week);
    if (arr) arr.push(d); else byWeek.set(d.week, [d]);
  }
  const weeks = [...byWeek.keys()].sort((a, b) => a - b);
  for (const w of weeks) byWeek.get(w)!.sort((a, b) => a.day - b.day);
  const weekCol = new Map(weeks.map((w, i) => [w, i]));
  const maxRows = Math.max(...weeks.map((w) => byWeek.get(w)!.length));

  // rows[r][col] = cellule | null (grille rectangulaire, emplacements creux = null)
  const rows: (TCell | null)[][] = Array.from({ length: maxRows }, () => weeks.map(() => null));
  for (const w of weeks) {
    const col = weekCol.get(w)!;
    byWeek.get(w)!.forEach((d, row) => {
      rows[row][col] = {
        day: d.day, col, row, status: dayStatus(progress, d.day),
        title: d.title, isReview: d.isReview, href: `/day/${d.day}`,
      };
    });
  }

  const currentWeek = days.find((d) => d.day === currentDay)?.week ?? weeks[0];
  const monthFirstWeek = new Map<number, number>();
  for (const d of days) {
    const cur = monthFirstWeek.get(d.month);
    if (cur === undefined || d.week < cur) monthFirstWeek.set(d.month, d.week);
  }
  const months = [...monthFirstWeek.keys()].sort((a, b) => a - b)
    .map((m) => ({ label: `M${m}`, col: weekCol.get(monthFirstWeek.get(m)!)! + 1 }));

  return (
    <TrajectoryGrid
      rows={rows}
      cols={weeks.length}
      months={months}
      currentDay={currentDay}
      currentWeek={currentWeek}
    />
  );
}
