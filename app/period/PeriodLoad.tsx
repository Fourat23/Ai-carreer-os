// V57 — Bloc de charge PARTAGÉ par /month/[id] et /week/[id].
//
// Grammaire commune, rendu différent selon l'unité : le mois montre ses
// semaines, la semaine montre ses journées. Les deux montrent la même chose
// ensuite — compétences travaillées, nature des journées, difficulté — parce
// que ce sont les mêmes faits à deux échelles. Partager le composant évite
// deux vocabulaires visuels pour une seule idée, sans cloner un template :
// la zone d'ouverture diffère réellement.
//
// Aucune carte : ce sont des TABLEAUX et des BANDES. Une ligne de semaine n'a
// ni action autonome, ni cycle de vie propre — la frontière de carte n'est pas
// justifiée (ADR-057 §5).
import Link from 'next/link';

type Day = {
  day: number; title: string; skillName: string; difficulty: number; hours: number;
  isReview: boolean; deliverable: string | null; project: string | null; status: string;
};
type Week = { week: number; days: number; hours: number; done: number; first: number; last: number; skills: string[] };
type Skill = { name: string; id: string; days: number; hours: number; done: number };

export type PeriodShape = {
  count: number; hours: number; days: Day[]; weeks: Week[]; skills: Skill[];
  nature: { review: number; project: number; deliverable: number; study: number };
  difficulty: { lvl: number; days: number }[];
  deliverables: number; projects: { project: number | string; days: number[] }[];
};

const NATURE_LABEL: Record<string, string> = {
  study: 'Étude', deliverable: 'Livrable attendu', review: 'Révision', project: 'Projet',
};
const STATUS_LABEL: Record<string, string> = {
  done: 'Terminée', 'in-progress': 'En cours', 'to-review': 'À revoir', todo: 'À faire',
};

export default function PeriodLoad({ model, unit }: { model: PeriodShape; unit: 'month' | 'week' }) {
  const maxSkillDays = Math.max(...model.skills.map((s) => s.days), 1);
  const maxDiff = Math.max(...model.difficulty.map((d) => d.days), 1);
  const natureRows = (['study', 'deliverable', 'review', 'project'] as const)
    .map((k) => ({ k, n: model.nature[k] }))
    .filter((r) => r.n > 0);

  return (
    <>
      {/* ── Ouverture propre à l'unité ──────────────────────────────────── */}
      {unit === 'month' ? (
        <section className="period-weeks" aria-label="Semaines du mois">
          <div className="period-sec-head">
            <h2 className="period-h">Semaines</h2>
            <span className="period-h-note">{model.weeks.length} semaines · {model.hours} h au total</span>
          </div>
          <table className="period-table">
            <thead>
              <tr>
                <th scope="col">Semaine</th><th scope="col">Journées</th>
                <th scope="col">Heures</th><th scope="col">Compétences</th>
                <th scope="col">Avancement</th>
              </tr>
            </thead>
            <tbody>
              {model.weeks.map((w) => (
                <tr key={w.week}>
                  <th scope="row"><Link href={`/week/${w.week}`}>Semaine {w.week}</Link></th>
                  <td className="num">{w.days} <span className="period-td-sub">j{w.first}–{w.last}</span></td>
                  <td className="num">{w.hours} h</td>
                  <td className="period-td-skills">{w.skills.join(' · ')}</td>
                  <td>
                    <span className="period-mini" aria-hidden="true">
                      <span className="period-mini-fill" style={{ width: `${(w.done / w.days) * 100}%` }} />
                    </span>
                    <span className="period-td-sub">{w.done}/{w.days}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        <section className="period-days" aria-label="Journées de la semaine">
          <div className="period-sec-head">
            <h2 className="period-h">Journées</h2>
            <span className="period-h-note">{model.count} journées · {model.hours} h au total</span>
          </div>
          <ol className="period-daylist">
            {model.days.map((d) => (
              <li key={d.day} className={`period-day is-${d.status}`}>
                <Link href={`/day/${d.day}`} className="period-day-link">
                  <span className="period-day-n">J{d.day}</span>
                  <span className="period-day-body">
                    <span className="period-day-t">{d.title}</span>
                    <span className="period-day-m">
                      {d.skillName} <span className="sep">/</span> difficulté {d.difficulty}/5
                      <span className="sep">/</span> {d.hours} h
                      <span className="sep">/</span> {NATURE_LABEL[d.isReview ? 'review' : d.project ? 'project' : d.deliverable ? 'deliverable' : 'study']}
                    </span>
                  </span>
                  <span className={`period-day-s s-${d.status}`}>{STATUS_LABEL[d.status]}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ── Faits communs aux deux échelles ─────────────────────────────── */}
      <section className="period-load" aria-label="Charge de la période">
        <div className="period-load-col">
          <div className="period-sec-head">
            <h2 className="period-h">Compétences travaillées</h2>
            <span className="period-h-note">en journées réelles</span>
          </div>
          <ol className="period-rows">
            {model.skills.map((s) => (
              <li key={s.name} className="period-row">
                <span className="period-row-k">{s.name}</span>
                <span className="period-row-bar" aria-hidden="true">
                  <span className="period-row-fill" style={{ width: `${(s.days / maxSkillDays) * 100}%` }} />
                </span>
                <span className="period-row-n">{s.days} j</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="period-load-col">
          <div className="period-sec-head">
            <h2 className="period-h">Nature des journées</h2>
            <span className="period-h-note">catégories exclusives, dérivées du programme</span>
          </div>
          <ol className="period-rows">
            {natureRows.map((r) => (
              <li key={r.k} className="period-row">
                <span className="period-row-k">{NATURE_LABEL[r.k]}</span>
                <span className="period-row-bar" aria-hidden="true">
                  <span className="period-row-fill" style={{ width: `${(r.n / model.count) * 100}%` }} />
                </span>
                <span className="period-row-n">{r.n} j</span>
              </li>
            ))}
          </ol>

          <div className="period-sec-head period-sec-head-2">
            <h2 className="period-h">Difficulté</h2>
            <span className="period-h-note">échelle du curriculum, 1 à 5</span>
          </div>
          <ol className="period-rows">
            {model.difficulty.filter((d) => d.days > 0).map((d) => (
              <li key={d.lvl} className="period-row">
                <span className="period-row-k">Niveau {d.lvl}</span>
                <span className="period-row-bar" aria-hidden="true">
                  <span className="period-row-fill" style={{ width: `${(d.days / maxDiff) * 100}%` }} />
                </span>
                <span className="period-row-n">{d.days} j</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {model.projects.length > 0 && (
        <section className="period-proj" aria-label="Projets de la période">
          <div className="period-sec-head">
            <h2 className="period-h">Projets</h2>
            <span className="period-h-note">
              {model.projects.length} projet{model.projects.length > 1 ? 's' : ''} ·{' '}
              {model.projects.reduce((n, p) => n + p.days.length, 0)} journées
            </span>
          </div>
          <ul className="period-rows">
            {model.projects.map((p) => (
              <li key={String(p.project)} className="period-row period-row-proj">
                <Link href="/projects" className="period-row-k">Projet {p.project}</Link>
                <span className="period-row-txt">
                  {p.days.length} journée{p.days.length > 1 ? 's' : ''} —{' '}
                  {p.days.map((d, i) => (
                    <span key={d}>{i > 0 ? ', ' : ''}<Link href={`/day/${d}`}>jour {d}</Link></span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
