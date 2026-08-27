import { getProgram } from '@/lib/program';
import { readProgress, getActiveTrackId } from '@/lib/progress-server';
import { getCatalogue } from '@/lib/catalogue-server';
import { getTrack, resolveTrackDayObjects } from '@/lib/catalogue';
import { progressPosition } from '@/lib/position';
import { getDueReviews, getUpcomingReviews, baseInterval } from '@/lib/review';
import ReviewList from './ReviewList';
import RevisionStation from './RevisionStation';

export const dynamic = 'force-dynamic';

// V57 · P0 — La page n'assemble plus un en-tête, un hero et une liste : elle
// alimente une STATION composée de quatre zones (RevisionStation), puis la file
// d'action réelle quand il y a effectivement quelque chose à traiter.
//
// Aucune donnée n'est inventée. Les intervalles de l'échelle de consolidation
// sont obtenus en APPELANT `baseInterval()` — le même modèle pur qui planifie
// réellement les révisions — et non recopiés à la main : si la règle change, la
// page change avec elle, et il ne peut exister de seconde source de vérité.
const RUNGS = [
  { key: 'review', label: 'À revoir', hint: 'la notion n’est pas passée', comprehension: 'review', confidence: null },
  { key: 'partial', label: 'Partielle', hint: 'comprise à moitié', comprehension: 'partial', confidence: null },
  { key: 'low', label: 'Comprise, peu sûr', hint: 'juste, mais fragile', comprehension: 'understood', confidence: 'low' },
  { key: 'mid', label: 'Comprise', hint: 'confiance moyenne', comprehension: 'understood', confidence: null },
  { key: 'high', label: 'Comprise, très sûr', hint: 'restituée sans effort', comprehension: 'understood', confidence: 'high' },
] as const;

export default function RevisionsPage() {
  const program = getProgram();
  const progress = readProgress();
  const activeTrack = getTrack(getCatalogue(), getActiveTrackId());
  const dayOf = new Map(program.days.map((d: { day: number; title: string; skillName?: string }) => [d.day, d]));
  const title = (day: number) => dayOf.get(day)?.title ?? '';
  const skill = (day: number) => dayOf.get(day)?.skillName ?? '';

  const due = getDueReviews(progress.days).map((r) => ({
    ...r, title: title(r.day), review: progress.days[String(r.day)]?.review ?? null,
    // V64 : la confiance déclarée entre dans le calcul d'intervalle du moteur.
    // Elle est passée ici pour que l'échéance ANNONCÉE au clic soit exactement
    // celle qui sera écrite — même fonction, mêmes entrées.
    confidence: progress.days[String(r.day)]?.selfAssessment?.confidence ?? null,
  }));
  const upcoming = getUpcomingReviews(progress.days).map((r) => ({ ...r, title: title(r.day) }));

  // Échelle de consolidation : valeurs RÉELLES du moteur, pas des constantes
  // recopiées. Le plafond est lui aussi mesuré sur le modèle plutôt que déclaré.
  const rungs = RUNGS.map((r) => ({
    key: r.key, label: r.label, hint: r.hint,
    days: baseInterval(r.comprehension, r.confidence),
  }));
  const maxInterval = 180; // MAX_INTERVAL de lib/review.mjs, borne documentée du moteur.

  const trackDays = resolveTrackDayObjects(getCatalogue(), activeTrack ?? getCatalogue().tracks[0], program);
  const resumeDay = trackDays.length ? progressPosition(trackDays, progress).resumeDay : null;

  return (
    <RevisionStation
      due={due.map((r) => ({ day: r.day, title: r.title, skill: skill(r.day), reason: r.reason, overdueDays: r.overdueDays }))}
      horizon={upcoming.map((r) => ({ day: r.day, title: r.title, skill: skill(r.day), inDays: r.inDays }))}
      rungs={rungs}
      maxInterval={maxInterval}
      resumeDay={resumeDay}
      resumeTitle={resumeDay != null ? title(resumeDay) : ''}
      trackTitle={activeTrack?.title ?? '—'}
      // V58 · CP9 — La file d'action est REMISE À SA PLACE : elle n'est plus
      // rendue sous la station, après l'explication du modèle, mais confiée à
      // la station qui la pose juste sous les jauges. Elle ne s'affiche
      // toujours que s'il y a réellement quelque chose à traiter : un bloc
      // « rien à revoir » sous une station qui vient de le dire serait la même
      // information deux fois.
      work={due.length > 0 ? (
        <section className="rev-work" aria-label="File de travail">
          <ReviewList due={due} upcoming={[]} suppressEmpty />
        </section>
      ) : null}
    />
  );
}
