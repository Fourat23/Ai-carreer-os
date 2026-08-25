'use client';

// Runner de capstone : contexte + signal + artefacts consultables (signal + bruit),
// puis phases de raisonnement. Correction locale DÉTERMINISTE (gradeCapstone, modèle
// pur), puis debrief + remédiation. N'écrit RIEN dans la progression ; la frontière
// preuve/proxy et la nature SIMULÉE sont rappelées.
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Check, X, RotateCcw, FileText, GraduationCap, FlaskConical, BookOpen } from 'lucide-react';
import { gradeCapstone } from '@/lib/capstone';
import type { Capstone, CapstoneResult } from '@/lib/capstone';
import type { Taxonomy } from '@/lib/assessment';

const TAXO_LABEL: Record<Taxonomy, string> = {
  RECALL: 'Se souvenir', UNDERSTANDING: 'Expliquer', APPLICATION: 'Appliquer',
  DIAGNOSIS: 'Diagnostiquer', TRANSFER: 'Transposer',
};
const PHASE_LABEL: Record<string, string> = {
  hypotheses: 'Hypothèses', investigation: 'Investigation', diagnosis: 'Diagnostic',
  decision: 'Décision', remediation: 'Remédiation', validation: 'Validation', communication: 'Communication',
};

type Responses = Record<string, number | number[] | string>;

export default function CapstoneRunner({
  capstone, skillNames,
}: {
  capstone: Capstone;
  skillNames: Record<string, string>;
}) {
  const [responses, setResponses] = useState<Responses>({});
  const [result, setResult] = useState<CapstoneResult | null>(null);

  const resById = useMemo(
    () => new Map(result?.results.map((r) => [r.id, r]) ?? []),
    [result],
  );

  function setMcq(qid: string, idx: number) { setResponses((r) => ({ ...r, [qid]: idx })); }
  function toggleMulti(qid: string, idx: number) {
    setResponses((r) => {
      const cur = Array.isArray(r[qid]) ? (r[qid] as number[]) : [];
      return { ...r, [qid]: cur.includes(idx) ? cur.filter((x) => x !== idx) : [...cur, idx] };
    });
  }
  function setPredict(qid: string, v: string) { setResponses((r) => ({ ...r, [qid]: v })); }

  function submit() { setResult(gradeCapstone(capstone, responses)); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function reset() { setResponses({}); setResult(null); }

  return (
    <>
      {/* V58 · CP7 — L'en-tête local est remplacé par la bande d'identité
          fournie par la page (serveur). Ne reste ici que l'avertissement de
          SIMULATION, qui est une information de fiabilité et doit rester
          proche du travail, pas dans le bandeau de titre. */}
      {capstone.simulationNote && (
        <p className="det-sim">
          <span className="diag-sim">SIMULATION</span> {capstone.simulationNote}
        </p>
      )}

      {result && <CapstoneResultPanel capstone={capstone} result={result} onReset={reset} />}

      <section className="cap-brief">
        <h2 className="cap-h2">Contexte</h2>
        <p className="cap-text">{capstone.context}</p>
        <h2 className="cap-h2">Signal</h2>
        <p className="cap-signal">{capstone.signal}</p>
      </section>

      <section>
        <h2 className="cap-h2">Artefacts <span className="cap-hint">(certains sont du bruit : à toi de trier)</span></h2>
        <div className="cap-artifacts">
          {capstone.artifacts.map((a) => (
            <details key={a.id} className="cap-artifact">
              <summary><FileText size={13} strokeWidth={2} /> <span className="cap-artifact-kind">{a.kind}</span> {a.title}</summary>
              <pre className="cap-artifact-content">{a.content}</pre>
            </details>
          ))}
        </div>
      </section>

      {/* V58 · CP7 — Les phases étaient autant de <section> SŒURS de premier
          niveau : sept phases + le brief + les artefacts donnaient dix blocs de
          poids équivalent, et `dominance` plafonnait mécaniquement à 0,117.
          C'est exactement la cause identifiée sur /diagnostics au CP0 de V57,
          et elle se corrige de la même façon : dans le DOM, pas en CSS.
          Un seul bloc structurant, les phases redeviennent des groupes. */}
      <section className="cap-phases" aria-label="Déroulé du capstone">
      {capstone.phases.map((phase, pi) => (
        <div key={phase.id} className="cap-phase">
          <div className="cap-phase-head">
            <span className="cap-phase-num">Phase {pi + 1}</span>
            <h2 className="cap-phase-title">{PHASE_LABEL[phase.kind] ?? phase.title}</h2>
          </div>
          <p className="cap-phase-prompt">{phase.prompt}</p>
          <ol className="diag-questions">
            {phase.questions.map((q, qi) => {
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
                    <div className="diag-options" role="group" aria-label={`Réponses (phase ${pi + 1}, question ${qi + 1})`}>
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
                      className="diag-predict" type="text" placeholder="Ta réponse…"
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
        </div>
      ))}
      </section>

      {!result ? (
        <button className="btn primary" onClick={submit}>Corriger la simulation</button>
      ) : (
        <button className="btn ghost" onClick={reset}><RotateCcw size={14} strokeWidth={2} /> Recommencer</button>
      )}
    </>
  );
}

function CapstoneResultPanel({
  capstone, result, onReset,
}: {
  capstone: Capstone;
  result: CapstoneResult;
  onReset: () => void;
}) {
  const pct = Math.round(result.ratio * 100);
  const d = capstone.debrief;
  const list = (arr?: string[]) => (arr ?? []).filter(Boolean);
  return (
    <div className={`diag-result ${result.passedOverall ? 'pass' : 'fail'}`}>
      <div className="diag-result-head">
        <strong>{result.passed} / {result.total} correct{result.passed > 1 ? 's' : ''} ({pct} %)</strong>
        <button className="btn small ghost" onClick={onReset}><RotateCcw size={13} strokeWidth={2} /> Refaire</button>
      </div>
      <div className="diag-result-taxo">
        {result.byPhase.map((p) => (
          <span key={p.id} className="diag-taxo-chip">{PHASE_LABEL[p.kind] ?? p.title} : {p.passed}/{p.total}</span>
        ))}
      </div>
      <p className="diag-proxy">
        Ce résultat est un <strong>indice de raisonnement</strong>, pas une preuve de maîtrise :
        il n'est pas enregistré automatiquement dans ta progression. Les infrastructures décrites sont simulées.
      </p>

      <details className="cap-debrief" open>
        <summary>Debrief — raisonnement attendu &amp; pistes</summary>
        <p className="cap-debrief-reason">{d.expectedReasoning}</p>
        <div className="cap-debrief-grid">
          {list(d.keySignals).length > 0 && <DebriefBlock title="Signaux clés" items={list(d.keySignals)} />}
          {list(d.redHerrings).length > 0 && <DebriefBlock title="Faux indices" items={list(d.redHerrings)} />}
          {list(d.alternatives).length > 0 && <DebriefBlock title="Alternatives" items={list(d.alternatives)} />}
          {list(d.tradeoffs).length > 0 && <DebriefBlock title="Compromis" items={list(d.tradeoffs)} />}
          {list(d.conceptsMobilized).length > 0 && <DebriefBlock title="Concepts mobilisés" items={list(d.conceptsMobilized)} />}
          {list(d.commonMistakes).length > 0 && <DebriefBlock title="Erreurs fréquentes" items={list(d.commonMistakes)} />}
        </div>
      </details>

      {!result.passedOverall && (
        <div className="cap-remediation">
          <span className="cap-remediation-label"><GraduationCap size={14} strokeWidth={2} /> À revoir :</span>
          <div className="cap-remediation-links">
            {(capstone.lessonRefs ?? []).map((s) => (
              <Link key={`l-${s}`} href={`/doc/lessons/${s}`} className="diag-remediation-link"><BookOpen size={12} strokeWidth={2} /> {s}</Link>
            ))}
            {(capstone.exerciseRefs ?? []).map((s) => (
              <Link key={`e-${s}`} href="/lab" className="diag-remediation-link"><FlaskConical size={12} strokeWidth={2} /> {s}</Link>
            ))}
            {(capstone.playbookRefs ?? []).map((s) => (
              <span key={`p-${s}`} className="diag-remediation-link">{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DebriefBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="cap-debrief-block">
      <h3 className="cap-debrief-h3">{title}</h3>
      <ul>{items.map((it, i) => <li key={i}>{it}</li>)}</ul>
    </div>
  );
}
