import { getProgram } from '@/lib/program';
import { readProgress, getActiveTrackId } from '@/lib/progress-server';
import { getCatalogue } from '@/lib/catalogue-server';
import { getTrack, resolveTrackDayObjects } from '@/lib/catalogue';
import { progressPosition } from '@/lib/position';
import Link from 'next/link';
import { getDueReviews, getUpcomingReviews } from '@/lib/review';
import { PageHeader, Metric, Status, InlineNotice } from '@/app/ui';
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
  // File RÉELLEMENT vide (ni due, ni à venir) → composition d'état vide dédiée.
  const empty = due.length === 0 && upcoming.length === 0;
  // Action réelle proposée : la journée de reprise du parcours actif, dérivée
  // du même read-model que le Dashboard (aucun second calcul, aucun CTA factice).
  const trackDays = resolveTrackDayObjects(getCatalogue(), activeTrack ?? getCatalogue().tracks[0], program);
  const resumeDay = trackDays.length ? progressPosition(trackDays, progress).resumeDay : null;
  const resumeTitle = resumeDay != null ? title(resumeDay) : '';

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
        {/* Anti-redondance : à zéro partout, ces pastilles répètent la métrique
            qu'elles jouxtent (« 0 · file vide · Dues 0 · À venir 0 »). */}
        {!empty && (
          <div className="skills-distribution" aria-label="File de révision">
            <Status tone={due.length > 0 ? 'attention' : 'neutral'} label={`Dues · ${due.length}`} />
            {overdue > 0 && <Status tone="blocking" label={`En retard · ${overdue}`} />}
            <Status tone="info" label={`À venir · ${upcoming.length}`} />
          </div>
        )}
      </div>

      <ReviewList due={due} upcoming={upcoming} suppressEmpty={empty} />

      {/* État vide INTENTIONNEL (V54.2.1). Aucune révision n'est inventée : la
          file reste à zéro. Ce qui change, c'est la composition — l'écran répond
          désormais aux trois questions posées devant une page vide : pourquoi
          c'est vide, quand cela se remplira, et quoi faire maintenant. La seule
          action proposée est réelle (la journée de reprise du parcours actif). */}
      {empty ? (
        <section className="rev-empty" aria-label="Comment la file de révision se remplit">
          <div className="rev-empty-why">
            <h2 className="section-title">Cette file est vide, et c'est normal</h2>
            <p className="rev-empty-lead">
              Une révision n'apparaît ici que si tu l'as réellement déclenchée en clôturant
              une journée. Rien n'est planifié à l'avance, rien n'est inventé.
            </p>
            <ol className="rev-steps">
              <li className="rev-step">
                <span className="rev-step-n">1</span>
                <div className="rev-step-body">
                  <span className="rev-step-t">Tu clôtures une journée</span>
                  <span className="rev-step-d">en déclarant ta compréhension : acquise, partielle, ou « à revoir ».</span>
                </div>
              </li>
              <li className="rev-step">
                <span className="rev-step-n">2</span>
                <div className="rev-step-body">
                  <span className="rev-step-t">L'échéance est calculée</span>
                  <span className="rev-step-d">par répétition espacée (SM-2) : plus la compréhension déclarée est faible, plus la révision revient tôt.</span>
                </div>
              </li>
              <li className="rev-step">
                <span className="rev-step-n">3</span>
                <div className="rev-step-body">
                  <span className="rev-step-t">La journée réapparaît ici</span>
                  <span className="rev-step-d">le jour venu — et la prochaine échéance est recalculée à chaque passage.</span>
                </div>
              </li>
            </ol>
          </div>
          <aside className="rev-empty-act">
            <span className="ui-panel-label">Ce que tu peux faire maintenant</span>
            {resumeDay != null ? (
              <>
                <p className="rev-empty-next">Jour {resumeDay}{resumeTitle ? <> — {resumeTitle}</> : null}</p>
                <Link className="btn cta" href={`/day/${resumeDay}`}>Continuer le parcours</Link>
              </>
            ) : (
              <p className="rev-empty-next">Aucune journée à reprendre sur ce parcours.</p>
            )}
            <div className="ui-panel-sep" />
            <p className="dash-note">
              Pour entretenir un acquis sans attendre une échéance, les{' '}
              <Link href="/diagnostics">diagnostics</Link> proposent du rappel actif à la demande.
            </p>
          </aside>
        </section>
      ) : (
        <div style={{ marginTop: 'var(--sp-6)' }}>
          <InlineNotice tone="info" title="Comment cette file se remplit">
            Quand tu clôtures une journée en indiquant « à revoir » (ou après une révision
            partielle), elle entre dans une file de <strong>répétition espacée</strong> (algorithme
            SM-2) : la prochaine échéance est calculée selon ta compréhension déclarée. Elle
            réapparaît ici le jour venu. En attendant, tu peux entretenir tes acquis avec les{' '}
            <Link href="/diagnostics">diagnostics</Link>. Aucune révision n'est inventée — la file
            ne reflète que tes journées réellement marquées.
          </InlineNotice>
        </div>
      )}
    </>
  );
}
