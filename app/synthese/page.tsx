import Link from 'next/link';
import { Route, Check, Eye } from 'lucide-react';
import { getProgram } from '@/lib/program';
import { getCatalogue } from '@/lib/catalogue-server';
import { readProgressV3 } from '@/lib/progress-server';
import { aggregateTracks } from '@/lib/track-aggregate';
import TrackActions from '../parcours/TrackActions';

export const dynamic = 'force-dynamic';

// Vue AGRÉGÉE multi-parcours — LECTURE SEULE. Distincte du Tableau de bord (qui
// concerne le parcours actif). Ne contient aucune action de progression ; la
// seule mutation possible est la BASCULE de parcours, via le flux TrackActions
// existant (avec confirmation). N'écrit jamais dans les parcours.
export default function SynthesePage() {
  const program = getProgram();
  const catalogue = getCatalogue();
  const rows = aggregateTracks(catalogue, readProgressV3(), program);

  return (
    <>
      <div className="page-head page-wide">
        <div className="page-head-main">
          <p className="page-eyebrow">Pilotage <span className="sep">/</span> vue d’ensemble multi-parcours</p>
          <h1 className="page-title">Synthèse des parcours</h1>
          <p className="page-sub">
            Comparaison des parcours disponibles, chacun avec sa progression propre.
            <span className="synth-ro"><Eye size={13} strokeWidth={2} /> Lecture seule — aucune action de progression ici.</span>
          </p>
        </div>
      </div>

      <ul className="synth-grid page-wide" aria-label="Synthèse des parcours (lecture seule)">
        {rows.map((r) => (
          <li key={r.trackId} className={`synth-card${r.active ? ' active' : ''}`}>
            <div className="synth-head">
              <Route size={16} strokeWidth={2} />
              <h2 className="synth-title">{r.title}</h2>
              {r.active
                ? <span className="track-badge active"><Check size={13} /> Actif</span>
                : <span className="track-badge">Disponible</span>}
            </div>

            <div className="synth-prog">
              <div className="dp-track" aria-hidden="true"><span style={{ width: `${r.percent}%` }} /></div>
              <span className="synth-prog-label">{r.completedDays}/{r.totalDays} jours · {r.percent}%</span>
            </div>

            <dl className="synth-metrics">
              <div><dt>Reprise</dt><dd>{r.resumeDay != null ? <Link href={`/day/${r.resumeDay}`}>Jour {r.resumeDay}</Link> : '—'}</dd></div>
              <div><dt>En cours</dt><dd>{r.inProgress}</dd></div>
              <div><dt>À revoir</dt><dd>{r.toReview}</dd></div>
              <div><dt>Révisions dues</dt><dd>{r.reviewsDue}</dd></div>
              <div><dt>Compétences</dt><dd>{r.skillsCount}</dd></div>
              <div><dt>État</dt><dd>{r.complete ? 'Terminé' : r.started ? 'En cours' : 'Non démarré'}</dd></div>
            </dl>

            {r.lastEvidence && (
              <p className="synth-evidence">
                Dernière preuve : <Link href={`/day/${r.lastEvidence.day}`}>Jour {r.lastEvidence.day}</Link> — {r.lastEvidence.title}
              </p>
            )}

            <div className="synth-actions">
              <TrackActions trackId={r.trackId} active={r.active} available hasActiveOther={!r.active} />
              <Link className="synth-open" href="/parcours">Détails du parcours →</Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
