import { getGlossary, CATEGORIES } from '@/lib/glossary';
import { SurfaceHead } from '@/app/ui';
import GlossaryBrowser from './GlossaryBrowser';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Glossaire IT & monde du travail — AI Career OS',
  description: "Décoder les acronymes, anglicismes et expressions du développement, de la data, de l'IA, de la production et de l'entreprise.",
};

export default function GlossaryPage() {
  const entries = getGlossary();
  const acronyms = entries.filter((e) => e.fullForm).length;

  return (
    <div className="gl page-wide">
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

      <GlossaryBrowser entries={entries} categories={CATEGORIES} />
    </div>
  );
}
