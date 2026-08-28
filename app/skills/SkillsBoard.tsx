'use client';

// Liste dense des compétences — V65.
//
// Ce n'est plus une grille de curseurs d'auto-évaluation : c'est une lecture
// de PREUVES. Pour chaque compétence : l'état projeté, combien de preuves le
// soutiennent, la dernière, s'il faut réviser, et POURQUOI cet état — le tout
// dérivé, jamais déclaré.
//
// L'explication vient du moteur (`whyCompetencyState`). Aucun texte explicatif
// n'est écrit en dur ici (exigence CP6).

import Link from 'next/link';
import { useState } from 'react';
import { Check, CircleDot, Circle, Layers, AlertTriangle, ExternalLink } from 'lucide-react';
import type { CompetencyProjection, CompetencyExplanation, CompetencyState } from '@/lib/competency';
import { Status } from '@/app/ui';
import type { Tone } from '@/app/ui';

const STATE_ORDER: CompetencyState[] = ['reinforced', 'demonstrated', 'practiced', 'unassessed'];

const STATE_META: Record<CompetencyState, { label: string; tone: Tone; hint: string; Icon: typeof Check }> = {
  reinforced: {
    label: 'Consolidée', tone: 'positive', Icon: Layers,
    hint: 'Plusieurs preuves qualifiantes, de sources et de jours différents.',
  },
  demonstrated: {
    label: 'Démontrée', tone: 'positive', Icon: Check,
    hint: 'Au moins une validation réussie par un validateur du produit.',
  },
  practiced: {
    label: 'Pratiquée', tone: 'accent', Icon: CircleDot,
    hint: 'Des traces existent, mais aucune validation réussie.',
  },
  unassessed: {
    label: 'Non évaluée', tone: 'neutral', Icon: Circle,
    hint: 'Aucune preuve — le produit ne se prononce pas.',
  },
};

function shortDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function SkillsBoard({
  competencies, explanations, skillNames,
}: {
  competencies: CompetencyProjection[];
  explanations: Record<string, CompetencyExplanation>;
  skillNames: Record<string, string>;
}) {
  const [open, setOpen] = useState<string | null>(null);

  const groups = STATE_ORDER
    .map((state) => ({ state, list: competencies.filter((c) => c.state === state) }))
    .filter((g) => g.list.length > 0);

  return (
    <div className="cmp-board">
      {groups.map(({ state, list }) => {
        const meta = STATE_META[state];
        return (
          <section key={state} className="cmp-group" aria-labelledby={`cmp-h-${state}`}>
            <div className="cmp-group-head">
              <h2 id={`cmp-h-${state}`} className="cmp-group-t">
                <Status tone={meta.tone} label={meta.label} />
              </h2>
              <span className="cmp-group-n">{list.length}</span>
              <span className="cmp-group-hint">{meta.hint}</span>
            </div>

            <ul className="cmp-list">
              {list.map((c) => {
                const why = explanations[c.competencyId];
                const isOpen = open === c.competencyId;
                return (
                  <li key={c.competencyId} className={`cmp-row${isOpen ? ' is-open' : ''}`}>
                    <div className="cmp-main">
                      <span className="cmp-name">{c.name ?? skillNames[c.competencyId] ?? c.competencyId}</span>
                      {c.needsReview && (
                        <span className="cmp-flag" title={c.needsReviewReasons.join(' · ')}>
                          <AlertTriangle size={12} strokeWidth={2.2} /> à revoir
                        </span>
                      )}
                    </div>

                    {/* Des grandeurs RÉELLES : des décomptes et des dates, jamais un
                        pourcentage. Et RIEN quand il n'y a rien : une compétence non
                        évaluée n'affiche pas trois zéros et un tiret. Vu à l'œil sur la
                        capture 1440 — quinze compétences non évaluées produisaient
                        quarante-cinq zéros alignés, avec le poids visuel d'une donnée
                        réelle. C'est la dette P0-1 de V63 sous une autre forme ; les
                        sondes, elles, étaient vertes. */}
                    {c.evidenceCount > 0 ? (
                      <dl className="cmp-facts">
                        <div><dt>Preuves qualifiantes</dt><dd>{c.qualifyingEvidenceCount}</dd></div>
                        <div><dt>Traces au total</dt><dd>{c.evidenceCount}</dd></div>
                        <div><dt>Dernière preuve</dt><dd>{shortDate(c.lastQualifiedEvidenceAt ?? c.lastEvidenceAt)}</dd></div>
                      </dl>
                    ) : (
                      <span className="cmp-none">aucune trace enregistrée</span>
                    )}

                    <button
                      type="button"
                      className="btn small cmp-why"
                      aria-expanded={isOpen}
                      aria-controls={`cmp-d-${c.competencyId}`}
                      onClick={() => setOpen(isOpen ? null : c.competencyId)}
                    >
                      {isOpen ? 'Masquer' : c.evidenceCount > 0 ? 'Voir les preuves' : 'Pourquoi cet état'}
                    </button>

                    {isOpen && why && (
                      <div className="cmp-detail" id={`cmp-d-${c.competencyId}`}>
                        <p className="cmp-rule">{why.rule}</p>
                        {why.facts.map((f, i) => <p key={i} className="cmp-fact">{f}</p>)}

                        {why.needsReview && why.needsReviewReasons.length > 0 && (
                          <ul className="cmp-review">
                            {why.needsReviewReasons.map((r, i) => (
                              <li key={i}><AlertTriangle size={12} strokeWidth={2} /> {r}</li>
                            ))}
                          </ul>
                        )}

                        {why.evidence.length > 0 && (
                          <ul className="cmp-ev">
                            {why.evidence.map((e) => (
                              <li key={e.id} className={`cmp-ev-item${e.qualifying ? ' is-q' : ''}`}>
                                <span className="cmp-ev-src">{e.sourceLabel}</span>
                                <span className="cmp-ev-title">
                                  {e.artifactRef
                                    ? <Link href={e.artifactRef}>{e.title || e.sourceId} <ExternalLink size={11} /></Link>
                                    : (e.title || e.sourceId)}
                                </span>
                                {e.dayId != null && <Link className="cmp-ev-day" href={`/day/${e.dayId}`}>Jour {e.dayId}</Link>}
                                <span className="cmp-ev-date">{shortDate(e.createdAt)}</span>
                                <span className="cmp-ev-val">
                                  {e.qualifying
                                    ? <><Check size={11} strokeWidth={2.4} /> {e.validationDetail || 'validée'}</>
                                    : 'non qualifiante'}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
