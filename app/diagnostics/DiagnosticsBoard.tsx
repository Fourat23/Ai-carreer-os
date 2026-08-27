'use client';

// Board de diagnostics : liste par domaine, prise d'une évaluation, correction
// DÉTERMINISTE en local (gradeAssessment, modèle pur) et restitution par niveau de
// taxonomie + remédiation. N'écrit RIEN dans la progression : la frontière
// preuve/proxy est rappelée explicitement.
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Check, X, ChevronLeft, GraduationCap, RotateCcw, Save } from 'lucide-react';
import { gradeAssessment, TAXONOMY } from '@/lib/assessment';
import type { Assessment, AssessmentResult, Taxonomy } from '@/lib/assessment';
import { SurfaceHead } from '@/app/ui';

const TAXO_LABEL: Record<Taxonomy, string> = {
  RECALL: 'Se souvenir',
  UNDERSTANDING: 'Expliquer',
  APPLICATION: 'Appliquer',
  DIAGNOSIS: 'Diagnostiquer',
  TRANSFER: 'Transposer',
};

type Responses = Record<string, number | number[] | string>;

export default function DiagnosticsBoard({
  assessments,
  skillNames,
  /** Ancre du catalogue : l'action principale de la page y mène. */
  anchorId,
}: {
  assessments: Assessment[];
  skillNames: Record<string, string>;
  anchorId?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = assessments.find((a) => a.id === openId) ?? null;

  const byDomain = useMemo(() => {
    const m = new Map<string, Assessment[]>();
    for (const a of assessments) {
      const d = a.domain || 'Autres';
      if (!m.has(d)) m.set(d, []);
      m.get(d)!.push(a);
    }
    return [...m.entries()].sort((x, y) => x[0].localeCompare(y[0]));
  }, [assessments]);

  if (open) {
    return <TakeAssessment assessment={open} skillNames={skillNames} onBack={() => setOpenId(null)} />;
  }

  // V57 · CP7 — Correction STRUCTURELLE, dans le DOM, pas en CSS.
  //
  // Cause établie au CP0 : ce composant émettait une <section> par domaine —
  // 14 sections sœurs de poids quasi égal, le hero (1016×305) plus petit que
  // la première section de contenu (1016×328). `dominance` étant le rapport
  // d'aire du plus grand bloc à la somme des blocs de premier niveau, elle
  // plafonnait mécaniquement à 0,102. Aucune règle de fond, de bordure ou
  // d'ombre ne pouvait la déplacer : les deux passes CSS de V56 visaient un
  // défaut de structure. Un seul bloc structurant désormais, les domaines
  // redeviennent des groupes internes.
  //
  // Et les 14 « cartes » mesurées n'étaient pas les items : V56 avait bien
  // dépouillé .diag-card et donné fond + bordure + rayon au conteneur
  // .diag-grid. La frontière avait été DÉPLACÉE d'un niveau, pas supprimée.
  return (
    <>
      <nav className="cat-index" id={anchorId} aria-label="Domaines">
        <span className="cat-index-k">Domaines</span>
        <ul className="cat-index-list">
          {byDomain.map(([domain, list]) => (
            <li key={domain}>
              <a href={`#dom-${slug(domain)}`}>{domain} <span className="cat-index-n">{list.length}</span></a>
            </li>
          ))}
        </ul>
      </nav>

      <section className="cat" aria-label="Catalogue des diagnostics">
        {byDomain.map(([domain, list]) => (
          <div key={domain} className="cat-group" id={`dom-${slug(domain)}`}>
            <div className="cat-group-head">
              <h2 className="cat-group-name">{domain}</h2>
              <span className="cat-group-n">{list.length} diagnostic{list.length > 1 ? 's' : ''}</span>
            </div>
            <ul className="cat-rows">
              {list.map((a) => {
                const counts = taxonomyCounts(a);
                return (
                  <li key={a.id} className="cat-row">
                    <button className="cat-row-link" onClick={() => setOpenId(a.id)}>
                      <span className="cat-row-body">
                        <span className="cat-row-title">{a.title}</span>
                        <span className="cat-row-sub">{a.skills.map((s) => skillNames[s] ?? s).join(' · ')}</span>
                      </span>
                      <span className="cat-row-tags">
                        {TAXONOMY.filter((t) => counts[t] > 0).map((t) => (
                          <span key={t} className="cat-tag">{TAXO_LABEL[t]} {counts[t]}</span>
                        ))}
                      </span>
                      <span className="cat-row-n">{a.questions.length} q.</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
}

const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function taxonomyCounts(a: Assessment): Record<Taxonomy, number> {
  const out = { RECALL: 0, UNDERSTANDING: 0, APPLICATION: 0, DIAGNOSIS: 0, TRANSFER: 0 };
  for (const q of a.questions) out[q.taxonomy] += 1;
  return out;
}

function TakeAssessment({
  assessment,
  skillNames,
  onBack,
}: {
  assessment: Assessment;
  skillNames: Record<string, string>;
  onBack: () => void;
}) {
  const [responses, setResponses] = useState<Responses>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function setMcq(qid: string, idx: number) {
    setResponses((r) => ({ ...r, [qid]: idx }));
  }
  function toggleMulti(qid: string, idx: number) {
    setResponses((r) => {
      const cur = Array.isArray(r[qid]) ? (r[qid] as number[]) : [];
      const next = cur.includes(idx) ? cur.filter((x) => x !== idx) : [...cur, idx];
      return { ...r, [qid]: next };
    });
  }
  function setPredict(qid: string, val: string) {
    setResponses((r) => ({ ...r, [qid]: val }));
  }

  // V64 · la correction est demandée au SERVEUR. Un score qui sera conservé
  // doit être calculé par le produit, jamais transmis par le client. Si le
  // serveur est injoignable, on corrige localement — même fonction pure — et
  // on le DIT : le résultat est alors affiché, mais non conservable.
  async function submit() {
    setBusy(true); setNotice(null);
    try {
      const res = await fetch(`/api/assessments/${encodeURIComponent(assessment.id)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses }),
      });
      const j = await res.json();
      if (res.ok && j.ok) { setResult(j.result); setOffline(false); }
      else { setResult(gradeAssessment(assessment, responses)); setOffline(true); }
    } catch {
      setResult(gradeAssessment(assessment, responses)); setOffline(true);
    }
    setBusy(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Conserver le résultat est une ACTION EXPLICITE. Rien n'est enregistré au
  // seul fait d'avoir répondu.
  async function keep() {
    setBusy(true); setNotice(null);
    try {
      const res = await fetch(`/api/assessments/${encodeURIComponent(assessment.id)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses, record: true }),
      });
      const j = await res.json();
      if (res.ok && j.ok && j.recorded) {
        setNotice(`Résultat rattaché à la journée ${j.day}.${j.evidence ? ' Une preuve a été créée.' : ' Aucune preuve : le seuil n’est pas atteint.'}`);
        window.dispatchEvent(new CustomEvent('progress-changed'));
      } else {
        setNotice(j?.reason ?? 'Le résultat n’a pas pu être conservé.');
      }
    } catch {
      setNotice('Le résultat n’a pas pu être conservé — réessaie.');
    }
    setBusy(false);
  }

  function reset() {
    setResponses({});
    setResult(null);
    setNotice(null);
  }

  const resById = new Map(result?.results.map((r) => [r.id, r]) ?? []);

  return (
    <>
      <button className="btn small ghost" onClick={onBack} style={{ marginBottom: 'var(--sp-4)' }}>
        <ChevronLeft size={14} strokeWidth={2} /> Tous les diagnostics
      </button>

      {/* V58 · CP10 — Dernier `page-head` réellement rendu du produit. Cette
          sous-vue est le DÉTAIL d'un diagnostic : elle prend la bande d'identité
          partagée, famille « detail », comme /missions/[id] et /capstones/[id]. */}
      <SurfaceHead
        kind="detail"
        eyebrow={<>{assessment.domain} <span className="sep">/</span> {assessment.skills.map((s) => skillNames[s] ?? s).join(' · ')}</>}
        title={assessment.title}
        lead={assessment.simulationNote
          ? <><span className="diag-sim">SIMULATION</span> {assessment.simulationNote}</>
          : undefined}
        facts={[
          { k: 'Questions', v: assessment.questions.length },
        ]}
      />

      {result && (
        <ResultPanel assessment={assessment} result={result} onReset={reset}
          onKeep={offline ? null : keep} busy={busy} notice={notice} />
      )}

      <ol className="diag-questions">
        {assessment.questions.map((q, qi) => {
          const r = resById.get(q.id);
          const graded = !!result;
          const cls = graded ? (r?.passed ? ' correct' : ' wrong') : '';
          return (
            <li key={q.id} className={`diag-q${cls}`}>
              <div className="diag-q-head">
                <span className="diag-q-level">{TAXO_LABEL[q.taxonomy]}</span>
                {graded && (
                  <span className={`diag-q-verdict ${r?.passed ? 'ok' : 'ko'}`}>
                    {r?.passed ? <><Check size={13} strokeWidth={2.5} /> Correct</> : <><X size={13} strokeWidth={2.5} /> À revoir</>}
                  </span>
                )}
              </div>
              <p className="diag-q-prompt">{qi + 1}. {q.prompt}</p>

              {(q.kind === 'mcq' || q.kind === 'multi') && (
                <div className="diag-options" role="group" aria-label={`Réponses à la question ${qi + 1}`}>
                  {(q.options ?? []).map((opt, oi) => {
                    const chosen = q.kind === 'mcq'
                      ? responses[q.id] === oi
                      : Array.isArray(responses[q.id]) && (responses[q.id] as number[]).includes(oi);
                    const isAnswer = graded && (Array.isArray(q.answer) ? q.answer.includes(oi) : q.answer === oi);
                    return (
                      <label key={oi} className={`diag-opt${chosen ? ' chosen' : ''}${isAnswer ? ' answer' : ''}`}>
                        <input
                          type={q.kind === 'mcq' ? 'radio' : 'checkbox'}
                          name={q.id}
                          checked={!!chosen}
                          disabled={graded}
                          onChange={() => (q.kind === 'mcq' ? setMcq(q.id, oi) : toggleMulti(q.id, oi))}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {q.kind === 'predict' && (
                <input
                  className="diag-predict"
                  type="text"
                  placeholder="Ta réponse…"
                  value={typeof responses[q.id] === 'string' ? (responses[q.id] as string) : ''}
                  disabled={graded}
                  onChange={(e) => setPredict(q.id, e.target.value)}
                />
              )}

              {graded && (
                <p className="diag-explain">
                  {!r?.passed && q.kind === 'predict' && (
                    <span className="diag-expected">Attendu : <code>{String(q.answer)}</code>. </span>
                  )}
                  {q.explanation}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {!result ? (
        <button className="btn primary" onClick={submit} disabled={busy}>{busy ? 'Correction…' : 'Corriger mes réponses'}</button>
      ) : (
        <button className="btn ghost" onClick={reset}><RotateCcw size={14} strokeWidth={2} /> Recommencer</button>
      )}
    </>
  );
}

function ResultPanel({
  assessment,
  result,
  onReset,
  onKeep,
  busy,
  notice,
}: {
  assessment: Assessment;
  result: AssessmentResult;
  onReset: () => void;
  onKeep: (() => void) | null;
  busy: boolean;
  notice: string | null;
}) {
  const pct = Math.round(result.ratio * 100);
  return (
    <div className={`diag-result ${result.passedOverall ? 'pass' : 'fail'}`}>
      <div className="diag-result-head">
        <strong>{result.passed} / {result.total} correct{result.passed > 1 ? 's' : ''} ({pct} %)</strong>
        <button className="btn small ghost" onClick={onReset}><RotateCcw size={13} strokeWidth={2} /> Refaire</button>
      </div>
      <div className="diag-result-taxo">
        {TAXONOMY.filter((t) => result.byTaxonomy[t]?.total > 0).map((t) => (
          <span key={t} className="diag-taxo-chip">
            {TAXO_LABEL[t]} : {result.byTaxonomy[t].passed}/{result.byTaxonomy[t].total}
          </span>
        ))}
      </div>
      <p className="diag-proxy">
        Ce résultat est un <strong>indice</strong> de compréhension, pas une preuve de maîtrise :
        il n'est pas enregistré automatiquement dans ta progression.
      </p>
      {/* V64 · le conserver est un geste explicite, jamais un effet de bord. */}
      {onKeep && (
        <div className="diag-keep">
          <button className="btn small" onClick={onKeep} disabled={busy}>
            <Save size={13} strokeWidth={2} /> Conserver ce résultat dans ma journée en cours
          </button>
          {notice && <span className="diag-keep-note" role="status">{notice}</span>}
        </div>
      )}
      {!result.passedOverall && (assessment.remediation?.length ?? 0) > 0 && (
        <div className="diag-remediation">
          <span className="diag-remediation-label"><GraduationCap size={14} strokeWidth={2} /> À revoir :</span>
          {assessment.remediation!.map((slug) => (
            <Link key={slug} href={`/doc/lessons/${slug}`} className="diag-remediation-link">{slug}</Link>
          ))}
        </div>
      )}
    </div>
  );
}
