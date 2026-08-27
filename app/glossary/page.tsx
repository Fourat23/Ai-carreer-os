import Link from 'next/link';
import { getGlossaryIndex, getGlossary, CATEGORIES } from '@/lib/glossary';
import { SurfaceHead, ContextLine } from '@/app/ui';
import GlossaryBrowser from './GlossaryBrowser';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Glossaire IT & monde du travail — AI Career OS',
  description: "Décoder les acronymes, anglicismes et expressions du développement, de la data, de l'IA, de la production et de l'entreprise.",
};

export default function GlossaryPage() {
  const entries = getGlossaryIndex();
  const acronyms = entries.filter((e) => e.fullForm).length;
  void getGlossary; // le corpus complet reste servi par /api/glossary/[id]

  return (
    <div className="gl page-wide">
      <ContextLine
        label="État du glossaire"
        facts={[
          { k: 'Termes', v: `${entries.length}`, here: true },
          { k: 'Acronymes', v: `${acronyms}` },
          { k: 'Catégories', v: `${CATEGORIES.length}` },
        ]}
      />
      <SurfaceHead
        kind="editorial"
        eyebrow={<>Outils <span className="sep">/</span> vocabulaire de terrain</>}
        title="Glossaire IT & monde du travail"
        lead="Décoder les acronymes, anglicismes et expressions entendus en développement, architecture, cloud, data, IA, production et entreprise. Chaque entrée dit ce que le terme veut dire, dans quel contexte on l'emploie, et ce qu'on attend de toi."
        facts={[
          { k: 'Termes', v: entries.length },
          { k: 'Acronymes', v: acronyms },
          { k: 'Catégories', v: CATEGORIES.length },
        ]}
      />

      {/* V62 · CP12 — Un glossaire n'est pas une destination : on y vient
          depuis un mot croisé ailleurs, et on repart travailler. La suite est
          donc explicitement le retour au travail, pas une autre lecture. */}
      <section className="tb-next" aria-label="Prochaine action">
        <div className="tb-next-body">
          <span className="tb-next-k">Ensuite</span>
          <p className="tb-next-t">Reprendre la journée en cours</p>
          <p className="tb-next-d">
            Le vocabulaire se retient en s’en servant, pas en le parcourant.
          </p>
        </div>
        <Link className="btn cta" href="/">Revenir au parcours</Link>
      </section>

      <GlossaryBrowser entries={entries} categories={CATEGORIES} />
    </div>
  );
}
