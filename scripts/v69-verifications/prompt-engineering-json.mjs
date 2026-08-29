// Sorties realistes d'un modele a qui on a demande "UNIQUEMENT du JSON".
const sorties = [
  ['propre',                      '{"nom":"Lina","montant":240}'],
  ['entoure de ```json',          '```json\n{"nom":"Lina","montant":240}\n```'],
  ['avec une phrase avant',       'Voici le resultat :\n{"nom":"Lina","montant":240}'],
  ['montant en texte',            '{"nom":"Lina","montant":"240"}'],
  ['montant avec devise',         '{"nom":"Lina","montant":"240 EUR"}'],
  ['virgule finale',              '{"nom":"Lina","montant":240,}'],
  ['champ absent',                '{"nom":"Lina"}'],
  ['null en chaine',              '{"nom":"Lina","montant":"null"}'],
  ['champ en trop',               '{"nom":"Lina","montant":240,"confiance":0.9}'],
];

const brut = (s) => { try { JSON.parse(s); return 'parse OK'; } catch { return 'PARSE ECHOUE'; } };
const repare = (s) => {
  let t = s.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const i = t.indexOf('{'), j = t.lastIndexOf('}');
  if (i >= 0 && j > i) t = t.slice(i, j + 1);
  try { return JSON.parse(t); } catch { return null; }
};
// Le schema attendu
const valide = (o) => o && typeof o.nom === 'string'
  && typeof o.montant === 'number' && Number.isFinite(o.montant);

console.log('sortie du modele'.padEnd(24), 'JSON.parse brut'.padEnd(16), 'apres reparation'.padEnd(18), 'conforme au schema');
for (const [nom, s] of sorties) {
  const o = repare(s);
  console.log(nom.padEnd(24), brut(s).padEnd(16), (o ? 'parse OK' : 'echec').padEnd(18), valide(o) ? 'OUI' : 'NON');
}
console.log('\nSur 9 sorties plausibles :');
const p = sorties.filter(([,s]) => brut(s) === 'parse OK').length;
const r = sorties.filter(([,s]) => repare(s)).length;
const v = sorties.filter(([,s]) => valide(repare(s))).length;
console.log(`   JSON.parse direct reussit sur ${p}/9`);
console.log(`   apres nettoyage des cloture et du bavardage : ${r}/9`);
console.log(`   mais SEULEMENT ${v}/9 respectent reellement le schema demande`);
