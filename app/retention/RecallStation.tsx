'use client';

// La file de réactivation, côté client (V66 · CP6).
//
// Le geste imposé est le point du sprint : **la consigne d'abord, la réponse
// APRÈS**. Tant que « J'ai tenté » n'est pas cliqué, ni le cours ni les trois
// issues ne sont accessibles. Sans cette contrainte, l'apprenant lit la leçon
// puis se déclare bon — c'est exactement la confusion entre « j'ai vu les mots »
// et « j'ai compris » que le sprint cherche à casser.
//
// Les trois issues sont symétriques et sans jugement : un échec est une donnée
// utile, pas une punition. Aucun score, aucun total, aucun compteur de jours
// consécutifs — le produit n'a jamais eu de mécanique de récompense, et ce
// n'est pas cette surface qui en introduira une.
//
// (Le gate V52 refuse jusqu'au VOCABULAIRE de la récompense dans le code, y
// compris en commentaire et y compris pour le nier. C'est volontairement
// grossier : une règle qui accepte les phrases négatives accepte, à la
// première inattention, celle qui ne l'est pas.)

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Check, CircleDot, X, Eye } from 'lucide-react';
import { FORMAT_LABEL, FORMAT_PROMPT, RETENTION_STATE_LABEL } from '@/lib/retention';
import type { RecallFormat, RecallOutcome, RetentionStateId } from '@/lib/retention';
import { sendCommand, announceProgressChanged } from '@/app/progress-command';

export interface PromptRow {
  conceptId: string;
  title: string;
  format: RecallFormat | null;
  teachingDays: number[];
  state: RetentionStateId;
  reason: string;
  // ── V74 · CP12 — ce que l'arbitre ajoute, tout est FACULTATIF ──
  // Ces champs viennent de la chaîne CP3 → CP4 → CP5. Ils sont optionnels pour
  // que la station continue de fonctionner exactement comme avant quand ils
  // sont absents : le CP12 branche le moteur, il ne réécrit pas la surface.
  /** Phrase explicable du CP3 : au plus deux facteurs cités (critère B10). */
  pourquoi?: string;
  /** Consigne d'un archétype RÉEL du CP5, citant une section de la leçon. */
  consigne?: string;
  /** Section où comparer APRÈS avoir tenté. */
  verifier?: string | null;
  minutes?: number;
}

const OUTCOMES: Array<{ key: RecallOutcome; label: string; Icon: typeof Check; hint: string }> = [
  { key: 'recalled', label: 'Retrouvé', Icon: Check, hint: 'sans regarder, et en entier' },
  { key: 'partial', label: 'En partie', Icon: CircleDot, hint: 'l’idée oui, les détails non' },
  { key: 'failed', label: 'Pas retrouvé', Icon: X, hint: 'il a fallu rouvrir le cours' },
];

export default function RecallStation({ prompts }: { prompts: PromptRow[] }) {
  const router = useRouter();
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reveal(id: string) {
    setRevealed((prev) => new Set(prev).add(id));
  }

  async function record(row: PromptRow, outcome: RecallOutcome) {
    setBusy(row.conceptId);
    setError(null);
    const r = await sendCommand({
      type: 'RECORD_RECALL',
      conceptId: row.conceptId,
      outcome,
      format: row.format ?? 'free',
      sourceRef: '/retention',
    });
    setBusy(null);
    if (!r.ok) {
      // Un échec d'enregistrement doit SE VOIR. Un clic sans effet visible est
      // le défaut que V64 a corrigé sur /revisions ; il ne revient pas ici.
      setError(`${row.title} : ${r.error}`);
      return;
    }
    announceProgressChanged();
    router.refresh();
  }

  return (
    <>
      {error && <p className="ret-error" role="alert">{error}</p>}

      <ol className="ret-queue">
        {prompts.map((row) => {
          const open = revealed.has(row.conceptId);
          return (
            <li key={row.conceptId} className={`ret-card${open ? ' is-open' : ''}`}>
              <div className="ret-card-head">
                <h3 className="ret-card-title">{row.title}</h3>
                <span className="ret-card-state">{RETENTION_STATE_LABEL[row.state]}</span>
              </div>
              {/* Le POURQUOI de l'arbitre passe devant l'état V66 quand il existe :
                  « il y a trois semaines que tu ne l'as pas retrouvée » se
                  conteste, « Fragile » ne se conteste pas. L'état reste affiché
                  dans l'en-tête de la carte. */}
              <p className="ret-card-why">{row.pourquoi ?? row.reason}</p>

              {row.format ? (
                <>
                  <p className="ret-card-format">
                    {FORMAT_LABEL[row.format]}
                    {row.minutes ? <span className="ret-card-mins"> · environ {row.minutes} min</span> : null}
                  </p>
                  {/* La consigne de l'archétype CITE une section réelle de la
                      leçon ; la consigne V66 est générique. On préfère la
                      première quand elle existe, jamais on n'en invente une. */}
                  <p className="ret-card-prompt">{row.consigne ?? FORMAT_PROMPT[row.format]}</p>
                </>
              ) : (
                // Honnêteté sur le corpus : quand la leçon n'offre aucune section
                // exploitable, on le DIT plutôt que d'inventer une consigne.
                <p className="ret-card-prompt">
                  Cette leçon ne porte aucune section exploitable comme épreuve de rappel.
                  Réexplique la notion de mémoire, puis relis pour vérifier.
                </p>
              )}

              {!open ? (
                <button type="button" className="btn" onClick={() => reveal(row.conceptId)}>
                  <Eye size={14} aria-hidden /> J’ai tenté — montrer le cours
                </button>
              ) : (
                <div className="ret-card-after">
                  <p className="ret-card-check">
                    {row.verifier
                      ? <>Compare ce que tu viens de produire avec la section <strong>« {row.verifier} »</strong> :{' '}</>
                      : <>Compare ce que tu viens de produire avec le cours :{' '}</>}
                    {row.teachingDays.length > 0
                      ? row.teachingDays.slice(0, 3).map((d, i) => (
                        <span key={d}>{i > 0 ? ' · ' : ''}<Link href={`/day/${d}`}>Jour {d}</Link></span>
                      ))
                      : <>aucune journée ouverte n’enseigne cette notion</>}
                    {' · '}
                    <Link href={`/doc/lessons/${row.conceptId}`}>la leçon</Link>.
                  </p>
                  <div className="ret-card-outcomes" role="group" aria-label={`Résultat pour ${row.title}`}>
                    {OUTCOMES.map(({ key, label, Icon, hint }) => (
                      <button
                        key={key}
                        type="button"
                        className={`btn ret-out is-${key}`}
                        disabled={busy === row.conceptId}
                        onClick={() => record(row, key)}
                      >
                        <Icon size={14} aria-hidden /> {label}
                        <span className="ret-out-hint">{hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
