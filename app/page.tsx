import Link from 'next/link';
import { getProgram } from '@/lib/program';
import { readProgress } from '@/lib/progress-server';
import { computeStats, currentSkills } from '@/lib/progress-stats';
import StartDayButton from './StartDayButton';
import BackupControls from './BackupControls';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = {
  'not-started': 'Non commencé', 'in-progress': 'En cours', 'done': 'Terminé', 'to-review': 'À revoir',
};

export default function Dashboard() {
  const program = getProgram();
  const progress = readProgress();
  const stats = computeStats(program, progress);
  const skillIds = currentSkills(program, stats.currentDay);
  const skillNames = program.skills.filter((s) => skillIds.includes(s.id)).map((s) => s.name);
  const current = program.days.find((d) => d.day === stats.currentDay);
  const currentMonth = program.months.find((m) => m.month === current?.month);

  return (
    <>
      <h1>Dashboard</h1>
      <p className="subtitle">
        Ton programme de 12 mois pour devenir employable sur des rôles IA appliquée.
        {progress.startDate
          ? ` Commencé le ${progress.startDate}.`
          : ' Clique sur « Commencer la journée » pour démarrer le compteur.'}
      </p>

      <div className="grid cols-4">
        <div className="card">
          <h3>Progression globale</h3>
          <div className="big">{stats.percent}%</div>
          <div className="progressbar" style={{ marginTop: 8 }}>
            <div style={{ width: `${stats.percent}%` }} />
          </div>
          <div className="sub" style={{ marginTop: 6 }}>{stats.completedDays} / {stats.totalDays} jours</div>
        </div>
        <div className="card">
          <h3>Jour actuel</h3>
          <div className="big">J{stats.currentDay}</div>
          <div className="sub">Mois {current?.month} · Semaine {current?.week}</div>
        </div>
        <div className="card">
          <h3>En cours / À revoir</h3>
          <div className="big">{stats.inProgressDays + stats.toReviewDays}</div>
          <div className="sub">{stats.inProgressDays} en cours · {stats.toReviewDays} à revoir</div>
        </div>
        <div className="card">
          <h3>Retard éventuel</h3>
          <div className="big" style={{ color: stats.delay > 0 ? 'var(--warn)' : 'var(--accent-2)' }}>
            {stats.expectedDay === null ? '—' : stats.delay > 0 ? `${stats.delay} j` : 'à jour'}
          </div>
          <div className="sub">
            {stats.expectedDay === null ? 'démarre le compteur' : `attendu : J${stats.expectedDay}`}
          </div>
        </div>
      </div>

      <div className="spacer" />

      <div className="grid cols-2">
        <div className="card">
          <h3>Aujourd'hui — Jour {stats.currentDay}</h3>
          <div style={{ fontSize: 18, fontWeight: 600, margin: '6px 0' }}>{current?.title}</div>
          <div className="row" style={{ margin: '8px 0' }}>
            {current?.isReview && <span className="badge review">Revue hebdo</span>}
            <span className="badge accent">{current?.skillName}</span>
            <span className="badge">Difficulté {current?.difficulty}/5</span>
            <span className="badge">{current?.hours} h</span>
          </div>
          <p className="sub">
            Statut : {STATUS_LABEL[progress.days[String(stats.currentDay)]?.status ?? 'not-started']}
          </p>
          <div className="row" style={{ marginTop: 12 }}>
            <StartDayButton day={stats.currentDay} />
            <Link className="btn" href={`/day/${stats.currentDay}`}>Ouvrir la vue du jour</Link>
          </div>
        </div>

        <div className="card">
          <h3>Compétences travaillées cette semaine</h3>
          <div className="row" style={{ margin: '8px 0' }}>
            {skillNames.length
              ? skillNames.map((n) => <span key={n} className="badge accent">{n}</span>)
              : <span className="muted">—</span>}
          </div>
          <h3 style={{ marginTop: 16 }}>Prochain livrable</h3>
          {stats.nextDeliverable ? (
            <>
              <div className="sub">
                <Link href={`/day/${stats.nextDeliverable.day}`}>Jour {stats.nextDeliverable.day}</Link> — {stats.nextDeliverable.title}
              </div>
              <p style={{ marginTop: 4 }}>{stats.nextDeliverable.deliverable}</p>
            </>
          ) : (
            <p className="muted">Tous les livrables sont faits 🎉</p>
          )}
        </div>
      </div>

      <div className="spacer" />

      <div className="card">
        <h3>Mois {currentMonth?.month} — {currentMonth?.title}</h3>
        <p className="sub">{currentMonth?.summary}</p>
        <div className="row" style={{ marginTop: 8 }}>
          <Link className="btn small" href={`/month/${currentMonth?.month}`}>Voir le mois</Link>
          <Link className="btn small" href={`/week/${current?.week}`}>Voir la semaine {current?.week}</Link>
          {currentMonth?.project && (
            <Link className="btn small" href={`/projects`}>Projet du mois : {currentMonth.project.name}</Link>
          )}
        </div>
      </div>

      <div className="spacer" />

      <div className="card">
        <h3>Sauvegarde de ma progression</h3>
        <p className="sub">
          Ta progression vit dans <code>data/progress.json</code>. Exporte-la régulièrement (surtout avant une mise à jour) ; restaure-la depuis un fichier exporté.
        </p>
        <BackupControls />
      </div>
    </>
  );
}
