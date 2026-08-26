import Link from 'next/link';
import { Route, Eye, Milestone as MilestoneIcon, Clock } from 'lucide-react';
import { getProgram } from '@/lib/program';
import { getCatalogue } from '@/lib/catalogue-server';
import { readProgress, readProgressV3 } from '@/lib/progress-server';
import { aggregateTracks } from '@/lib/track-aggregate';
import { evidenceTimeline, milestones } from '@/lib/learning-experience';
import { PageHeader, Status, HeroFocus, HeroFact, PositionRing, EvidenceMark, ContextLine } from '@/app/ui';
import TrackActions from '../parcours/TrackActions';
import TrajectoryMap from '../TrajectoryMap';
import { getTrack, resolveTrackDayObjects } from '@/lib/catalogue';
import { getActiveTrackId } from '@/lib/progress-server';

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
  // Journées du parcours actif — même read-model que partout ailleurs.
  const activeTrack = getTrack(catalogue, getActiveTrackId()) ?? catalogue.tracks[0];
  const activeDays = resolveTrackDayObjects(catalogue, activeTrack, program);
  const monthTitles = new Map(program.months.map((m: { month: number; title: string }) => [m.month, m.title]));

  return (
    <>
      <ContextLine
        label="Vue d’ensemble des parcours"
        facts={[
          { k: 'Parcours', v: `${rows.length}` },
          { k: 'Actif', v: activeTrack.title, here: true },
          { k: 'Commencés', v: `${startedCount} / ${rows.length}` },
          { k: 'Journées', v: `${totalDone} / ${totalDays}` },
          { k: 'Révisions dues', v: `${totalReviews}` },
        ]}
      />

      <PageHeader
        eyebrow={<>Pilotage <span className="sep">/</span> vue d’ensemble multi-parcours</>}
        title="Synthèse des parcours"
        sub={<>
          Comparaison des parcours disponibles, chacun avec sa progression propre.
          <span className="synth-ro"><Eye size={13} strokeWidth={2} /> Lecture seule — aucune action de progression ici.</span>
        </>}
      />

      {/* ── HERO comparatif (V55) — la situation d'ensemble AVANT le détail.
          Ton `calm` : page de lecture, pas de focus d'action ; le halo d'accent
          reste réservé au Dashboard. Tous les chiffres sont des agrégats des
          lignes déjà calculées — aucune seconde source, aucun score inventé. */}
      <div className="page-wide">
        <HeroFocus
          tone="calm"
          eyebrow="Situation d'ensemble"
          title={activeRow ? activeRow.title : 'Aucun parcours actif'}
          lead={activeRow
            ? `Parcours actif — ${activeRow.completedDays} des ${activeRow.totalDays} journées terminées. Les autres parcours conservent leur propre progression.`
            : 'Choisis un parcours pour commencer : chacun conserve sa progression propre.'}
          meta={
            <>
              <HeroFact k="Parcours suivis">{startedCount} sur {rows.length}</HeroFact>
              <HeroFact k="Jours terminés">{totalDone} sur {totalDays} cumulés</HeroFact>
              <HeroFact k="Révisions dues">
                {totalReviews > 0
                  ? <Status tone="attention" label={`${totalReviews} à traiter`} />
                  : <span className="muted">aucune échéance</span>}
              </HeroFact>
            </>
          }
          // Le CTA vit DANS le hero, aux côtés des chiffres qui le justifient
          // (acquis V54.2.1 : il flottait auparavant dans l'en-tête de page).
          actions={activeRow?.resumeDay != null
            ? <Link className="btn cta" href={`/day/${activeRow.resumeDay}`}>Continuer — jour {activeRow.resumeDay}</Link>
            : undefined}
          aside={activeRow ? (
            <div className="dash-hero-aside">
              <PositionRing percent={activeRow.percent} day={activeRow.resumeDay ?? 1}
                total={activeRow.totalDays} label="Position dans le parcours actif" />
              <div className="dash-hero-nums">
                <span className="dash-hero-pct">{activeRow.percent}%</span>
                <span className="dash-hero-pctk">du parcours actif</span>
              </div>
            </div>
          ) : undefined}
        />
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

      {/* MOTIF · TrajectoryMap — la trajectoire du parcours ACTIF, mois par mois,
          sous la comparaison. Même représentation que le Dashboard : un apprenant
          qui a compris l'une comprend l'autre. */}
      {activeDays.length > 0 && (
        <section className="dash-socle page-wide" style={{ marginTop: 'var(--sp-8)' }} aria-label="Trajectoire du parcours actif">
          <header className="dash-socle-head">
            <div className="dash-socle-title">
              <span className="section-label">Trajectoire</span>
              <h2 className="section-title">{activeRow?.title}</h2>
            </div>
            <p className="dash-socle-note">Une piste par mois. Clique une journée pour l’ouvrir.</p>
          </header>
          <TrajectoryMap days={activeDays} progress={activeProgress}
            currentDay={activeRow?.resumeDay ?? 1} monthTitles={monthTitles} />
        </section>
      )}

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
                {/* MOTIF · EvidenceMark — le type de preuve devient reconnaissable
                    en balayage. Le libellé reste affiché : jamais la forme seule. */}
                <span className={`lx-tl-type lx-tl-${e.type}`}>
                  <EvidenceMark type={e.type} size={14} />
                  {EV_TYPE_LABEL[e.type] ?? e.type}
                </span>
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
