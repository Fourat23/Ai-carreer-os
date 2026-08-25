import Link from 'next/link';
import { HeroFocus, HeroFact } from '@/app/ui';
import { getProgram, getDocHtml } from '@/lib/program';
import { readProgress, getActiveTrackId } from '@/lib/progress-server';
import { getCatalogue } from '@/lib/catalogue-server';
import { getTrack } from '@/lib/catalogue';
import { skillStats } from '@/lib/skill-state';
import { demoteDocTitle } from '@/lib/doc-sections';
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
  // Agrégats des états RÉELS (aucune seconde source, aucun score inventé).
  const countState = (k: string) => rawStats.filter((s) => s.state === k).length;
  const demonstrated = countState('demonstrated');
  const practising = countState('practising');
  const learning = countState('learning');
  const untouched = rawStats.length - demonstrated - practising - learning;

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
      {/* V56 — la page n'avait aucun point focal : douze états de compétence
          au même poids. Le hero dit d'abord OÙ EN EST la maîtrise globale,
          uniquement à partir des états réellement dérivés. */}
      <HeroFocus
        tone="calm"
        eyebrow="État réel de tes compétences"
        title={`${demonstrated} compétence${demonstrated > 1 ? 's' : ''} démontrée${demonstrated > 1 ? 's' : ''} sur ${rawStats.length}`}
        lead="Chaque état est dérivé de tes preuves et de tes journées terminées — jamais déclaré à la main."
        meta={
          <>
            <HeroFact k="Démontrées">{demonstrated}</HeroFact>
            <HeroFact k="En pratique">{practising}</HeroFact>
            <HeroFact k="En apprentissage">{learning}</HeroFact>
            <HeroFact k="Non commencées">{untouched}</HeroFact>
          </>
        }
        actions={<Link className="btn cta" href="/diagnostics">Tester une compétence</Link>}
      />

      <SkillsBoard skills={program.skills} initialScores={progress.skills} stats={stats} explains={explains} />
      {rubric && (
        <details className="solution" style={{ marginTop: 24 }}>
          <summary>Voir la grille détaillée (que signifie chaque niveau)</summary>
          <div className="prose" style={{ borderRadius: '0 0 8px 8px', borderTop: 'none' }}
               dangerouslySetInnerHTML={{ __html: demoteDocTitle(rubric) }} />
        </details>
      )}
    </>
  );
}
