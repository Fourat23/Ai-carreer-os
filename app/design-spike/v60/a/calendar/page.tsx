// V60 · A — MISSION CONTROL · Calendar.
//
// COMPOSITION : l'année en UN SEUL RUBAN continu, pas douze cartes. Chaque
// mois est un SECTEUR dont la largeur est proportionnelle à son nombre réel
// de journées, subdivisé en colonnes d'une journée dont la hauteur porte la
// difficulté réelle. Un mois court est donc visiblement plus étroit — c'est
// la représentation honnête que le brief demande.
//
// Sous le ruban, un registre tabulaire dense : les mêmes douze mois, en
// lignes, sans une seule boîte.
import { spikeData } from '../../data';
import { SpikeFlag, NoProgress } from '../../parts';

export const dynamic = 'force-dynamic';

export default function ACalendar() {
  const d = spikeData();
  const now = d.progress.resumeDay;

  return (
    <main className="dir-a">
      <SpikeFlag dir="A — Mission Control" screen="Calendar" />

      <div className="a-status">
        <div><span className="k">Carte</span><span className="v">12 mois · {d.totalDays} journées</span></div>
        <div><span className="k">Semaines</span><span className="v">{d.weeks.length}</span></div>
        <div><span className="k">Charge totale</span><span className="v">{d.hours.toLocaleString('fr-FR')} h</span></div>
        <div><span className="k">Projets</span><span className="v">{d.months.filter((m) => m.project).length}</span></div>
        <div className="grow"><NoProgress recorded={d.progress.recordedDays} /></div>
      </div>

      <div className="a-ribbon">
        <div className="a-ribbon-h">
          <h1>Carte de l’année</h1>
          <span className="k">largeur = journées réelles · hauteur = difficulté</span>
        </div>
        <div className="a-band">
          {d.months.map((mo) => (
            <div key={mo.month} className="a-mo" style={{ flex: mo.days.length }} title={`Mois ${mo.month} — ${mo.days.length} journées`}>
              {mo.days.map((day) => (
                <span key={day.day}
                      className={`a-dcol${day.project != null ? ' pj' : day.isReview ? ' rv' : ''}`}
                      style={{ height: `${18 + day.difficulty * 16}%`, opacity: day.day === now ? 1 : undefined,
                               background: day.day === now ? 'var(--now)' : undefined }} />
              ))}
            </div>
          ))}
        </div>
        <div className="a-molab">
          {d.months.map((mo) => (
            <div key={mo.month} style={{ flex: mo.days.length }}>M{mo.month} · {mo.days.length} j</div>
          ))}
        </div>
      </div>

      <table className="a-motab">
        <thead>
          <tr>
            <th style={{ width: 60 }}>Mois</th>
            <th>Programme</th>
            <th style={{ width: 96 }}>Journées</th>
            <th style={{ width: 96 }}>Heures</th>
            <th style={{ width: 96 }}>Révision</th>
            <th style={{ width: 130 }}>Difficulté max</th>
            <th style={{ width: 190 }}>Compétence dominante</th>
          </tr>
        </thead>
        <tbody>
          {d.months.map((mo) => (
            <tr key={mo.month}>
              <td className="m">{String(mo.month).padStart(2, '0')}</td>
              <td>
                <span className="ti">{mo.title}</span>
                <span className="su">{mo.summary}</span>
                {mo.project && <span className="pr">Projet {mo.project.id} — {mo.project.name}</span>}
              </td>
              <td className="num">{mo.days.length}</td>
              <td className="num">{mo.hours} h</td>
              <td className="num">{mo.reviewDays || '—'}</td>
              <td className="num">{mo.peakDifficulty} / 5</td>
              <td className="num">{mo.skills[0] ? `${mo.skills[0].name} · ${mo.skills[0].days} j` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
