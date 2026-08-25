// V60 · C — CAREER INTELLIGENCE · Calendar.
//
// COMPOSITION : douze COLONNES DE DENSITÉ alignées sur une ligne de sol
// commune. La hauteur d'une colonne est la charge réelle du mois ; les
// segments empilés sont ses journées, teintés selon révision et jalon de
// projet. Un mois court produit une colonne visiblement plus basse — il n'est
// PAS complété pour faire joli, ce que le brief exige explicitement.
//
// Sous les colonnes, les douze mois en lignes éditoriales : chiffre géant,
// titre, résumé réel, mesures à droite. Aucune carte.
import { spikeData } from '../../data';
import { SpikeFlag, NoProgress } from '../../parts';

export const dynamic = 'force-dynamic';

export default function CCalendar() {
  const d = spikeData();
  const maxDays = Math.max(...d.months.map((m) => m.days.length));

  return (
    <main className="dir-c">
      <SpikeFlag dir="C — Career Intelligence" screen="Calendar" />

      <div className="c-wide">
        <section className="c-year">
          <p className="c-eyebrow">Année complète · {d.totalDays} journées · {d.hours.toLocaleString('fr-FR')} heures</p>
          <h1 style={{ fontSize: 'clamp(34px,4.6vw,78px)', lineHeight: .98, letterSpacing: '-0.045em',
                       fontWeight: 600, marginTop: 22, maxWidth: '16ch' }}>
            Douze mois, inégaux par construction.
          </h1>
          <p style={{ marginTop: 24, maxWidth: '62ch', fontSize: 18, lineHeight: 1.55, color: 'var(--txt-2)' }}>
            La hauteur d’une colonne est le nombre réel de journées du mois, et chaque
            segment porte sa difficulté. Les mois courts restent courts : rien n’est
            complété pour égaliser la grille. <NoProgress recorded={d.progress.recordedDays} />
          </p>

          <div className="c-grid">
            {d.months.map((mo) => (
              <div key={mo.month} className="c-col">
                <span className="num">{String(mo.month).padStart(2, '0')}</span>
                <span className="stack" style={{ height: `${(mo.days.length / maxDays) * 100}%` }}>
                  {mo.days.map((x) => (
                    <i key={x.day}
                       className={x.project != null ? 'pj' : x.isReview ? 'rv' : ''}
                       style={{ opacity: 0.28 + x.difficulty * 0.14 }} />
                  ))}
                </span>
                <span className="hrs">{mo.days.length} j · {mo.hours} h</span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ paddingBottom: 90 }}>
          {d.months.map((mo) => (
            <article key={mo.month} className="c-mrow">
              <span className="mn">{String(mo.month).padStart(2, '0')}</span>
              <div>
                <h3>{mo.title}</h3>
                <p>{mo.summary}</p>
                {mo.project && <p className="pj">Projet {mo.project.id} — {mo.project.name}</p>}
              </div>
              <div className="rt">
                <div><b>{mo.days.length}</b> journées</div>
                <div><b>{mo.hours}</b> heures</div>
                <div><b>{mo.weeks.length}</b> semaines</div>
                <div><b>{mo.reviewDays || '—'}</b> révisions</div>
                <div>difficulté max <b>{mo.peakDifficulty}</b></div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
