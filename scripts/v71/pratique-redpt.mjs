// V71 — CP10. Grille R/E/D/P/T sur les sections de pratique des 128 lecons.
//
// CE QUE CETTE SONDE EST. Une operationnalisation de l ancre D8 = 5 du contrat
// gele au CP1, qui exige CINQ elements :
//
//   R — production Reelle et observable (l apprenant PRODUIT, il ne restitue pas)
//   E — Enonce du contexte (une situation, pas un enonce hors-sol)
//   D — contraintes Donnees (ce qui est impose, ce qui est interdit)
//   P — livrable nomme (le Produit attendu est dit : un tableau, un script, trois lignes)
//   T — critere de reussite verifiable seul (le Test que l apprenant s applique)
//
// Elle N AJOUTE AUCUNE DIMENSION et ne modifie pas le bareme (brief §6) : les cinq
// lettres sont les cinq elements deja ecrits dans l ancre D8 = 5, rendus verifiables
// un par un. La note D8 reste attribuee par LECTURE.
//
// CE QUE CETTE SONDE N EST PAS. Elle ne note pas. Elle detecte des MARQUEURS
// lexicaux, et un marqueur absent ne prouve pas l element absent : une consigne peut
// nommer son livrable sans jamais ecrire le mot « livrable ». Inversement le mot
// « livrable » ne prouve pas qu il y en ait un. Sortie = ordre de lecture, rien d autre.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'curriculum/lessons';
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Une section de pratique = tout titre de niveau 2 qui porte une CONSIGNE adressee a
// l apprenant. Deux exclusions, et elles comptent :
//   - les corrections : ce n est pas la consigne, c est sa reponse ;
//   - les RENVOIS : « ## 🛠️ Pratique » SANS sous-titre. Ces sections ne sont pas des
//     consignes mais des routages vers les exercices auto-corriges de la plateforme
//     (« exercice `queue-idempotent-consumer`, SIMULATIONS deterministes »).
//
// Deux versions de cette sonde ont ete jetees avant celle-ci, et c est instructif :
//   v1 incluait les renvois — leurs 45 a 60 mots de routage remontaient en tete de
//      l ordre de lecture des lecons dont la vraie consigne est ailleurs et va bien
//      (verifie sur api-design-basics).
//   v2 excluait tout titre commencant par 🛠️ — ce qui jetait aussi des pratiques
//      REELLES, la meme icone servant aux deux (verifie sur browser-dom-rendering, dont
//      la pratique est l un des meilleurs dispositifs du corpus).
// Le discriminant retenu est le SOUS-TITRE : un renvoi s intitule « Pratique » tout
// court, une consigne annonce ce qu on va faire apres un tiret cadratin.
const TITRE_PRATIQUE = /^##\s+.*(pratique|mini-exercice|exercice|a toi de|ta production)/i;
const TITRE_CORRECTION = /^##\s+.*(correction|corrige)/i;
const TITRE_RENVOI = /^##\s+🛠️\s*Pratique\s*$/;

const MARQUEURS = {
  R: [/\bproduis\b/, /\becris\b/, /\bconstrui/, /\bimplemente/, /\bmesure\b/, /\bcompte\b/,
      /\bexecute\b/, /\btrie\b/, /\bcorrige\b/, /\bdecide\b/, /\bcompare\b/, /\breproduis\b/,
      /\bfais-le\b/, /\brefais\b/, /\bcasse\b/, /\bajoute\b/, /\bremplace\b/],
  E: [/\bton\b/, /\bta\b/, /\btes\b/, /\bune equipe\b/, /\bon te\b/, /\bun collegue\b/,
      /\bimagine\b/, /\bsuppose\b/, /\bvoici\b/, /\bsur un\b/, /\bsur une\b/],
  D: [/\bsans\b/, /\bne pas\b/, /\binterdit\b/, /\bimpose\b/, /\bmaximum\b/, /\bau plus\b/,
      /\bexactement\b/, /\bdoit\b/, /\bobligatoire/, /\ben moins de\b/, /\buniquement\b/],
  P: [/\blivrable\b/, /\brends\b/, /\bune capture\b/, /\bun tableau\b/, /\btrois lignes\b/,
      /\bta reponse\b/, /\bun script\b/, /\bun fichier\b/, /\bune liste\b/, /\bun schema\b/,
      /\bta sortie\b/, /\bta version\b/],
  T: [/\bverifie\b/, /\bverification\b/, /\btu sais que\b/, /\bcritere\b/, /\breussi\b/,
      /\bdoit afficher\b/, /\bdoit refuser\b/, /\btu as fini\b/, /\bsi .{0,40}alors\b/,
      /\bcompare (a|au|aux)\b/, /\battendu\b/, /\bprouve\b/],
};

// TROISIEME correction, et la plus importante. 66 des 128 lecons portent un bloc
// « Vérifie seul, sans corrigé » — une consigne de verification autonome, c est-a-dire
// exactement le T de la grille. Il vit A L INTERIEUR de la section Correction attendue,
// que la regle ci-dessus exclut. La v3 de cette sonde declarait donc T absent sur des
// lecons qui le portent, et quatre lecons « sans aucune pratique » alors qu elles en ont
// une (verifie sur async-messaging-queues : « Rejoue deux fois le meme message dans ton
// worker. L effet est-il identique ? Sinon, tu as un doublon en attente d un
// redemarrage. » — R, E et T dans trois lignes). Le bloc est donc rattache a l appareil
// de pratique, ou qu il soit.
const BLOC_VERIF = /\*\*Vérifie seul[^*]*\*\*\s*:?([\s\S]*?)(?=\n## |\n\*\*[A-ZÉÀ]|$)/g;

const lignes = [];
for (const f of readdirSync(DIR).filter((x) => x.endsWith('.md')).sort()) {
  const md = readFileSync(join(DIR, f), 'utf8');
  const blocs = [];
  let cour = null;
  for (const l of md.split('\n')) {
    if (/^## /.test(l)) {
      if (cour) blocs.push(cour);
      cour = TITRE_PRATIQUE.test(l) && !TITRE_CORRECTION.test(l) && !TITRE_RENVOI.test(l)
        ? { titre: l, txt: '' } : null;
    } else if (cour) cour.txt += l + '\n';
  }
  if (cour) blocs.push(cour);
  for (const m of md.matchAll(BLOC_VERIF)) blocs.push({ titre: 'Vérifie seul', txt: m[1] });

  const txt = norm(blocs.map((b) => b.txt).join('\n'));
  const manquants = Object.entries(MARQUEURS)
    .filter(([, rs]) => !rs.some((r) => r.test(txt)))
    .map(([k]) => k);
  lignes.push({ slug: f.replace(/\.md$/, ''), n: blocs.length, mots: txt.split(/\s+/).filter(Boolean).length, manquants });
}

const sans = lignes.filter((l) => l.n === 0);
const trous = lignes.filter((l) => l.n > 0 && l.manquants.length).sort((a, b) => b.manquants.length - a.manquants.length);

console.log(`Lecons                                   : ${lignes.length}`);
console.log(`  sans aucune section de pratique        : ${sans.length}`);
console.log(`  avec au moins un marqueur R/E/D/P/T absent : ${trous.length}`);
console.log(`  aucun marqueur absent                  : ${lignes.length - sans.length - trous.length}\n`);
if (sans.length) console.log('SANS SECTION DE PRATIQUE DETECTEE (a lire en premier) :\n  ' + sans.map((l) => l.slug).join('\n  ') + '\n');
console.log('ORDRE DE LECTURE (marqueurs absents en premier) :');
for (const l of trous) console.log(`  ${l.manquants.join('')}  ${l.slug.padEnd(34)} ${l.n} section(s), ${l.mots} mots`);
console.log('\nRappel : un marqueur absent n est PAS un defaut. C est une lecon a lire.');
