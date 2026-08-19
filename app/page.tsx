import Link from 'next/link';
import { CalendarDays, NotebookPen, FolderGit2, ClipboardCheck, Route } from 'lucide-react';
import { getProgram } from '@/lib/program';
import { getCatalogue } from '@/lib/catalogue-server';
import { getTrack, resolveTrackDayObjects } from '@/lib/catalogue';
import { readProgress, getActiveTrackId } from '@/lib/progress-server';
import { computeStats, currentSkills } from '@/lib/progress-stats';
import { resumeReasonText, countStatuses } from '@/lib/resume';
import { progressPosition } from '@/lib/position';
import { reviewSummary, getDueReviews } from '@/lib/review';
import { nextBestActions } from '@/lib/learning-experience';
import { PageHeader, SectionHeader, Status, Metric, Panel, ActionRow, EmptyState, PrimaryFocus } from '@/app/ui';
import type { Tone } from '@/app/ui';
import StartDayButton from './StartDayButton';
import Trajectory365 from './Trajectory365';

export const dynamic = 'force-dynamic';

// Statut de journée → libellé + ton produit (jamais couleur seule).
const DAY_STATUS: Record<string, { label: string; tone: Tone }> = {
  'not-started': { label: 'Non commencé', tone: 'neutral' },
  'in-progress': { label: 'En cours', tone: 'info' },
  'done': { label: 'Terminé', tone: 'positive' },
  'to-review': { label: 'À revoir', tone: 'attention' },
};

export default function Dashboard() {
  const program = getProgram();
  const progress = readProgress();
  const catalogue = getCatalogue();
  const activeTrack = getTrack(catalogue, getActiveTrackId()) ?? catalogue.tracks[0];
  // Jours du PARCOURS ACTIF. Toutes les positions/compteurs en découlent.
  const trackDays = resolveTrackDayObjects(catalogue, activeTrack, program);
  const stats = computeStats(trackDays, progress);
  const counts = countStatuses(trackDays, progress);
  const pos = progressPosition(trackDays, progress);
  const percent = pos.total ? Math.round((pos.currentProgressPosition / pos.total) * 100) : 0;
  const resumeDay = program.days.find((d) => d.day === pos.resumeDay);
  const resumeStatus = progress.days[String(pos.resumeDay)]?.status ?? 'not-started';
  const st = DAY_STATUS[resumeStatus] ?? DAY_STATUS['not-started'];
  const skillIds = currentSkills(program, pos.resumeDay);
  const skillNames = program.skills.filter((s) => skillIds.includes(s.id)).map((s) => s.name);
  const currentMonth = program.months.find((m) => m.month === resumeDay?.month);
  const started = resumeStatus !== 'not-started';
  const reviews = reviewSummary(progress.days);
  // « Que faire ensuite » : actions dérivées (read-model), hors reprise.
  const nextActions = nextBestActions(program, progress, { reviews: getDueReviews(progress.days), limit: 4 })
    .filter((a) => a.kind !== 'resume');
  // Dernière preuve ajoutée (toutes journées confondues).
  let lastEvidence: { day: number; title: string } | null = null;
  let lastAt = '';
  for (const k of Object.keys(progress.days)) {
    for (const e of (progress.days[k]?.evidence ?? [])) {
      if (typeof e.createdAt === 'string' && e.createdAt > lastAt) { lastAt = e.createdAt; lastEvidence = { day: Number(k), title: e.title }; }
    }
  }
  // Ton du rythme (dérivé, jamais couleur seule : accompagné d'un libellé).
  const paceTone: Tone = pos.complete ? 'positive' : pos.delay > 0 ? 'attention' : pos.ahead > 0 ? 'accent' : 'positive';
  const paceLabel = pos.expectedDay === null ? '—' : pos.complete ? 'Terminé'
    : pos.delay > 0 ? `${pos.delay} j de retard` : pos.ahead > 0 ? `${pos.ahead} j d'avance` : 'À jour';

  return (
    <>
      <PageHeader
        eyebrow={<>Mission control <span className="sep">/</span> jour {pos.resumeDay} sur {pos.total}</>}
        title="Tableau de bord"
        sub={<>Programme de 12 mois vers des rôles IA appliquée.{progress.startDate ? ` Commencé le ${progress.startDate}.` : ' Lance ta première journée pour démarrer.'}</>}
      />

      <p className="track-hint">
        <Route size={13} strokeWidth={2} /> Parcours actif : <strong>{activeTrack.title}</strong>
        <span className="sep">·</span> <Link href="/parcours">gérer les parcours</Link>
      </p>

      <div className="dash-cols">
        {/* Colonne principale : reprise + prochaines actions + trajectoire */}
        <div className="dash-main">
          <PrimaryFocus
            eyebrow={<>{pos.resumeReason === 'complete' ? 'Programme terminé' : started ? 'Reprendre où j\'en suis' : 'Commencer maintenant'} <span className="sep">·</span> jour {pos.resumeDay} / {pos.total}</>}
            status={
              <>
                {resumeDay?.isReview && <Status tone="attention" label="Revue hebdo" />}
                <Status tone={st.tone} label={st.label} />
              </>
            }
            title={resumeDay?.title}
            meta={
              <>
                <Status tone="accent" label={resumeDay?.skillName ?? '—'} />
                <span className="ui-focus-fact"><span className="ui-focus-fact-k">Difficulté</span> {resumeDay?.difficulty}/5</span>
                <span className="ui-focus-fact"><span className="ui-focus-fact-k">Durée</span> {resumeDay?.hours} h</span>
                <span className="ui-focus-fact"><span className="ui-focus-fact-k">Repères</span> Mois {resumeDay?.month} · Sem. {resumeDay?.week}</span>
              </>
            }
            reason={resumeReasonText(pos.resumeReason)}
            actions={
              <>
                <StartDayButton day={pos.resumeDay} label={started ? `Reprendre le jour ${pos.resumeDay}` : `Commencer le jour ${pos.resumeDay}`} className="btn cta" />
                <Link className="btn" href={`/day/${pos.resumeDay}`}>Ouvrir la vue du jour</Link>
              </>
            }
          />

          {nextActions.length > 0 && (
            <section className="section lx-next">
              <SectionHeader label="Que faire ensuite" title="Prochaines actions" note="dérivé de tes preuves & révisions" />
              <ul className="lx-next-list">
                {nextActions.map((a, i) => (
                  <ActionRow
                    key={i}
                    kind={a.kind}
                    href={a.href}
                    action={a.action}
                    reason={a.reason}
                    goal={<>{a.goal} · preuve : {a.expectedEvidence}</>}
                  />
                ))}
              </ul>
            </section>
          )}

          <section className="section">
            <SectionHeader label="Trajectoire" title={`${pos.total} jours`} note={`${percent}% · ${counts.done}/${counts.total} jours`} />
            <Trajectory365 days={trackDays} progress={progress} currentDay={pos.resumeDay} />
          </section>

          <div className="side-block progress-block">
            <div className="stat-k">Progression globale</div>
            <div className="progress-line"><span className="stat-v">{percent}%</span><span className="stat-sub">{counts.done} / {counts.total} jours terminés</span></div>
            <div className="progressbar" style={{ marginTop: 8 }}><div style={{ width: `${percent}%` }} /></div>
          </div>
        </div>

        {/* Colonne secondaire : révisions (primaire) puis pilotage sobre */}
        <aside className="dash-side" aria-label="Pilotage">
          <Panel
            label="Révisions"
            emphasis={reviews.dueToday > 0}
            footer={
              <Link className={`btn small${reviews.dueToday > 0 ? ' primary' : ''}`} href="/revisions">
                {reviews.dueToday > 0 ? 'Réviser maintenant' : 'Ouvrir les révisions'}
              </Link>
            }
          >
            <Metric
              label="À revoir aujourd'hui"
              value={reviews.dueToday}
              tone={reviews.dueToday > 0 ? 'attention' : undefined}
              sub={reviews.overdue > 0 ? `${reviews.overdue} en retard` : (reviews.next ? `prochaine : jour ${reviews.next.day} dans ${reviews.next.inDays} j` : 'aucune révision planifiée')}
            />
          </Panel>

          <Panel label="Rythme">
            <Metric label="Cadence" value={paceLabel} tone={paceTone}
              sub={pos.expectedDay === null ? 'compteur non démarré' : `attendu jour ${pos.expectedDay}${pos.nextIncompleteDay ? ` · à faire jour ${pos.nextIncompleteDay}` : ''}`} />
            <div className="ui-panel-sep" />
            <Metric label="En cours / à revoir" value={counts['in-progress'] + counts['to-review']}
              sub={`${counts['in-progress']} en cours · ${counts['to-review']} à revoir`} />
          </Panel>

          <Panel label="Prochain livrable">
            {stats.nextDeliverable ? (
              <>
                <div className="dash-strong"><Link href={`/day/${stats.nextDeliverable.day}`}>Jour {stats.nextDeliverable.day}</Link> — {stats.nextDeliverable.title}</div>
                <p className="dash-note">{stats.nextDeliverable.deliverable}</p>
              </>
            ) : <EmptyState title="Tous les livrables sont faits." hint="Rien à produire pour l'instant." />}
          </Panel>

          <Panel label="Compétences actives">
            <div className="row" style={{ gap: 6 }}>
              {skillNames.length ? skillNames.map((n) => <Status key={n} tone="accent" label={n} />) : <span className="muted">—</span>}
            </div>
            <div className="ui-panel-sep" />
            <div className="ui-panel-label">Dernière preuve</div>
            {lastEvidence ? (
              <div className="dash-strong"><Link href={`/day/${lastEvidence.day}`}>Jour {lastEvidence.day}</Link> — {lastEvidence.title}</div>
            ) : <p className="dash-note">Aucune preuve enregistrée pour l'instant.</p>}
          </Panel>

          <Panel
            label={`Mois ${currentMonth?.month} / 12`}
            footer={
              <div className="row" style={{ gap: 8 }}>
                <Link className="btn small" href={`/month/${currentMonth?.month}`}>Voir le mois</Link>
                <Link className="btn small" href={`/week/${resumeDay?.week}`}>Semaine {resumeDay?.week}</Link>
              </div>
            }
          >
            <div className="dash-strong">{currentMonth?.title}</div>
            <p className="dash-note">{currentMonth?.summary}</p>
          </Panel>

          <nav className="dash-quick" aria-label="Accès rapides">
            <Link className="btn small" href="/calendar"><CalendarDays size={14} /> Calendrier</Link>
            <Link className="btn small" href="/projects"><FolderGit2 size={14} /> Projets</Link>
            <Link className="btn small" href="/reviews"><ClipboardCheck size={14} /> Évaluations</Link>
            <Link className="btn small" href="/notes"><NotebookPen size={14} /> Notes</Link>
          </nav>
        </aside>
      </div>
    </>
  );
}
