'use client';

// Board de diagnostics : liste par domaine, prise d'une évaluation, correction
// DÉTERMINISTE en local (gradeAssessment, modèle pur) et restitution par niveau de
// taxonomie + remédiation. N'écrit RIEN dans la progression : la frontière
// preuve/proxy est rappelée explicitement.
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Check, X, ChevronLeft, GraduationCap, RotateCcw } from 'lucide-react';
import { gradeAssessment, TAXONOMY } from '@/lib/assessment';
import type { Assessment, AssessmentResult, Taxonomy } from '@/lib/assessment';

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
}: {
  assessments: Assessment[];
  skillNames: Record<string, string>;
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

  return (
    <>
      {byDomain.map(([domain, list]) => (
        <section key={domain} style={{ marginBottom: 'var(--sp-6)' }}>
          <div className="section-head">
            <span className="section-label">Domaine</span>
            <h2 className="section-title">{domain}</h2>
            <span className="section-note">{list.length} diagnostic(s)</span>
          </div>
          <div className="diag-grid">
            {list.map((a) => {
              const counts = taxonomyCounts(a);
              return (
                <button key={a.id} className="diag-card" onClick={() => setOpenId(a.id)}>
                  <h3 className="diag-card-title">{a.title}</h3>
                  <p className="diag-card-skills">
                    {a.skills.map((s) => skillNames[s] ?? s).join(' · ')}
                  </p>
                  <div className="diag-taxo">
                    {TAXONOMY.filter((t) => counts[t] > 0).map((t) => (
                      <span key={t} className="diag-taxo-chip" title={TAXO_LABEL[t]}>
                        {TAXO_LABEL[t]} {counts[t]}
                      </span>
                    ))}
                  </div>
                  <span className="diag-card-cta">{a.questions.length} question(s) →</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}

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

  function submit() {
    setResult(gradeAssessment(assessment, responses));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function reset() {
    setResponses({});
    setResult(null);
  }

  const resById = new Map(result?.results.map((r) => [r.id, r]) ?? []);

  return (
    <>
      <button className="btn small ghost" onClick={onBack} style={{ marginBottom: 'var(--sp-4)' }}>
        <ChevronLeft size={14} strokeWidth={2} /> Tous les diagnostics
      </button>

      <div className="page-head">
        <div className="page-head-main">
          <p className="page-eyebrow">{assessment.domain} <span className="sep">/</span> {assessment.skills.map((s) => skillNames[s] ?? s).join(' · ')}</p>
          <h1 className="page-title">{assessment.title}</h1>
          {assessment.simulationNote && (
            <p className="page-sub"><span className="diag-sim">SIMULATION</span> {assessment.simulationNote}</p>
          )}
        </div>
      </div>

      {result && <ResultPanel assessment={assessment} result={result} onReset={reset} />}

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
        <button className="btn primary" onClick={submit}>Corriger mes réponses</button>
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
}: {
  assessment: Assessment;
  result: AssessmentResult;
  onReset: () => void;
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
