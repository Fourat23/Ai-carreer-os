import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDay, getDayHtml, getSolutionHtml, getDayChecklist } from '@/lib/program';
import { getDayProgress } from '@/lib/progress-server';
import { EMPTY_DAY_PROGRESS } from '@/lib/types';
import DayPanel from './DayPanel';

export const dynamic = 'force-dynamic';

export default async function DayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dayNum = Number(id);
  if (!Number.isInteger(dayNum) || dayNum < 1 || dayNum > 365) notFound();

  const meta = getDay(dayNum);
  const html = getDayHtml(dayNum);
  if (!meta || !html) notFound();
  const solution = getSolutionHtml(dayNum);
  const checklist = getDayChecklist(dayNum);
  const progress = getDayProgress(dayNum) ?? { ...EMPTY_DAY_PROGRESS };

  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="row">
          {dayNum > 1 && <Link className="btn small" href={`/day/${dayNum - 1}`}>← Jour {dayNum - 1}</Link>}
          {dayNum < 365 && <Link className="btn small" href={`/day/${dayNum + 1}`}>Jour {dayNum + 1} →</Link>}
        </div>
        <div className="row">
          <Link className="btn small" href={`/week/${meta.week}`}>Semaine {meta.week}</Link>
          <Link className="btn small" href={`/month/${meta.month}`}>Mois {meta.month}</Link>
        </div>
      </div>

      <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />

      <DayPanel day={dayNum} initial={progress} checklist={checklist} />

      {!meta.isReview && solution && (
        <details className="solution">
          <summary>⛔ Voir la correction (seulement après avoir vraiment essayé seul)</summary>
          <div className="prose" style={{ borderRadius: '0 0 8px 8px', borderTop: 'none' }}
               dangerouslySetInnerHTML={{ __html: solution }} />
        </details>
      )}
    </>
  );
}
