import Link from 'next/link';
import { getProgram, getDocHtml } from '@/lib/program';
import { readProgress, getActiveTrackId } from '@/lib/progress-server';
import { getCatalogue } from '@/lib/catalogue-server';
import { getTrack } from '@/lib/catalogue';
import { skillStats } from '@/lib/skill-state';
import { explainSkillState } from '@/lib/learning-experience';
import { PageHeader } from '@/app/ui';
import SkillsBoard from './SkillsBoard';

export const dynamic = 'force-dynamic';

export default function SkillsPage() {
  const program = getProgram();
  const progress = readProgress();
  const activeTrack = getTrack(getCatalogue(), getActiveTrackId());
  const rubric = getDocHtml('rubrics/skills-scorecard.md');
  const rawStats = skillStats(program, progress);
  const stats = Object.fromEntries(rawStats.map((s) => [s.id, s]));
  // « Pourquoi cet état ? » + prochaine action, dérivés du read-model pur (aucune vérité propre).
  const explains = Object.fromEntries(rawStats.map((s) => [s.id, explainSkillState(s)]));

  return (
    <>
      <PageHeader
        eyebrow={<>Compétences <span className="sep">/</span> parcours actif : {activeTrack?.title ?? '—'}</>}
        title="Compétences"
        sub={<>
          Regroupées par <strong>état réel</strong> dérivé de ta progression sur le parcours actif.
          Réévalue à chaque revue mensuelle. Détail : <Link href="/doc/rubrics/skills-scorecard">scorecard</Link>.
          Pour tester une compétence : <Link href="/diagnostics">diagnostics</Link>.
        </>}
      />
      <SkillsBoard skills={program.skills} initialScores={progress.skills} stats={stats} explains={explains} />
      {rubric && (
        <details className="solution" style={{ marginTop: 24 }}>
          <summary>Voir la grille détaillée (que signifie chaque niveau)</summary>
          <div className="prose" style={{ borderRadius: '0 0 8px 8px', borderTop: 'none' }}
               dangerouslySetInnerHTML={{ __html: rubric }} />
        </details>
      )}
    </>
  );
}
