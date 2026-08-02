import Link from 'next/link';
import { listMissions, missionProgressFor } from '@/lib/missions-server';
import { readProgress } from '@/lib/progress-server';
import { getActiveTrackId } from '@/lib/progress-server';

export const dynamic = 'force-dynamic';

const CAT_LABEL: Record<string, string> = {
  'debt-maintenance': 'Dette & maintenance',
  performance: 'Performance',
  documentation: 'Documentation',
  incident: 'Incident & post-mortem',
};
const STATUS_LABEL: Record<string, string> = {
  'not-started': 'À commencer',
  'in-progress': 'En cours',
  'deliverables-incomplete': 'Livrables incomplets',
  'ready-for-review': 'Prêt pour revue',
  done: 'Terminé',
};

export default function MissionsPage() {
  const flat = readProgress();
  const activeTrack = getActiveTrackId();
  const missions = listMissions().filter((m) => m.status === 'published');

  return (
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow">Missions d'ingénierie</p>
        <h1>Missions</h1>
        <p className="page-sub">
          Des scénarios réalistes : analyser, diagnostiquer, arbitrer, modifier sous contrôle,
          mesurer, produire des livrables. Chaque livrable indique s'il est <strong>auto-corrigé</strong>,
          <strong> validé structurellement</strong> ou soumis à <strong>revue humaine</strong>.
          Les preuves sont créées dans le parcours actif ({activeTrack}).
        </p>
      </header>
      <ul className="mission-list">
        {missions.map((m) => {
          const prog = missionProgressFor(flat, m);
          return (
            <li key={m.id} className="card mission-card">
              <div className="mission-card-head">
                <span className="badge accent">{CAT_LABEL[m.category] ?? m.category}</span>
                <span className={`badge ${prog.status === 'done' ? 'ok' : prog.status === 'not-started' ? '' : 'review'}`}>
                  {STATUS_LABEL[prog.status] ?? prog.status}
                </span>
              </div>
              <h3><Link href={`/missions/${m.id}`}>{m.title}</Link></h3>
              <p className="mission-desc">{m.description}</p>
              <div className="mission-meta">
                <span>Difficulté {m.difficulty}/5</span>
                <span>≈ {m.estimatedHours} h</span>
                <span>{prog.requiredDone}/{prog.requiredTotal} livrables requis</span>
                <span>Jours {m.dayRefs.join(', ')}</span>
              </div>
              <div className="mission-skills">
                {m.skills.map((s) => <span key={s} className="chip">{s}</span>)}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
