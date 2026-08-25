// V60 · A — MISSION CONTROL · Day (journée 80, réelle).
//
// COMPOSITION : un PLAN DE VOL horizontal en tête — les six temps de la
// journée en segments, celui qui est en cours occupant sa propre colonne et
// portant un liseré. Puis une gouttière verticale collante à gauche qui
// répète l'étape courante en position spatiale, et le contenu en sections
// ouvertes séparées par des filets pleine largeur.
//
// Ce n'est ni six cartes empilées, ni un article avec sommaire : le statut
// courant est lisible sans lire, par la position.
import { spikeDay, splitDay } from '../../data';
import { SpikeFlag, FAMILY_LABEL, Inline } from '../../parts';

export const dynamic = 'force-dynamic';

const DAY = 80;
// Les six temps de la mission, dans l'ordre du brief.
const STAGES = ['Objectif', 'Comprendre', 'Pratiquer', 'Vérifier', 'Produire', 'Réviser'];
const STAGE_OF: Record<string, number> = {
  objective: 0, learn: 1, observe: 1, practice: 2, verify: 3, apply: 4, prepare: 4, retain: 5,
};

export default function ADay() {
  const { meta, html, phases, week, month } = spikeDay(DAY);
  if (!meta) return null;

  const parts = splitDay(html);

  // L'étape « en cours » du prototype : la première phase pratique réelle.
  const currentIx = Math.max(0, parts.findIndex((p) => p.family === 'practice'));
  const currentStage = STAGE_OF[parts[currentIx]?.family ?? 'objective'] ?? 0;

  return (
    <main className="dir-a">
      <SpikeFlag dir="A — Mission Control" screen={`Day · journée ${DAY}`} />

      <div className="a-status">
        <div><span className="k">Mission</span><span className="v">J{DAY}</span></div>
        <div><span className="k">Secteur</span><span className="v">M{meta.month} · S{meta.week}</span></div>
        <div><span className="k">Compétence</span><span className="v">{meta.skillName}</span></div>
        <div><span className="k">Difficulté</span><span className="v">{meta.difficulty}/5</span></div>
        <div><span className="k">Durée</span><span className="v">{meta.hours} h</span></div>
        <div className="grow">{week?.theme}</div>
      </div>

      {/* Relevé sur capture : le hero à deux colonnes répétait le livrable à
          l'identique à gauche et à droite, et la colonne de droite restait aux
          deux tiers vide. Une seule bande, le titre et ses spécifications. */}
      <div className="a-op-solo">
        <div>
          <p className="a-op-tag">Mission {DAY} · {month?.title}</p>
          <h1>{meta.title}</h1>
          {meta.deliverable && <p className="a-op-obj"><Inline text={meta.deliverable} /></p>}
        </div>
        <dl className="a-op-spec a-op-spec-v">
          <div><dt>Compétence</dt><dd style={{ fontSize: 17 }}>{meta.skillName}</dd></div>
          <div><dt>Difficulté</dt><dd>{meta.difficulty}<small> / 5</small></dd></div>
          <div><dt>Durée</dt><dd>{meta.hours}<small> h</small></dd></div>
          <div><dt>Temps</dt><dd>{phases.length}</dd></div>
          <div><dt>Sections</dt><dd>{parts.length}</dd></div>
        </dl>
      </div>

      <div className="a-plan">
        {STAGES.map((s, i) => (
          <div key={s} className={`a-plan-seg${i === currentStage ? ' on' : i < currentStage ? ' done' : ''}`}>
            {String(i + 1).padStart(2, '0')}
            <b>{s}</b>
          </div>
        ))}
      </div>

      <div className="a-day">
        <nav className="a-gutter" aria-label="Temps de la mission">
          {parts.map((p, i) => (
            <a key={p.id} href={`#${p.id}`} className={`a-step${i === currentIx ? ' on' : ''}`}>
              <b>{String(i + 1).padStart(2, '0')}</b>
              {p.family ? FAMILY_LABEL[p.family] ?? '' : '—'}
            </a>
          ))}
        </nav>
        <div className="a-main">
          {parts.map((p, i) => (
            <section key={p.id} id={p.id} className="a-sec">
              <h2 className="a-sec-h">
                <b>{String(i + 1).padStart(2, '0')}</b>
                {p.family ? FAMILY_LABEL[p.family] : '—'}
                <span style={{ color: 'var(--txt)', letterSpacing: 0, textTransform: 'none', fontSize: 15 }}>{p.label}</span>
                {i === currentIx && <span className="r">en cours</span>}
              </h2>
              <div className="a-sec-b" dangerouslySetInnerHTML={{ __html: p.body }} />
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
