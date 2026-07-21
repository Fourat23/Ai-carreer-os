import { getGlossary, CATEGORIES } from '@/lib/glossary';
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
      <h1>Glossaire IT &amp; monde du travail</h1>
      <p className="subtitle">
        {entries.length} termes pour décoder les acronymes, anglicismes et expressions
        entendus en développement, architecture, cloud, data, IA, production, gestion de
        projet et entreprise ({acronyms} acronymes, {entries.length - acronyms} expressions).
        Chaque entrée dit ce que le terme veut dire, dans quel contexte on l'emploie, et ce
        qu'une personne attend concrètement de toi quand elle l'utilise.
      </p>
      <GlossaryBrowser entries={entries} categories={CATEGORIES} />
    </>
  );
}
