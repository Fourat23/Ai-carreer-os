import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FlaskConical, Check, ArrowRight } from 'lucide-react';
import { getDay, getDayHtml, getSolutionHtml, getDayChecklist } from '@/lib/program';
import { getDayProgress } from '@/lib/progress-server';
import { getDayExerciseIndex } from '@/lib/day-exercises-server';
import { selectDayExercises } from '@/lib/day-exercises';
import { getExercise } from '@/lib/exercises-server';
import { getRuntimeAdapter } from '@/lib/runtime.mjs';
import { hasLabEvidence } from '@/lib/lab-progress';
import { EMPTY_DAY_PROGRESS } from '@/lib/types';
import { stripDayLeadHtml } from '@/lib/day-view';
import { annotateDayHtml, deriveActivities } from '@/lib/section-family';
import DayPanel from './DayPanel';
import DayHeader from './DayHeader';
import DayOutline from './DayOutline';
import DayCorrection from './DayCorrection';
import DayEvidence from './DayEvidence';

export const dynamic = 'force-dynamic';

// Libellés FR des rôles pédagogiques dérivés (ADR-013). Affichés seulement quand
// une journée porte plusieurs exercices, pour distinguer le principal des compléments.
const DAY_ROLE_LABELS: Record<string, string> = {
  principal: 'Principal', complement: 'Complément', remediation: 'Remédiation', challenge: 'Défi',
};

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

  // Exercices de code liés à ce jour (fixture, sans toucher au Markdown).
  // Sélection/ordre PURS (par difficulté puis id), statut via preuve de réussite.
  const labExercises = selectDayExercises(
    getDayExerciseIndex(),
    dayNum,
    (exId) => getExercise(exId),
    (exId) => hasLabEvidence(progress, exId),
  ).map((x) => ({ ...x, runtimeLabel: getRuntimeAdapter(x.runtime)?.label ?? x.runtime }));

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

        {labExercises.length > 0 && (
          <section className="day-lab">
            <div className="section-head">
              <span className="section-label">Laboratoire</span>
              <h2 className="section-title">Exercices de code</h2>
            </div>
            <div className="day-lab-list">
              {labExercises.map((x) => (
                <Link key={x.id} href={`/lab/${x.id}`} className="day-lab-item">
                  <FlaskConical size={15} strokeWidth={2} />
                  <span className="day-lab-title">{x.title}</span>
                  <span className="day-lab-meta">
                    {labExercises.length > 1 && x.role && (
                      <span className={`day-lab-role role-${x.role}`}>{DAY_ROLE_LABELS[x.role] ?? x.role}</span>
                    )}
                    <span className="day-lab-runtime">{x.runtimeLabel}</span>
                    {x.difficulty ? <span className="day-lab-diff" title={`Difficulté ${x.difficulty}/5`} aria-label={`Difficulté ${x.difficulty} sur 5`}>{'●'.repeat(x.difficulty)}<span className="day-lab-diff-off">{'●'.repeat(Math.max(0, 5 - x.difficulty))}</span></span> : null}
                  </span>
                  {x.status === 'passed'
                    ? <span className="badge ok"><Check size={12} /> Réussi</span>
                    : <span className="badge">À faire</span>}
                  <ArrowRight size={14} className="day-lab-go" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />

        <DayPanel day={dayNum} initial={progress} checklist={checklist} activities={activities} />

        {solution && (
          <DayCorrection day={dayNum} solutionHtml={solution} isReview={!!meta.isReview} initial={progress} />
        )}

        <DayEvidence day={dayNum} initial={progress.evidence ?? []} skillId={meta.skill} skillName={meta.skillName} />
      </div>

      <DayOutline variant="rail" />
    </div>
  );
}
