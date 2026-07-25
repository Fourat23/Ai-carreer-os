import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getProgram } from '@/lib/program';
import { readProgress } from '@/lib/progress-server';
import { computeStats, currentSkills } from '@/lib/progress-stats';
import StartDayButton from './StartDayButton';
import BackupControls from './BackupControls';

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
  const stats = computeStats(program, progress);
  const skillIds = currentSkills(program, stats.currentDay);
  const skillNames = program.skills.filter((s) => skillIds.includes(s.id)).map((s) => s.name);
  const current = program.days.find((d) => d.day === stats.currentDay);
  const currentMonth = program.months.find((m) => m.month === current?.month);
  const st = STATUS[progress.days[String(stats.currentDay)]?.status ?? 'not-started'] ?? STATUS['not-started'];

  return (
    <>
      <div className="page-head">
        <div className="page-head-main">
          <p className="page-eyebrow">Pilotage <span className="sep">/</span> jour {stats.currentDay} sur 365</p>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-sub">
            Ton programme de 12 mois pour devenir employable sur des rôles IA appliquée.
            {progress.startDate
              ? ` Commencé le ${progress.startDate}.`
              : ' Lance ta première journée pour démarrer le compteur.'}
          </p>
        </div>
      </div>

      {/* Reprendre — action principale et point d'entrée du jour */}
      <section className="resume">
        <div className="resume-main">
          <p className="resume-eyebrow">Reprendre où j'en suis</p>
          <div className="resume-line">
            <span className="resume-day">Jour {stats.currentDay}</span>
            <span className={`day-status ${st.cls}`}>{st.label}</span>
          </div>
          <h2 className="resume-title">{current?.title}</h2>
          <div className="resume-meta">
            {current?.isReview && <span className="badge review">Revue hebdo</span>}
            <span className="day-skill">{current?.skillName}</span>
            <dl className="day-data">
              <div><dt>Difficulté</dt><dd>{current?.difficulty}/5</dd></div>
              <div><dt>Durée</dt><dd>{current?.hours} h</dd></div>
              <div><dt>Repères</dt><dd>Mois {current?.month} · Semaine {current?.week}</dd></div>
            </dl>
          </div>
        </div>
        <div className="resume-actions">
          <StartDayButton day={stats.currentDay} label={`Reprendre le jour ${stats.currentDay}`} />
          <Link className="btn" href={`/day/${stats.currentDay}`}>Ouvrir la vue du jour</Link>
        </div>
      </section>

      <div className="stat-strip">
        <div className="stat">
          <div className="stat-k">Progression</div>
          <div className="stat-v">{stats.percent}%</div>
          <div className="progressbar" style={{ margin: '8px 0 6px' }}><div style={{ width: `${stats.percent}%` }} /></div>
          <div className="stat-sub">{stats.completedDays} / {stats.totalDays} jours</div>
        </div>
        <div className="stat">
          <div className="stat-k">En cours / à revoir</div>
          <div className="stat-v">{stats.inProgressDays + stats.toReviewDays}</div>
          <div className="stat-sub">{stats.inProgressDays} en cours · {stats.toReviewDays} à revoir</div>
        </div>
        <div className="stat">
          <div className="stat-k">Rythme</div>
          <div className="stat-v sm" style={{ color: stats.delay > 0 ? 'var(--warn)' : 'var(--ok)' }}>
            {stats.expectedDay === null ? '—' : stats.delay > 0 ? `${stats.delay} j de retard` : 'À jour'}
          </div>
          <div className="stat-sub">{stats.expectedDay === null ? 'compteur non démarré' : `attendu : jour ${stats.expectedDay}`}</div>
        </div>
        <div className="stat">
          <div className="stat-k">Mois en cours</div>
          <div className="stat-v sm">{currentMonth?.month} / 12</div>
          <div className="stat-sub">{currentMonth?.title}</div>
        </div>
      </div>

      {/* Lecture d'instrument : livrable, compétences, mois — un seul conteneur structuré */}
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
            ) : (
              <span className="muted">Tous les livrables sont faits.</span>
            )}
          </div>
        </div>
        <div className="dash-row">
          <div className="dash-row-k">Compétences actives</div>
          <div className="dash-row-v">
            <div className="row" style={{ gap: 6 }}>
              {skillNames.length
                ? skillNames.map((n) => <span key={n} className="badge accent">{n}</span>)
                : <span className="muted">—</span>}
            </div>
          </div>
        </div>
        <div className="dash-row">
          <div className="dash-row-k">Mois {currentMonth?.month}</div>
          <div className="dash-row-v">
            <div className="dash-strong">{currentMonth?.title}</div>
            <p className="dash-note">{currentMonth?.summary}</p>
            <div className="row" style={{ gap: 8, marginTop: 10 }}>
              <Link className="btn small" href={`/month/${currentMonth?.month}`}>Voir le mois <ArrowRight size={13} /></Link>
              <Link className="btn small" href={`/week/${current?.week}`}>Semaine {current?.week}</Link>
              {currentMonth?.project && (
                <Link className="btn small ghost" href="/projects">Projet : {currentMonth.project.name}</Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="section" style={{ marginTop: 'var(--sp-8)' }}>
        <div className="section-head">
          <span className="section-label">Données</span>
          <h2 className="section-title">Sauvegarde de ma progression</h2>
        </div>
        <p className="subtitle" style={{ marginBottom: 12 }}>
          Ta progression vit dans <code>data/progress.json</code>. Exporte-la régulièrement (surtout avant une mise à jour) ; restaure-la depuis un fichier exporté.
        </p>
        <BackupControls />
      </section>
    </>
  );
}
