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
import { curriculumPartition } from '@/lib/curriculum-partition';
import {
  PageHeader, SectionHeader, Status, Metric, Panel, ActionRow,
  HeroFocus, HeroFact, DifficultyScale, PositionRing,
} from '@/app/ui';
import type { Tone } from '@/app/ui';
import StartDayButton from './StartDayButton';
import TrajectoryMap from './TrajectoryMap';

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
  // Programme global vs parcours actif : UN seul calcul partagé avec /parcours
  // et /calendar (read-model pur), pour un vocabulaire identique partout.
  const part = curriculumPartition(program, trackDays.map((d) => d.day));
  const partial = part.inTrack < part.total;
  const monthTitles = new Map(program.months.map((m) => [m.month, m.title]));
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
        eyebrow={<>Mission control <span className="sep">/</span> {activeTrack.title}</>}
        title="Tableau de bord"
        sub={<>
          Programme global de {part.monthsTotal} mois — <strong>{part.total} jours</strong> — vers des rôles IA appliquée.
          {partial ? <> Ton parcours en couvre {part.inTrack}.</> : <> Ton parcours les couvre tous.</>}
        </>}
      />

      {/* ── HERO — le point focal dominant de la page (V55).
          Avant : le focus était un panneau à peine plus haut que ses voisins
          (rapport de surface 1er/2e bloc mesuré à 1,20). Il occupe désormais la
          pleine largeur et porte le cran typographique `display`.
          L'aparté ne contient AUCUN ornement : anneau de position (progression
          réelle + graduations = mois réels), difficulté et durée de la journée. */}
      <HeroFocus
        eyebrow={<>{pos.resumeReason === 'complete' ? 'Programme terminé' : started ? 'Reprendre où j’en suis' : 'Commencer maintenant'}</>}
        status={
          <>
            {resumeDay?.isReview && <Status tone="attention" label="Revue hebdo" />}
            <Status tone={st.tone} label={st.label} />
          </>
        }
        title={resumeDay?.title}
        lead={resumeReasonText(pos.resumeReason)}
        meta={
          <>
            <Status tone="accent" label={resumeDay?.skillName ?? '—'} />
            <HeroFact k="Difficulté">
              <DifficultyScale value={resumeDay?.difficulty ?? 0} />
              <span className="ui-diff-n">{resumeDay?.difficulty}/5</span>
            </HeroFact>
            <HeroFact k="Durée">{resumeDay?.hours} h</HeroFact>
            <HeroFact k="Repères">Mois {resumeDay?.month} · Semaine {resumeDay?.week}</HeroFact>
          </>
        }
        actions={
          <>
            <StartDayButton day={pos.resumeDay} label={started ? `Reprendre le jour ${pos.resumeDay}` : `Commencer le jour ${pos.resumeDay}`} className="btn cta" />
            <Link className="btn" href={`/day/${pos.resumeDay}`}>Ouvrir la vue du jour</Link>
          </>
        }
        aside={
          <div className="dash-hero-aside">
            <PositionRing percent={percent} day={pos.resumeDay} total={pos.total} months={part.monthsCovered.length || part.monthsTotal} />
            <div className="dash-hero-nums">
              <span className="dash-hero-pct">{percent}%</span>
              <span className="dash-hero-pctk">{counts.done} / {counts.total} jours terminés</span>
            </div>
          </div>
        }
      />

      {/* ── CONTEXT STRIP — trajectoire réelle, compacte */}
      <div className="dash-context">
        <Link href="/parcours" className="dash-ctx-track">
          <Route size={14} strokeWidth={2} aria-hidden />
          <span className="dash-ctx-track-name">{activeTrack.title}</span>
        </Link>
        <span className="dash-ctx-sep" aria-hidden />
        {partial && (
          <>
            <span className="dash-ctx-item"><span className="dash-ctx-k">Couverture</span> {part.inTrack} des {part.total} jours</span>
            <span className="dash-ctx-sep" aria-hidden />
          </>
        )}
        <span className="dash-ctx-item"><span className="dash-ctx-k">Position</span> jour {pos.resumeDay} / {pos.total}</span>
        <span className="dash-ctx-sep" aria-hidden />
        <span className="dash-ctx-item"><span className="dash-ctx-k">Mois</span> {currentMonth?.month} / {part.monthsTotal}</span>
        <span className="dash-ctx-sep" aria-hidden />
        <span className="dash-ctx-item"><span className="dash-ctx-k">Prochaine étape</span> {currentMonth?.title}</span>
        {reviews.dueToday > 0 && (
          <span className="dash-ctx-right"><Status tone="attention" label={`${reviews.dueToday} révision(s) due(s)`} /></span>
        )}
      </div>

      <div className="dash-cols">
        {/* Colonne principale : carte de trajectoire + prochaines actions */}
        <div className="dash-main">
          <section className="dash-socle" aria-label="Trajectoire du parcours">
            <header className="dash-socle-head">
              <div className="dash-socle-title">
                <span className="section-label">Trajectoire</span>
                <h2 className="section-title">
                  {part.monthsCovered.length || part.monthsTotal} mois · {pos.total} jours
                  {partial && <span className="dash-socle-scope"> sur les {part.total} du programme</span>}
                </h2>
              </div>
              <p className="dash-socle-note">Une piste par mois. Clique une journée pour l’ouvrir.</p>
            </header>
            <TrajectoryMap days={trackDays} progress={progress} currentDay={pos.resumeDay} monthTitles={monthTitles} />
          </section>

          {nextActions.length > 0 && (
            <section className="section lx-next">
              <SectionHeader label="Que faire ensuite" title="Prochaines actions" note="dérivé de tes preuves & révisions" />
              <ul className="lx-next-list">
                {nextActions.map((a, i) => (
                  <ActionRow key={i} kind={a.kind} href={a.href} action={a.action} reason={a.reason}
                    goal={<>{a.goal} · preuve : {a.expectedEvidence}</>} />
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* ── RAIL — TROIS familles au maximum, de poids décroissant (ADR-055).
            1. alertes réellement actionnables · 2. compétences & preuves ·
            3. contexte du mois. Une famille sans donnée est réduite ou fusionnée,
            jamais réservée en hauteur. */}
        <aside className="dash-side" aria-label="Pilotage">
          <Panel
            label="Révisions & rythme"
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
            {/* Rythme FUSIONNÉ ici (au lieu d'un 4e panneau) et affiché
                uniquement si le compteur a démarré — sinon « — » = bruit. */}
            {pos.expectedDay !== null && (
              <>
                <div className="ui-panel-sep" />
                <Metric label="Cadence" value={paceLabel} tone={paceTone}
                  sub={`attendu jour ${pos.expectedDay}${pos.nextIncompleteDay ? ` · à faire jour ${pos.nextIncompleteDay}` : ''}`} />
              </>
            )}
            {counts['in-progress'] + counts['to-review'] > 0 && (
              <>
                <div className="ui-panel-sep" />
                <Metric label="En cours / à revoir" value={counts['in-progress'] + counts['to-review']}
                  sub={`${counts['in-progress']} en cours · ${counts['to-review']} à revoir`} />
              </>
            )}
          </Panel>

          <Panel label="Compétences & preuves">
            <div className="row" style={{ gap: 6 }}>
              {skillNames.length ? skillNames.map((n) => <Status key={n} tone="accent" label={n} />) : <span className="muted">—</span>}
            </div>
            <div className="ui-panel-sep" />
            <div className="ui-panel-label">Dernière preuve</div>
            {lastEvidence ? (
              <div className="dash-strong"><Link href={`/day/${lastEvidence.day}`}>Jour {lastEvidence.day}</Link> — {lastEvidence.title}</div>
            ) : <p className="dash-note">Aucune preuve enregistrée pour l&apos;instant.</p>}
            {/* Prochain livrable : masqué s'il désigne la journée DÉJÀ en focus
                (anti-redondance) ; fusionné ici plutôt qu'en panneau séparé. */}
            {stats.nextDeliverable && stats.nextDeliverable.day !== pos.resumeDay && (
              <>
                <div className="ui-panel-sep" />
                <div className="ui-panel-label">Prochain livrable</div>
                <div className="dash-strong"><Link href={`/day/${stats.nextDeliverable.day}`}>Jour {stats.nextDeliverable.day}</Link> — {stats.nextDeliverable.title}</div>
                <p className="dash-note">{stats.nextDeliverable.deliverable}</p>
              </>
            )}
          </Panel>

          {/* Contexte du mois : remonté du pied de page vers le rail. Il donne au
              rail une troisième famille RÉELLE et évite la colonne vide mesurée
              en V54.2.1 (déséquilibre de 516 px à 1440). */}
          <Panel label={`Mois ${currentMonth?.month} / ${part.monthsTotal} · Semaine ${resumeDay?.week}`}>
            <div className="dash-strong">{currentMonth?.title}</div>
            <p className="dash-note">{currentMonth?.summary}</p>
            <div className="row" style={{ gap: 8, marginTop: 'var(--sp-3)' }}>
              <Link className="btn small" href={`/month/${currentMonth?.month}`}>Voir le mois</Link>
              <Link className="btn small" href={`/week/${resumeDay?.week}`}>Semaine {resumeDay?.week}</Link>
            </div>
          </Panel>
        </aside>
      </div>

      {/* ── Accès rapides : bande basse pleine largeur, poids faible */}
      <nav className="dash-quickbar" aria-label="Accès rapides">
        <Link className="dash-quicklink" href="/calendar"><CalendarDays size={15} aria-hidden /> Calendrier</Link>
        <Link className="dash-quicklink" href="/projects"><FolderGit2 size={15} aria-hidden /> Projets</Link>
        <Link className="dash-quicklink" href="/reviews"><ClipboardCheck size={15} aria-hidden /> Évaluations</Link>
        <Link className="dash-quicklink" href="/notes"><NotebookPen size={15} aria-hidden /> Notes</Link>
      </nav>
    </>
  );
}
