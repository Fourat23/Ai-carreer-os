import Link from 'next/link';
import { HeroFocus, HeroFact } from '@/app/ui';
import { getProgram, getDocHtml } from '@/lib/program';
import { readProgress } from '@/lib/progress-server';

export const dynamic = 'force-dynamic';

export default function ReviewsPage() {
  const program = getProgram();
  const progress = readProgress();
  const monthly = getDocHtml('rubrics/monthly-evaluation.md');
  const interview = getDocHtml('rubrics/interview-evaluation.md');

  // Jours de revue hebdo = le 7e jour de chaque semaine.
  const reviewDays = program.days.filter((d) => d.isReview);
  const doneReviews = reviewDays.filter((d) => progress.days[String(d.day)]?.status === 'done').length;

  return (
    <>
      <HeroFocus
        tone="calm"
        eyebrow="Évaluations"
        title={`${doneReviews} revue${doneReviews > 1 ? 's' : ''} hebdomadaire${doneReviews > 1 ? 's' : ''} sur ${reviewDays.length}`}
        lead="Revues hebdomadaires, bilans mensuels et grilles d'entretien. Rien n'est noté automatiquement : ces revues sont des rendez-vous avec toi-même."
        meta={
          <>
            <HeroFact k="Revues hebdo">{reviewDays.length} au programme</HeroFact>
            <HeroFact k="Terminées">{doneReviews}</HeroFact>
            <HeroFact k="Grilles">mensuelle et entretien</HeroFact>
          </>
        }
      />

      <div className="section-head"><span className="section-label">Hebdo</span><h2 className="section-title">Revues hebdomadaires</h2></div>
      <div className="card">
        <table className="list">
          <thead><tr><th>Semaine</th><th>Jour de revue</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {reviewDays.map((d) => {
              const st = progress.days[String(d.day)]?.status ?? 'not-started';
              return (
                <tr key={d.day}>
                  <td>Semaine {d.week}</td>
                  <td>Jour {d.day}</td>
                  <td>{st === 'done' ? <span className="badge ok">terminée</span> : <span className="badge">à faire</span>}</td>
                  <td><Link className="btn small" href={`/day/${d.day}`}>Ouvrir</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="section-head" style={{ marginTop: 'var(--sp-8)' }}><span className="section-label">Mensuel</span><h2 className="section-title">Revues mensuelles</h2></div>
      <div className="card">
        <div className="row" style={{ flexWrap: 'wrap' }}>
          {program.months.map((m) => (
            <Link key={m.month} className="btn small" href={`/month/${m.month}`}>
              Mois {m.month}
            </Link>
          ))}
        </div>
        {monthly && (
          <details className="solution" style={{ marginTop: 16 }}>
            <summary>Grille d'évaluation mensuelle</summary>
            <div className="prose" style={{ borderRadius: '0 0 8px 8px', borderTop: 'none' }}
                 dangerouslySetInnerHTML={{ __html: monthly }} />
          </details>
        )}
      </div>

      <div className="section-head" style={{ marginTop: 'var(--sp-8)' }}><span className="section-label">Entretien</span><h2 className="section-title">Grille d'entretien</h2></div>
      {interview && (
        <article className="prose" dangerouslySetInnerHTML={{ __html: interview }} />
      )}
    </>
  );
}
