import Link from 'next/link';
import { getProgram } from '@/lib/program';
import { getCatalogue } from '@/lib/catalogue-server';
import { getTrack, resolveTrackDayObjects } from '@/lib/catalogue';
import { readProgress, getActiveTrackId } from '@/lib/progress-server';
import { buildCalendar } from '@/lib/calendar-model';
import { curriculumPartition } from '@/lib/curriculum-partition';
import { progressPosition } from '@/lib/position';
import { PageHeader, Status, InlineNotice, HeroFocus, HeroFact, YearBand } from '@/app/ui';

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
  // Avancement PAR MOIS, dérivé des journées réellement terminées du parcours.
  // Aucune agrégation nouvelle : même statut, même source que partout ailleurs.
  // Position réelle sur le parcours (même read-model que le Dashboard).
  const resumeDay = trackDays.length ? progressPosition(trackDays, progress).resumeDay : 1;
  const currentMonth = program.months.find((m) => m.month === program.days.find((d) => d.day === resumeDay)?.month);
  const doneTotal = trackDays.filter((d) => progress.days[String(d.day)]?.status === 'done').length;
  const monthDone = new Map<number, number>();
  const monthTotal = new Map<number, number>();
  const monthPct = new Map<number, number>();
  for (const mb of cal.months) {
    const days = mb.weeks.flatMap((w) => w.days);
    const done = days.filter((d) => progress.days[String(d.day)]?.status === 'done').length;
    monthDone.set(mb.month, done);
    monthTotal.set(mb.month, days.length);
    monthPct.set(mb.month, days.length ? Math.round((done / days.length) * 100) : 0);
  }

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

      {/* ── HERO du calendrier (V55) : la page avait 12 blocs strictement
          équivalents (dominance mesurée 0,089, rapport 1er/2e = 1,00) et aucune
          action. Le hero donne un point d'entrée réel — le mois courant, la
          position, et l'accès direct à la journée de reprise. */}
      <div className="page-wide">
        <HeroFocus
          tone="calm"
          eyebrow={<>Parcours actif <span className="sep">·</span> {activeTrack.title}</>}
          title={currentMonth ? `Mois ${currentMonth.month} — ${currentMonth.title}` : 'Calendrier du parcours'}
          lead={currentMonth?.summary}
          meta={
            <>
              <HeroFact k="Position">jour {resumeDay} sur {part.inTrack}</HeroFact>
              <HeroFact k="Couverture">{part.inTrack} des {part.total} jours du programme</HeroFact>
              <HeroFact k="Mois">{part.monthsCovered.length} sur {part.monthsTotal}</HeroFact>
              <HeroFact k="Terminées">{doneTotal} journées</HeroFact>
            </>
          }
          actions={<Link className="btn cta" href={`/day/${resumeDay}`}>Ouvrir le jour {resumeDay}</Link>}
        />
      </div>

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

      {/* ── MOTIF · YearBand — la continuité que douze blocs de mois détruisent.
          Chaque mois y pèse SON nombre réel de journées : un mois peu couvert
          apparaît COURT, et non comme un grand panneau vide. */}
      <div className="page-wide">
        <YearBand
          days={trackDays.map((d) => ({ day: d.day, month: d.month, difficulty: d.difficulty, status: progress.days[String(d.day)]?.status ?? 'not-started' }))}
          currentDay={resumeDay}
          monthTitles={monthTitle}
          label={`Année du parcours ${activeTrack.title}`}
        />
      </div>

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
            {/* V55 — l'en-tête de mois porte désormais son propre repère de
                progression, dérivé des journées réellement terminées. Il donne
                une distinction forte entre mois et rend les mois peu couverts
                lisibles sans inventer de journées. */}
            <h2 className="month-head">
              <Link href={`/month/${mb.month}`} className="month-no">
                <span className="month-no-k">Mois</span>
                <span className="month-no-v">{mb.month}</span>
              </Link>
              <span className="month-head-body">
                <span className="month-title">{monthTitle.get(mb.month)}</span>
                <span className="month-count">
                  {monthDone.get(mb.month) ?? 0} / {monthTotal.get(mb.month) ?? 0} journées terminées
                </span>
              </span>
            </h2>
            <div className="month-bar" aria-hidden="true">
              <span style={{ width: `${monthPct.get(mb.month) ?? 0}%` }} />
            </div>
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
