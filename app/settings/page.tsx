import { readProgress, listTracks, getActiveTrackId } from '@/lib/progress-server';
import { backupStats } from '@/lib/backup';
import { getCatalogue } from '@/lib/catalogue-server';
import { getTrack } from '@/lib/catalogue';
import SettingsPanel from './SettingsPanel';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const stats = backupStats(readProgress());
  const tracks = listTracks();
  const activeTrack = getTrack(getCatalogue(), getActiveTrackId());
  const activeTitle = activeTrack?.title ?? getActiveTrackId();
  return (
    <>
      <div className="page-head">
        <div className="page-head-main">
          <p className="page-eyebrow">Données <span className="sep">/</span> local uniquement</p>
          <h1 className="page-title">Sauvegarde des données</h1>
          <p className="page-sub">
            AI Career OS est strictement local : ta progression vit dans <code>data/progress.json</code>.
            Exporte-la régulièrement pour ne rien perdre.
          </p>
        </div>
      </div>

      <div className="stat-strip" style={{ marginBottom: 'var(--sp-6)' }}>
        <div className="stat"><div className="stat-k">Jours suivis</div><div className="stat-v sm">{stats.daysTracked}</div></div>
        <div className="stat"><div className="stat-k">Terminés</div><div className="stat-v sm">{stats.done}</div></div>
        <div className="stat"><div className="stat-k">Notes / réponses</div><div className="stat-v sm">{stats.notes}</div></div>
        <div className="stat"><div className="stat-k">Compétences notées</div><div className="stat-v sm">{stats.skillsRated}</div></div>
      </div>

      <p className="track-hint" style={{ marginBottom: 'var(--sp-6)' }}>
        {tracks.length} parcours suivi{tracks.length > 1 ? 's' : ''} <span className="sep">·</span> actif : <strong>{activeTitle}</strong>
        <span className="sep">·</span> l’export contient la progression du parcours actif.
      </p>

      <SettingsPanel />
    </>
  );
}
