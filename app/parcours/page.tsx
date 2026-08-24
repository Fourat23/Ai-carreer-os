import Link from 'next/link';
import { getCatalogue } from '@/lib/catalogue-server';
import { getProgram } from '@/lib/program';
import { getTrack, getTrackModules, isTrackAvailable, resolveTrackDayObjects } from '@/lib/catalogue';
import { getActiveTrackId, readProgress } from '@/lib/progress-server';
import { progressPosition } from '@/lib/position';
import { PageHeader, Status, ProgressRail } from '@/app/ui';
import type { Tone } from '@/app/ui';
import TrackActions from './TrackActions';

export const dynamic = 'force-dynamic';

// État d'un module, DÉRIVÉ de la progression réelle (aucune source parallèle).
const MOD_STATE: Record<string, { label: string; tone: Tone }> = {
  done: { label: 'Terminé', tone: 'positive' },
  current: { label: 'En cours', tone: 'accent' },
  started: { label: 'Commencé', tone: 'info' },
  upcoming: { label: 'À venir', tone: 'neutral' },
};

export default function ParcoursPage() {
  const cat = getCatalogue();
  const program = getProgram();
  const activeId = getActiveTrackId();
  const active = getTrack(cat, activeId) ?? cat.tracks[0];
  const modules = getTrackModules(cat, active);
  const techName = (id: string) => cat.technologies.find((t) => t.id === id)?.name ?? id;
  const lessonTitle = new Map((program.lessons ?? []).map((l: { slug: string; title: string }) => [l.slug, l.title]));
  const others = cat.tracks.filter((t) => t.id !== active.id);

  // Position réelle sur le parcours actif (même read-model que le dashboard).
  const progress = readProgress();
  const trackDays = resolveTrackDayObjects(cat, active, program);
  const pos = progressPosition(trackDays, progress);
  const isDone = (d: number) => progress.days[String(d)]?.status === 'done';

  // Avancement PAR MODULE, dérivé des jours réellement terminés.
  const mods = modules.map((m, i) => {
    const days: number[] = m.dayRefs ?? [];
    const done = days.filter(isDone).length;
    const holdsResume = days.includes(pos.resumeDay);
    const state = done === days.length && days.length > 0 ? 'done'
      : holdsResume ? 'current'
        : done > 0 ? 'started' : 'upcoming';
    return { m, i, days, done, total: days.length, state, pct: days.length ? Math.round((done / days.length) * 100) : 0 };
  });
  const currentMod = mods.find((x) => x.state === 'current');
  const nextMod = currentMod ? mods.find((x) => x.i === currentMod.i + 1) : undefined;
  const doneMods = mods.filter((x) => x.state === 'done').length;

  return (
    <>
      <PageHeader
        eyebrow={<>Parcours <span className="sep">/</span> {cat.tracks.filter((t) => isTrackAvailable(t)).length} disponibles · {cat.tracks.length} au total</>}
        title="Parcours"
        sub="Ta trajectoire actuelle, module par module — et les alternatives si tu veux changer de cap."
        actions={<Link className="btn cta" href={`/day/${pos.resumeDay}`}>Continuer — jour {pos.resumeDay}</Link>}
      />

      {/* Parcours actif — roadmap dominante */}
      <section className="track-active">
        <div className="track-active-head">
          <div>
            <p className="dpx-eyebrow">Parcours actif · v{active.version}</p>
            <h2 className="track-title">{active.title}</h2>
          </div>
          <TrackActions trackId={active.id} active available={isTrackAvailable(active)} />
        </div>
        <p className="track-goal">{active.goal}</p>
        <div className="track-techs">
          {active.technologies.slice(0, 12).map((id) => <span key={id} className="badge">{techName(id)}</span>)}
        </div>

        {/* Barre d'avancement du parcours (primitive partagée avec le Dashboard) */}
        <div className="track-progress">
          <ProgressRail
            percent={pos.total ? (pos.currentProgressPosition / pos.total) * 100 : 0}
            sub={<>{doneMods}/{mods.length} modules terminés · jour {pos.resumeDay} / {pos.total}{nextMod ? ` · ensuite : ${nextMod.m.title}` : ''}</>}
          />
        </div>

        <div className="section-head" style={{ marginTop: 'var(--sp-6)' }}>
          <span className="section-label">Roadmap</span>
          <h3 className="section-title">{modules.length} modules · {active.totalDays} jours</h3>
          <span className="section-note">état dérivé de tes journées terminées</span>
        </div>

        <ol className="track-roadmap">
          {mods.map(({ m, i, days, done, total, state, pct }) => (
            <li key={m.id} className={`track-step is-${state}`}>
              <span className="track-step-rail" aria-hidden>
                <span className="track-step-dot" />
              </span>
              <div className="track-step-body">
                <div className="track-step-head">
                  <span className="track-step-n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="track-step-title">{m.title}</span>
                  <Status tone={MOD_STATE[state].tone} label={MOD_STATE[state].label} />
                </div>
                <div className="track-step-meta">
                  <span>{total} jours · jours {days[0]}–{days[days.length - 1]}</span>
                  {done > 0 && <span className="track-step-done">{done}/{total} terminés ({pct}%)</span>}
                  {days[0] != null && <Link href={`/day/${state === 'current' ? pos.resumeDay : days[0]}`}>ouvrir</Link>}
                </div>
                {(m.lessonRefs ?? []).length > 0 && (
                  <div className="track-step-lessons">
                    <span className="track-mod-lessons-label">Leçons :</span>{' '}
                    {(m.lessonRefs ?? []).map((slug: string, j: number) => (
                      <span key={slug}>
                        {j > 0 && ' · '}
                        <Link href={`/doc/lessons/${slug}`}>{lessonTitle.get(slug) ?? slug}</Link>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Autres parcours — séparés : disponibles (activables) vs annoncés */}
      {(() => {
        const available = others.filter((t) => isTrackAvailable(t));
        const announced = others.filter((t) => !isTrackAvailable(t));
        return (
          <>
            {available.length > 0 && (
              <section style={{ marginTop: 'var(--sp-8)' }}>
                <div className="section-head">
                  <span className="section-label">Alternatives</span>
                  <h2 className="section-title">Changer de trajectoire</h2>
                  <span className="section-note">ta progression de chaque parcours est conservée</span>
                </div>
                {/* Rangées de COMPARAISON compactes : durée réelle + objectif tronqué +
                    technologies. Le CTA reste secondaire (décision explicite, pas dominante). */}
                <div className="track-compare">
                  {available.map((t) => (
                    <div className="track-crow" key={t.id}>
                      <div className="track-crow-id">
                        <div className="track-crow-title">{t.title}</div>
                        <div className="track-crow-goal">{t.goal}</div>
                      </div>
                      <div className="track-crow-facts">
                        <span className="track-crow-fact"><span className="track-crow-k">Durée</span> {t.totalDays} j</span>
                        <span className="track-crow-fact"><span className="track-crow-k">Techs</span> {(t.technologies ?? []).length}</span>
                      </div>
                      <div className="track-crow-techs">
                        {(t.technologies ?? []).slice(0, 5).map((id) => <span key={id} className="badge">{techName(id)}</span>)}
                        {(t.technologies ?? []).length > 5 && <span className="track-crow-more">+{(t.technologies ?? []).length - 5}</span>}
                      </div>
                      <div className="track-crow-act"><TrackActions trackId={t.id} active={false} available hasActiveOther /></div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {announced.length > 0 && (
              <section style={{ marginTop: 'var(--sp-8)' }}>
                <div className="section-head">
                  <span className="section-label">À venir</span>
                  <h2 className="section-title">Parcours annoncés</h2>
                  <span className="section-note">bientôt disponibles</span>
                </div>
                <div className="track-list track-list-soon">
                  {announced.map((t) => (
                    <div className="track-row is-soon" key={t.id}>
                      <div className="track-row-main">
                        <div className="track-row-title">{t.title}</div>
                        <div className="track-row-goal">{t.goal}</div>
                      </div>
                      <TrackActions trackId={t.id} active={false} available={false} hasActiveOther />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        );
      })()}
    </>
  );
}
