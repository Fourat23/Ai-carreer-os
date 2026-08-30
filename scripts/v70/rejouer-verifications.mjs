// V70 CP12 — rejoue TOUTES les vérifications et contrôle que les chiffres
// cités dans les leçons figurent encore dans leur sortie.
// Toute divergence est un fait à publier, pas à corriger silencieusement.
//
// POURQUOI CE REJEU N'EST PAS DANS `gates:active`, décision déclarée.
// Le rejeu complet dure environ sept minutes, dominé par trois scripts qui
// mesurent des durées réelles : linux-ressources.sh (126 s, dont 120 s de
// charge processeur volontaire), readme-executable.sh (178 s, dont un clone
// et trois constructions), pipeline-duree.mjs (101 s, qui chronomètre les 155
// fichiers de tests du dépôt un par un).
// Ajouter sept minutes à une porte exécutée en permanence pousserait à la
// contourner, ce qui reviendrait à supprimer la porte. Le rejeu est donc une
// commande distincte, `npm run v70:verify`, à lancer avant toute publication
// du corpus et à chaque modification d'un script de vérification.
// C'est un compromis assumé, pas un oubli : une porte que l'on saute ne
// protège de rien, comme le mesure la leçon ci-dessous sur les tests
// instables (2 % d'instabilité sur 300 tests -> 0,2333 % de pipelines verts).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'scripts/v70-verifications';
const SP = '/tmp/claude-0/-home-user-Ai-carreer-os/79d55860-21ac-5b1a-91c6-5b6622f4a502/scratchpad';

// Chiffres cités dans les leçons, à retrouver dans la sortie du script.
// Seules les valeurs DÉTERMINISTES sont contrôlées : les durées varient d'une
// exécution à l'autre et ne sont donc pas des ancres.
const ANCRES = {
  'sql-mise-a-jour-perdue.mjs':   ['50'],
  'n-plus-un.mjs':                ['51'],
  'etl-idempotence.mjs':          ['617', '96006', '2000', '299000'],
  'disjoncteur-et-attente.mjs':   ['600', '5'],
  'slo-budget-erreur.py':         ['43', '800'],
  'llm-cout-et-vecteurs.py':      ['12', '41'],
  'couches-overlay.sh':           ['c---------', '5132', '5144'],
  'supervision-redemarrage.mjs':  ['137', '143', '78'],
  'linux-permissions.sh':         [],
  'journaux-et-correlation.mjs':  ['200/200', '1/200', '39.5'],
  'incidents-arithmetique.mjs':   ['59 %', '6.4 h', '48.0'],
  'ml-pieges-mesures.py':         ['97.33', '79.3', '97.93', '+0.00'],
  'reseaux-et-attention.py':      ['0.2500', '9.095e-13', '65 536'],
  'porte-couverture.mjs':         ['100.00', '88.89'],
  'tests-instables.mjs':          ['0.2333'],
  'dimensionnement.mjs':          ['1 157', '11 574', '2,84'],
  'retour-arriere.mjs':           ['151', '25', '72 000'],
  'git-avance.sh':                ['4 etapes'],
  'js-async-et-types.mjs':        ['NaN,NaN', '0.30000000000000004'],
  'hachage-lent.mjs':             [],
  'pipeline-duree.mjs':           ['155'],
  'secret-dans-git.sh':           ['sk_live_51H8fQ2aNvR'],
  'cles-vs-mots-de-passe.mjs':    ['681015', 'true'],
  'reseau-mesures.mjs':           ['1460'],
  'readme-executable.sh':         [],
};

const lanceur = (f) => {
  if (f.endsWith('.mjs')) return [process.execPath, [path.join(DIR, f)]];
  if (f.endsWith('.py'))  return ['python3', [path.join(DIR, f)]];
  if (f.endsWith('.sh'))  return ['bash', [path.join(DIR, f)]];
  return null;
};

const fichiers = fs.readdirSync(DIR)
  .filter((f) => /\.(mjs|py|sh)$/.test(f)).sort();

let ok = 0, casses = 0, ancresManquantes = [];
console.log(`rejeu de ${fichiers.length} vérifications\n`);
for (const f of fichiers) {
  const [cmd, args] = lanceur(f);
  const t0 = Date.now();
  const r = spawnSync(cmd, args, {
    encoding: 'utf8', timeout: 600000,
    env: { ...process.env, PYTHONPATH: `${SP}/py` },
  });
  const ms = Date.now() - t0;
  // NOTE DE MÉTHODE — V70 CP12.
  // toLocaleString('fr-FR') émet U+202F (espace fine insécable) comme
  // séparateur de milliers, et non l'espace ordinaire U+0020 employé dans le
  // texte des leçons. Vérifié par inspection octet à octet :
  //   « 11M-bM-^@M-/574 » dans la sortie contre « 11 574 » dans la leçon.
  // Les NOMBRES sont identiques ; seul le caractère d'espacement diffère.
  // On normalise donc les espaces des deux côtés avant de comparer, sinon la
  // sonde signale une divergence de chiffre là où il n'y a qu'une différence
  // de typographie. Cette normalisation ne masque aucun écart numérique.
  const normEsp = (t) => t.replace(/[\u00a0\u202f\u2009]/g, ' ');
  const sortie = normEsp((r.stdout || '') + (r.stderr || ''));
  const vivant = r.status === 0;
  const attendues = ANCRES[f] || null;
  const manquantes = attendues ? attendues.filter((a) => !sortie.includes(normEsp(a))) : [];
  if (!vivant) casses++; else ok++;
  if (manquantes.length) ancresManquantes.push({ f, manquantes });
  const etat = vivant ? 'OK   ' : 'ÉCHEC';
  const anc = attendues === null ? 'pas d ancre'
    : manquantes.length === 0 ? `${attendues.length} ancre(s) retrouvée(s)`
    : `ANCRES MANQUANTES : ${manquantes.join(', ')}`;
  console.log(`  ${etat} ${String(ms).padStart(6)} ms  ${f.padEnd(32)} ${anc}`);
  if (!vivant) console.log(`         ${(r.stderr || '').split('\n').slice(0, 3).join(' | ')}`);
}
console.log(`\nscripts exécutés sans erreur : ${ok} / ${fichiers.length}`);
console.log(`scripts en échec             : ${casses}`);
console.log(`scripts dont une ancre manque : ${ancresManquantes.length}`);
for (const a of ancresManquantes)
  console.log(`   ${a.f} : ${a.manquantes.join(', ')}`);
process.exit(casses > 0 || ancresManquantes.length > 0 ? 1 : 0);
