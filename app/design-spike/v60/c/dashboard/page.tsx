// V60 · C — CAREER INTELLIGENCE · Dashboard.
//
// COMPOSITION : éditoriale. Une accroche typographique très grande qui ÉNONCE
// la position en toutes lettres, des chiffres traités comme des figures de
// magazine, une portée de trajectoire sur toute la largeur, puis deux
// colonnes de texte posées directement sur le canvas.
//
// Presque aucune boîte : les séparations sont des filets capillaires et du
// blanc. L'action principale est un lien souligné à grande échelle, pas un
// bouton dans une carte.
import { spikeData } from '../../data';
import { SpikeFlag, MonthStaff, NoProgress, Inline } from '../../parts';

export const dynamic = 'force-dynamic';

export default function CDashboard() {
  const d = spikeData();
  const now = d.progress.resumeDay;
  const day = d.days.find((x) => x.day === now) ?? d.days[0];
  const month = d.months.find((m) => m.month === day.month);
  const week = d.weeks.find((w) => w.week === day.week);
  const next = d.days.filter((x) => x.day >= now).slice(0, 4);
  const hoursByMonth = d.months.map((m) => m.hours);

  return (
    <main className="dir-c">
      <SpikeFlag dir="C — Career Intelligence" screen="Dashboard" />

      <div className="c-wrap">
        <section className="c-lede">
          <p className="c-eyebrow">Parcours · {d.trackName || 'AI Engineer — Fondations'}</p>
          <h1>Douze mois pour devenir ingénieur IA. <em>Vous entrez au jour {now}.</em></h1>
          <p className="sub">
            {month?.title} — {week?.theme}. La journée qui vous attend porte sur
            « {day.title.toLowerCase()} », et se conclut par une preuve à produire.
          </p>
          <p><a className="c-cta" href={`/day/${now}`}>Commencer la journée {now}<span>{day.hours} h · difficulté {day.difficulty}/5</span></a></p>

          <dl className="c-figs">
            <div><dt>Journées</dt><dd>{d.totalDays}</dd></div>
            <div><dt>Heures de travail</dt><dd>{d.hours.toLocaleString('fr-FR')}<small> h</small></dd></div>
            <div><dt>Compétences suivies</dt><dd>{d.skills.length}</dd></div>
            <div><dt>Projets jalonnés</dt><dd>{d.months.filter((m) => m.project).length}</dd></div>
            <div><dt>Avancement</dt><dd style={{ fontSize: 20, letterSpacing: 0 }}><NoProgress recorded={d.progress.recordedDays} /></dd></div>
          </dl>
        </section>

        <section className="c-staff">
          <div className="c-staff-h">
            <h2>La forme de l’année</h2>
            <span className="k c-eyebrow">chaque trait = une journée · hauteur = difficulté réelle</span>
          </div>
          <MonthStaff days={d.days} hoursByMonth={hoursByMonth} />
        </section>

        <div className="c-cols">
          <div className="c-art">
            <h2>Ce qui vient</h2>
            {next.map((x, i) => (
              <article key={x.day} className="c-item">
                <span className="idx">J{x.day}</span>
                <div>
                  <h3>{x.title}</h3>
                  {x.deliverable && <p><Inline text={x.deliverable} /></p>}
                  <div className="tags">
                    <span>{x.skillName}</span>
                    <span>difficulté {x.difficulty}/5</span>
                    <span>{x.hours} h</span>
                    <span>semaine {x.week}</span>
                    {i === 0 && <span style={{ color: 'var(--accent-2)' }}>prochaine</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="c-aside">
            <h2>Le mois {day.month}</h2>
            <p style={{ marginTop: 16, fontSize: 15, lineHeight: 1.65, color: 'var(--txt-2)' }}>{month?.summary}</p>
            {month?.project && (
              <p style={{ marginTop: 18, fontSize: 15, color: 'var(--accent-2)', lineHeight: 1.5 }}>
                Projet {month.project.id} — {month.project.name}
              </p>
            )}
            <h2 style={{ marginTop: 34 }}>Compétences du mois</h2>
            {month?.skills.slice(0, 7).map((s) => (
              <p key={s.id} className="c-aline"><span>{s.name}</span><b>{s.days} j</b></p>
            ))}
            <h2 style={{ marginTop: 34 }}>Ce que le fichier local sait</h2>
            <p className="c-aline"><span>Journées enregistrées</span><b>0</b></p>
            <p className="c-aline"><span>Compétences notées</span><b>0</b></p>
            <p className="c-aline"><span>Date de démarrage</span><b>aucune</b></p>
            <p style={{ marginTop: 14, fontSize: 13.5, lineHeight: 1.6, color: 'var(--txt-4)' }}>
              Rien n’est estimé à la place de ces valeurs. Tant qu’aucune journée
              n’est marquée, aucune progression n’est dessinée.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
