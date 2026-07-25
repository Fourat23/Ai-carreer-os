import Link from 'next/link';
import { CalendarDays, NotebookPen, FolderGit2, ClipboardCheck } from 'lucide-react';
import { Route } from 'lucide-react';
import { getProgram } from '@/lib/program';
import { getCatalogue } from '@/lib/catalogue-server';
import { getTrack } from '@/lib/catalogue';
import { readProgress, getActiveTrackId } from '@/lib/progress-server';
import { computeStats, currentSkills } from '@/lib/progress-stats';
import { resumeReasonText, countStatuses } from '@/lib/resume';
import { progressPosition } from '@/lib/position';
import { reviewSummary } from '@/lib/review';
import StartDayButton from './StartDayButton';
import Trajectory365 from './Trajectory365';

export const dynamic = 'force-dynamic';

const STATUS: Record<string, { label: string; cls: string }> = {
  'not-started': { label: 'Non commencé', cls: 'idle' },
  'in-progress': { label: 'En cours', cls: 'prog' },
  'done': { label: 'Terminé', cls: 'ok' },
  'to-review': { label: 'À revoir', cls: 'warn' },
};

export default function Dashboard() {
  const program = getProgram();
  const progress = readProgress();
  const catalogue = getCatalogue();
  const activeTrack = getTrack(catalogue, getActiveTrackId()) ?? catalogue.tracks[0];
  const stats = computeStats(program, progress);          // livrable suivant
  const counts = countStatuses(program.days, progress);
  const pos = progressPosition(program.days, progress);   // source de vérité des positions
  const percent = pos.total ? Math.round((pos.currentProgressPosition / pos.total) * 100) : 0;
  const resumeDay = program.days.find((d) => d.day === pos.resumeDay);
  const resumeStatus = progress.days[String(pos.resumeDay)]?.status ?? 'not-started';
  const st = STATUS[resumeStatus] ?? STATUS['not-started'];
  const skillIds = currentSkills(program, pos.resumeDay);
  const skillNames = program.skills.filter((s) => skillIds.includes(s.id)).map((s) => s.name);
  const currentMonth = program.months.find((m) => m.month === resumeDay?.month);
  const started = resumeStatus !== 'not-started';
  const reviews = reviewSummary(progress.days);
  // Dernière preuve ajoutée (toutes journées confondues).
  let lastEvidence: { day: number; title: string } | null = null;
  let lastAt = '';
  for (const k of Object.keys(progress.days)) {
    for (const e of (progress.days[k]?.evidence ?? [])) {
      if (typeof e.createdAt === 'string' && e.createdAt > lastAt) { lastAt = e.createdAt; lastEvidence = { day: Number(k), title: e.title }; }
    }
  }

  return (
    <>
      <div className="page-head">
        <div className="page-head-main">
          <p className="page-eyebrow">Mission control <span className="sep">/</span> jour {pos.resumeDay} sur 365</p>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-sub">
            Programme de 12 mois vers des rôles IA appliquée.
            {progress.startDate ? ` Commencé le ${progress.startDate}.` : ' Lance ta première journée pour démarrer.'}
          </p>
        </div>
      </div>

      <p className="track-hint">
        <Route size={13} strokeWidth={2} /> Parcours actif : <strong>{activeTrack.title}</strong>
        <span className="sep">·</span> <Link href="/parcours">gérer les parcours</Link>
      </p>

      <div className="dash-cols">
        {/* Colonne principale : reprise + trajectoire + progression */}
        <div className="dash-main">
          <section className="resume">
            <div className="resume-main">
              <p className="resume-eyebrow">{pos.resumeReason === 'complete' ? 'Programme terminé' : started ? 'Reprendre où j\'en suis' : 'Commencer'}</p>
              <div className="resume-line">
                <span className="resume-day">Jour {pos.resumeDay}</span>
                <span className={`day-status ${st.cls}`}>{st.label}</span>
              </div>
              <h2 className="resume-title">{resumeDay?.title}</h2>
              <div className="resume-meta">
                {resumeDay?.isReview && <span className="badge review">Revue hebdo</span>}
                <span className="day-skill">{resumeDay?.skillName}</span>
                <dl className="day-data">
                  <div><dt>Difficulté</dt><dd>{resumeDay?.difficulty}/5</dd></div>
                  <div><dt>Durée</dt><dd>{resumeDay?.hours} h</dd></div>
                  <div><dt>Repères</dt><dd>Mois {resumeDay?.month} · Semaine {resumeDay?.week}</dd></div>
                </dl>
              </div>
              <p className="resume-why">{resumeReasonText(pos.resumeReason)}</p>
            </div>
            <div className="resume-actions">
              <StartDayButton day={pos.resumeDay} label={started ? `Reprendre le jour ${pos.resumeDay}` : `Commencer le jour ${pos.resumeDay}`} />
              <Link className="btn" href={`/day/${pos.resumeDay}`}>Ouvrir la vue du jour</Link>
            </div>
          </section>

          <section className="section">
            <div className="section-head">
              <span className="section-label">Trajectoire</span>
              <h2 className="section-title">365 jours</h2>
              <span className="section-note">{percent}% · {counts.done}/{counts.total} jours</span>
            </div>
            <Trajectory365 program={program} progress={progress} currentDay={pos.resumeDay} />
          </section>

          <div className="side-block progress-block">
            <div className="stat-k">Progression globale</div>
            <div className="progress-line"><span className="stat-v">{percent}%</span><span className="stat-sub">{counts.done} / {counts.total} jours terminés</span></div>
            <div className="progressbar" style={{ marginTop: 8 }}><div style={{ width: `${percent}%` }} /></div>
          </div>
        </div>

        {/* Colonne secondaire : rythme, livrable, compétences, mois, accès */}
        <aside className="dash-side" aria-label="Pilotage">
          <div className="side-block rev-block">
            <div className="stat-k">Révisions</div>
            <div className="rev-nums">
              <span className={`rev-due${reviews.dueToday > 0 ? ' has' : ''}`}>{reviews.dueToday}</span>
              <span className="stat-sub">à revoir aujourd'hui{reviews.overdue > 0 ? ` · ${reviews.overdue} en retard` : ''}</span>
            </div>
            <div className="stat-sub" style={{ marginBottom: 10 }}>
              {reviews.next ? `Prochaine : jour ${reviews.next.day} dans ${reviews.next.inDays} j` : 'Aucune révision planifiée'}
            </div>
            <Link className={`btn small${reviews.dueToday > 0 ? ' primary' : ''}`} href="/revisions">
              {reviews.dueToday > 0 ? 'Réviser maintenant' : 'Ouvrir les révisions'}
            </Link>
          </div>
          <div className="side-block">
            <div className="stat-k">Rythme</div>
            <div className="stat-v sm" style={{ color: pos.complete ? 'var(--ok)' : pos.delay > 0 ? 'var(--warn)' : pos.ahead > 0 ? 'var(--accent)' : 'var(--ok)' }}>
              {pos.expectedDay === null ? '—' : pos.complete ? 'Terminé' : pos.delay > 0 ? `${pos.delay} j de retard` : pos.ahead > 0 ? `${pos.ahead} j d'avance` : 'À jour'}
            </div>
            <div className="stat-sub">
              {pos.expectedDay === null ? 'compteur non démarré' : `attendu jour ${pos.expectedDay}${pos.nextIncompleteDay ? ` · à faire jour ${pos.nextIncompleteDay}` : ''}`}
            </div>
            <div className="side-sep" />
            <div className="stat-k">En cours / à revoir</div>
            <div className="stat-v sm">{counts['in-progress'] + counts['to-review']}</div>
            <div className="stat-sub">{counts['in-progress']} en cours · {counts['to-review']} à revoir</div>
          </div>

          <div className="side-block">
            <div className="stat-k">Prochain livrable</div>
            {stats.nextDeliverable ? (
              <>
                <div className="dash-strong"><Link href={`/day/${stats.nextDeliverable.day}`}>Jour {stats.nextDeliverable.day}</Link> — {stats.nextDeliverable.title}</div>
                <p className="dash-note">{stats.nextDeliverable.deliverable}</p>
              </>
            ) : <span className="muted">Tous les livrables sont faits.</span>}
          </div>

          <div className="side-block">
            <div className="stat-k">Compétences actives</div>
            <div className="row" style={{ gap: 6, marginTop: 6 }}>
              {skillNames.length ? skillNames.map((n) => <span key={n} className="badge accent">{n}</span>) : <span className="muted">—</span>}
            </div>
            <div className="side-sep" />
            <div className="stat-k">Dernière preuve</div>
            {lastEvidence ? (
              <div className="dash-strong" style={{ marginTop: 4 }}>
                <Link href={`/day/${lastEvidence.day}`}>Jour {lastEvidence.day}</Link> — {lastEvidence.title}
              </div>
            ) : <p className="dash-note" style={{ marginTop: 4 }}>Aucune preuve enregistrée pour l'instant.</p>}
          </div>

          <div className="side-block">
            <div className="stat-k">Mois {currentMonth?.month} / 12</div>
            <div className="dash-strong">{currentMonth?.title}</div>
            <p className="dash-note">{currentMonth?.summary}</p>
            <div className="row" style={{ gap: 8, marginTop: 10 }}>
              <Link className="btn small" href={`/month/${currentMonth?.month}`}>Voir le mois</Link>
              <Link className="btn small" href={`/week/${resumeDay?.week}`}>Semaine {resumeDay?.week}</Link>
            </div>
          </div>

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
