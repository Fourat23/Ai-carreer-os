import Link from 'next/link';
import { getProgram } from '@/lib/program';
import { readProgress } from '@/lib/progress-server';

export const dynamic = 'force-dynamic';

export default function CalendarPage() {
  const program = getProgram();
  const progress = readProgress();

  const byMonth = new Map<number, typeof program.days>();
  for (const d of program.days) {
    if (!byMonth.has(d.month)) byMonth.set(d.month, []);
    byMonth.get(d.month)!.push(d);
  }

  return (
    <>
      <div className="page-head">
        <div className="page-head-main">
          <p className="page-eyebrow">Vue d'ensemble <span className="sep">/</span> 365 jours</p>
          <h1 className="page-title">Calendrier</h1>
          <p className="page-sub">Mois → semaines → jours. Clique un jour pour l'ouvrir.</p>
        </div>
      </div>
      <div className="legend">
        <span><i style={{ background: '#143a2c', borderColor: '#1e5b45' }} /> Terminé</span>
        <span><i style={{ background: '#2a3550', borderColor: '#2e4a70' }} /> En cours</span>
        <span><i style={{ background: '#3a2a52', borderColor: '#533a7a' }} /> À revoir</span>
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
