// Détail d'UNE compétence — V65.1 · CP8.
//
// /skills répond « où j'en suis, globalement ». Cette page répond à la seule
// question que la liste ne peut pas traiter sans devenir illisible :
// « qu'est-ce qui, exactement, soutient CET état — et qu'est-ce qui manque ? ».
//
// Tout vient du read-model transverse. Aucune vérité n'est calculée ici, aucun
// texte explicatif n'est écrit en dur : la règle et les faits sont produits par
// `whyCompetencyState`, la prochaine action par `nextActionForCompetency`, et
// l'atteignabilité par le corpus lui-même.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, AlertTriangle, ExternalLink, Ban } from 'lucide-react';
import { getProgram } from '@/lib/program';
import {
  getCompetencySummary, getEvidenceLedger, getCompetencyReachability,
} from '@/lib/learner-read-models';
import { nextActionForCompetency, COMPETENCY_STATE_LABEL, COMPETENCY_STATE_TONE, EVIDENCE_SOURCE_LABEL } from '@/lib/competency';
import { isQualifying } from '@/lib/evidence';
import { PageHeader, ContextLine, Status, Panel } from '@/app/ui';
import type { Tone } from '@/app/ui';

export const dynamic = 'force-dynamic';

function frDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function SkillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const program = getProgram();
  const skill = (program.skills as Array<{ id: string; name: string }>).find((s) => s.id === id);
  if (!skill) notFound();

  const summary = getCompetencySummary();
  const c = summary.competencies.find((x) => x.competencyId === id);
  if (!c) notFound();

  const why = summary.explanations[id] ?? null;
  const ledger = getEvidenceLedger();
  const all = ledger.getEvidenceBySkill(id);
  const qualifying = all.filter(isQualifying);
  const insufficient = all.filter((e) => !isQualifying(e));
  const reach = getCompetencyReachability()[id];
  const next = nextActionForCompetency(c);
  const tone = COMPETENCY_STATE_TONE[c.state] as Tone;

  return (
    <>
      <ContextLine
        label="Compétence"
        facts={[
          { k: 'Compétence', v: skill.name, here: true },
          { k: 'État', v: COMPETENCY_STATE_LABEL[c.state] },
          { k: 'Preuves qualifiantes', v: `${qualifying.length}` },
          { k: 'Traces au total', v: `${all.length}` },
          { k: 'Dernière preuve', v: frDate(c.lastQualifiedEvidenceAt ?? c.lastEvidenceAt) },
        ]}
      />

      <PageHeader
        eyebrow={<><Link href="/skills">Compétences</Link> <span className="sep">/</span> {skill.name}</>}
        title={skill.name}
        sub={<>
          État <strong>{COMPETENCY_STATE_LABEL[c.state]}</strong> — projeté depuis les preuves
          ci-dessous, jamais déclaré. <Link href="/doc/rubrics/skills-scorecard">Grille des niveaux</Link>.
        </>}
      />

      <div className="cmpd-grid">
        <div className="cmpd-main">
          {/* ── POURQUOI CET ÉTAT ─────────────────────────────────────── */}
          <Panel label="Pourquoi cet état">
            <div className="cmpd-state"><Status tone={tone} label={COMPETENCY_STATE_LABEL[c.state]} /></div>
            {why && (
              <>
                <p className="cmpd-rule">{why.rule}</p>
                {why.facts.map((f, i) => <p key={i} className="cmpd-fact">{f}</p>)}
              </>
            )}
            {c.needsReview && c.needsReviewReasons.length > 0 && (
              <ul className="cmpd-review">
                {c.needsReviewReasons.map((r, i) => (
                  <li key={i}><AlertTriangle size={13} strokeWidth={2} aria-hidden /> {r}</li>
                ))}
              </ul>
            )}
          </Panel>

          {/* ── PREUVES RETENUES ──────────────────────────────────────── */}
          <section className="cmpd-sec" aria-labelledby="cmpd-h-q">
            <h2 id="cmpd-h-q" className="cmpd-h">Preuves retenues</h2>
            {qualifying.length === 0 ? (
              <p className="cmpd-none">
                Aucune preuve qualifiante. Une compétence se démontre par une <strong>validation
                réussie</strong> produite par un validateur du produit — pas par une journée terminée
                ni par une note personnelle.
              </p>
            ) : (
              <ul className="cmpd-ev">
                {[...qualifying].reverse().map((e) => (
                  <li key={e.id} className="cmpd-ev-item is-q">
                    <span className="cmpd-ev-src">{EVIDENCE_SOURCE_LABEL[e.sourceType] ?? e.sourceType}</span>
                    <span className="cmpd-ev-title">
                      {e.artifactRef
                        ? <Link href={e.artifactRef}>{e.title || e.sourceId} <ExternalLink size={11} aria-hidden /></Link>
                        : (e.title || e.sourceId)}
                    </span>
                    <span className="cmpd-ev-date">{frDate(e.createdAt)}</span>
                    {e.dayId != null && <Link className="cmpd-ev-day" href={`/day/${e.dayId}`}>Jour {e.dayId}</Link>}
                    <span className="cmpd-ev-val">
                      <Check size={12} strokeWidth={2.4} aria-hidden /> {e.validation?.detail || 'validée'}
                    </span>
                    {/* PROVENANCE — qui a produit ce fait, et comment. Sans elle,
                        une preuve est une affirmation. */}
                    <span className="cmpd-ev-prov">
                      {e.provenance?.producer} · {e.provenance?.method}
                      {e.provenance?.note ? ` · ${e.provenance.note}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ── TENTATIVES QUI NE SUFFISENT PAS ───────────────────────── */}
          <section className="cmpd-sec" aria-labelledby="cmpd-h-n">
            <h2 id="cmpd-h-n" className="cmpd-h">Traces qui ne démontrent pas</h2>
            {insufficient.length === 0 ? (
              <p className="cmpd-none">Aucune trace non qualifiante enregistrée.</p>
            ) : (
              <ul className="cmpd-ev">
                {[...insufficient].reverse().map((e) => (
                  <li key={e.id} className="cmpd-ev-item">
                    <span className="cmpd-ev-src">{EVIDENCE_SOURCE_LABEL[e.sourceType] ?? e.sourceType}</span>
                    <span className="cmpd-ev-title">{e.title || e.sourceId}</span>
                    <span className="cmpd-ev-date">{frDate(e.createdAt)}</span>
                    {e.dayId != null && <Link className="cmpd-ev-day" href={`/day/${e.dayId}`}>Jour {e.dayId}</Link>}
                    <span className="cmpd-ev-val">
                      {/* POURQUOI elle ne suffit pas — le fait, pas un jugement. */}
                      {e.validation?.status === 'failed'
                        ? `validation en échec${e.validation.detail ? ` · ${e.validation.detail}` : ''}`
                        : e.sourceType === 'review' ? 'une révision atteste d’un réentraînement, pas d’une démonstration'
                        : e.sourceType === 'declared' ? 'déclarée par toi — le produit ne certifie pas'
                        : e.sourceType === 'submission' ? 'travail rendu, non noté par le produit'
                        : 'aucune validation réussie'}
                    </span>
                    <span className="cmpd-ev-prov">
                      {e.provenance?.producer} · {e.provenance?.method}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="cmpd-rail">
          {/* ── PROCHAINE ACTION RÉELLE ───────────────────────────────── */}
          <Panel label="Prochaine action">
            {reach && !reach.reachable ? (
              // HONNÊTETÉ SUR LE CORPUS (CP3) : quand le produit n'offre aucun
              // moyen de démontrer cette compétence, c'est SON manque, pas celui
              // de l'apprenant. On ne propose pas une action qui n'existe pas.
              <p className="cmpd-note">
                <Ban size={13} strokeWidth={2} aria-hidden /> Le programme ne propose
                aujourd&apos;hui <strong>aucun exercice, diagnostic, mission ni capstone</strong> portant
                sur cette compétence. Elle ne peut donc pas sortir de « Non évaluée » — ce n&apos;est pas
                une lacune de ta part.
              </p>
            ) : next ? (
              <>
                <div className="cmpd-next-a">{next.action}</div>
                <p className="cmpd-next-r">{next.reason}</p>
                <p className="cmpd-next-e"><strong>Preuve attendue :</strong> {next.expectedEvidence}</p>
                <p className="cmpd-next-g"><strong>Objectif :</strong> {next.goal}</p>
                <Link className="btn cta" href={next.href}>{next.cta}</Link>
              </>
            ) : (
              <p className="cmpd-note">
                Compétence consolidée : plusieurs preuves qualifiantes, de sources et de jours
                différents. Rien à faire dans l&apos;immédiat.
              </p>
            )}
          </Panel>

          {/* ── CE QUE LE PROGRAMME PROPOSE ───────────────────────────── */}
          <Panel label="Ce que le programme propose">
            {reach ? (
              <dl className="cmpd-reach">
                <div><dt>Exercices</dt><dd>{reach.exercises}</dd></div>
                <div><dt>Diagnostics</dt><dd>{reach.assessments}</dd></div>
                <div><dt>Missions</dt><dd>{reach.missions}</dd></div>
                <div><dt>Capstones</dt><dd>{reach.capstones}</dd></div>
              </dl>
            ) : <p className="cmpd-note">—</p>}
            <p className="cmpd-note">
              Sources capables de produire une preuve qualifiante sur cette compétence.
              Une source disponible n&apos;est pas une preuve : il faut la réussir.
            </p>
          </Panel>

          <Panel label="Historique">
            <p className="cmpd-note">
              {all.length === 0
                ? 'Aucune trace enregistrée pour cette compétence.'
                : `${all.length} trace${all.length > 1 ? 's' : ''} enregistrée${all.length > 1 ? 's' : ''}, dont ${qualifying.length} qualifiante${qualifying.length > 1 ? 's' : ''}.`}
            </p>
            <Link href="/history">Voir l&apos;historique complet</Link>
          </Panel>
        </aside>
      </div>
    </>
  );
}
