// V69 — mesure les exemples guidés du corpus. NE MODIFIE RIEN.
// Compte ; trouve ; compare. N'écrit aucun cours (cf. brief V69 §14).
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'curriculum/lessons';
const PERIMETRE = JSON.parse(fs.readFileSync('docs/v69/perimetre.json', 'utf8'));

const mots = (s) => (s.trim().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;

export function exempleGuide(txt) {
  const lignes = txt.split('\n');
  let debut = -1;
  for (let i = 0; i < lignes.length; i++) {
    if (/^##\s+.*[Ee]xemple guidé/.test(lignes[i])) { debut = i + 1; break; }
  }
  if (debut === -1) return null;
  let fin = lignes.length;
  for (let i = debut; i < lignes.length; i++) {
    if (/^##\s/.test(lignes[i])) { fin = i; break; }
  }
  return lignes.slice(debut, fin).join('\n');
}

// Marqueurs du standard V69 (docs/V69-ACADEMIC-EDITORIAL-STANDARD.md §3).
//
// LIMITE DÉCLARÉE de la sonde `decisions` : elle compte des unités de décision
// ÉTIQUETÉES. Le brief V69 §7 exige au contraire de VARIER LA FORME ; une leçon
// peut donc porter d'excellentes décisions sous une autre forme (une question de
// consommateur, un candidat pesé, une étape d'enquête) et compter 0 ici.
// Un 0 n'est PAS un verdict de superficialité : c'est une invitation à lire.
// Une première version ne reconnaissait que « **Décision N » et signalait 10
// leçons sur 40 ; l'inspection a montré qu'aucune des 10 n'était superficielle —
// elles employaient une autre forme d'étiquette. La sonde a été élargie, pas les
// leçons alignées sur la sonde.
const FORMES = [
  /\*\*Décision\s*\d/g,                 // « **Décision 1 — … »
  /\*\*Candidat\s*\d/g,                 // « **Candidat 2 — … »
  /\*\*Réglage\s*\d/g,
  /\*\*Étape\s*\d/g,
  /\*\*Couche\s*\d/g,               // « **Couche 2 — … » (défense en profondeur)
];
const marqueurs = (ex) => ({
  decisions:  FORMES.reduce((n, re) => n + (ex.match(re) || []).length, 0),
  variante:   /Variante qui déplace le problème/.test(ex),
  gabaritB:   /\*\*Énoncé\*\*/.test(ex) && /\*\*Raisonnement\*\*/.test(ex),
  mesure:     /mesuré|Mesuré|calculé|exécut/.test(ex),
});

const rows = [];
for (const f of fs.readdirSync(DIR).filter((f) => f.endsWith('.md')).sort()) {
  const slug = f.replace(/\.md$/, '');
  const ex = exempleGuide(fs.readFileSync(path.join(DIR, f), 'utf8'));
  if (ex === null) { rows.push({ slug, mots: null }); continue; }
  rows.push({ slug, mots: mots(ex), ...marqueurs(ex), cible: PERIMETRE.includes(slug) });
}

const med = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

const cibles = rows.filter((r) => r.cible && r.mots !== null);
const autres = rows.filter((r) => !r.cible && r.mots !== null);
const sansEx = rows.filter((r) => r.mots === null);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(rows, null, 2));
} else {
  console.log(`Leçons analysées : ${rows.length}  (dont ${sansEx.length} sans section « Exemple guidé »)`);
  console.log(`Périmètre V69    : ${cibles.length} / ${PERIMETRE.length} attendues\n`);
  const bloc = (nom, g) => {
    const m = g.map((r) => r.mots);
    console.log(`${nom} (${g.length} leçons)`);
    console.log(`   médiane ${med(m)} mots | min ${Math.min(...m)} | max ${Math.max(...m)}`);
    console.log(`   ≥ 3 décisions explicites : ${g.filter((r) => r.decisions >= 3).length}/${g.length}`);
    console.log(`   variante qui déplace     : ${g.filter((r) => r.variante).length}/${g.length}`);
    console.log(`   gabarit Énoncé/Raisonn.  : ${g.filter((r) => r.gabaritB).length}/${g.length}`);
    console.log(`   < 120 mots               : ${g.filter((r) => r.mots < 120).length}/${g.length}\n`);
  };
  bloc('PÉRIMÈTRE V69', cibles);
  bloc('HORS PÉRIMÈTRE', autres);
  const faibles = cibles.filter((r) => r.decisions < 3 || !r.variante);
  if (faibles.length) {
    console.log('Leçons du périmètre sous le standard :');
    faibles.forEach((r) => console.log(`   ${r.slug} — décisions ${r.decisions}, variante ${r.variante}`));
  } else console.log('Toutes les leçons du périmètre portent ≥3 décisions et une variante.');
}
