'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Skill } from '@/lib/types';
import { SKILL_STATE_LABEL, type SkillStat } from '@/lib/skill-state';
import type { SkillExplanation } from '@/lib/learning-experience';
import { skillStatusToken, STATUS_DISPLAY_ORDER, statusRank } from '@/lib/skill-vocabulary.mjs';
import { Status, Metric } from '@/app/ui';
import type { Tone } from '@/app/ui';
import { sendCommand } from '@/app/progress-command';

// Regroupement des compétences par ÉTAT sémantique (ordre V52, aucune 2e source).
const GROUP_HINT: Record<string, string> = {
  'demonstrated': 'Solides — preuves à l\'appui, aucune action requise.',
  'to-consolidate': 'Fragiles — à retravailler en priorité.',
  'practiced': 'Pratiquées — en cours de consolidation.',
  'discovered': 'Découvertes — première exposition, pas encore pratiquées.',
  'not-started': 'Non abordées — pas encore dans le parcours suivi.',
};

export default function SkillsBoard({
  skills, initialScores, stats = {}, explains = {},
}: {
  skills: Skill[];
  initialScores: Record<string, number>;
  stats?: Record<string, SkillStat>;
  explains?: Record<string, SkillExplanation>;
}) {
  const [scores, setScores] = useState<Record<string, number>>(initialScores);
  const [error, setError] = useState<string | null>(null);

  async function setScore(skill: string, score: number) {
    const previous = scores[skill];
    setScores((s) => ({ ...s, [skill]: score }));
    setError(null);
    const r = await sendCommand({ type: 'SET_SKILL', skill, score });
    if (!r.ok) {
      // Un échec ne laisse pas un score affiché qui n'existe pas sur disque.
      setScores((s) => ({ ...s, [skill]: previous }));
      setError(r.error);
    }
  }

  // V64 · dette P0-1 de V63. Tant qu'AUCUNE compétence n'a été auto-évaluée,
  // « 0.0 / 5 » n'est pas une moyenne : c'est une valeur inventée qui a le poids
  // visuel d'une donnée réelle. Une donnée qui n'existe pas s'affiche
  // « non renseigné » — jamais estimée (invariant §1 « Données »).
  const rated = skills.filter((s) => Number.isFinite(scores[s.id]) && scores[s.id] > 0);
  const avg = rated.length === 0 ? null
    : rated.reduce((sum, s) => sum + scores[s.id], 0) / rated.length;

  // Groupes ordonnés par STATUS_DISPLAY_ORDER (état → compétences).
  const byState = new Map<string, Skill[]>();
  for (const s of skills) {
    const state = stats[s.id]?.state ?? 'not-started';
    if (!byState.has(state)) byState.set(state, []);
    byState.get(state)!.push(s);
  }
  const groups = [...byState.entries()]
    .sort((a, b) => statusRank(a[0]) - statusRank(b[0]))
    .map(([state, list]) => ({ state, list, token: skillStatusToken(state) }));

  // Répartition (donnée réelle) pour l'en-tête.
  const distribution = STATUS_DISPLAY_ORDER
    .map((state) => ({ token: skillStatusToken(state), n: byState.get(state)?.length ?? 0 }))
    .filter((d) => d.n > 0);

  return (
    <>
      {error && <p className="cmd-error" role="alert">{error}</p>}
      <div className="skills-summary">
        <Metric
          label="Auto-évaluation moyenne"
          value={avg === null ? 'non renseigné' : `${avg.toFixed(1)} / 5`}
          emphasis={avg !== null}
          sub={avg === null
            ? 'Aucune compétence auto-évaluée pour l’instant. Les états ci-dessous sont dérivés de tes preuves, pas de cette note.'
            : `Moyenne des ${rated.length} compétence${rated.length > 1 ? 's' : ''} que tu as notée${rated.length > 1 ? 's' : ''}. Honnêteté : ne compte que ce que tu peux produire seul et expliquer.`} />
        <div className="skills-distribution" aria-label="Répartition par état">
          {distribution.map((d) => (
            <Status key={d.token.state} tone={d.token.tone as Tone} label={`${d.token.label} · ${d.n}`} />
          ))}
        </div>
      </div>

      {groups.map(({ state, list, token }) => (
        <section key={state} className="skills-group">
          <div className="skills-group-head">
            <Status tone={token.tone as Tone} label={token.label} />
            <span className="skills-group-count">{list.length} compétence{list.length > 1 ? 's' : ''}</span>
            <span className="skills-group-hint">{GROUP_HINT[state] ?? ''}</span>
          </div>
          {list.map((s) => {
            const val = scores[s.id] ?? 0;
            const st = stats[s.id];
            const ex = explains[s.id];
            const hasWhy = ex && (ex.reasons.length > 0 || ex.nextAction);
            return (
              <div key={s.id} className="skill-block">
                <div className="skill-row">
                  <div className="name">
                    {s.name}
                    {st && (
                      <span className="skill-meta">
                        {st.daysDone > 0 && <span className="skill-sub">{st.daysDone}/{st.daysAssociated} j</span>}
                        {st.evidenceCount > 0 && <span className="skill-sub">{st.evidenceCount} preuve{st.evidenceCount > 1 ? 's' : ''}</span>}
                      </span>
                    )}
                  </div>
                  <div className="dots" role="group" aria-label={`Auto-évaluation ${s.name} : ${val} sur 5`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`dot ${n <= val ? 'filled' : ''}`}
                        title={`${n}/5`}
                        aria-label={`Mettre ${n} sur 5`}
                        aria-pressed={n <= val}
                        onClick={() => setScore(s.id, n === val ? n - 1 : n)}
                      />
                    ))}
                  </div>
                  <div className="muted" style={{ width: 40 }}>{val}/5</div>
                </div>
                {hasWhy && (
                  <details className="skill-why">
                    <summary>Pourquoi cet état ? &amp; quoi faire</summary>
                    {ex.reasons.length > 0 && (
                      <ul className="skill-why-reasons">
                        {ex.reasons.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    )}
                    {ex.nextAction && (
                      <div className="skill-next">
                        <span className="skill-next-label">Prochaine action</span>
                        <Link href={ex.nextAction.href} className="skill-next-action">{ex.nextAction.action}</Link>
                        <span className="skill-next-goal">{ex.nextAction.goal} · preuve attendue : {ex.nextAction.expectedEvidence}</span>
                      </div>
                    )}
                  </details>
                )}
              </div>
            );
          })}
        </section>
      ))}
    </>
  );
}
