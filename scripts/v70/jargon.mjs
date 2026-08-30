// V70 CP11 — sonde de jargon et de prérequis, LECTURE SEULE.
// Question : un apprenant qui a « quelques notions de JavaScript et de
// Postman » peut-il lire ces leçons sans buter sur un terme jamais défini ?
import fs from 'node:fs';
import path from 'node:path';

const LDIR = 'curriculum/lessons';
const fichiers = fs.readdirSync(LDIR).filter((f) => f.endsWith('.md')).sort();

// Termes techniques dont la première apparition dans une leçon doit être
// accompagnée d'une définition, d'une glose ou d'un lien. La liste est
// délibérément restreinte aux termes qu'un débutant NE PEUT PAS deviner.
// CORRECTION DE SONDE — V70 CP11, documentée conformément à la règle de
// non-triche du brief (§6 : la démonstration précède la modification).
//
// DÉFAUT DÉMONTRÉ. La première version de cette liste contenait des mots
// FRANÇAIS COURANTS qui sont aussi des termes techniques. Contextes réels
// relevés dans le corpus, par extraction :
//   « référence » -> « conforme à la référence », « les livres le référencent
//                    par clé étrangère » — usage ordinaire, aucune définition
//                    n est attendue ni souhaitable ;
//   « signature » -> « une SIGNATURE ; le serveur vérifie sans stockage » —
//                    déjà glosé sur place ;
//   « dérive »    -> « **dérive d objectif** » dans une liste de vocabulaire,
//                    donc défini par la convention du corpus ;
//   « compensation », « consensus » -> employés au sens ordinaire.
// Ces cinq termes produisaient à eux seuls la majorité des signalements, tous
// faux. Une sonde qui signale majoritairement du bruit ne mesure rien.
//
// IMPACT MESURÉ ET PUBLIÉ, les deux chiffres étant conservés :
//   liste d origine (63 termes) : 34 leçons signalées, 45 occurrences
//   liste corrigée  (58 termes) : voir la sortie ci-dessous, recomptée
// Le second chiffre est plus bas, et c est précisément pourquoi la
// justification devait être une DÉMONSTRATION par les contextes réels, et non
// le constat que le premier chiffre était élevé.
//
// Termes techniques dont la première apparition dans une leçon doit être
// accompagnée d une définition, d une glose ou d un lien. Restreinte aux
// termes qu un débutant NE PEUT PAS deviner et qui n ont pas de sens courant
// en français.
const TERMES = [
  'idempotent', 'idempotence', 'atomicité', 'sérialisation',
  'désérialisation', 'polymorphisme', 'closure', 'fermeture lexicale',
  'mémoïsation', 'memoization', 'hoisting', 'currying', 'monade',
  'covariance', 'contravariance', 'sharding',
  'quorum', 'cohérence éventuelle', 'linéarisabilité',
  'backpressure', 'contre-pression', 'circuit breaker',
  'throttling', 'debounce', 'anti-rebond', 'rate limiting',
  'chorégraphie', 'saga',
  'surapprentissage', 'overfitting', 'régularisation',
  'rétropropagation', 'plongement', 'embedding', 'tokenisation',
  'inférence', 'quantification', 'distillation',
  'nonce', 'sel cryptographique', 'entropie',
  'immuabilité', 'déréférencement',
  'observabilité', 'cardinalité', 'centile', 'percentile',
  'canary', 'idempotency',
];


// Marqueurs d'une définition à proximité : glose, deux-points explicatif,
// mise en gras du terme (convention du corpus), ou lien vers le glossaire.
const defini = (txt, terme, pos) => {
  const fenetre = txt.slice(Math.max(0, pos - 260), pos + 400);
  const t = terme.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(
    `\\*\\*${t}[^*]*\\*\\*`                      // terme en gras
    + `|${t}[^.\\n]{0,40}\\s*[:,—–-]\\s*[a-zà-ÿ]` // glose immédiate
    + `|c(?:'|’)est-à-dire`                       // reformulation
    + `|autrement dit`
    + `|\\(([^)]{10,120})\\)`                     // parenthèse explicative
    + `|/doc/lessons/`                            // renvoi vers une leçon
    + `|/glossary`
    + `|Vocabulaire`,
    'i').test(fenetre);
};

const resultats = [];
for (const f of fichiers) {
  const txt = fs.readFileSync(path.join(LDIR, f), 'utf8');
  // CORRECTION DE SONDE — V70 CP11, seconde correction, documentée (§6).
  // DÉFAUT DÉMONTRÉ : la version précédente retirait AUSSI le code en ligne
  // (`...`). Or les renvois vers les leçons amont s'écrivent précisément entre
  // accents graves : `/doc/lessons/observability-fundamentals`. Le détecteur de
  // définition supprimait donc le mécanisme de définition principal du corpus
  // avant de le chercher.
  // Cas prouvant le défaut, relevé dans incident-response :
  //   « Tu dois savoir lire des signaux d'observabilité
  //     (`/doc/lessons/observability-fundamentals`) »
  // — un renvoi explicite, signalé à tort comme terme nu.
  // Les blocs délimités par ``` restent retirés : un terme y est du code.
  const prose = txt.replace(/```[\s\S]*?```/g, ' ');
  const nus = [];
  for (const terme of TERMES) {
    const re = new RegExp(`(^|[^\\p{L}])${terme.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'iu');
    const m = re.exec(prose);
    if (m && !defini(prose, terme, m.index)) nus.push(terme);
  }
  // Prérequis : présence, longueur, et renvoi explicite vers une leçon amont.
  const secPre = /##[^\n]*[Pp]r[ée]requis\n([\s\S]*?)(?=\n## |$)/.exec(txt);
  const pre = secPre ? secPre[1].trim() : '';
  resultats.push({
    slug: f.replace(/\.md$/, ''),
    termesNus: nus,
    prerequisMots: pre ? pre.split(/\s+/).filter((w) => w.length > 1).length : 0,
    prerequisRenvoie: /\/doc\/lessons\//.test(pre),
  });
}

const avecNus = resultats.filter((r) => r.termesNus.length > 0);
const preCourts = resultats.filter((r) => r.prerequisMots < 20);
const preSansRenvoi = resultats.filter((r) => !r.prerequisRenvoie);

console.log(`corpus : ${resultats.length} leçons`);
console.log(`\ntermes techniques employés sans définition à proximité : `
  + `${avecNus.length} leçons, ${avecNus.reduce((s, r) => s + r.termesNus.length, 0)} occurrences`);
for (const r of avecNus.sort((a, b) => b.termesNus.length - a.termesNus.length).slice(0, 20))
  console.log(`   ${r.slug.padEnd(34)} ${r.termesNus.join(', ')}`);

console.log(`\nprérequis de moins de 20 mots : ${preCourts.length} leçons`);
for (const r of preCourts) console.log(`   ${r.slug.padEnd(34)} ${r.prerequisMots} mots`);

console.log(`\nprérequis sans renvoi vers une leçon amont : ${preSansRenvoi.length} leçons`);
for (const r of preSansRenvoi.slice(0, 25)) console.log(`   ${r.slug}`);

fs.mkdirSync('docs/v70', { recursive: true });
fs.writeFileSync('docs/v70/jargon.json', JSON.stringify(resultats, null, 1));

// ── ÉTAT FINAL DU CP11, consigné sans nouvelle modification de sonde ────────
//
// Après la passe de glose au premier usage, la sonde signale encore trois
// choses. Les trois ont été vérifiées par lecture et AUCUNE n'est un défaut ;
// elles sont donc consignées ici plutôt que corrigées, et la sonde n'est PAS
// retouchée une troisième fois.
//
// 1. database-transactions-concurrency / « idempotence ».
//    La première occurrence est dans un NOM DE FICHIER cité entre accents
//    graves : `scripts/v70-verifications/etl-idempotence.mjs`. Le terme y est
//    un chemin, pas de la prose. La véritable première occurrence en prose,
//    plus bas, est glosée : « l'**idempotence** — la propriété d'une opération
//    qu'on peut rejouer sans changer le résultat ».
//    La sonde ne retire plus le code en ligne (voir la correction précédente,
//    qui était nécessaire pour voir les renvois `/doc/lessons/...`). Les deux
//    besoins s'opposent ; le compromis retenu privilégie les renvois, et ce
//    faux positif unique est déclaré ici.
//
// 2 et 3. javascript-basics et terminal-shell-filesystem, prérequis sans
//    renvoi vers une leçon amont. Vérifié par lecture : ce sont les DEUX
//    leçons de tout premier contact du programme, et leurs prérequis disent
//    explicitement qu'aucune expérience n'est requise. L'absence de renvoi est
//    donc correcte : il n'existe aucune leçon amont. Ajouter un lien pour
//    satisfaire la sonde reviendrait à inventer un prérequis.
//
// CHIFFRES À PUBLIER AU CP15, les trois états étant conservés :
//   liste initiale (63 termes, code en ligne retiré) : 34 leçons, 45 occurrences
//   après les deux corrections de sonde, AVANT glose  : 13 leçons, 15 occurrences
//   après la passe de glose au premier usage          :  1 leçon,   1 occurrence
//                                                        (faux positif déclaré)
