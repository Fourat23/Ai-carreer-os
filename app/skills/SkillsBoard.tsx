'use client';

import { useState } from 'react';
import type { Skill } from '@/lib/types';
import { SKILL_STATE_LABEL, type SkillStat } from '@/lib/skill-state';

export default function SkillsBoard({
  skills, initialScores, stats = {},
}: {
  skills: Skill[];
  initialScores: Record<string, number>;
  stats?: Record<string, SkillStat>;
}) {
  const [scores, setScores] = useState<Record<string, number>>(initialScores);

  async function setScore(skill: string, score: number) {
    setScores((s) => ({ ...s, [skill]: score }));
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'skill', payload: { skill, score } }),
    });
  }

  const avg =
    skills.length === 0 ? 0
    : skills.reduce((sum, s) => sum + (scores[s.id] ?? 0), 0) / skills.length;

  return (
    <>
      <div className="card" style={{ marginBottom: 18 }}>
        <h3>Score moyen</h3>
        <div className="big">{avg.toFixed(1)} / 5</div>
        <div className="sub">Clique sur un rond pour ajuster ton auto-évaluation. Honnêteté : ne compte que ce que tu peux produire seul et expliquer.</div>
      </div>

      {skills.map((s) => {
        const val = scores[s.id] ?? 0;
        const st = stats[s.id];
        return (
          <div key={s.id} className="skill-row">
            <div className="name">
              {s.name}
              {st && (
                <span className="skill-meta">
                  <span className={`skst skst-${st.state}`}>{SKILL_STATE_LABEL[st.state]}</span>
                  {st.daysDone > 0 && <span className="skill-sub">{st.daysDone}/{st.daysAssociated} j</span>}
                  {st.evidenceCount > 0 && <span className="skill-sub">{st.evidenceCount} preuve{st.evidenceCount > 1 ? 's' : ''}</span>}
                </span>
              )}
            </div>
            <div className="dots">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`dot ${n <= val ? 'filled' : ''}`}
                  title={`${n}/5`}
                  onClick={() => setScore(s.id, n === val ? n - 1 : n)}
                />
              ))}
            </div>
            <div className="muted" style={{ width: 40 }}>{val}/5</div>
          </div>
        );
      })}
    </>
  );
}
