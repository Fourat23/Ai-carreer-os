// V71 CP3 — detection des prerequis enseignes APRES la lecon qui les cite.
//
// La sonde DETECTE seulement. Elle compare deux faits verifiables :
//   - le premier jour du parcours qui enseigne la lecon citante ;
//   - le premier jour du parcours qui enseigne la lecon citee en prerequis.
//
// Elle ne classe rien. Un prerequis postérieur n'est un defaut que si la
// FORMULATION en fait une exigence ; si le texte signale que la notion viendra
// plus tard, le comportement est correct. Cette distinction demande une lecture,
// et le script imprime donc la phrase citante pour que la lecture soit possible.
//
//   node scripts/v71/prerequis-ordre.mjs          # tableau + phrases
//   node scripts/v71/prerequis-ordre.mjs --json   # sortie machine

import fs from 'node:fs';

const ordre = JSON.parse(fs.readFileSync('docs/v71/ordre-lecture.json', 'utf8'));
const jour = new Map(ordre.map((r) => [r.slug, r.prog ? Number(r.j1.replace('day-', '')) : null]));
const connu = new Set(ordre.map((r) => r.slug));

// La section « Prerequis » porte un emoji variable selon les lecons ; on la
// reconnait par son titre normalise, pas par sa decoration.
const norm = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const sectionPrerequis = (texte) => {
  const parts = texte.split(/^## /m);
  for (const p of parts.slice(1)) {
    const titre = p.split('\n')[0];
    if (/prerequis/.test(norm(titre))) return p.split('\n').slice(1).join('\n').trim();
  }
  return null;
};

// Phrase citante : on decoupe sur la ponctuation forte apres avoir rejoint les
// lignes, car le corpus est enroule a ~90 colonnes et une phrase tient sur
// plusieurs lignes.
const phraseCitant = (corps, cible) => {
  const plat = corps.replace(/\n+/g, ' ').replace(/\s+/g, ' ');
  const phrases = plat.split(/(?<=[.!?;])\s+/);
  const p = phrases.find((s) => s.includes(`/doc/lessons/${cible}`));
  return (p || plat).trim();
};

const posterieurs = [];
const horsParcours = [];
const inconnus = [];

for (const r of ordre) {
  const texte = fs.readFileSync(`curriculum/lessons/${r.slug}.md`, 'utf8');
  const corps = sectionPrerequis(texte);
  if (!corps) continue;

  const cites = [...new Set([...corps.matchAll(/\/doc\/lessons\/([a-z0-9-]+)/g)].map((m) => m[1]))];
  for (const cible of cites) {
    if (cible === r.slug) continue;
    if (!connu.has(cible)) { inconnus.push({ lecon: r.slug, cible }); continue; }

    const jL = jour.get(r.slug);
    const jP = jour.get(cible);
    const enr = { lecon: r.slug, jourLecon: jL, cible, jourCible: jP, phrase: phraseCitant(corps, cible) };

    if (jP === null) { horsParcours.push(enr); continue; }   // etagere de reference
    if (jL === null) continue;                                // citante hors parcours : pas d'ordre a violer
    if (jP > jL) posterieurs.push({ ...enr, ecart: jP - jL });
  }
}

posterieurs.sort((a, b) => b.ecart - a.ecart);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ posterieurs, horsParcours, inconnus }, null, 2));
} else {
  console.log(`\nPREREQUIS ENSEIGNES APRES LA LECON QUI LES CITE : ${posterieurs.length}\n`);
  for (const p of posterieurs) {
    console.log(`+${String(p.ecart).padStart(3)} j  ${p.lecon} (j${p.jourLecon}) -> ${p.cible} (j${p.jourCible})`);
  }
  console.log(`\nPREREQUIS HORS PARCOURS (etagere de reference) : ${horsParcours.length}\n`);
  for (const p of horsParcours) console.log(`       ${p.lecon} (j${p.jourLecon}) -> ${p.cible}`);
  if (inconnus.length) {
    console.log(`\nCIBLES INEXISTANTES : ${inconnus.length}`);
    for (const p of inconnus) console.log(`       ${p.lecon} -> ${p.cible}`);
  }
  console.log('\n--- phrases citantes (pour lecture) ---');
  for (const p of [...posterieurs, ...horsParcours]) {
    console.log(`\n${p.lecon} -> ${p.cible}${p.ecart ? ` (+${p.ecart} j)` : ' (hors parcours)'}`);
    console.log(`  ${p.phrase}`);
  }
}
