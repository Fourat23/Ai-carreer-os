// V60 · B — LEARNING WORKSTATION · Day (journée 80, réelle).
//
// C'est l'écran phare de la direction. La règle de composition est unique et
// tenue partout : LECTURE À GAUCHE, ACTION À DROITE, séparées par un filet
// plein qui va du haut au bas du volet.
//
// À gauche on lit ; à droite on fait et on prouve. Les deux défilent
// indépendamment, comme deux volets d'éditeur. Le rail de contexte à
// l'extrême gauche donne la position dans la semaine sans quitter la page.
//
// Ce n'est pas « article Markdown + sidebar » : la sidebar n'est pas un
// sommaire, c'est le plan de travail, et il porte un contenu différent du
// document.
import { spikeDay, spikeData, splitDay } from '../../data';
import { SpikeFlag, EvidenceGlyph, FAMILY_LABEL, Inline } from '../../parts';

export const dynamic = 'force-dynamic';

const DAY = 80;
/** Sections du corpus qui relèvent de l'ACTION plutôt que de la lecture. */
const ACTION_FAMILIES = new Set(['practice', 'apply', 'verify', 'prepare']);

export default function BDay() {
  const { meta, html, week, month } = spikeDay(DAY);
  const d = spikeData();
  if (!meta) return null;

  const parts = splitDay(html);

  const reading = parts.filter((p) => !p.family || !ACTION_FAMILIES.has(p.family));
  const action = parts.filter((p) => p.family && ACTION_FAMILIES.has(p.family));
  const weekDays = d.days.filter((x) => x.week === meta.week);

  return (
    <div className="dir-b">
      <SpikeFlag dir="B — Learning Workstation" screen={`Day · journée ${DAY}`} />
      <div className="b-app">
        <div className="b-tabs">
          <div className="b-tab"><span className="dot" />Poste de travail</div>
          <div className="b-tab on"><span className="dot" />Journée {DAY}</div>
          <div className="b-tab"><span className="dot" />Année</div>
          <span className="path mono">mois {meta.month} / semaine {meta.week} / jour {DAY}</span>
        </div>

        <div className="b-panes" style={{ gridTemplateColumns: '250px minmax(0, 1fr)' }}>
          <aside className="b-pane ctx">
            <div className="b-ph">Semaine {meta.week} <em>{weekDays.length} j</em></div>
            <div className="b-tree">
              {weekDays.map((x) => (
                <div key={x.day} className={`b-tnode l2${x.day === DAY ? ' on' : ''}`}>
                  <span className="g">J{x.day}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.title}</span>
                </div>
              ))}
              <div className="b-tsec">Plan de la journée</div>
              {parts.map((p, i) => (
                <a key={p.id} href={`#${p.id}`}
                   className={`b-tnode l2${p.family && ACTION_FAMILIES.has(p.family) ? ' on' : ''}`}>
                  <span className="g">{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.label}</span>
                </a>
              ))}
              <div className="b-tsec">Thème</div>
              <div className="b-tnode l2" style={{ whiteSpace: 'normal', lineHeight: 1.45 }}>{week?.theme}</div>
            </div>
          </aside>

          <main className="b-pane" style={{ display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)', overflow: 'hidden' }}>
            <div className="b-work-hd" style={{ padding: '22px 30px 18px' }}>
              <p className="b-kicker">Jour {DAY} · {month?.title}</p>
              <h1 style={{ fontSize: 'clamp(22px,2vw,32px)', marginTop: 10 }}>{meta.title}</h1>
              <dl className="b-meta" style={{ marginTop: 16, paddingTop: 12 }}>
                <div><dt>Compétence</dt><dd style={{ fontSize: 15 }}>{meta.skillName}</dd></div>
                <div><dt>Difficulté</dt><dd>{meta.difficulty}/5</dd></div>
                <div><dt>Durée</dt><dd>{meta.hours} h</dd></div>
                <div><dt>Sections lecture</dt><dd>{reading.length}</dd></div>
                <div><dt>Sections action</dt><dd>{action.length}</dd></div>
              </dl>
            </div>

            <div className="b-split">
              <section className="b-read">
                <div className="b-ph" style={{ margin: '-26px -32px 20px', position: 'static' }}>
                  Lecture · référence <em>{reading.length} sections</em>
                </div>
                <div className="b-prose">
                  {reading.map((p, i) => (
                    <div key={p.id} id={p.id}>
                      <h2>{String(i + 1).padStart(2, '0')} · {p.label}</h2>
                      <div dangerouslySetInnerHTML={{ __html: p.body }} />
                    </div>
                  ))}
                </div>
              </section>

              <section className="b-act" style={{ overflowY: 'auto' }}>
                <div className="b-ph">Action · production <em>{action.length} sections</em></div>

                <div className="b-note">
                  <b>Livrable attendu.</b> <Inline text={meta.deliverable ?? ''} />
                </div>

                {action.map((p, i) => (
                  <div key={p.id} id={p.id}>
                    <div className="b-ph" style={{ background: 'var(--pane-2)' }}>
                      <span>{String(i + 1).padStart(2, '0')} · {p.family ? FAMILY_LABEL[p.family] : ''}</span>
                      <em>{p.label}</em>
                    </div>
                    <div className="b-prose" style={{ padding: '14px 18px', fontSize: 13.5 }}
                         dangerouslySetInnerHTML={{ __html: p.body }} />
                  </div>
                ))}

                <div className="b-ph">Preuve à produire</div>
                <div className="b-evi">
                  <span style={{ color: 'var(--accent-2)' }}><EvidenceGlyph kind="practice" size={20} /></span>
                  <span className="bd"><b>Exercices de la journée</b><s>corrigés localement</s></span>
                </div>
                <div className="b-evi">
                  <span style={{ color: 'var(--accent-2)' }}><EvidenceGlyph kind="produce" size={20} /></span>
                  <span className="bd"><b>Livrable</b><s>{meta.deliverable?.slice(0, 46)}…</s></span>
                </div>
                <div className="b-evi">
                  <span style={{ color: 'var(--accent-2)' }}><EvidenceGlyph kind="verify" size={20} /></span>
                  <span className="bd"><b>Critères de validation</b><s>section « vérifier » du document</s></span>
                </div>
              </section>
            </div>
          </main>
        </div>

        <div className="b-stat">
          <span>J{DAY} / {d.totalDays}</span>
          <span>M{meta.month} · S{meta.week}</span>
          <span>{meta.skillName}</span>
          <span>{parts.length} sections</span>
          <span>lecture {reading.length} · action {action.length}</span>
          <span className="grow">prototype — aucune action n’écrit sur disque</span>
        </div>
      </div>
    </div>
  );
}
