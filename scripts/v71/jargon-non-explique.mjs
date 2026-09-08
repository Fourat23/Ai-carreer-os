// V71 — CP11. Sigles employés dans une leçon sans y être développés.
//
// POURQUOI LA PREMIÈRE VERSION A ÉTÉ JETÉE. Elle repérait les sigles par une
// expression régulière sur les majuscules. Résultat : 121 leçons sur 128, donc
// aucun ordre de lecture exploitable, et des candidats qui n'étaient pas des
// sigles du tout — `RIEUR` (extrait de « SUPÉRIEUR »), `QUALIT` (de « QUALITÉ »),
// `TAGE`, `ARBRE`, `CHOIX`, `JUSTE`, `VOUS`. La cause est double : les frontières
// de mot de JavaScript sont ASCII, donc une majuscule accentuée coupe le mot en
// deux ; et le corpus emploie les capitales pour l'emphase en français.
//
// CE QUE FAIT CETTE VERSION. Elle n'invente pas la liste des sigles : elle prend
// celle que le projet a déjà écrite — les 198 entrées de `curriculum/glossary/`
// qui portent une forme longue. Un sigle est donc un sigle parce que le projet
// l'a déclaré tel, pas parce qu'il est en capitales.
//
// CE QU'ELLE NE PROUVE PAS. Le glossaire ne compte pas comme explication :
// l'ancre D5 exige que le terme soit « compréhensible AU MOMENT OÙ IL APPARAÎT,
// par ce que la leçon en dit, SANS RECOURS AU GLOSSAIRE ». Un sigle développé
// dans la leçon vaut 2 sur cette ancre ; c'est la lecture qui décide entre 2, 4
// et 5, selon que le rôle est dit ou non. Cette sonde produit un ordre de
// lecture, pas une note.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const glossaire = JSON.parse(readFileSync('curriculum/glossary/glossary.json', 'utf8'));
const SIGLES = glossaire
  .filter((e) => e.fullForm && /^[A-Za-z0-9./-]{2,8}$/.test(e.term))
  .map((e) => ({ terme: e.term, forme: e.fullForm }));

const sansAccent = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
// Le sigle doit apparaître entouré de non-lettres : évite `IA` dans « médIAtion ».
const occurrences = (txt, t) => {
  const re = new RegExp(`(?<![A-Za-zÀ-ÿ0-9])${t.replace(/[.*+?^${}()|[\]\\/-]/g, '\\$&')}(?![A-Za-zÀ-ÿ0-9])`, 'g');
  return (txt.match(re) ?? []).length;
};

const lignes = [];
for (const f of readdirSync('curriculum/lessons').filter((x) => x.endsWith('.md')).sort()) {
  const brut = readFileSync(join('curriculum/lessons', f), 'utf8');
  const prose = brut.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`\n]*`/g, ' ');
  const plat = sansAccent(brut);            // la forme longue peut vivre dans un tableau
  const manquants = [];
  for (const { terme, forme } of SIGLES) {
    const n = occurrences(prose, terme);
    if (n < 2) continue;                    // cité une fois : pas une dépendance de lecture
    // développé quelque part dans la leçon ? on tolère les variantes de casse et d'accent.
    const motsForme = sansAccent(forme).split(/[\s-]+/).filter((w) => w.length > 2);
    const developpe = motsForme.length > 0 && motsForme.every((w) => plat.includes(w));
    if (!developpe) manquants.push(`${terme}×${n}`);
  }
  if (manquants.length) lignes.push({ slug: f.replace(/\.md$/, ''), manquants });
}

const total = lignes.reduce((s, l) => s + l.manquants.length, 0);
console.log(`Sigles du glossaire employés ≥2 fois dans une leçon SANS y être développés`);
console.log(`Leçons concernées : ${lignes.length} / 128 — occurrences : ${total}\n`);
for (const l of lignes.sort((a, b) => b.manquants.length - a.manquants.length)) {
  console.log(`  ${l.slug.padEnd(34)} ${l.manquants.join('  ')}`);
}
console.log(`\nOrdre de lecture. Un sigle non développé peut être légitime (le sujet même`);
console.log(`de la leçon, développé dans son titre ou ses prérequis) ; un sigle développé`);
console.log(`peut rester inexpliqué. La lecture tranche, pas ce compteur.`);
