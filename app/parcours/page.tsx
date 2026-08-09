import Link from 'next/link';
import { getCatalogue } from '@/lib/catalogue-server';
import { getProgram } from '@/lib/program';
import { getTrack, getTrackModules, isTrackAvailable } from '@/lib/catalogue';
import { getActiveTrackId } from '@/lib/progress-server';
import TrackActions from './TrackActions';

export const dynamic = 'force-dynamic';

export default function ParcoursPage() {
  const cat = getCatalogue();
  const activeId = getActiveTrackId();
  const active = getTrack(cat, activeId) ?? cat.tracks[0];
  const modules = getTrackModules(cat, active);
  const techName = (id: string) => cat.technologies.find((t) => t.id === id)?.name ?? id;
  const lessonTitle = new Map((getProgram().lessons ?? []).map((l: { slug: string; title: string }) => [l.slug, l.title]));
  const others = cat.tracks.filter((t) => t.id !== active.id);

  return (
    <>
      <div className="page-head page-wide">
        <div className="page-head-main">
          <p className="page-eyebrow">Parcours <span className="sep">/</span> {cat.tracks.filter((t) => isTrackAvailable(t)).length} disponible · {cat.tracks.length} au total</p>
          <h1 className="page-title">Parcours</h1>
          <p className="page-sub">Ton parcours actif et les parcours à venir. Le contenu actuel constitue le premier parcours officiel.</p>
        </div>
      </div>

      {/* Parcours actif */}
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
        <div className="section-head" style={{ marginTop: 'var(--sp-6)' }}>
          <span className="section-label">Modules</span>
          <h3 className="section-title">{modules.length} modules · {active.totalDays} jours</h3>
        </div>
        <div className="track-modules">
          {modules.map((m, i) => (
            <div className="track-mod" key={m.id}>
              <span className="track-mod-n">{String(i + 1).padStart(2, '0')}</span>
              <div className="track-mod-body">
                <div className="track-mod-title">{m.title}</div>
                <div className="track-mod-meta">
                  {m.dayRefs.length} jours · jours {m.dayRefs[0]}–{m.dayRefs[m.dayRefs.length - 1]}
                  {m.dayRefs[0] != null && <> · <Link href={`/day/${m.dayRefs[0]}`}>ouvrir</Link></>}
                </div>
                {(m.lessonRefs ?? []).length > 0 && (
                  <div className="track-mod-lessons">
                    <span className="track-mod-lessons-label">Leçons à lire :</span>{' '}
                    {(m.lessonRefs ?? []).map((slug: string, j: number) => (
                      <span key={slug}>
                        {j > 0 && ' · '}
                        <Link href={`/doc/lessons/${slug}`}>{lessonTitle.get(slug) ?? slug}</Link>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Autres parcours */}
      <div className="section-head" style={{ marginTop: 'var(--sp-8)' }}>
        <span className="section-label">Autres parcours</span>
        <h2 className="section-title">À venir</h2>
      </div>
      <div className="track-list">
        {others.map((t) => (
          <div className="track-row" key={t.id}>
            <div className="track-row-main">
              <div className="track-row-title">{t.title}</div>
              <div className="track-row-goal">{t.goal}</div>
              <div className="track-techs">{(t.technologies ?? []).slice(0, 6).map((id) => <span key={id} className="badge">{techName(id)}</span>)}</div>
            </div>
            <TrackActions trackId={t.id} active={false} available={isTrackAvailable(t)} hasActiveOther />
          </div>
        ))}
      </div>
    </>
  );
}
