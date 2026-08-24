import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMonthHtml, getProgram } from '@/lib/program';
import { readProgress } from '@/lib/progress-server';
import { periodModel, periodBounds } from '@/lib/period-model';
import { annotateProseA11y } from '@/lib/section-family';
import { YearBand } from '@/app/ui';
import PeriodLoad from '../../period/PeriodLoad';

export const dynamic = 'force-dynamic';

// V57 · CP3 — Le mois passe d'un `article.prose` nu (2 fonds, 1 ombre,
// amplitude 1,65 au CP0) à une VUE DE PILOTAGE. Les faits affichés existent
// tous déjà dans le programme : journées, semaines, heures, compétences,
// difficulté, nature des journées, livrables, projets. Rien n'est fabriqué —
// l'intention éditoriale du mois reste le document, elle n'est pas remplacée.
//
// Motif propriétaire : YearBand. Raison informationnelle — la question propre
// à une page de mois est « où ce mois tombe-t-il dans l'année ? ». C'est
// exactement ce que la bande d'année exprime, avec la densité réelle de chaque
// mois. Ce n'est pas un ornement ajouté pour la couverture : sans elle, la
// page ne répond pas à sa question de position.
export default async function MonthPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const month = Number(id);
  const program = getProgram();
  const { min, max } = periodBounds(program, 'month');
  if (!Number.isInteger(month) || month < min || month > max) notFound();
  const html = getMonthHtml(month);
  if (!html) notFound();

  const progress = readProgress();
  const m = periodModel(program, progress, 'month', month);
  if (!m) notFound();

  const bandDays = program.days.map((d: { day: number; month: number }) => ({
    day: d.day, month: d.month,
    status: progress.days?.[String(d.day)]?.status ?? 'todo',
  }));

  return (
    <div className="period">
      {/* ── POSITION : de quoi il s'agit, où c'est dans l'année ──────────── */}
      <section className="period-head" aria-label={`Mois ${month}`}>
        <div className="period-head-main">
          <p className="period-eyebrow">
            Parcours <span className="sep">/</span> mois {month} sur {max}
            <span className="sep">/</span> jours {m.first} à {m.last}
          </p>
          <h1 className="period-title">Mois {month}</h1>
          <p className="period-lead">
            {m.count} journées, {m.hours} h de travail prévues, réparties sur{' '}
            {m.weeks.length} semaines et {m.skills.length} compétences.
          </p>
        </div>
        <div className="period-progress">
          <span className="period-progress-k">Progression réelle</span>
          <span className="period-progress-n">{m.percent}<span className="period-progress-u">%</span></span>
          <span className="period-progress-d">{m.done} journée{m.done > 1 ? 's' : ''} terminée{m.done > 1 ? 's' : ''} sur {m.count}</span>
          <span className="period-bar" aria-hidden="true"><span className="period-bar-fill" style={{ width: `${m.percent}%` }} /></span>
        </div>
      </section>

      {/* ── TRAJECTOIRE : la position du mois dans l'année réelle ─────────── */}
      <section className="period-year" aria-label="Position dans l’année">
        <div className="period-sec-head">
          <h2 className="period-h">Position dans l’année</h2>
          <span className="period-h-note">densité réelle : un mois court occupe une bande courte</span>
        </div>
        <YearBand days={bandDays} currentDay={m.first} label={`Année du curriculum, mois ${month} en cours`} />
      </section>

      {/* ── ACTION : la prochaine journée, réelle ──────────────────────────── */}
      <section className="period-next" aria-label="Prochaine action">
        {m.next ? (
          <>
            <div className="period-next-body">
              <span className="period-next-k">Prochaine journée non terminée</span>
              <p className="period-next-t">Jour {m.next.day} — {m.next.title}</p>
              <p className="period-next-d">
                {m.next.skillName} <span className="sep">/</span> difficulté {m.next.difficulty}/5
                <span className="sep">/</span> {m.next.hours} h
                {m.next.deliverable ? <> <span className="sep">/</span> livrable attendu</> : null}
              </p>
            </div>
            <Link className="btn cta" href={`/day/${m.next.day}`}>Ouvrir le jour {m.next.day}</Link>
          </>
        ) : (
          <div className="period-next-body">
            <span className="period-next-k">Mois terminé</span>
            <p className="period-next-t">Les {m.count} journées de ce mois sont marquées terminées.</p>
          </div>
        )}
      </section>

      {/* ── CHARGE : semaines, compétences, nature, difficulté ─────────────── */}
      <PeriodLoad model={m} unit="month" />

      {/* ── INTENTION : le document du mois, jamais mis en carte ───────────── */}
      <section className="period-doc" aria-label={`Intention du mois ${month}`}>
        <div className="period-sec-head">
          <h2 className="period-h">Intention du mois</h2>
          <span className="period-h-note">document du curriculum, inchangé</span>
        </div>
        <article className="prose reading" dangerouslySetInnerHTML={{ __html: annotateProseA11y(html) }} />
      </section>

      <nav className="period-nav" aria-label="Navigation des mois">
        {month > min
          ? <Link href={`/month/${month - 1}`}>← Mois {month - 1}</Link>
          : <span className="period-nav-off">Début du parcours</span>}
        <Link href="/calendar">Calendrier complet</Link>
        {month < max
          ? <Link href={`/month/${month + 1}`}>Mois {month + 1} →</Link>
          : <span className="period-nav-off">Fin du parcours</span>}
      </nav>
    </div>
  );
}
