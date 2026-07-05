import Link from 'next/link';
import { getProgram, getDocHtml } from '@/lib/program';
import { readProgress } from '@/lib/progress-server';
import SkillsBoard from './SkillsBoard';

export const dynamic = 'force-dynamic';

export default function SkillsPage() {
  const program = getProgram();
  const progress = readProgress();
  const rubric = getDocHtml('rubrics/skills-scorecard.md');

  return (
    <>
      <h1>Compétences</h1>
      <p className="subtitle">
        20 compétences suivies de 0 à 5. Réévalue à chaque revue mensuelle.
        Détail de la grille : <Link href="/doc/rubrics/skills-scorecard">scorecard</Link>.
      </p>
      <SkillsBoard skills={program.skills} initialScores={progress.skills} />
      {rubric && (
        <details className="solution" style={{ marginTop: 24 }}>
          <summary>📖 Voir la grille détaillée (que signifie chaque niveau)</summary>
          <div className="prose" style={{ borderRadius: '0 0 8px 8px', borderTop: 'none' }}
               dangerouslySetInnerHTML={{ __html: rubric }} />
        </details>
      )}
    </>
  );
}
