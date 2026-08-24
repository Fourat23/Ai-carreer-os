import Link from 'next/link';
import { Route, Eye, Milestone as MilestoneIcon, Clock } from 'lucide-react';
import { getProgram } from '@/lib/program';
import { getCatalogue } from '@/lib/catalogue-server';
import { readProgress, readProgressV3 } from '@/lib/progress-server';
import { aggregateTracks } from '@/lib/track-aggregate';
import { evidenceTimeline, milestones } from '@/lib/learning-experience';
import { PageHeader, Status, Metric } from '@/app/ui';
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
  // Repères transversaux — agrégats des lignes déjà calculées (aucune 2e source).
  const activeRow = rows.find((r) => r.active);
  const startedCount = rows.filter((r) => r.started).length;
  const totalDone = rows.reduce((n, r) => n + r.completedDays, 0);
  const totalDays = rows.reduce((n, r) => n + r.totalDays, 0);
  const totalReviews = rows.reduce((n, r) => n + r.reviewsDue, 0);

  return (
    <>
      <PageHeader
        eyebrow={<>Pilotage <span className="sep">/</span> vue d’ensemble multi-parcours</>}
        title="Synthèse des parcours"
        sub={<>
          Comparaison des parcours disponibles, chacun avec sa progression propre.
          <span className="synth-ro"><Eye size={13} strokeWidth={2} /> Lecture seule — aucune action de progression ici.</span>
        </>}
        actions={activeRow?.resumeDay != null
          ? <Link className="btn cta" href={`/day/${activeRow.resumeDay}`}>Continuer — jour {activeRow.resumeDay}</Link>
          : undefined}
      />

      {/* Repères transversaux (données réelles agrégées, aucun score inventé) */}
      <div className="synth-summary page-wide">
        <Metric label="Parcours suivis" value={`${startedCount} / ${rows.length}`} emphasis
          sub={activeRow ? `actif : ${activeRow.title}` : 'aucun parcours actif'} />
        <div className="synth-summary-facts">
          <Metric label="Jours terminés" value={totalDone} sub={`sur ${totalDays} jours cumulés`} />
          <Metric label="Révisions dues" value={totalReviews} tone={totalReviews > 0 ? 'attention' : undefined}
            sub={totalReviews > 0 ? 'à traiter' : 'aucune échéance'} />
        </div>
      </div>

      <div className="synth-table-wrap page-wide" role="region" aria-label="Comparaison des parcours (lecture seule)" tabIndex={0}>
        <table className="synth-table">
          {/* Colonnes PRIMARY (col-p) toujours visibles · SECONDARY (col-s) repliées
              sous 1100px. En mobile, chaque ligne devient un bloc empilé libellé
              (représentation sémantiquement équivalente — aucune donnée perdue). */}
          <thead>
            <tr>
              <th scope="col" className="col-p">Parcours</th>
              <th scope="col" className="col-p">État</th>
              <th scope="col" className="col-p">Progression</th>
              <th scope="col" className="num col-s">Reprise</th>
              <th scope="col" className="num col-s">En cours</th>
              <th scope="col" className="num col-s">À revoir</th>
              <th scope="col" className="num col-p">Révisions</th>
              <th scope="col" className="num col-s">Compét.</th>
              <th scope="col" className="col-s">Dernière preuve</th>
              <th scope="col" className="col-p"><span className="sr-only">Action</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.trackId} className={r.active ? 'is-active' : undefined}>
                <th scope="row" className="synth-td-track col-p">
                  <Route size={14} strokeWidth={2} aria-hidden />
                  <span className="synth-td-title">{r.title}</span>
                </th>
                <td className="col-p" data-label="État">{r.active
                  ? <Status tone="accent" label="Actif" />
                  : <Status tone={r.complete ? 'positive' : r.started ? 'info' : 'neutral'} label={r.complete ? 'Terminé' : r.started ? 'En cours' : 'Non démarré'} />}
                </td>
                <td className="synth-td-prog col-p" data-label="Progression">
                  <div className="synth-bar" aria-hidden="true"><span style={{ width: `${r.percent}%` }} /></div>
                  <span className="synth-bar-label">{r.completedDays}/{r.totalDays} · {r.percent}%</span>
                </td>
                <td className="num col-s" data-label="Reprise">{r.resumeDay != null ? <Link href={`/day/${r.resumeDay}`}>J{r.resumeDay}</Link> : '—'}</td>
                <td className="num col-s" data-label="En cours">{r.inProgress}</td>
                <td className="num col-s" data-label="À revoir">{r.toReview}</td>
                <td className={`num col-p${r.reviewsDue > 0 ? ' hot' : ''}`} data-label="Révisions dues">{r.reviewsDue}</td>
                <td className="num col-s" data-label="Compétences">{r.skillsCount}</td>
                <td className="synth-td-ev col-s" data-label="Dernière preuve">{r.lastEvidence
                  ? <Link href={`/day/${r.lastEvidence.day}`}>J{r.lastEvidence.day} — {r.lastEvidence.title}</Link>
                  : <span className="muted">—</span>}</td>
                <td className="synth-td-act col-p"><TrackActions trackId={r.trackId} active={r.active} available hasActiveOther={!r.active} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
