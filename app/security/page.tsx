import { publicScenarioSummaries, listPlaybooks } from '@/lib/security-server';
import TechBench from '../tech/TechBench';
import SecurityCatalogue from './SecurityCatalogue';
import PlaybookBrowser from './PlaybookBrowser';

export const dynamic = 'force-dynamic';

// V58 · CP5 — TechBench, propagé depuis les trois laboratoires de V57.
// Le CP0 mesurait ici UNE seule <section> englobant tout : topBlocks 1,
// dominance 1 (dégénérée), 3 fonds, 1 ombre, 52 cartes — et surtout une
// hiérarchie inversée, la liste de 45 playbooks écrasant visuellement les
// 4 scénarios de laboratoire, qui sont le contenu primaire.
// Les playbooks passent donc APRÈS, dans leur propre zone : ce sont un
// référentiel de consultation, pas le travail du jour.
export default function SecurityPage() {
  const scenarios = publicScenarioSummaries();
  const playbooks = listPlaybooks();
  const domains = new Set(scenarios.map((s) => (s as { domain?: string }).domain).filter(Boolean)).size;
  const artifacts = scenarios.reduce(
    (n, s) => n + ((s as { artifactCount?: number }).artifactCount ?? 0), 0,
  );

  return (
    <TechBench
      eyebrow="Laboratoire · sécurité et réponse à incident"
      title="Security & Incident Lab"
      lead={<>Analyse de sécurité sur fixtures locales — secrets, chaîne d’approvisionnement,
        RBAC, durcissement Kubernetes, exposition, réponse à incident. Chaque analyse est
        <strong> déterministe</strong> : le même artefact donne toujours le même diagnostic.</>}
      limits={[
        'Ce n’est ni un SAST, ni un scanner de dépendances, ni un audit professionnel.',
        'Aucune analyse d’Internet : la base CVE est factice et locale.',
        'Aucun secret réel, aucune exécution, aucun déploiement.',
      ]}
      facts={[
        { k: 'Scénarios', v: scenarios.length },
        domains > 0 ? { k: 'Domaines', v: domains } : { k: 'Playbooks', v: playbooks.length },
        artifacts > 0 ? { k: 'Artefacts', v: artifacts } : { k: 'Playbooks', v: playbooks.length },
      ]}
      related={[
        { href: '/day/68', label: 'Jour secrets' },
        { href: '/kubernetes', label: 'Kubernetes Lab' },
        { href: '/pipelines', label: 'Pipeline Lab' },
        { href: '/glossary', label: 'Glossaire' },
      ]}
      after={playbooks.length > 0 ? (
        <section className="tb-ref" aria-label="Playbooks opérationnels">
          <div className="tb-sec-head">
            <h2 className="tb-h">Playbooks opérationnels</h2>
            <span className="tb-h-note">{playbooks.length} cas · référentiel de consultation</span>
          </div>
          <PlaybookBrowser playbooks={playbooks} />
        </section>
      ) : null}
    >
      {scenarios.length === 0
        ? <p className="muted">Aucun scénario pour le moment.</p>
        : <SecurityCatalogue scenarios={scenarios} />}
    </TechBench>
  );
}
