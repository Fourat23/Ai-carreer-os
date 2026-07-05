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
      <h1>Calendrier — 365 jours</h1>
      <p className="subtitle">
        Vue mois → semaines → jours. Vert = terminé, bleu = en cours, violet = à revoir, pointillé = revue hebdo.
      </p>

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
    </>
  );
}
