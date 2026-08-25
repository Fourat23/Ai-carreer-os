// V60 · A — MISSION CONTROL · Dashboard.
//
// COMPOSITION : trois bandes pleine largeur d'amplitude très inégale.
//   1. bande d'état, 40 px, mono, bord à bord — « où en est le système »
//   2. bloc opératoire, 58 vh — la mission courante à gauche, l'horizon à droite
//   3. registres, trois colonnes de filets — ce qui vient, ce qui pèse, ce qui reste
//
// Zéro carte. Les zones sont découpées par des filets d'un pixel et par des
// fonds de bande, jamais par des boîtes flottantes.
import { spikeData } from '../../data';
import { SpikeFlag, ArcHorizon, NoProgress, Inline } from '../../parts';

export const dynamic = 'force-dynamic';

export default function ADashboard() {
  const d = spikeData();
  const now = d.progress.resumeDay;
  const day = d.days.find((x) => x.day === now) ?? d.days[0];
  const month = d.months.find((m) => m.month === day.month);
  const week = d.weeks.find((w) => w.week === day.week);
  const upcoming = d.days.filter((x) => x.day > now).slice(0, 6);
  const projects = d.months.filter((m) => m.project).map((m) => ({ m: m.month, p: m.project! }));
  const load = [...d.months].sort((a, b) => b.hours - a.hours).slice(0, 6);

  return (
    <main className="dir-a">
      <SpikeFlag dir="A — Mission Control" screen="Dashboard" />

      <div className="a-status">
        <div><span className="k">Parcours</span><span className="v">{d.trackName || 'AI Engineer — Fondations'}</span></div>
        <div><span className="k">Horizon</span><span className="v">{d.totalDays} j</span></div>
        <div><span className="k">Charge</span><span className="v">{d.hours.toLocaleString('fr-FR')} h</span></div>
        <div><span className="k">Position</span><span className="v live">J{now}</span></div>
        <div><span className="k">Secteur</span><span className="v">M{day.month} · S{day.week}</span></div>
        <div className="grow"><NoProgress recorded={d.progress.recordedDays} /></div>
      </div>

      <div className="a-op">
        <div className="a-op-l">
          <p className="a-op-tag">Mission courante · jour {now} sur {d.totalDays}</p>
          <h1>{day.title}</h1>
          {day.deliverable && <p className="a-op-obj"><Inline text={day.deliverable} /></p>}
          <a className="a-op-go" href={`/day/${now}`}>Engager la journée {now} <span>↵</span></a>
          <dl className="a-op-spec">
            <div><dt>Compétence</dt><dd style={{ fontSize: 18 }}>{day.skillName}</dd></div>
            <div><dt>Difficulté</dt><dd>{day.difficulty}<small> / 5</small></dd></div>
            <div><dt>Durée</dt><dd>{day.hours}<small> h</small></dd></div>
            <div><dt>Semaine</dt><dd>{day.week}<small> / 52</small></dd></div>
          </dl>
        </div>
        <div className="a-op-r">
          <p className="a-arc-cap">Horizon · {d.totalDays} journées · hauteur = difficulté réelle</p>
          <div className="a-arcwrap"><ArcHorizon days={d.days} now={now} /></div>
          <div className="a-arc-key">
            <span><i style={{ background: 'var(--line-hard)' }} />journée</span>
            <span><i style={{ background: 'var(--warn)' }} />révision</span>
            <span><i style={{ background: 'var(--accent-2)' }} />jalon projet</span>
            <span><i style={{ background: 'var(--now)' }} />position</span>
          </div>
        </div>
      </div>

      <div className="a-reg">
        <section>
          <h2><span>Séquence à venir</span><span>{upcoming.length}</span></h2>
          {upcoming.map((x, i) => (
            <div key={x.day} className={`a-row${i === 0 ? ' is-next' : ''}`}>
              <span className="n">J{x.day}</span>
              <span className="t">{x.title}</span>
              <span className="v">{x.hours} h</span>
            </div>
          ))}
        </section>
        <section>
          <h2><span>Jalons de projet</span><span>{projects.length}</span></h2>
          {projects.slice(0, 6).map((p) => (
            <div key={p.m} className="a-row">
              <span className="n">M{p.m}</span>
              <span className="t">{p.p.name}</span>
              <span className="v">#{p.p.id}</span>
            </div>
          ))}
        </section>
        <section>
          <h2><span>Charge par mois</span><span>heures</span></h2>
          {load.map((m) => (
            <div key={m.month} className="a-row">
              <span className="n">M{m.month}</span>
              <span className="t">{m.title}</span>
              <span className="v">{m.hours} h</span>
            </div>
          ))}
        </section>
      </div>

      <div className="a-reg" style={{ borderTop: '1px solid var(--line)' }}>
        <section style={{ gridColumn: '1 / -1', borderRight: 'none' }}>
          <h2><span>Secteur courant · mois {day.month}</span><span>{week?.theme}</span></h2>
          <p style={{ marginTop: 14, maxWidth: '92ch', fontSize: 15, lineHeight: 1.65, color: 'var(--txt-2)' }}>
            {month?.summary}
          </p>
        </section>
      </div>
    </main>
  );
}
