import { notFound } from 'next/navigation';
import { getDay, getDayHtml, getSolutionHtml, getDayChecklist } from '@/lib/program';
import { getDayProgress } from '@/lib/progress-server';
import { EMPTY_DAY_PROGRESS } from '@/lib/types';
import { stripDayLeadHtml } from '@/lib/day-view';
import { annotateDayHtml, deriveActivities } from '@/lib/section-family';
import DayPanel from './DayPanel';
import DayHeader from './DayHeader';
import DayOutline from './DayOutline';
import DayCorrection from './DayCorrection';

export const dynamic = 'force-dynamic';

export default async function DayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dayNum = Number(id);
  if (!Number.isInteger(dayNum) || dayNum < 1 || dayNum > 365) notFound();

  const meta = getDay(dayNum);
  const rawHtml = getDayHtml(dayNum);
  if (!meta || !rawHtml) notFound();
  const html = annotateDayHtml(stripDayLeadHtml(rawHtml));
  const activities = deriveActivities(html);
  const solution = getSolutionHtml(dayNum);
  const checklist = getDayChecklist(dayNum);
  const progress = getDayProgress(dayNum) ?? { ...EMPTY_DAY_PROGRESS };

  return (
    <div className="day-view">
      <div className="day-main">
        <DayHeader
          day={dayNum}
          title={meta.title}
          skillName={meta.skillName}
          difficulty={meta.difficulty}
          hours={meta.hours}
          week={meta.week}
          month={meta.month}
          status={progress.status}
        />

        <DayOutline variant="compact" />

        <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />

        <DayPanel day={dayNum} initial={progress} checklist={checklist} activities={activities} />

        {solution && (
          <DayCorrection day={dayNum} solutionHtml={solution} isReview={!!meta.isReview} initial={progress} />
        )}
      </div>

      <DayOutline variant="rail" />
    </div>
  );
}
