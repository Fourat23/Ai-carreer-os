import Link from 'next/link';
import { getProgram } from '@/lib/program';
import { getCatalogue } from '@/lib/catalogue-server';
import { getTrack, resolveTrackDayObjects } from '@/lib/catalogue';
import { readProgress, getActiveTrackId } from '@/lib/progress-server';
import { buildCalendar } from '@/lib/calendar-model';
import { curriculumPartition } from '@/lib/curriculum-partition';
import { PageHeader, Status, InlineNotice } from '@/app/ui';

export const dynamic = 'force-dynamic';

export default function CalendarPage() {
  const program = getProgram();
  const progress = readProgress();
  const catalogue = getCatalogue();
  const activeTrack = getTrack(catalogue, getActiveTrackId()) ?? catalogue.tracks[0];
  // Le calendrier reflète le PARCOURS ACTIF. Le modèle rend TOUJOURS dans
  // l'ordre chronologique (contrat V54.2.1) : mois → semaines → jours.
  const trackDays = resolveTrackDayObjects(catalogue, activeTrack, program);
  const cal = buildCalendar(trackDays);
  // Partition vérifiable des 365 jours : rien n'est passé sous silence.
  const part = curriculumPartition(program, trackDays.map((d) => d.day));
  const monthTitle = new Map(program.months.map((m) => [m.month, m.title]));
  const outside = part.before + part.interleaved + part.after;

  return (
    <>
      <PageHeader
        eyebrow={<>Programme global <span className="sep">/</span> {part.total} jours <span className="sep">·</span> {part.monthsTotal} mois</>}
        title="Calendrier"
        sub={<>Parcours actif : <strong>{activeTrack.title}</strong> — mois → semaines → jours, dans l&apos;ordre chronologique. Clique un jour pour l&apos;ouvrir.</>}
        actions={
          <Status
            tone={outside === 0 ? 'positive' : 'info'}
            label={outside === 0 ? `${part.inTrack} jours · programme complet` : `${part.inTrack} / ${part.total} jours du programme`}
          />
        }
      />

      {/* Réconciliation explicite : la somme des catégories vaut TOUJOURS le total.
          Avant V54.2.1, seuls les jours « intercalés » étaient comptés, et ceux
          situés au-delà du dernier jour du parcours n'apparaissaient nulle part. */}
      {outside > 0 && (
        <InlineNotice tone="info" title="Ce que ce calendrier montre — et ce qu'il ne montre pas">
          Le programme global compte <strong>{part.total} jours</strong> sur {part.monthsTotal} mois.
          Le parcours <strong>{activeTrack.title}</strong> en couvre <strong>{part.inTrack}</strong>,
          répartis sur {part.monthsCovered.length} mois (jours {part.firstTrackDay} à {part.lastTrackDay}).
          Les <strong>{outside} autres jours</strong> appartiennent à d&apos;autres domaines du programme :
          {part.before > 0 && <> {part.before} avant le jour {part.firstTrackDay},</>}
          {' '}{part.interleaved} intercalés entre les journées du parcours
          {part.after > 0 && <>, {part.after} au-delà du jour {part.lastTrackDay}</>}.
          {' '}Ils restent accessibles depuis les <Link href="/parcours">autres parcours</Link>.
          {' '}<span className="cal-sum">{part.inTrack} + {part.before + part.interleaved + part.after} = {part.total}</span>
        </InlineNotice>
      )}

      <div className="legend" aria-label="Légende des états">
        <span><i style={{ background: 'var(--swatch-done-bg)', borderColor: 'var(--swatch-done-bd)' }} /> Terminé</span>
        <span><i style={{ background: 'var(--swatch-prog-bg)', borderColor: 'var(--swatch-prog-bd)' }} /> En cours</span>
        <span><i style={{ background: 'var(--swatch-review-bg)', borderColor: 'var(--swatch-review-bd)' }} /> À revoir</span>
        <span><i style={{ borderStyle: 'dashed' }} /> Revue hebdo</span>
      </div>

      {/* Grille RÉGULIÈRE (jamais de colonnes CSS / maçonnerie) : l'ordre de
          lecture visuel — gauche → droite, puis ligne suivante — doit coïncider
          avec l'ordre du DOM, qui est chronologique. Les attributs data-calendar-*
          rendent cet ordre assertable dans le navigateur (scripts/v5421-*). */}
      <div className="cal-months page-wide">
        {cal.months.map((mb) => (
          <section key={mb.month} className="month-block" data-calendar-month={mb.month}>
            <h2 className="month-head">
              <Link href={`/month/${mb.month}`} className="month-no">Mois {mb.month}</Link>
              <span className="month-title">{monthTitle.get(mb.month)}</span>
            </h2>
            {mb.weeks.map((wb) => (
              <div key={wb.week} className="cal-week" data-calendar-week={wb.week}>
                <Link href={`/week/${wb.week}`} className="week-label">Semaine {wb.week}</Link>
                {/* V54.2.1 — `role="listitem"` sur <a> n'est pas autorisé
                    (axe-core : aria-allowed-role, ×365). Une vraie liste
                    <ul>/<li> porte la sémantique, le lien reste un lien. */}
                <ul className="week-days">
                  {wb.days.map((d) => {
                    const st = progress.days[String(d.day)]?.status ?? 'not-started';
                    const cls = ['day-cell'];
                    if (st === 'done') cls.push('done');
                    else if (st === 'in-progress') cls.push('in-progress');
                    else if (st === 'to-review') cls.push('to-review');
                    if (d.isReview) cls.push('review');
                    return (
                      <li key={d.day} className="day-slot">
                        <Link href={`/day/${d.day}`} className={cls.join(' ')}
                          data-calendar-day={d.day}
                          title={`Jour ${d.day} — ${d.title}${d.isReview ? ' · revue hebdo' : ''}`}>
                          {d.day}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}
