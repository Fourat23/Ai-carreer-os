const texte = `Article 7 - Preavis. En cas de demission, le salarie est tenu de respecter un preavis. La duree de ce preavis est fixee a deux mois pour les cadres et a un mois pour les autres categories de personnel. Article 8 - Conges payes. Le salarie acquiert 2,5 jours ouvrables par mois de travail effectif.`;

const decouperTaille = (t, taille, chevauchement = 0) => {
  const out = []; let i = 0;
  while (i < t.length) { out.push(t.slice(i, i + taille)); i += taille - chevauchement; }
  return out;
};
const decouperStructure = (t) => t.split(/(?=Article \d)/).map(s => s.trim()).filter(Boolean);

const contient = (c) => /deux mois/.test(c) && /demission|preavis/i.test(c);
const rapport = (nom, chunks) => {
  const ok = chunks.filter(contient);
  console.log(`\n${nom} -> ${chunks.length} morceaux`);
  chunks.forEach((c, i) => console.log(`   [${i}] ${JSON.stringify(c.slice(0, 62))}${c.length > 62 ? '…' : ''}`));
  console.log(`   morceaux contenant A LA FOIS "demission/preavis" et "deux mois" : ${ok.length}`);
};

rapport('A. taille fixe 120 caracteres, sans chevauchement', decouperTaille(texte, 120));
rapport('B. taille fixe 120 avec chevauchement de 40', decouperTaille(texte, 120, 40));
rapport('C. decoupage par structure (Article)', decouperStructure(texte));
