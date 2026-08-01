import { getProgram } from '@/lib/program';
import { readProgress, getActiveTrackId } from '@/lib/progress-server';
import { getCatalogue } from '@/lib/catalogue-server';
import { getTrack } from '@/lib/catalogue';
import { getDueReviews, getUpcomingReviews } from '@/lib/review';
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

  return (
    <>
      <div className="page-head">
        <div className="page-head-main">
          <p className="page-eyebrow">Révision espacée <span className="sep">/</span> parcours actif : {activeTrack?.title ?? '—'}</p>
          <h1 className="page-title">Révisions</h1>
          <p className="page-sub">
            Les journées marquées « à revoir » reviennent ici à échéance. Après chaque révision,
            indique où tu en es : la prochaine date est recalculée automatiquement.
          </p>
        </div>
      </div>
      <ReviewList due={due} upcoming={upcoming} />
    </>
  );
}
