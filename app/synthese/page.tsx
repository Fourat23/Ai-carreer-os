import Link from 'next/link';
import { Route, Check, Eye, Milestone as MilestoneIcon, Clock } from 'lucide-react';
import { getProgram } from '@/lib/program';
import { getCatalogue } from '@/lib/catalogue-server';
import { readProgress, readProgressV3 } from '@/lib/progress-server';
import { aggregateTracks } from '@/lib/track-aggregate';
import { evidenceTimeline, milestones } from '@/lib/learning-experience';
import TrackActions from '../parcours/TrackActions';

export const dynamic = 'force-dynamic';

const EV_TYPE_LABEL: Record<string, string> = {
  exercise: 'Exercice', assessment: 'Diagnostic', capstone: 'Capstone', mission: 'Mission',
  project: 'Projet', repo: 'Dépôt', demo: 'Démo', screenshot: 'Capture', note: 'Note', other: 'Autre',
};
function frDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Vue AGRÉGÉE multi-parcours — LECTURE SEULE. Distincte du Tableau de bord (qui
// concerne le parcours actif). Ne contient aucune action de progression ; la
// seule mutation possible est la BASCULE de parcours, via le flux TrackActions
// existant (avec confirmation). N'écrit jamais dans les parcours.
export default function SynthesePage() {
  const program = getProgram();
  const catalogue = getCatalogue();
  const rows = aggregateTracks(catalogue, readProgressV3(), program);
  // Historique de preuves + jalons du PARCOURS ACTIF — dérivés (read-model), lecture seule.
  const activeProgress = readProgress();
  const timeline = evidenceTimeline(activeProgress, program, { limit: 20 });
  const ms = milestones(program, activeProgress);

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

      <section className="page-wide" style={{ marginTop: 'var(--sp-8)' }}>
        <div className="section-head">
          <span className="section-label"><MilestoneIcon size={13} strokeWidth={2} /> Jalons</span>
          <h2 className="section-title">Jalons fondés sur tes preuves</h2>
          <span className="section-note">{ms.filter((m) => m.achieved).length}/{ms.length} atteints</span>
        </div>
        <ul className="lx-milestones">
          {ms.map((m) => (
            <li key={m.id} className={`lx-milestone${m.achieved ? ' done' : ''}`}>
              <span className="lx-ms-check" aria-hidden="true">{m.achieved ? '●' : '○'}</span>
              <div className="lx-ms-body">
                <span className="lx-ms-label">{m.label} {m.achieved ? <span className="lx-ms-state">atteint</span> : <span className="lx-ms-state muted">à atteindre</span>}</span>
                <span className="lx-ms-why">{m.achieved ? `${m.why} · ${frDate(m.achievedAt ?? '')}` : m.description}</span>
              </div>
            </li>
          ))}
        </ul>
        <p className="page-sub" style={{ marginTop: 'var(--sp-2)' }}>
          Un jalon célèbre un fait pédagogique réel (une preuve), pas des points. Réussir reste un <strong>indice</strong>, pas une maîtrise prouvée.
        </p>
      </section>

      <section className="page-wide" style={{ marginTop: 'var(--sp-6)' }}>
        <div className="section-head">
          <span className="section-label"><Clock size={13} strokeWidth={2} /> Preuves</span>
          <h2 className="section-title">D'où vient ta progression</h2>
          <span className="section-note">{timeline.length} preuve(s) récente(s)</span>
        </div>
        {timeline.length === 0 ? (
          <div className="empty">Aucune preuve enregistrée pour l'instant. Termine un exercice, un diagnostic ou un capstone pour commencer ton historique.</div>
        ) : (
          <ol className="lx-timeline">
            {timeline.map((e, i) => (
              <li key={i} className="lx-tl-item">
                <span className="lx-tl-date">{frDate(e.createdAt)}</span>
                <span className={`lx-tl-type lx-tl-${e.type}`}>{EV_TYPE_LABEL[e.type] ?? e.type}</span>
                <span className="lx-tl-title"><Link href={`/day/${e.day}`}>{e.title || `Jour ${e.day}`}</Link></span>
                {e.skills.length > 0 && <span className="lx-tl-skills">{e.skills.join(' · ')}</span>}
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
