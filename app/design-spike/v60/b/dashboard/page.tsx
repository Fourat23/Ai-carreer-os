// V60 · B — LEARNING WORKSTATION · Dashboard.
//
// COMPOSITION : la fenêtre entière est un poste de travail. Trois volets
// ACCOLÉS (250 / 1fr / 330), séparés par un filet d'un pixel, sans gouttière,
// sans rayon, sans ombre — donc aucune carte flottante. Une barre d'onglets
// en haut, une barre d'état en bas, une règle d'année en pied de volet
// central. La page ne défile pas : ce sont les volets qui défilent.
import { spikeData } from '../../data';
import { SpikeFlag, YearRuler, EvidenceGlyph, NoProgress, Inline } from '../../parts';

export const dynamic = 'force-dynamic';

export default function BDashboard() {
  const d = spikeData();
  const now = d.progress.resumeDay;
  const day = d.days.find((x) => x.day === now) ?? d.days[0];
  const month = d.months.find((m) => m.month === day.month);
  const monthWeeks = d.weeks.filter((w) => w.month === day.month);
  const upcoming = d.days.filter((x) => x.day > now).slice(0, 5);

  // Types de preuve réellement produits par le curriculum, comptés.
  const evidence = [
    { kind: 'practice', label: 'Exercices', n: 376, note: 'mappés sur les 365 journées' },
    { kind: 'produce', label: 'Livrables de journée', n: d.days.filter((x) => x.deliverable).length, note: 'décrits dans le corpus' },
    { kind: 'prepare', label: 'Projets jalonnés', n: d.months.filter((m) => m.project).length, note: 'un par mois porteur' },
    { kind: 'verify', label: 'Journées de révision', n: d.days.filter((x) => x.isReview).length, note: 'réactivation planifiée' },
  ];

  return (
    <div className="dir-b">
      <SpikeFlag dir="B — Learning Workstation" screen="Dashboard" />
      <div className="b-app">
        <div className="b-tabs">
          <div className="b-tab on"><span className="dot" />Poste de travail</div>
          <div className="b-tab"><span className="dot" />Journée {now}</div>
          <div className="b-tab"><span className="dot" />Année</div>
          <span className="path mono">parcours/{d.trackName || 'ai-engineer-foundations'} — mois {day.month} / semaine {day.week}</span>
        </div>

        <div className="b-panes">
          <aside className="b-pane ctx">
            <div className="b-ph">Contexte <em>M{day.month}</em></div>
            <div className="b-tree">
              <div className="b-tsec">Mois {day.month}</div>
              {monthWeeks.map((w) => (
                <div key={w.week}>
                  <div className={`b-tnode l2${w.week === day.week ? ' on' : ''}`}>
                    <span className="g">S{w.week}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.theme}</span>
                  </div>
                  {w.week === day.week && d.days.filter((x) => x.week === w.week).map((x) => (
                    <div key={x.day} className={`b-tnode l3${x.day === now ? ' on' : ''}`}>
                      <span className="g">J{x.day}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.title}</span>
                    </div>
                  ))}
                </div>
              ))}
              <div className="b-tsec">Suite</div>
              {upcoming.map((x) => (
                <div key={x.day} className="b-tnode l2">
                  <span className="g">J{x.day}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.title}</span>
                </div>
              ))}
            </div>
          </aside>

          <main className="b-pane b-work">
            <div className="b-work-hd">
              <p className="b-kicker">Travail en cours · journée {now} / {d.totalDays}</p>
              <h1>{day.title}</h1>
              {day.deliverable && <p><Inline text={day.deliverable} /></p>}
              <a className="b-run" href={`/day/${now}`}>Ouvrir la journée {now} <kbd>Entrée</kbd></a>
              <dl className="b-meta">
                <div><dt>Compétence</dt><dd style={{ fontSize: 15 }}>{day.skillName}</dd></div>
                <div><dt>Difficulté</dt><dd>{day.difficulty}/5</dd></div>
                <div><dt>Durée</dt><dd>{day.hours} h</dd></div>
                <div><dt>Semaine</dt><dd>{day.week}</dd></div>
                <div><dt>Mois</dt><dd>{day.month}</dd></div>
              </dl>
            </div>

            <div className="b-ph">Programme du mois <em>{month?.title}</em></div>
            <p style={{ padding: '18px 34px 22px', fontSize: 14.5, lineHeight: 1.65, color: 'var(--txt-2)', maxWidth: '84ch' }}>
              {month?.summary}
            </p>

            <div className="b-ph">Semaines du mois <em>{monthWeeks.length}</em></div>
            {monthWeeks.map((w, i) => (
              <div key={w.week} className="b-task">
                <span className="ix">S{w.week}</span>
                <span className="bd">
                  <b>{w.theme}</b>
                  <s>{d.days.filter((x) => x.week === w.week).length} journées · {w.skills.join(' · ')}</s>
                </span>
              </div>
            ))}

          </main>

          <aside className="b-pane evi">
            <div className="b-ph">Preuve <em>types</em></div>
            {evidence.map((e) => (
              <div key={e.kind} className="b-evi">
                <span style={{ color: 'var(--accent-2)' }}><EvidenceGlyph kind={e.kind} size={20} /></span>
                <span className="bd">
                  <b>{e.n} {e.label.toLowerCase()}</b>
                  <s>{e.note}</s>
                </span>
              </div>
            ))}
            <div className="b-ph">État <em>local</em></div>
            <div className="b-note">
              <b>Aucune progression enregistrée.</b> Le fichier local ne contient
              zéro journée, zéro compétence notée et aucune date de démarrage.
              Rien n’est estimé à sa place.
            </div>
            <div className="b-ph">Compétences <em>{d.skills.length}</em></div>
            {month?.skills.slice(0, 8).map((s) => (
              <div key={s.id} className="b-task">
                <span className="ix mono">{s.days}j</span>
                <span className="bd"><b style={{ fontWeight: 500 }}>{s.name}</b></span>
              </div>
            ))}
          </aside>
        </div>

        {/* Relevé sur capture : placée en pied de volet, la règle d'année
            tombait sous la ligne de flottaison et la direction B perdait sa
            représentation de trajectoire au premier écran. Elle devient une
            bande pleine largeur, ancrée au-dessus de la barre d'état. */}
        <div className="b-strip">
          <div className="b-strip-h">
            <span>Année · 365 journées · hauteur = difficulté réelle</span>
            <span><NoProgress recorded={d.progress.recordedDays} /></span>
          </div>
          <YearRuler days={d.days} now={now} />
        </div>

        <div className="b-stat">
          <span>J{now} / {d.totalDays}</span>
          <span>M{day.month} · S{day.week}</span>
          <span>{day.skillName}</span>
          <span>diff {day.difficulty}/5</span>
          <span>{day.hours} h</span>
          <span className="grow">local · aucune écriture · aucun réseau</span>
        </div>
      </div>
    </div>
  );
}
