import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWeekHtml, getProgram } from '@/lib/program';
import { readProgress } from '@/lib/progress-server';
import { periodModel, periodBounds } from '@/lib/period-model';
import { annotateProseA11y } from '@/lib/section-family';
import { PositionRing, SurfaceHead } from '@/app/ui';
import PeriodLoad from '../../period/PeriodLoad';

export const dynamic = 'force-dynamic';

// V57 · CP4 — La semaine devient une UNITÉ OPÉRATIONNELLE : ce qu'on y fait,
// dans quel ordre, où on en est, et quelle est la prochaine journée. Elle
// partage la grammaire du mois (`PeriodLoad`) mais son ouverture diffère
// réellement : le mois montre ses semaines, la semaine montre ses journées.
//
// Motif propriétaire : PositionRing, dans sa sémantique d'origine — position
// et progression dans le programme, graduations = mois réels. Raison
// informationnelle : une semaine isolée ne dit pas où l'on se trouve dans
// l'année ; l'anneau répond à cette question sans la fabriquer, avec les
// mêmes chiffres que le Dashboard.
export default async function WeekPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const week = Number(id);
  const program = getProgram();
  const { min, max } = periodBounds(program, 'week');
  if (!Number.isInteger(week) || week < min || week > max) notFound();
  const html = getWeekHtml(week);
  if (!html) notFound();

  const progress = readProgress();
  const w = periodModel(program, progress, 'week', week);
  if (!w) notFound();

  // Position dans le PROGRAMME entier — mêmes données que le Dashboard,
  // aucun second calcul.
  const total = program.days.length;
  const doneAll = program.days.filter(
    (d: { day: number }) => progress.days?.[String(d.day)]?.status === 'done',
  ).length;
  const months = new Set(program.days.map((d: { month: number }) => d.month)).size;
  const month = w.days[0].month;

  return (
    <div className="period">
      {/* V58 · CP10 — bande d'identité partagée. Le motif PositionRing reste
          en `aside` : c'est exactement l'emplacement que la primitive réserve
          au motif propriétaire porteur de donnée. */}
      <SurfaceHead
        kind="catalog"
        eyebrow={<>Parcours <span className="sep">/</span>{' '}
          <Link href={`/month/${month}`}>mois {month}</Link>
          <span className="sep">/</span> semaine {week} sur {max}
          <span className="sep">/</span> jours {w.first} à {w.last}</>}
        title={`Semaine ${week}`}
        lead={<>{w.count} journées, {w.hours} h de travail prévues,{' '}
          {w.skills.length} compétence{w.skills.length > 1 ? 's' : ''} travaillée{w.skills.length > 1 ? 's' : ''}
          {w.deliverables > 0 ? <>, {w.deliverables} livrable{w.deliverables > 1 ? 's' : ''} attendu{w.deliverables > 1 ? 's' : ''}</> : null}.</>}
        aside={
          <div className="period-ring">
            <PositionRing
              percent={Math.round((doneAll / total) * 100)}
              day={w.first}
              total={total}
              months={months}
              label={`Position dans le programme au début de la semaine ${week}`}
            />
          </div>
        }
      />

      <section className="period-next" aria-label="Prochaine action">
        {w.next ? (
          <>
            <div className="period-next-body">
              <span className="period-next-k">Prochaine journée non terminée</span>
              <p className="period-next-t">Jour {w.next.day} — {w.next.title}</p>
              <p className="period-next-d">
                {w.next.skillName} <span className="sep">/</span> difficulté {w.next.difficulty}/5
                <span className="sep">/</span> {w.next.hours} h
                {w.next.deliverable ? <> <span className="sep">/</span> livrable attendu</> : null}
              </p>
            </div>
            <Link className="btn cta" href={`/day/${w.next.day}`}>Ouvrir le jour {w.next.day}</Link>
          </>
        ) : (
          <div className="period-next-body">
            <span className="period-next-k">Semaine terminée</span>
            <p className="period-next-t">Les {w.count} journées de cette semaine sont marquées terminées.</p>
          </div>
        )}
        <span className="period-next-bar" aria-hidden="true">
          <span className="period-next-fill" style={{ width: `${w.percent}%` }} />
        </span>
      </section>

      <PeriodLoad model={w} unit="week" />

      <section className="period-doc" aria-label={`Intention de la semaine ${week}`}>
        <div className="period-sec-head">
          <h2 className="period-h">Intention de la semaine</h2>
          <span className="period-h-note">document du curriculum, inchangé</span>
        </div>
        <article className="prose reading" dangerouslySetInnerHTML={{ __html: annotateProseA11y(html) }} />
      </section>

      <nav className="period-nav" aria-label="Navigation des semaines">
        {week > min
          ? <Link href={`/week/${week - 1}`}>← Semaine {week - 1}</Link>
          : <span className="period-nav-off">Début du parcours</span>}
        <Link href={`/month/${month}`}>Mois {month}</Link>
        {week < max
          ? <Link href={`/week/${week + 1}`}>Semaine {week + 1} →</Link>
          : <span className="period-nav-off">Fin du parcours</span>}
      </nav>
    </div>
  );
}
