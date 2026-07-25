// Trajectoire 365 — signature visuelle du Dashboard. Grille compacte semaines ×
// jours (façon carte de contributions) alimentée par les VRAIES données de
// progression. Chaque cellule = un jour, cliquable, colorée par statut ; la
// semaine courante est encadrée. Server component (liens natifs = clavier OK),
// CSS pur, aucune donnée fictive, aucune bibliothèque graphique.
import Link from 'next/link';
import { dayStatus } from '@/lib/resume';
import type { Program, Progress } from '@/lib/types';

export default function Trajectory365({
  program, progress, currentDay,
}: {
  program: Program; progress: Progress; currentDay: number;
}) {
  const byWeek = new Map<number, Program['days']>();
  for (const d of program.days) {
    const arr = byWeek.get(d.week);
    if (arr) arr.push(d); else byWeek.set(d.week, [d]);
  }
  const weeks = [...byWeek.keys()].sort((a, b) => a - b);
  for (const w of weeks) byWeek.get(w)!.sort((a, b) => a.day - b.day);
  const weekPos = new Map(weeks.map((w, i) => [w, i + 1]));
  const maxRows = Math.max(...weeks.map((w) => byWeek.get(w)!.length));

  const currentWeek = program.days.find((d) => d.day === currentDay)?.week ?? 1;

  // Étiquette de mois au-dessus de sa première semaine.
  const monthFirstWeek = new Map<number, number>();
  for (const d of program.days) {
    const cur = monthFirstWeek.get(d.month);
    if (cur === undefined || d.week < cur) monthFirstWeek.set(d.month, d.week);
  }
  const months = [...monthFirstWeek.keys()].sort((a, b) => a - b);

  const cols = weeks.length;

  return (
    <div className="traj">
      <div className="traj-scroll">
        <div className="traj-inner">
          <div className="traj-months" style={{ gridTemplateColumns: `repeat(${cols}, var(--cell))` }}>
            {months.map((m) => (
              <span key={m} className="traj-mlabel" style={{ gridColumn: weekPos.get(monthFirstWeek.get(m)!) }}>
                M{m}
              </span>
            ))}
          </div>
          <div
            className="traj-grid"
            role="group"
            aria-label="Trajectoire sur 365 jours — un carré par jour, coloré par statut"
            style={{ gridTemplateColumns: `repeat(${cols}, var(--cell))`, gridTemplateRows: `repeat(${maxRows}, var(--cell))` }}
          >
            {weeks.map((w) => {
              const isNow = w === currentWeek;
              return byWeek.get(w)!.map((d, i) => {
                const s = dayStatus(progress, d.day);
                const cls = ['tcell', `s-${s}`];
                if (d.day === currentDay) cls.push('now');
                if (d.isReview) cls.push('rev');
                if (isNow) cls.push('col-now');
                return (
                  <Link
                    key={d.day}
                    href={`/day/${d.day}`}
                    className={cls.join(' ')}
                    style={{ gridColumn: weekPos.get(w), gridRow: i + 1 }}
                    title={`Jour ${d.day} · ${d.title} — ${labelOf(s)}`}
                    aria-label={`Jour ${d.day}, ${d.title}, ${labelOf(s)}`}
                  />
                );
              });
            })}
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
        <span className="traj-now-note">Semaine {currentWeek} · jour {currentDay} en cours</span>
      </div>
    </div>
  );
}

function labelOf(s: string) {
  return s === 'done' ? 'terminé' : s === 'in-progress' ? 'en cours' : s === 'to-review' ? 'à revoir' : 'à venir';
}
