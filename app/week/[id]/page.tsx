import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProgram, getWeekHtml } from '@/lib/program';

export const dynamic = 'force-dynamic';

export default async function WeekPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const week = Number(id);
  if (!Number.isInteger(week) || week < 1 || week > 52) notFound();
  const html = getWeekHtml(week);
  if (!html) notFound();
  const program = getProgram();
  const days = program.days.filter((d) => d.week === week);

  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="row">
          {week > 1 && <Link className="btn small" href={`/week/${week - 1}`}>← Semaine {week - 1}</Link>}
          {week < 52 && <Link className="btn small" href={`/week/${week + 1}`}>Semaine {week + 1} →</Link>}
        </div>
        <Link className="btn small" href="/calendar">Calendrier</Link>
      </div>
      <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      <div className="card" style={{ marginTop: 18 }}>
        <h3>Jours de la semaine</h3>
        {days.map((d) => (
          <div key={d.day} className="row" style={{ justifyContent: 'space-between', padding: '4px 0' }}>
            <Link href={`/day/${d.day}`}>Jour {d.day} — {d.title}</Link>
            {d.isReview && <span className="badge review">revue</span>}
          </div>
        ))}
      </div>
    </>
  );
}
