'use client';

// V75 · CP9 — PASSER UN DÉFI DE TRANSFERT.
//
// ── CE QUI DISTINGUE CETTE SURFACE D'UN DIAGNOSTIC ──────────────────────
//
// Le **pont conceptuel** (`bridge`) est affiché AVANT les questions, et c'est
// délibéré : un défi de transfert n'est pas un piège. On annonce la notion
// d'origine et le contexte d'arrivée, puis on demande de faire le trajet. Cacher
// le pont testerait la devinette, pas le transfert.
//
// ── LA CORRECTION VIENT DU SERVEUR ──────────────────────────────────────
//
// Elle ne vient jamais d'ici. Un verdict calculé côté client pourrait être
// fabriqué par le client, et une preuve fabriquée est pire qu'une preuve
// absente. Le repli local existe pour ne pas perdre le travail en cas de coupure
// — et dans ce cas **la conservation est désactivée**, explicitement.
//
// ── CONSERVER EST UNE ACTION EXPLICITE ──────────────────────────────────
//
// Répondre n'écrit rien. C'est la règle de V65 pour les diagnostics, reprise à
// l'identique : le produit n'inscrit pas une preuve au dos de quelqu'un.
import { useState } from 'react';
import Link from 'next/link';
import { Check, X, RotateCcw, Save, ChevronLeft } from 'lucide-react';
import { gradeTransferChallenge } from '@/lib/transfer-challenge';
import type { TransferChallenge, TransferChallengeResult } from '@/lib/transfer-challenge';
import { SurfaceHead, Panel, InlineNotice } from '@/app/ui';

type Responses = Record<string, number | number[] | string>;

export default function ChallengeRunner({
  challenge, skillNames,
}: { challenge: TransferChallenge; skillNames: Record<string, string> }) {
  const [responses, setResponses] = useState<Responses>({});
  const [result, setResult] = useState<TransferChallengeResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [horsLigne, setHorsLigne] = useState(false);
  // UN seul canal de retour, succès comme échec — c'est le motif de
  // `DiagnosticsBoard`, et la porte `v64:check` l'exige sur tout correcteur
  // serveur : la régression visée est le clic sans effet visible. J'en avais
  // ouvert un second (`error`) ; deux canaux, c'est un de trop pour garantir
  // qu'un échec s'affiche.
  const [notice, setNotice] = useState<string | null>(null);
  const [echec, setEchec] = useState(false);

  const setMcq = (id: string, i: number) => setResponses((r) => ({ ...r, [id]: i }));
  const toggleMulti = (id: string, i: number) => setResponses((r) => {
    const cur = Array.isArray(r[id]) ? (r[id] as number[]) : [];
    return { ...r, [id]: cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i].sort((a, b) => a - b) };
  });
  const setPredict = (id: string, v: string) => setResponses((r) => ({ ...r, [id]: v }));

  async function corriger() {
    setBusy(true); setNotice(null); setEchec(false);
    try {
      const res = await fetch(`/api/transfer/${encodeURIComponent(challenge.id)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses }),
      });
      const j = await res.json();
      if (res.ok && j.ok) { setResult(j.result); setHorsLigne(false); }
      else { setResult(gradeTransferChallenge(challenge, responses)); setHorsLigne(true); }
    } catch {
      setResult(gradeTransferChallenge(challenge, responses)); setHorsLigne(true);
    }
    setBusy(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function conserver() {
    setBusy(true); setNotice(null); setEchec(false);
    try {
      const res = await fetch(`/api/transfer/${encodeURIComponent(challenge.id)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses, record: true }),
      });
      const j = await res.json();
      if (res.ok && j.ok && j.recorded) {
        setNotice(j.qualifying
          ? 'Preuve enregistrée. Elle atteste d’un transfert observé — pas d’une maîtrise.'
          : 'Résultat enregistré. Le seuil n’est pas atteint : il compte comme pratique, pas comme démonstration.');
        window.dispatchEvent(new CustomEvent('progress-changed'));
      } else {
        setEchec(true);
        setNotice(j?.reason ?? 'Le résultat n’a pas pu être conservé.');
      }
    } catch {
      setEchec(true);
      setNotice('Le résultat n’a pas pu être conservé — réessaie.');
    }
    setBusy(false);
  }

  function recommencer() { setResponses({}); setResult(null); setNotice(null); setEchec(false); }

  const parId = new Map(result?.results.map((r) => [r.id, r]) ?? []);
  const seuil = Math.round((challenge.passThreshold ?? 0.7) * 100);

  return (
    <>
      <Link className="btn small ghost" href="/transfer" style={{ marginBottom: 'var(--sp-4)' }}>
        <ChevronLeft size={14} strokeWidth={2} /> Tous les défis
      </Link>

      <SurfaceHead
        kind="detail"
        eyebrow={<>
          {challenge.transferLevel === 'T5' ? 'Changement de domaine' : 'Contexte voisin'}
          <span className="sep">/</span>
          {(challenge.skills ?? []).map((s) => skillNames[s] ?? s).join(' · ')}
        </>}
        title={challenge.title}
        lead={challenge.simulationNote
          ? <><span className="diag-sim">SIMULATION</span> {challenge.simulationNote}</>
          : undefined}
        facts={[
          { k: 'Questions', v: challenge.questions.length },
          { k: 'Seuil', v: `${seuil} %` },
        ]}
      />

      {/* ── LE PONT, AVANT LES QUESTIONS ──
          Un défi de transfert n'est pas une devinette : on dit d'où l'on part et
          où l'on arrive, et on demande de faire le trajet. */}
      <Panel label="Le pont">
        <p className="tr-bridge-from">
          <strong>Tu pars de</strong> {skillNames[challenge.sourceSkill] ?? challenge.sourceSkill}.
        </p>
        <p className="tr-bridge-to">
          <strong>Tu arrives dans</strong> {challenge.targetContext}
        </p>
        {challenge.bridge ? <p className="tr-bridge">{challenge.bridge}</p> : null}
        {(challenge.lessonRefs ?? []).length > 0 ? (
          <p className="ret-note">
            Notions d’origine :{' '}
            {(challenge.lessonRefs ?? []).map((l, i) => (
              <span key={l}>{i > 0 ? ' · ' : ''}<Link href={`/doc/lessons/${l}`}>{l}</Link></span>
            ))}
          </p>
        ) : null}
      </Panel>

      {result ? (
        <Panel label={result.passedOverall ? 'Transfert observé' : 'Seuil non atteint'}>
          <p className="tr-verdict">
            <strong>{result.passed} / {result.total}</strong> — seuil {seuil} %.
          </p>
          <p className="ret-note">
            {result.passedOverall
              ? 'Tu as reconnu la notion hors de son contexte d’origine. C’est un indice de transfert, pas une preuve que tu la maîtrises : un indice se répète, une maîtrise se démontre dans la durée.'
              : 'Reconnaître une notion ailleurs est exactement ce qui est difficile, et rater un défi n’annule rien de ce que tu sais. Les explications ci-dessous disent où le pont a cédé.'}
          </p>
          {horsLigne ? (
            <InlineNotice tone="attention">
              La correction a été faite <strong>sur ton appareil</strong>, le serveur n’ayant pas
              répondu. Le résultat ne peut pas être conservé comme preuve : un verdict que le
              produit n’a pas calculé lui-même ne vaut rien comme preuve.
            </InlineNotice>
          ) : null}
          {notice && (echec
            ? <p className="ret-error" role="alert">{notice}</p>
            : <p className="ret-note"><strong>{notice}</strong></p>)}
          <div className="tr-actions">
            {!horsLigne && (!notice || echec) ? (
              <button type="button" className="btn small" onClick={conserver} disabled={busy}>
                <Save size={13} strokeWidth={2} /> Conserver ce résultat
              </button>
            ) : null}
            <button type="button" className="btn small ghost" onClick={recommencer} disabled={busy}>
              <RotateCcw size={14} strokeWidth={2} /> Recommencer
            </button>
          </div>
        </Panel>
      ) : null}

      <ol className="diag-questions">
        {challenge.questions.map((q, qi) => {
          const r = parId.get(q.id);
          const corrige = !!result;
          const cls = corrige ? (r?.passed ? ' correct' : ' wrong') : '';
          return (
            <li key={q.id} className={`diag-q${cls}`}>
              <div className="diag-q-head">
                <span className="diag-q-level">Transposer</span>
                {corrige && (
                  <span className={`diag-q-verdict ${r?.passed ? 'ok' : 'ko'}`}>
                    {r?.passed
                      ? <><Check size={13} strokeWidth={2.5} /> Correct</>
                      : <><X size={13} strokeWidth={2.5} /> À revoir</>}
                  </span>
                )}
              </div>
              <p className="diag-q-prompt">{qi + 1}. {q.prompt}</p>

              {(q.kind === 'mcq' || q.kind === 'multi') && (
                <div className="diag-options" role="group" aria-label={`Réponses à la question ${qi + 1}`}>
                  {(q.options ?? []).map((opt, oi) => {
                    const choisi = q.kind === 'mcq'
                      ? responses[q.id] === oi
                      : Array.isArray(responses[q.id]) && (responses[q.id] as number[]).includes(oi);
                    const attendu = corrige && (Array.isArray(q.answer) ? q.answer.includes(oi) : q.answer === oi);
                    return (
                      <label key={oi} className={`diag-opt${choisi ? ' chosen' : ''}${attendu ? ' answer' : ''}`}>
                        <input
                          type={q.kind === 'mcq' ? 'radio' : 'checkbox'}
                          name={q.id}
                          checked={!!choisi}
                          disabled={corrige}
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
                  disabled={corrige}
                  onChange={(e) => setPredict(q.id, e.target.value)}
                />
              )}

              {corrige && (
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
        <button type="button" className="btn primary" onClick={corriger} disabled={busy}>
          {busy ? 'Correction…' : 'Corriger mes réponses'}
        </button>
      ) : null}
    </>
  );
}
