// V60.1 · CAREER WORKSTATION — DASHBOARD.
//
// COUCHE 1 · PILOTAGE. La question est : où suis-je dans ma trajectoire, et
// que dois-je faire maintenant ?
//
// COMPOSITION — trois registres d'amplitude très inégale, dans une page
// BORNÉE (héritée de B) :
//
//   ligne de système        ~40 px   mono, bord à bord            ← A
//   ┌──────────────────────────────────────────────────────────┐
//   │ BLOC FOCAL             ~46 %   la journée à faire         │ ← A + C
//   │  display · livrable · une seule action · faits            │
//   ├──────────────────────────────────────────────────────────┤
//   │ CHAMP DE TRAJECTOIRE   ~30 %   TrajectoryMap, large        │ ← A
//   ├──────────────────────────────────────────────────────────┤
//   │ SOCLE                  ~24 %   3 familles, en colonnes     │ ← B
//   └──────────────────────────────────────────────────────────┘
//   ligne de faits          ~32 px   YearBand + état             ← B
//
// Zéro carte. Les registres sont séparés par un filet d'un pixel et par un
// changement de fond. Le focal est la SEULE surface élevée de l'écran.
//
// Le socle porte TROIS familles, choisies sur leur valeur d'usage et non
// parce qu'elles existaient en V60 : ce qui vient ensuite, le mois courant,
// et les jalons de projet. La « charge par mois » de V60 A est retirée —
// elle est déjà lisible dans le champ de trajectoire, et V59 a montré ce que
// coûte une donnée dite deux fois sur la même page.
import { cwData, FAMILY_LABEL } from '../data';
import { SystemLine, FactsLine, ProtoNotice, Inline, NoProgress, isBlind } from '../shell';
import { TrajectoryMap, YearBand, PositionRing } from '../motifs';

export const dynamic = 'force-dynamic';

export default async function CwDashboard({
  searchParams,
}: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const blind = isBlind(await searchParams);
  const d = cwData();
  const now = d.progress.resumeDay;
  const day = d.days.find((x) => x.day === now) ?? d.days[0];
  const month = d.months.find((m) => m.month === day.month)!;
  const week = d.weeks.find((w) => w.week === day.week);
  const next = d.days.filter((x) => x.day > now).slice(0, 4);
  const projects = d.months.filter((m) => m.project).slice(0, 4);
  // Position réelle de la journée dans son mois — intervalle borné, donc anneau.
  const posInMonth = month.days.findIndex((x) => x.day === now) + 1;

  return (
    <div className="cw-app">
      <ProtoNotice blind={blind} screen="Dashboard" />
      <SystemLine
        items={[
          { k: 'Parcours', v: blind ? 'Parcours actif' : d.trackTitle },
          { k: 'Horizon', v: `${d.totalDays} journées` },
          { k: 'Charge', v: `${d.hours.toLocaleString('fr-FR')} h` },
          { k: 'Position', v: `J${now} · M${day.month} · S${day.week}`, pos: true },
        ]}
        tail={<NoProgress recorded={d.progress.recordedDays} />}
      />

      <div className="cw-body cw-dash" tabIndex={0}>
        {/* ── REGISTRE 1 · le focal. Une seule surface élevée de l'écran. ── */}
        <section className="cw-dash-focal" aria-labelledby="dash-h">
          <div className="cw-dash-focal-l">
            <p className="cw-eyebrow">Journée {now} sur {d.totalDays} — à faire maintenant</p>
            <h1 id="dash-h" className="cw-display cw-dash-title">{day.title}</h1>
            {day.deliverable && (
              <p className="cw-dash-deliv">
                <span className="cw-dash-deliv-k cw-mono">Livrable</span>
                <Inline text={day.deliverable} />
              </p>
            )}
            <dl className="cw-figs cw-dash-figs-l">
              <div><dt>Compétence</dt><dd className="cw-txt">{day.skillName}</dd></div>
              <div><dt>Difficulté</dt><dd>{day.difficulty}<small> / 5</small></dd></div>
              <div><dt>Durée</dt><dd>{day.hours}<small> h</small></dd></div>
              <div><dt>Semaine</dt><dd>{day.week}<small> / {d.weeks.length}</small></dd></div>
            </dl>
            <div className="cw-dash-act">
              <a className="cw-go" href={`/day/${now}`}>
                Ouvrir la journée {now}<span className="cw-sub">{day.hours} h</span>
              </a>
              <a className="cw-go2" href="#socle">Voir la suite du mois</a>
            </div>
          </div>

          {/* La colonne droite ne porte QU'UN sujet : la position dans le mois.
              Intervalle borné, donc PositionRing — l'année, elle, est le rôle
              exclusif de TrajectoryMap juste en dessous. */}
          <div className="cw-dash-focal-r">
            <div className="cw-dash-ring">
              <PositionRing value={posInMonth} total={month.days.length} label={`Position dans le mois ${day.month}`} />
              <p className="cw-dash-ring-c">
                <b>Mois {day.month}</b><br />
                {month.days.length} journées · {month.hours} h<br />
                {month.reviewDays} révisions · difficulté max {month.peakDifficulty}
              </p>
            </div>
            <p className="cw-dash-week"><b>Semaine {day.week}</b>{week?.theme}</p>
            {month.project && (
              <p className="cw-dash-week"><b>Projet du mois</b>{month.project.name}</p>
            )}
          </div>
        </section>

        {/* ── REGISTRE 2 · le champ de trajectoire. Un seul objet, grand. ── */}
        <section className="cw-dash-field cw-grid-tex" aria-labelledby="dash-traj">
          {/* La légende était mêlée à la phrase de cadrage : « RÉVISION » se
              retrouvait orpheline sur une seconde ligne, derrière un tiret
              seul. Cadrage et légende sont deux choses, sur deux lignes. */}
          <div className="cw-dash-field-h">
            <h2 id="dash-traj" className="cw-dash-h2">L’année entière</h2>
            <p className="cw-eyebrow cw-dash-field-cap">
              une colonne = une journée réelle · hauteur = difficulté réelle
            </p>
            <ul className="cw-legend">
              <li><span className="cw-lg cw-dy" />journée</li>
              <li><span className="cw-lg cw-rv" />révision</li>
              <li><span className="cw-lg cw-pj" />jalon de projet</li>
              <li><span className="cw-lg cw-nw" />position</li>
            </ul>
          </div>
          <TrajectoryMap days={d.days} now={now} height={170} />
        </section>

        {/* ── REGISTRE 3 · le socle. Trois familles, pas trois tableaux. ── */}
        <section className="cw-dash-socle" id="socle" aria-label="Contexte du parcours">
          <div className="cw-socle-col">
            <h2 className="cw-socle-h">Ce qui vient</h2>
            {next.map((x, i) => (
              <a key={x.day} className={`cw-socle-row${i === 0 ? ' cw-first' : ''}`} href={`/day/${x.day}`}>
                <span className="cw-socle-n cw-mono">J{x.day}</span>
                <span className="cw-socle-t">{x.title}</span>
                <span className="cw-socle-v cw-mono">{x.hours} h · {x.difficulty}/5</span>
              </a>
            ))}
          </div>

          <div className="cw-socle-col">
            <h2 className="cw-socle-h">Le mois {day.month}</h2>
            <p className="cw-socle-sum">{month.summary}</p>
            <p className="cw-socle-skills">
              {month.skills.slice(0, 5).map((s) => (
                <span key={s.id}><b>{s.name}</b> <i className="cw-mono">{s.days} j</i></span>
              ))}
            </p>
          </div>

          <div className="cw-socle-col">
            <h2 className="cw-socle-h">Jalons de projet <span className="cw-mono">{d.projects}</span></h2>
            {projects.map((m) => (
              <div key={m.month} className="cw-socle-row">
                <span className="cw-socle-n cw-mono">M{m.month}</span>
                <span className="cw-socle-t">{m.project!.name}</span>
                <span className="cw-socle-v cw-mono">#{m.project!.id}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <FactsLine
        facts={[
          `J${now} / ${d.totalDays}`,
          `${d.reviewDays} révisions`,
          `${d.projects} projets`,
          `${d.skills.length} compétences`,
        ]}
        band={<YearBand days={d.days} now={now} />}
        tail={blind ? 'lecture seule' : 'local · aucune écriture · aucun réseau'}
      />
    </div>
  );
}
