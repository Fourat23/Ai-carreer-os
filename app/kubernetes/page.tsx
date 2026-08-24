import { publicManifestSummaries } from '@/lib/manifests-server';
import KubernetesCatalogue from './KubernetesCatalogue';
import TechBench from '../tech/TechBench';

export const dynamic = 'force-dynamic';

// V57 · CP9 — Même constat qu'au CP0 sur /pipelines : zéro bloc structurant.
// Même grammaire, contenu propre au domaine.
export default function KubernetesPage() {
  const scenarios = publicManifestSummaries();
  // Même correction qu'ailleurs : le résumé public porte `resourceCount`.
  const resources = scenarios.reduce((n, s) => n + (s.resourceCount ?? 0), 0);
  const kinds = new Set(scenarios.flatMap((s) => s.kinds ?? [])).size;
  const skills = new Set(scenarios.flatMap((s) => (s as { skills?: string[] }).skills ?? [])).size;

  return (
    <TechBench
      eyebrow="Laboratoire · orchestration de conteneurs"
      title="Kubernetes & Orchestration Lab"
      lead={<>Analyse une configuration, détecte ses défauts, simule un incident
        (CrashLoopBackOff, OOMKilled…) ou un rollout. Les manifests sont en JSON,
        équivalents au YAML que tu écriras en production.</>}
      limits={[
        'Ce n’est pas une console kubectl : aucun cluster n’est contacté.',
        'Aucun accès réseau, aucun secret, aucun déploiement réel.',
        'Les incidents sont rejoués à l’identique : c’est ce qui les rend analysables.',
      ]}
      facts={[
        { k: 'Scénarios', v: scenarios.length },
        { k: 'Ressources décrites', v: resources },
        { k: 'Types de ressource', v: kinds },
        { k: 'Compétences couvertes', v: skills },
      ]}
      related={[
        { href: '/day/320', label: 'Jour conteneurs' },
        { href: '/cloud-lab', label: 'Cloud Topology Lab' },
        { href: '/pipelines', label: 'Pipeline Lab' },
        { href: '/glossary', label: 'Glossaire' },
      ]}
    >
      {scenarios.length === 0
        ? <p className="muted">Aucun scénario pour le moment.</p>
        : <KubernetesCatalogue scenarios={scenarios} />}
    </TechBench>
  );
}
