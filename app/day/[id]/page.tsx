import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FlaskConical, Check, ArrowRight } from 'lucide-react';
import { getDay, getDayHtml, getSolutionHtml, getDayChecklist } from '@/lib/program';
import { getDayProgress, getActiveTrackId, readProgress } from '@/lib/progress-server';
import { getCatalogue } from '@/lib/catalogue-server';
import { resolveTrackDays, trackNeighbors } from '@/lib/catalogue';
import { getDayExerciseIndex } from '@/lib/day-exercises-server';
import { selectDayExercises } from '@/lib/day-exercises';
import { getExercise } from '@/lib/exercises-server';
import { missionsForDay, missionProgressFor } from '@/lib/missions-server';
import { getRuntimeAdapter } from '@/lib/runtime.mjs';
import { hasLabEvidence } from '@/lib/lab-progress';
import { EMPTY_DAY_PROGRESS } from '@/lib/types';
import { stripDayLeadHtml } from '@/lib/day-view';
import { annotateDayHtml, deriveActivities } from '@/lib/section-family';
import { SectionHeader, Status } from '@/app/ui';
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

  // Navigation BORNÉE au parcours actif : précédent/suivant sont les journées
  // voisines dans resolveTrackDays (jamais day±1). Si la journée est hors du
  // parcours actif (contenu partagé consultable), on retombe sur une navigation
  // linéaire du programme sans position de parcours.
  const catalogue = getCatalogue();
  const trackDays = resolveTrackDays(catalogue, getActiveTrackId());
  const nb = trackNeighbors(trackDays, dayNum);
  const prevDay = nb.inTrack ? nb.prev : (dayNum > 1 ? dayNum - 1 : null);
  const nextDay = nb.inTrack ? nb.next : (dayNum < 365 ? dayNum + 1 : null);
  const trackTotal = nb.inTrack ? nb.total : null;
  const trackPosition = nb.inTrack ? nb.position : null;

  // Exercices de code liés à ce jour (fixture, sans toucher au Markdown).
  // Sélection/ordre PURS (par difficulté puis id), statut via preuve de réussite.
  const labExercises = selectDayExercises(
    getDayExerciseIndex(),
    dayNum,
    (exId) => getExercise(exId),
    (exId) => hasLabEvidence(progress, exId),
  ).map((x) => ({ ...x, runtimeLabel: getRuntimeAdapter(x.runtime)?.label ?? x.runtime }));

  // Missions d'ingénierie reliées à ce jour (dérivé de dayRefs ; statut via progression).
  const MISSION_CAT: Record<string, string> = { 'debt-maintenance': 'Dette & maintenance', performance: 'Performance', documentation: 'Documentation', incident: 'Incident' };
  const MISSION_STATUS: Record<string, string> = { 'not-started': 'À commencer', 'in-progress': 'En cours', 'deliverables-incomplete': 'Livrables incomplets', 'ready-for-review': 'Prêt pour revue', done: 'Terminé' };
  const flatProgress = readProgress();
  const dayMissions = missionsForDay(dayNum).map((m) => {
    const st = missionProgressFor(flatProgress, m).status;
    return { id: m.id, title: m.title, category: MISSION_CAT[m.category] ?? m.category, statusLabel: MISSION_STATUS[st] ?? 'À commencer', done: st === 'done' };
  });

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
          prevDay={prevDay}
          nextDay={nextDay}
          trackTotal={trackTotal}
          trackPosition={trackPosition}
        />

        <DayOutline variant="compact" />

        {labExercises.length > 0 && (
          <section className="day-lab">
            <SectionHeader label="Laboratoire" title="Exercices de code" />

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
                    ? <Status tone="positive" icon={<Check size={12} />} label="Réussi" />
                    : <Status tone="neutral" label="À faire" />}
                  <ArrowRight size={14} className="day-lab-go" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {dayMissions.length > 0 && (
          <section className="day-lab day-missions">
            <SectionHeader label="Missions" title="Missions d'ingénierie" />

            <div className="day-lab-list">
              {dayMissions.map((m) => (
                <Link key={m.id} href={`/missions/${m.id}`} className="day-lab-item">
                  <span className="day-lab-title">{m.title}</span>
                  <span className="day-lab-meta">
                    <span className="day-lab-runtime">{m.category}</span>
                  </span>
                  {m.done ? <Status tone="positive" icon={<Check size={12} />} label="Terminé" /> : <Status tone="neutral" label={m.statusLabel} />}
                  <ArrowRight size={14} className="day-lab-go" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />

        <DayPanel day={dayNum} nextDay={nextDay} initial={progress} checklist={checklist} activities={activities} />

        {solution && (
          <DayCorrection day={dayNum} solutionHtml={solution} isReview={!!meta.isReview} initial={progress} />
        )}

        <DayEvidence day={dayNum} initial={progress.evidence ?? []} skillId={meta.skill} skillName={meta.skillName} />
      </div>

      <DayOutline variant="rail" />
    </div>
  );
}
