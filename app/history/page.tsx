// Historique de travail — V65.
//
// Il ne répond pas « quelles pages ai-je ouvertes ? » mais « quel travail réel
// ai-je effectué ? ». Chaque ligne est un fait DÉJÀ persisté et horodaté :
// début de session, travail rendu, preuve créée, journée terminée, révision
// effectuée. Aucun événement de navigation, aucun horodatage reconstruit.

import Link from 'next/link';
import { Play, Send, ShieldCheck, Check, RotateCcw } from 'lucide-react';
import { getLearningHistory } from '@/lib/learner-read-models';
import type { HistoryEvent } from '@/lib/learner-history';
import { PageHeader, ContextLine } from '@/app/ui';

export const dynamic = 'force-dynamic';

const ICON = {
  DAY_STARTED: Play,
  SUBMISSION_CREATED: Send,
  EVIDENCE_CREATED: ShieldCheck,
  DAY_COMPLETED: Check,
  REVIEW_COMPLETED: RotateCcw,
} as const;

function hhmm(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function longDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function HistoryPage() {
  const { groups, summary } = getLearningHistory(300);
  const empty = summary.total === 0;

  return (
    <>
      <ContextLine
        label="Historique de travail"
        facts={
          empty
            ? [{ k: 'Événements', v: 'aucun', here: true }]
            : [
                { k: 'Événements', v: `${summary.total}`, here: true },
                { k: 'Jours actifs', v: `${summary.activeDays}` },
                { k: 'Preuves', v: `${summary.byType.EVIDENCE_CREATED}` },
                { k: 'Journées terminées', v: `${summary.byType.DAY_COMPLETED}` },
              ]
        }
      />
      <PageHeader
        eyebrow="Historique"
        title="Ce que j'ai réellement fait"
        sub={<>
          Chaque ligne est un <strong>fait enregistré</strong>, avec son heure réelle. Ouvrir une page
          n&apos;est pas un fait de travail : la navigation n&apos;apparaît pas ici, et n&apos;a jamais
          été enregistrée.
        </>}
      />

      {empty ? (
        <section className="ev-empty" aria-label="Historique vide">
          <h2 className="ev-empty-t">Rien à afficher pour l&apos;instant.</h2>
          <p className="ev-empty-p">
            L&apos;historique se remplit quand tu commences une journée, rends un travail,
            obtiens une validation ou termines une révision.
          </p>
          <div className="ev-empty-actions">
            <Link className="btn cta" href="/">Reprendre mon parcours</Link>
          </div>
        </section>
      ) : (
        <div className="hist">
          {groups.map((g) => (
            <section key={g.date} className="hist-day" aria-labelledby={`h-${g.date}`}>
              <h2 id={`h-${g.date}`} className="hist-date">{longDate(g.date)}</h2>
              <ol className="hist-list">
                {g.events.map((e: HistoryEvent, i: number) => {
                  const Icon = ICON[e.type] ?? Play;
                  return (
                    <li key={`${e.type}-${e.at}-${i}`} className={`hist-item t-${e.type.toLowerCase()}`}>
                      <time className="hist-time" dateTime={e.at}>{hhmm(e.at)}</time>
                      <span className="hist-icon" aria-hidden="true"><Icon size={13} strokeWidth={2.2} /></span>
                      <span className="hist-label">
                        {e.dayId != null && e.type !== 'EVIDENCE_CREATED'
                          ? <Link href={`/day/${e.dayId}`}>{e.label}</Link>
                          : e.label}
                        {e.type === 'EVIDENCE_CREATED' && e.qualifying === false && (
                          <span className="hist-tag">non qualifiante</span>
                        )}
                      </span>
                      {e.detail && <span className="hist-detail">{e.detail}</span>}
                      {e.competencyIds && e.competencyIds.length > 0 && (
                        <span className="hist-comp">{e.competencyIds.join(' · ')}</span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
