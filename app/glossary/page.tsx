import { getGlossary, CATEGORIES } from '@/lib/glossary';
import { HeroFocus, HeroFact } from '@/app/ui';
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
    <>
      <HeroFocus
        tone="calm"
        eyebrow="Vocabulaire"
        title="Glossaire IT & monde du travail"
        lead="Décoder les acronymes, anglicismes et expressions entendus en développement, architecture, cloud, data, IA, production et entreprise."
        meta={
          <>
            <HeroFact k="Termes">{entries.length}</HeroFact>
            <HeroFact k="Acronymes">{acronyms}</HeroFact>
            <HeroFact k="Catégories">{CATEGORIES.length}</HeroFact>
          </>
        }
      />
      <div className="page-head" hidden>
        <div className="page-head-main">
          <p className="page-eyebrow">Vocabulaire <span className="sep">/</span> {entries.length} termes · {acronyms} acronymes</p>
          <h1 className="page-title">Glossaire IT &amp; monde du travail</h1>
          <p className="page-sub">
            Décoder les acronymes, anglicismes et expressions entendus en développement,
            architecture, cloud, data, IA, production et entreprise. Chaque entrée dit ce que
            le terme veut dire, dans quel contexte on l'emploie, et ce qu'on attend de toi.
          </p>
        </div>
      </div>
      <GlossaryBrowser entries={entries} categories={CATEGORIES} />
    </>
  );
}
