import { getProgram } from '@/lib/program';
import { readProgress, getActiveTrackId } from '@/lib/progress-server';
import { getCatalogue } from '@/lib/catalogue-server';
import { getTrack } from '@/lib/catalogue';
import Link from 'next/link';
import { getDueReviews, getUpcomingReviews } from '@/lib/review';
import { PageHeader, Metric, Status } from '@/app/ui';
import ReviewList from './ReviewList';

export const dynamic = 'force-dynamic';

export default function RevisionsPage() {
  const program = getProgram();
  const progress = readProgress();
  const activeTrack = getTrack(getCatalogue(), getActiveTrackId());
  const title = (day: number) => program.days.find((d) => d.day === day)?.title ?? '';

  const due = getDueReviews(progress.days).map((r) => ({
    ...r, title: title(r.day), review: progress.days[String(r.day)]?.review ?? null,
  }));
  const upcoming = getUpcomingReviews(progress.days).map((r) => ({ ...r, title: title(r.day) }));
  const overdue = due.filter((r) => r.overdueDays > 0).length;

  return (
    <>
      <PageHeader
        eyebrow={<>Révision espacée <span className="sep">/</span> parcours actif : {activeTrack?.title ?? '—'}</>}
        title="Révisions"
        sub={<>Une file de travail priorisée : les journées « à revoir » reviennent ici à échéance. Après chaque révision, la prochaine date est recalculée. Pour un rappel actif, mêle des <Link href="/diagnostics">diagnostics</Link>.</>}
      />

      <div className="skills-summary">
        <Metric label="À revoir aujourd'hui" value={due.length} emphasis
          tone={due.length > 0 ? 'attention' : undefined}
          sub={overdue > 0 ? `dont ${overdue} en retard` : (upcoming.length ? `${upcoming.length} à venir` : 'file vide')} />
        <div className="skills-distribution" aria-label="File de révision">
          <Status tone={due.length > 0 ? 'attention' : 'neutral'} label={`Dues · ${due.length}`} />
          {overdue > 0 && <Status tone="blocking" label={`En retard · ${overdue}`} />}
          <Status tone="info" label={`À venir · ${upcoming.length}`} />
        </div>
      </div>

      <ReviewList due={due} upcoming={upcoming} />
    </>
  );
}
