import { notFound } from 'next/navigation';
import { getScenario, publicScenario, getCveDb, getPlaybook } from '@/lib/security-server';
import { analyzeScenario } from '@/lib/security-analysis.mjs';
import type { Analysis } from '@/lib/security-analysis';
import { WorkbenchShell } from '@/app/ui';
import SecurityAnalyzer from './SecurityAnalyzer';

export const dynamic = 'force-dynamic';

// V58 · CP4 — Coquille de poste de travail partagée. Le CP0 mesurait 3 fonds
// et ZÉRO ombre sur cette route, avec un diagnostic sans priorité visuelle.
export default async function ScenarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scn = getScenario(id);
  if (!scn) notFound();
  const view = publicScenario(scn);
  const analysis = analyzeScenario(scn, getCveDb()) as Analysis;
  const playbook = scn.playbookRef ? getPlaybook(scn.playbookRef) : null;
  const artifacts = (scn.artifacts as unknown[] | undefined)?.length ?? 0;
  // `limits` est produit par le moteur d'analyse : ce qu'il ne peut PAS
  // conclure est une information de sécurité, pas un ornement.
  const engineLimits = analysis.summary?.limits ?? [];

  return (
    <WorkbenchShell
      backHref="/security"
      backLabel="Security & Incident Lab"
      eyebrowExtra={scn.domain}
      title={scn.title}
      lead={scn.description}
      facts={[
        artifacts > 0 && { k: 'Artefacts', v: artifacts },
        typeof scn.difficulty === 'number' && { k: 'Difficulté', v: `${scn.difficulty}/5` },
        !!scn.fixedArtifacts && { k: 'Corrigé', v: 'fourni' },
      ]}
      systemState={[
        { k: 'Analyse', v: 'locale et déterministe' },
        { k: 'Base CVE', v: 'factice et locale — aucun appel externe', tone: 'warn' },
        { k: 'Exécution', v: 'aucune : rien n’est lancé ni déployé' },
      ]}
      severity={analysis.summary?.bySeverity}
      severityNote={analysis.summary?.total === 0
        ? 'Aucune règle déclenchée sur ces artefacts.'
        : undefined}
      limits={engineLimits.length > 0 ? engineLimits : [
        'Ce n’est ni un SAST, ni un scanner de dépendances, ni un audit professionnel.',
        'Aucune analyse d’Internet, aucun secret réel, aucune exécution.',
      ]}
      days={scn.dayRefs ?? []}
      related={[{ href: '/kubernetes', label: 'Kubernetes Lab' }]}
    >
      <SecurityAnalyzer
        id={scn.id} initialScenario={view} initialAnalysis={analysis}
        hasFixed={!!scn.fixedArtifacts} incident={scn.incident ?? null}
        playbook={playbook as Record<string, unknown> | null} dayRefs={scn.dayRefs ?? []}
      />
    </WorkbenchShell>
  );
}
