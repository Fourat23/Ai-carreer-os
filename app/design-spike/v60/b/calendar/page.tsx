// V60 · B — LEARNING WORKSTATION · Calendar.
//
// COMPOSITION : un vrai planning tabulaire. 12 lignes de mois × colonnes de
// semaines. Chaque cellule porte le thème réel de la semaine et un profil de
// difficulté en barres. Dense, direct, sans emphase — le brief demande ici le
// planning d'un professionnel, pas un spectacle.
//
// Les mois n'ont pas tous le même nombre de semaines : les cellules
// manquantes restent VIDES et estompées plutôt que remplies.
import { spikeData } from '../../data';
import { SpikeFlag, NoProgress } from '../../parts';

export const dynamic = 'force-dynamic';

export default function BCalendar() {
  const d = spikeData();
  const now = d.progress.resumeDay;
  const maxW = Math.max(...d.months.map((m) => m.weeks.length));

  return (
    <div className="dir-b">
      <SpikeFlag dir="B — Learning Workstation" screen="Calendar" />
      <div className="b-app">
        <div className="b-tabs">
          <div className="b-tab"><span className="dot" />Poste de travail</div>
          <div className="b-tab"><span className="dot" />Journée {now}</div>
          <div className="b-tab on"><span className="dot" />Année</div>
          <span className="path mono">{d.totalDays} journées · {d.weeks.length} semaines · {d.hours.toLocaleString('fr-FR')} h</span>
        </div>

        <div className="b-panes" style={{ gridTemplateColumns: 'minmax(0, 1fr) 330px' }}>
          <main className="b-pane b-plan">
            <div className="b-ph">
              <span>Planning · 12 mois × {maxW} semaines</span>
              <em>barre = difficulté réelle de la journée</em>
            </div>
            <table className="b-ptab">
              <thead>
                <tr>
                  <th style={{ width: 190 }}>Mois</th>
                  {Array.from({ length: maxW }, (_, i) => <th key={i}>Sem. {i + 1}</th>)}
                </tr>
              </thead>
              <tbody>
                {d.months.map((mo) => (
                  <tr key={mo.month}>
                    <td className="mo">
                      <b>{String(mo.month).padStart(2, '0')}</b>
                      <s>{mo.title}</s>
                    </td>
                    {Array.from({ length: maxW }, (_, i) => {
                      const wk = mo.weeks[i];
                      const theme = d.weeks.find((w) => w.week === wk)?.theme;
                      const wd = wk ? d.days.filter((x) => x.week === wk) : [];
                      return (
                        <td key={i}>
                          <span className={`b-wk${wk ? '' : ' empty'}`}>
                            {wk ? (
                              <>
                                <span className="n">S{wk} · {wd.length} j</span>
                                <span className="th">{theme}</span>
                                <span className="bars">
                                  {wd.map((x) => (
                                    <i key={x.day}
                                       className={x.project != null ? 'pj' : x.isReview ? 'rv' : ''}
                                       style={{ height: `${20 + x.difficulty * 16}%` }} />
                                  ))}
                                </span>
                              </>
                            ) : <span className="n">—</span>}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </main>

          <aside className="b-pane evi">
            <div className="b-ph">Totaux <em>dérivés</em></div>
            <div className="b-task"><span className="ix mono">365</span><span className="bd"><b>journées</b><s>ordre gelé</s></span></div>
            <div className="b-task"><span className="ix mono">{d.weeks.length}</span><span className="bd"><b>semaines</b><s>thème réel par semaine</s></span></div>
            <div className="b-task"><span className="ix mono">12</span><span className="bd"><b>mois</b><s>programme et projet</s></span></div>
            <div className="b-task"><span className="ix mono">{d.hours.toLocaleString('fr-FR')}</span><span className="bd"><b>heures</b><s>somme des durées déclarées</s></span></div>
            <div className="b-task"><span className="ix mono">{d.days.filter((x) => x.isReview).length}</span><span className="bd"><b>journées de révision</b><s>réactivation planifiée</s></span></div>

            <div className="b-ph">Projets <em>{d.months.filter((m) => m.project).length}</em></div>
            {d.months.filter((m) => m.project).map((m) => (
              <div key={m.month} className="b-task">
                <span className="ix mono">M{m.month}</span>
                <span className="bd"><b style={{ fontWeight: 500 }}>{m.project!.name}</b><s>projet {m.project!.id}</s></span>
              </div>
            ))}

            <div className="b-ph">État</div>
            <div className="b-note"><NoProgress recorded={d.progress.recordedDays} /> — aucune journée n’est marquée terminée, donc rien n’est colorié comme tel.</div>
          </aside>
        </div>

        <div className="b-stat">
          <span>vue année</span>
          <span>12 mois</span>
          <span>{d.weeks.length} semaines</span>
          <span>{d.totalDays} journées</span>
          <span className="grow">prototype — lecture seule</span>
        </div>
      </div>
    </div>
  );
}
