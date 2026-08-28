import { Eye, ShieldQuestion } from 'lucide-react';
import { HeroFocus, HeroFact } from '@/app/ui';
import { listAssessments } from '@/lib/assessments-server';
import { getProgram } from '@/lib/program';
import { PageHeader, ContextLine } from '@/app/ui';
import { getHistoryBySource } from '@/lib/learner-read-models';
import DiagnosticsBoard from './DiagnosticsBoard';

export const dynamic = 'force-dynamic';

// Diagnostics = auto-évaluations à taxonomie (RECALL → TRANSFER). Correction 100 %
// DÉTERMINISTE, en local, sans « IA ». Un score est un INDICE (proxy), jamais une
// preuve de maîtrise. La page n'écrit rien dans la progression : elle relie chaque
// résultat à des leçons de remédiation.
export default function DiagnosticsPage() {
  const assessments = listAssessments();
  const program = getProgram();
  const skillName = new Map((program.skills ?? []).map((s: { id: string; name: string }) => [s.id, s.name]));
  // Agrégats réels du catalogue de diagnostics.
  const coveredSkills = new Set(assessments.flatMap((a) => a.skills ?? [])).size;
  const totalQuestions = assessments.reduce((n, a) => n + (a.questions?.length ?? 0), 0);
  // V65.1 · CP9 — ce que l'APPRENANT a réellement fait ici. Le catalogue était
  // identique qu'on en ait passé zéro ou seize (CP0, P0-4).
  const history = getHistoryBySource('assessment');
  const takenCount = Object.keys(history).length;
  const passedCount = Object.values(history).filter((h) => h.passed).length;

  return (
    <>
      <ContextLine
        label="État des diagnostics"
        facts={[
          { k: 'Diagnostics', v: `${assessments.length}`, here: true },
          { k: 'Questions', v: `${totalQuestions}` },
          { k: 'Compétences couvertes', v: `${coveredSkills}` },
          { k: 'Passés', v: takenCount === 0 ? 'aucun' : `${takenCount} / ${assessments.length}` },
          { k: 'Réussis', v: takenCount === 0 ? '—' : `${passedCount}` },
        ]}
      />
      <PageHeader
        eyebrow={<>Apprendre <span className="sep">/</span> auto-évaluations diagnostiques</>}
        title="Diagnostics"
        sub={<>
          Teste ta compréhension par niveau — te souvenir, expliquer, appliquer, diagnostiquer,
          transposer. Correction locale et déterministe ; en cas d'écart, la leçon à revoir t'est
          indiquée.
          <span className="synth-ro"><Eye size={13} strokeWidth={2} /> Réussir un diagnostic est un
          INDICE de compréhension, pas une preuve de maîtrise.</span>
        </>}
      />

      <HeroFocus
        tone="calm"
        eyebrow="Auto-évaluation diagnostique"
        title={`${assessments.length} diagnostic${assessments.length > 1 ? 's' : ''} disponible${assessments.length > 1 ? 's' : ''}`}
        lead="Correction locale et déterministe. Un score est un indice de compréhension, jamais une preuve de maîtrise."
        // Un diagnostic s'ouvre dans le tableau ci-dessous, côté client : il
        // n'existe pas de route `/diagnostics/[id]`. L'action pointe donc sur
        // le catalogue, comme `/day` pointe sur `#travail` — un lien qui ne
        // mène nulle part est pire que pas de lien.
        actions={assessments.length > 0
          ? <a className="btn cta" href="#catalogue">Choisir un diagnostic</a>
          : undefined}
        meta={
          <>
            <HeroFact k="Compétences couvertes">{coveredSkills}</HeroFact>
            <HeroFact k="Questions">{totalQuestions}</HeroFact>
            <HeroFact k="Correction">locale, sans réseau</HeroFact>
            {/* On n'affiche « 0 » nulle part pour dire « jamais passé » : on le dit. */}
            <HeroFact k="Ton historique">
              {takenCount === 0 ? 'aucun diagnostic passé' : `${takenCount} passé${takenCount > 1 ? 's' : ''}, ${passedCount} réussi${passedCount > 1 ? 's' : ''}`}
            </HeroFact>
          </>
        }
      />

      {assessments.length === 0 ? (
        <div className="empty">
          <ShieldQuestion size={16} strokeWidth={2} /> Aucun diagnostic disponible.
        </div>
      ) : (
        <DiagnosticsBoard
          anchorId="catalogue"
          assessments={assessments}
          skillNames={Object.fromEntries(skillName)}
          history={history}
        />
      )}
    </>
  );
}
