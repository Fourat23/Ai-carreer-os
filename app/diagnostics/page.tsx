import { Eye, ShieldQuestion } from 'lucide-react';
import { HeroFocus, HeroFact } from '@/app/ui';
import { listAssessments } from '@/lib/assessments-server';
import { getProgram } from '@/lib/program';
import { PageHeader } from '@/app/ui';
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

  return (
    <>
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
        meta={
          <>
            <HeroFact k="Compétences couvertes">{coveredSkills}</HeroFact>
            <HeroFact k="Questions">{totalQuestions}</HeroFact>
            <HeroFact k="Correction">locale, sans réseau</HeroFact>
          </>
        }
      />

      {assessments.length === 0 ? (
        <div className="empty">
          <ShieldQuestion size={16} strokeWidth={2} /> Aucun diagnostic disponible.
        </div>
      ) : (
        <DiagnosticsBoard
          assessments={assessments}
          skillNames={Object.fromEntries(skillName)}
        />
      )}
    </>
  );
}
