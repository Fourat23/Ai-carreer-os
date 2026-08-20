import Link from 'next/link';
import { getProgram } from '@/lib/program';
import { getCatalogue } from '@/lib/catalogue-server';
import { getTrack, resolveTrackDayObjects } from '@/lib/catalogue';
import { readProgress, getActiveTrackId } from '@/lib/progress-server';
import { buildCalendar } from '@/lib/calendar-model';
import { PageHeader, Status } from '@/app/ui';

export const dynamic = 'force-dynamic';

export default function CalendarPage() {
  const program = getProgram();
  const progress = readProgress();
  const catalogue = getCatalogue();
  const activeTrack = getTrack(catalogue, getActiveTrackId()) ?? catalogue.tracks[0];
  // Le calendrier reflète le PARCOURS ACTIF (Fondations = les 365 jours).
  const trackDays = resolveTrackDayObjects(catalogue, activeTrack, program);
  const cal = buildCalendar(trackDays);
  const monthTitle = new Map(program.months.map((m) => [m.month, m.title]));
  // Couverture explicite : le filtre du parcours est annoncé (transparence).
  const coverage = `${cal.rendered} jour${cal.rendered > 1 ? 's' : ''} · ${cal.months.length} mois`;
  const contiguous = cal.missing.length === 0;

  return (
    <>
      <PageHeader
        eyebrow={<>Vue d'ensemble <span className="sep">/</span> {coverage}</>}
        title="Calendrier"
        sub={<>Le parcours actif <strong>{activeTrack.title}</strong> — mois → semaines → jours, dans l'ordre chronologique. Clique un jour pour l'ouvrir.</>}
        actions={
          <Status
            tone={contiguous ? 'positive' : 'attention'}
            label={contiguous ? `${cal.rendered} jours, continu` : `${cal.missing.length} jour(s) hors parcours`}
          />
        }
      />

      <div className="legend" aria-label="Légende des états">
        <span><i style={{ background: 'var(--swatch-done-bg)', borderColor: 'var(--swatch-done-bd)' }} /> Terminé</span>
        <span><i style={{ background: 'var(--swatch-prog-bg)', borderColor: 'var(--swatch-prog-bd)' }} /> En cours</span>
        <span><i style={{ background: 'var(--swatch-review-bg)', borderColor: 'var(--swatch-review-bd)' }} /> À revoir</span>
        <span><i style={{ borderStyle: 'dashed' }} /> Revue hebdo</span>
      </div>

      <div className="cal-months page-wide">
        {cal.months.map((mb) => (
          <section key={mb.month} className="month-block">
            <h2 className="month-head">
              <Link href={`/month/${mb.month}`} className="month-no">Mois {mb.month}</Link>
              <span className="month-title">{monthTitle.get(mb.month)}</span>
            </h2>
            {mb.weeks.map((wb) => (
              <div key={wb.week} className="cal-week">
                <Link href={`/week/${wb.week}`} className="week-label">Semaine {wb.week}</Link>
                <div className="week-days" role="list">
                  {wb.days.map((d) => {
                    const st = progress.days[String(d.day)]?.status ?? 'not-started';
                    const cls = ['day-cell'];
                    if (st === 'done') cls.push('done');
                    else if (st === 'in-progress') cls.push('in-progress');
                    else if (st === 'to-review') cls.push('to-review');
                    if (d.isReview) cls.push('review');
                    return (
                      <Link key={d.day} href={`/day/${d.day}`} role="listitem" className={cls.join(' ')}
                        title={`Jour ${d.day} — ${d.title}${d.isReview ? ' · revue hebdo' : ''}`}>
                        {d.day}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}
