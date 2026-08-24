// V55 — Carte de trajectoire structurée PAR MOIS.
//
// Remplace la grille 7×52 de carrés uniformes (`Trajectory365`), que la mesure
// CP0 décrivait honnêtement comme un tableur : à 1920, un rectangle de
// ~1180×280 px de cellules indiscernables, sans repère nommé.
//
// La carte conserve exactement les mêmes données — les journées réelles du
// parcours actif — mais leur donne une STRUCTURE lisible : une piste par mois,
// nommée, avec sa densité d'avancement propre. Elle reste 100 % déterministe,
// n'agrège rien de nouveau et n'invente aucune journée.
//
// Composant serveur : il construit le modèle, `TrajectoryMapGrid` rend la
// grille interactive et accessible.
import { dayStatus } from '@/lib/resume';
import type { Program, Progress } from '@/lib/types';
import TrajectoryMapGrid, { type TLane } from './TrajectoryMapGrid';

export default function TrajectoryMap({
  days, progress, currentDay, monthTitles,
}: {
  days: Program['days'];
  progress: Progress;
  currentDay: number;
  monthTitles?: Map<number, string>;
}) {
  // Regroupement par mois, dans l'ordre du programme (les journées arrivent
  // déjà chronologiques — contrat V54.2.1 — on ne le suppose pas pour autant).
  const byMonth = new Map<number, Program['days']>();
  for (const d of days) {
    const arr = byMonth.get(d.month);
    if (arr) arr.push(d); else byMonth.set(d.month, [d]);
  }
  const monthNums = [...byMonth.keys()].sort((a, b) => a - b);
  for (const m of monthNums) byMonth.get(m)!.sort((a, b) => a.day - b.day);

  // Largeur de piste commune = le mois le plus fourni. Les mois moins couverts
  // laissent des emplacements VIDES explicites plutôt que d'être étirés : la
  // comparaison entre mois reste honnête (un mois de 5 journées ne doit pas
  // occuper autant qu'un mois de 35).
  const width = Math.max(...monthNums.map((m) => byMonth.get(m)!.length), 1);

  const lanes: TLane[] = monthNums.map((m, row) => {
    const list = byMonth.get(m)!;
    const done = list.filter((d) => dayStatus(progress, d.day) === 'done').length;
    return {
      month: m,
      title: monthTitles?.get(m) ?? '',
      done,
      total: list.length,
      cells: list.map((d, col) => ({
        day: d.day, row, col,
        status: dayStatus(progress, d.day),
        title: d.title,
        isReview: !!d.isReview,
        href: `/day/${d.day}`,
      })),
    };
  });

  return <TrajectoryMapGrid lanes={lanes} width={width} currentDay={currentDay} />;
}
