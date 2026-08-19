import { Eye, ShieldQuestion } from 'lucide-react';
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
