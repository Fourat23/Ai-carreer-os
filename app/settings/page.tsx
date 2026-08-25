import { readProgress, listTracks, getActiveTrackId } from '@/lib/progress-server';
import { backupStats } from '@/lib/backup';
import { getCatalogue } from '@/lib/catalogue-server';
import { getTrack } from '@/lib/catalogue';
import { SurfaceHead } from '@/app/ui';
import SettingsPanel from './SettingsPanel';

export const dynamic = 'force-dynamic';

// V58 · CP8 — Le CP0 mesurait ici ZÉRO bloc structurant : `topBlocks = 0`,
// `dominance = 0`, 3 fonds, aucune ombre. La page empilait un en-tête, une
// bande de statistiques et un panneau, sans aucune section.
//
// Composition de paramètres : catégories → état → contrôles → explication.
// Aucune préférence n'est inventée : les seuls réglages du produit sont le
// parcours actif et la sauvegarde, et ce sont ceux qui figurent ici.
export default function SettingsPage() {
  const stats = backupStats(readProgress());
  const tracks = listTracks();
  const activeTrack = getTrack(getCatalogue(), getActiveTrackId());
  const activeTitle = activeTrack?.title ?? getActiveTrackId();

  return (
    <div className="set">
      <SurfaceHead
        kind="detail"
        eyebrow={<>Outils <span className="sep">/</span> données locales</>}
        title="Sauvegarde des données"
        lead={<>AI Career OS est strictement local : ta progression vit dans <code>data/progress.json</code>,
          sur cette machine et nulle part ailleurs. Rien n’est envoyé, rien n’est synchronisé —
          c’est donc à toi d’exporter régulièrement.</>}
        facts={[
          { k: 'Jours suivis', v: stats.daysTracked },
          { k: 'Terminés', v: stats.done },
          stats.notes > 0 && { k: 'Notes', v: stats.notes },
        ]}
      />

      {/* ── ÉTAT : ce que contient réellement la sauvegarde ───────────────── */}
      <section className="set-group" aria-label="Contenu de la sauvegarde">
        <div className="set-group-head">
          <h2 className="set-h">Ce que contient ta progression</h2>
          <span className="set-h-note">lu depuis le fichier local, jamais estimé</span>
        </div>
        <dl className="set-facts">
          <div><dt>Jours suivis</dt><dd>{stats.daysTracked}</dd></div>
          <div><dt>Journées terminées</dt><dd>{stats.done}</dd></div>
          <div><dt>Notes et réponses</dt><dd>{stats.notes}</dd></div>
          <div><dt>Compétences notées</dt><dd>{stats.skillsRated}</dd></div>
        </dl>
      </section>

      {/* ── PARCOURS : le seul réglage du produit qui change ce qu'on voit ── */}
      <section className="set-group" aria-label="Parcours">
        <div className="set-group-head">
          <h2 className="set-h">Parcours</h2>
          <span className="set-h-note">{tracks.length} suivi{tracks.length > 1 ? 's' : ''}</span>
        </div>
        <p className="set-text">
          Parcours actif : <strong>{activeTitle}</strong>. L’export ne contient que la
          progression de ce parcours — changer de parcours change ce qui est exporté.
        </p>
      </section>

      {/* ── CONTRÔLES : export, import, réinitialisation ──────────────────── */}
      <section className="set-group" aria-label="Export et import">
        <div className="set-group-head">
          <h2 className="set-h">Exporter, importer, restaurer</h2>
          <span className="set-h-note">fichiers locaux uniquement</span>
        </div>
        <SettingsPanel />
      </section>
    </div>
  );
}
