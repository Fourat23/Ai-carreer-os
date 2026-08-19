import Link from 'next/link';
import { getProgram } from '@/lib/program';
import { getCatalogue } from '@/lib/catalogue-server';
import { getTrack, resolveTrackDayObjects } from '@/lib/catalogue';
import { readProgress, getActiveTrackId } from '@/lib/progress-server';

export const dynamic = 'force-dynamic';

export default function CalendarPage() {
  const program = getProgram();
  const progress = readProgress();
  const catalogue = getCatalogue();
  const activeTrack = getTrack(catalogue, getActiveTrackId()) ?? catalogue.tracks[0];
  // Le calendrier est généré à partir du PARCOURS ACTIF (Fondations = 365 jours).
  const trackDays = resolveTrackDayObjects(catalogue, activeTrack, program);

  const byMonth = new Map<number, typeof program.days>();
  for (const d of trackDays) {
    if (!byMonth.has(d.month)) byMonth.set(d.month, []);
    byMonth.get(d.month)!.push(d);
  }

  return (
    <>
      <div className="page-head">
        <div className="page-head-main">
          <p className="page-eyebrow">Vue d'ensemble <span className="sep">/</span> {trackDays.length} jours · {activeTrack.title}</p>
          <h1 className="page-title">Calendrier</h1>
          <p className="page-sub">Mois → semaines → jours. Clique un jour pour l'ouvrir.</p>
        </div>
      </div>
      <div className="legend">
        <span><i style={{ background: 'var(--swatch-done-bg)', borderColor: 'var(--swatch-done-bd)' }} /> Terminé</span>
        <span><i style={{ background: 'var(--swatch-prog-bg)', borderColor: 'var(--swatch-prog-bd)' }} /> En cours</span>
        <span><i style={{ background: 'var(--swatch-review-bg)', borderColor: 'var(--swatch-review-bd)' }} /> À revoir</span>
        <span><i style={{ borderStyle: 'dashed' }} /> Revue hebdo</span>
      </div>

      <div className="cal-months page-wide">
      {[...byMonth.entries()].map(([month, days]) => {
        const m = program.months.find((x) => x.month === month);
        const weeks = new Map<number, typeof days>();
        for (const d of days) {
          if (!weeks.has(d.week)) weeks.set(d.week, []);
          weeks.get(d.week)!.push(d);
        }
        return (
          <div key={month} className="month-block">
            <h2>
              <Link href={`/month/${month}`}>Mois {month}</Link>
              <span className="muted" style={{ fontSize: 14, fontWeight: 400 }}>{m?.title}</span>
            </h2>
            {[...weeks.entries()].map(([week, wdays]) => (
              <div key={week} className="week-row">
                <Link href={`/week/${week}`} className="week-label">Semaine {week}</Link>
                {wdays.map((d) => {
                  const st = progress.days[String(d.day)]?.status ?? 'not-started';
                  const cls = ['day-cell'];
                  if (st === 'done') cls.push('done');
                  else if (st === 'in-progress') cls.push('in-progress');
                  else if (st === 'to-review') cls.push('to-review');
                  if (d.isReview) cls.push('review');
                  return (
                    <Link key={d.day} href={`/day/${d.day}`} className={cls.join(' ')} title={`Jour ${d.day} — ${d.title}`}>
                      {d.day}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}
      </div>
    </>
  );
}
