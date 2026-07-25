import Link from 'next/link';
import { CalendarDays, NotebookPen, FolderGit2, ClipboardCheck } from 'lucide-react';
import { getProgram } from '@/lib/program';
import { readProgress } from '@/lib/progress-server';
import { computeStats, currentSkills } from '@/lib/progress-stats';
import { resumeReasonText, countStatuses } from '@/lib/resume';
import { progressPosition } from '@/lib/position';
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

      {/* Zone principale — la bonne journée, et pourquoi */}
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

      {/* Trajectoire 365 — signature */}
      <section className="section">
        <div className="section-head">
          <span className="section-label">Trajectoire</span>
          <h2 className="section-title">365 jours</h2>
          <span className="section-note">{percent}% · {counts.done}/{counts.total} jours</span>
        </div>
        <Trajectory365 program={program} progress={progress} currentDay={pos.resumeDay} />
      </section>

      {/* Pilotage récent */}
      <div className="stat-strip">
        <div className="stat">
          <div className="stat-k">Progression</div>
          <div className="stat-v">{percent}%</div>
          <div className="progressbar" style={{ margin: '8px 0 6px' }}><div style={{ width: `${percent}%` }} /></div>
          <div className="stat-sub">{counts.done} / {counts.total} jours</div>
        </div>
        <div className="stat">
          <div className="stat-k">En cours / à revoir</div>
          <div className="stat-v">{counts['in-progress'] + counts['to-review']}</div>
          <div className="stat-sub">{counts['in-progress']} en cours · {counts['to-review']} à revoir</div>
        </div>
        <div className="stat">
          <div className="stat-k">Rythme</div>
          <div className="stat-v sm" style={{ color: pos.complete ? 'var(--ok)' : pos.delay > 0 ? 'var(--warn)' : pos.ahead > 0 ? 'var(--accent)' : 'var(--ok)' }}>
            {pos.expectedDay === null ? '—' : pos.complete ? 'Terminé' : pos.delay > 0 ? `${pos.delay} j de retard` : pos.ahead > 0 ? `${pos.ahead} j d'avance` : 'À jour'}
          </div>
          <div className="stat-sub">
            {pos.expectedDay === null
              ? 'compteur non démarré'
              : `attendu jour ${pos.expectedDay}${pos.nextIncompleteDay ? ` · à faire jour ${pos.nextIncompleteDay}` : ''}`}
          </div>
        </div>
        <div className="stat">
          <div className="stat-k">Mois en cours</div>
          <div className="stat-v sm">{currentMonth?.month} / 12</div>
          <div className="stat-sub">{currentMonth?.title}</div>
        </div>
      </div>

      {/* Lecture d'instrument */}
      <div className="dash-panel">
        <div className="dash-row">
          <div className="dash-row-k">Prochain livrable</div>
          <div className="dash-row-v">
            {stats.nextDeliverable ? (
              <>
                <div className="dash-strong">
                  <Link href={`/day/${stats.nextDeliverable.day}`}>Jour {stats.nextDeliverable.day}</Link> — {stats.nextDeliverable.title}
                </div>
                <p className="dash-note">{stats.nextDeliverable.deliverable}</p>
              </>
            ) : <span className="muted">Tous les livrables sont faits.</span>}
          </div>
        </div>
        <div className="dash-row">
          <div className="dash-row-k">Compétences actives</div>
          <div className="dash-row-v">
            <div className="row" style={{ gap: 6 }}>
              {skillNames.length ? skillNames.map((n) => <span key={n} className="badge accent">{n}</span>) : <span className="muted">—</span>}
            </div>
          </div>
        </div>
        <div className="dash-row">
          <div className="dash-row-k">Mois {currentMonth?.month}</div>
          <div className="dash-row-v">
            <div className="dash-strong">{currentMonth?.title}</div>
            <p className="dash-note">{currentMonth?.summary}</p>
            <div className="row" style={{ gap: 8, marginTop: 10 }}>
              <Link className="btn small" href={`/month/${currentMonth?.month}`}>Voir le mois</Link>
              <Link className="btn small" href={`/week/${resumeDay?.week}`}>Semaine {resumeDay?.week}</Link>
              {currentMonth?.project && <Link className="btn small ghost" href="/projects">Projet : {currentMonth.project.name}</Link>}
            </div>
          </div>
        </div>
      </div>

      {/* Actions secondaires */}
      <nav className="dash-quick" aria-label="Accès rapides">
        <Link className="btn small" href="/calendar"><CalendarDays size={14} /> Calendrier</Link>
        <Link className="btn small" href="/projects"><FolderGit2 size={14} /> Projets</Link>
        <Link className="btn small" href="/reviews"><ClipboardCheck size={14} /> Évaluations</Link>
        <Link className="btn small" href="/notes"><NotebookPen size={14} /> Notes</Link>
      </nav>
    </>
  );
}
