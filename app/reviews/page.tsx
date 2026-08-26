import Link from 'next/link';
import { getProgram, getDocHtml } from '@/lib/program';
import { readProgress } from '@/lib/progress-server';
import { EvidenceMark, SurfaceHead, ContextLine } from '@/app/ui';
import { annotateProseA11y } from '@/lib/section-family';
import { demoteDocTitle } from '@/lib/doc-sections';

export const dynamic = 'force-dynamic';

// V57 · CP8 — /reviews échouait R4 et empilait un hero, un tableau de 52
// lignes dans une carte, une rangée de 12 boutons de mois et deux documents.
// Une page d'évaluation doit d'abord servir la DÉCISION : qu'est-ce qui est
// dû, qu'est-ce qui a été fait, quel écart, quelle remédiation.
//
// La page est donc organisée autour de trois échelles réelles de revue —
// hebdomadaire, mensuelle, entretien — et la première d'entre elles est
// résolue jusqu'à l'action : la prochaine revue non faite.
//
// Aucune note n'est calculée. Une revue reste un rendez-vous avec soi-même :
// le produit dit ce qui est dû et ce qui est fait, jamais ce que ça vaut.
//
// Motif propriétaire : EvidenceMark, pour ce qu'il exprime — la NATURE d'une
// preuve. Une revue produite est une évaluation (`assessment`), un bilan
// mensuel en est une autre : le glyphe distingue les deux natures, il ne
// récompense rien et ne compte rien.
export default function ReviewsPage() {
  const program = getProgram();
  const progress = readProgress();
  const monthly = getDocHtml('rubrics/monthly-evaluation.md');
  const interview = getDocHtml('rubrics/interview-evaluation.md');
  const statusOf = (d: number) => progress.days?.[String(d)]?.status ?? 'todo';

  const reviewDays = (program.days as { day: number; week: number; month: number; isReview?: boolean }[])
    .filter((d) => d.isReview);
  const done = reviewDays.filter((d) => statusOf(d.day) === 'done');
  const next = reviewDays.find((d) => statusOf(d.day) !== 'done') ?? null;

  // Revues groupées par mois : c'est l'échelle à laquelle on décide vraiment
  // (« ce mois-ci, qu'est-ce que je n'ai pas bouclé ? »), pas 52 lignes à plat.
  const byMonth = [...reviewDays.reduce((m, d) => {
    const cur = m.get(d.month) ?? [];
    cur.push(d); m.set(d.month, cur);
    return m;
  }, new Map<number, typeof reviewDays>()).entries()].sort((a, b) => a[0] - b[0]);

  return (
    <div className="rv">
      <ContextLine
        label="État de la boucle d’évaluation"
        facts={[
          { k: 'Revues hebdo', v: `${reviewDays.length}` },
          { k: 'Terminées', v: `${done.length}`, here: true },
          { k: 'Restantes', v: `${reviewDays.length - done.length}` },
          { k: 'Grilles', v: `${[monthly, interview].filter(Boolean).length}` },
        ]}
      />
      {/* ── POSITION : où en est la boucle d'évaluation ─────────────────────
          V58 · CP10 — bande d'identité partagée (famille « pilot » : cette
          surface pilote une boucle, elle ne catalogue pas des objets). */}
      <SurfaceHead
        kind="pilot"
        eyebrow={<>Évaluer <span className="sep">/</span> trois échelles de revue</>}
        title="Évaluations"
        lead={<>Rien n’est noté automatiquement. Le produit dit ce qui est dû et ce qui est
          fait ; ce que ça vaut, c’est toi qui l’écris, avec les grilles ci-dessous.</>}
        facts={[
          { k: 'Revues hebdo au programme', v: reviewDays.length },
          { k: 'Terminées', v: done.length },
          { k: 'Grilles disponibles', v: [monthly, interview].filter(Boolean).length },
        ]}
      />

      {/* ── DÉCISION : la prochaine revue due, résolue jusqu'à l'action ───── */}
      {next ? (
        <section className="rv-next" aria-label="Prochaine revue">
          <div className="rv-next-body">
            <span className="rv-next-k">Prochaine revue hebdomadaire non faite</span>
            <p className="rv-next-t">Semaine {next.week} — jour {next.day}</p>
            <p className="rv-next-d">
              {done.length} revue{done.length > 1 ? 's' : ''} derrière toi ·{' '}
              {reviewDays.length - done.length} restante{reviewDays.length - done.length > 1 ? 's' : ''}
            </p>
          </div>
          <Link className="btn cta" href={`/day/${next.day}`}>Ouvrir la revue</Link>
        </section>
      ) : (
        <section className="rv-next" aria-label="Prochaine revue">
          <div className="rv-next-body">
            <span className="rv-next-k">Revues hebdomadaires</span>
            <p className="rv-next-t">Les {reviewDays.length} revues du programme sont marquées faites.</p>
          </div>
        </section>
      )}

      {/* ── ÉCARTS : par mois, l'échelle à laquelle on décide ─────────────── */}
      <section className="rv-grid" aria-label="Revues hebdomadaires par mois">
        <div className="rv-sec-head">
          <h2 className="rv-h">Revues hebdomadaires</h2>
          <span className="rv-h-note">une par semaine · groupées par mois</span>
        </div>
        <ol className="rv-months">
          {byMonth.map(([month, list]) => {
            const d = list.filter((x) => statusOf(x.day) === 'done').length;
            return (
              <li key={month} className="rv-month">
                <Link href={`/month/${month}`} className="rv-month-k">Mois {month}</Link>
                <span className="rv-month-weeks">
                  {list.map((x) => (
                    <Link
                      key={x.day}
                      href={`/day/${x.day}`}
                      className={`rv-week s-${statusOf(x.day)}`}
                      title={`Semaine ${x.week} — jour ${x.day} — ${statusOf(x.day) === 'done' ? 'faite' : 'à faire'}`}
                    >
                      S{x.week}
                    </Link>
                  ))}
                </span>
                <span className="rv-month-n">{d}/{list.length}</span>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ── GRILLES : ce sur quoi on statue, documents inchangés ──────────── */}
      <section className="rv-rubrics" aria-label="Grilles d’évaluation">
        <div className="rv-sec-head">
          <h2 className="rv-h">Grilles</h2>
          <span className="rv-h-note">documents du curriculum, inchangés</span>
        </div>
        {monthly && (
          <details className="rv-rubric">
            <summary>
              <EvidenceMark type="assessment" />
              <span className="rv-rubric-t">Bilan mensuel</span>
              <span className="rv-rubric-d">à tenir à la fin de chaque mois</span>
            </summary>
            <article className="prose reading" dangerouslySetInnerHTML={{ __html: demoteDocTitle(annotateProseA11y(monthly)) }} />
          </details>
        )}
        {interview && (
          <details className="rv-rubric">
            <summary>
              <EvidenceMark type="assessment" />
              <span className="rv-rubric-t">Grille d’entretien</span>
              <span className="rv-rubric-d">se relire comme un recruteur le ferait</span>
            </summary>
            <article className="prose reading" dangerouslySetInnerHTML={{ __html: demoteDocTitle(annotateProseA11y(interview)) }} />
          </details>
        )}
      </section>
    </div>
  );
}
