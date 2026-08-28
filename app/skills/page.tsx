// Compétences — V65. La page ne répond plus « combien ai-je consommé ? » mais
// « qu'est-ce que j'ai réellement démontré, et qu'est-ce qui le prouve ? ».
//
// Tout vient du read-model transverse : aucune vérité calculée ici, aucun texte
// explicatif écrit en dur — l'explication est produite par le moteur
// (`whyCompetencyState`) et consommée telle quelle.

import Link from 'next/link';
import { getProgram, getDocHtml } from '@/lib/program';
import { getActiveTrackId } from '@/lib/progress-server';
import { getCatalogue } from '@/lib/catalogue-server';
import { getTrack } from '@/lib/catalogue';
import { demoteDocTitle } from '@/lib/doc-sections';
import { getCompetencySummary } from '@/lib/learner-read-models';
import { PageHeader, ContextLine } from '@/app/ui';
import SkillsBoard from './SkillsBoard';

export const dynamic = 'force-dynamic';

export default function SkillsPage() {
  const program = getProgram();
  const activeTrack = getTrack(getCatalogue(), getActiveTrackId());
  const rubric = getDocHtml('rubrics/skills-scorecard.md');
  const summary = getCompetencySummary();
  const { counts, assessedCount, totalCount, evidenceCount, qualifyingEvidenceCount } = summary;

  // ÉTAT VIDE HONNÊTE (contrat §12) : 0 compétence évaluée n'est pas une
  // compétence évaluée à 0. Le produit dit ce qu'il sait, et rien de plus.
  const empty = evidenceCount === 0;

  return (
    <>
      <ContextLine
        label="État des compétences"
        facts={
          empty
            ? [
                { k: 'Compétences', v: `${totalCount}` },
                { k: 'Preuves', v: 'aucune', here: true },
              ]
            : [
                { k: 'Compétences', v: `${totalCount}` },
                { k: 'Évaluées', v: `${assessedCount}`, here: true },
                { k: 'Consolidées', v: `${counts.reinforced}` },
                { k: 'Démontrées', v: `${counts.demonstrated}` },
                { k: 'Preuves', v: `${evidenceCount}` },
              ]
        }
      />
      <PageHeader
        eyebrow={<>Compétences <span className="sep">/</span> parcours actif : {activeTrack?.title ?? '—'}</>}
        title="Compétences"
        sub={<>
          Chaque état est <strong>projeté depuis des preuves</strong> — jamais déclaré, jamais déduit
          d&apos;une simple journée terminée. Détail des niveaux : <Link href="/doc/rubrics/skills-scorecard">scorecard</Link>.
          Pour produire une preuve : <Link href="/diagnostics">diagnostics</Link> ou <Link href="/lab">laboratoire</Link>.
        </>}
      />

      {empty ? (
        <section className="ev-empty" aria-label="Aucune preuve enregistrée">
          <h2 className="ev-empty-t">Aucune preuve enregistrée pour l&apos;instant.</h2>
          <p className="ev-empty-p">
            Une compétence se démontre par une <strong>validation réussie</strong> : un exercice dont
            tous les tests passent, un diagnostic au-dessus du seuil, une mission livrée.
            Tant qu&apos;il n&apos;y en a aucune, le produit ne se prononce pas — il n&apos;affiche pas
            un niveau de zéro, il dit qu&apos;il ne sait pas.
          </p>
          <div className="ev-empty-actions">
            <Link className="btn cta" href="/lab">Ouvrir le laboratoire</Link>
            <Link className="btn" href="/diagnostics">Passer un diagnostic</Link>
          </div>
        </section>
      ) : (
        <section className="ev-lede" aria-label="Ce que tes preuves établissent">
          <p className="ev-lede-h">
            <strong>{assessedCount}</strong> compétence{assessedCount > 1 ? 's' : ''} sur {totalCount} repose
            {assessedCount > 1 ? 'nt' : ''} sur au moins une trace enregistrée.
          </p>
          <p className="ev-lede-s">
            {qualifyingEvidenceCount > 0
              ? <><strong>{qualifyingEvidenceCount}</strong> preuve{qualifyingEvidenceCount > 1 ? 's' : ''} qualifiante{qualifyingEvidenceCount > 1 ? 's' : ''} sur {evidenceCount} enregistrée{evidenceCount > 1 ? 's' : ''} — seules les validations réussies démontrent.</>
              : <>Aucune preuve qualifiante pour l&apos;instant : {evidenceCount} trace{evidenceCount > 1 ? 's' : ''} enregistrée{evidenceCount > 1 ? 's' : ''} comptent comme pratique.</>}
          </p>
          <Link className="ev-lede-link" href="/history">Voir l&apos;historique de travail</Link>
        </section>
      )}

      <SkillsBoard
        competencies={summary.competencies}
        explanations={summary.explanations}
        skillNames={Object.fromEntries(program.skills.map((s: { id: string; name: string }) => [s.id, s.name]))}
      />

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
