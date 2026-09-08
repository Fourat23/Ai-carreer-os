// V71 — CP14. TESTS NEGATIFS DES GATES.
//
// LE PROBLEME QUE CE SCRIPT RESOUT. Cinquante-deux gates sont verts. Un gate vert
// prouve deux choses tres differentes : soit le depot est sain, soit le gate ne
// regarde rien. Rien dans « 52 gates verts » ne permet de distinguer les deux.
//
// CE QUE FAIT CE SCRIPT. Pour chaque gate teste, il INTRODUIT VOLONTAIREMENT le
// defaut precis que ce gate pretend detecter, execute le gate, et verifie qu il
// ROUGIT. Puis il restaure le fichier et verifie la restauration a l octet pres.
// Un gate qui reste vert devant son propre defaut est INVALIDE — et c est un
// resultat a publier, pas un seuil a assouplir.
//
// SECURITE. Chaque test restaure par `git checkout --` puis controle que
// `git status --porcelain` est vide. Si la restauration echoue, le script s ARRETE
// immediatement : mieux vaut un depot bloque qu un depot silencieusement modifie.
//
// TROIS TESTS ONT ETE MAL VISES AVANT D ETRE JUSTES, ET C EST LE PLUS INSTRUCTIF.
//   1. curriculum:depth-check — j ai d abord retire le titre « Exemple guide » d une
//      lecon en attendant du rouge. Le gate est reste vert. Lecture du gate : pour les
//      lecons il n exige que quatre choses (>= 350 mots, >= 6 sections, le mot
//      « exercice », le mot « vocabulaire »), et le « gabarit complet » — qui contient
//      Exemple guide — est COMPTE ligne 88 mais jamais exige. Le gate ne ment pas ; ma
//      lecture de son message de succes etait fausse. Le test a ete conserve, MARQUE
//      comme lacune de couverture, et trois autres tests vises sur ce qu il exige
//      VRAIMENT ont ete ajoutes.
//   2. v64:check — j ai insere « dangerouslySetInnerHTML » dans un COMMENTAIRE. Vert.
//      Le gate retire les commentaires avant de tester (ligne 18-20), et il a raison :
//      un commentaire ne rend aucun HTML. Reecrit avec du vrai JSX : rouge.
//   3. v66:render — j ai ajoute une section ordinaire en fin de fichier. Vert, et c est
//      correct : elle atteint la page. Le defaut que ce gate detecte est une cloture de
//      bloc de code echappee — le bug du CP8 qui faisait disparaitre 11 sections sur 18.
//      Reecrit ainsi : rouge.
// Trois fois sur treize, un gate declare « invalide » etait en fait un test mal vise.
// Un test negatif teste donc DEUX choses a la fois : le gate, et la comprehension
// qu on a du gate.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const NL = String.fromCharCode(10);
const sh = (cmd) => execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
// On ignore les fichiers non suivis : ce script lui-meme n est pas encore commite.
const propre = () => sh('git status --porcelain --untracked-files=no').trim() === '';
const gateRougit = (script) => {
  try { execSync(`npm run ${script}`, { stdio: 'pipe' }); return false; }
  catch { return true; }
};

if (!propre()) { console.error('ARRET : le depot n est pas propre avant de commencer.'); process.exit(2); }

// Chaque test : le gate, le fichier touche, la transformation, et surtout
// L AFFIRMATION du gate que le defaut est cense contredire.
const TESTS = [
  {
    gate: 'curriculum:check', fichier: 'curriculum/lessons/git-fundamentals.md',
    affirme: 'tout est present et coherent',
    defaut: 'supprimer entierement une lecon du corpus',
    patch: (f) => sh(`rm ${f}`),
  },
  {
    gate: 'curriculum:depth-check', fichier: 'curriculum/lessons/git-fundamentals.md',
    affirme: 'chaque lecon contient un mini-exercice (ligne 80 du gate)',
    defaut: 'supprimer toute occurrence du mot exercice dans une lecon',
    patch: (f, t) => writeFileSync(f, t.replace(/exercice/gi, 'travail')),
  },
  {
    gate: 'curriculum:depth-check', fichier: 'curriculum/lessons/git-fundamentals.md',
    affirme: 'une lecon fait au moins 350 mots et 6 sections (lignes 83-84)',
    defaut: 'reduire une lecon a trois lignes',
    patch: (f) => writeFileSync(f, ['# Git', '', 'Un mini-exercice et du vocabulaire.', ''].join(NL)),
  },
  {
    gate: 'curriculum:depth-check', fichier: 'curriculum/days/day-004.md',
    affirme: 'chaque journee a une section Cours approfondi (ligne 40)',
    defaut: 'renommer le titre Cours approfondi d une journee',
    patch: (f, t) => writeFileSync(f, t.replace('## 📖 Cours approfondi', '## 📖 Notes')),
  },
  {
    gate: 'curriculum:depth-check', fichier: 'curriculum/lessons/git-fundamentals.md',
    affirme: 'RIEN — « gabarit complet » est COMPTE (ligne 88) mais jamais exige',
    attendu: 'vert',
    defaut: 'retirer le titre Exemple guide d une lecon',
    patch: (f, t) => writeFileSync(f, t.replace(/^## .*Exemple guid.*$/m, '## Divers')),
  },
  {
    gate: 'glossary:check', fichier: 'curriculum/glossary/glossary.json',
    affirme: 'unicite des entrees',
    defaut: 'dupliquer une entree du glossaire',
    patch: (f, t) => { const a = JSON.parse(t); a.push(JSON.parse(JSON.stringify(a[0]))); writeFileSync(f, JSON.stringify(a, null, 2)); },
  },
  {
    gate: 'v48:check', fichier: 'curriculum/lessons/git-fundamentals.md',
    affirme: 'corpus gele',
    defaut: 'ajouter un seul octet a une lecon',
    patch: (f, t) => writeFileSync(f, t + NL),
  },
  {
    gate: 'v47:check', fichier: 'data/exercises/a11y-accessible-name.json',
    affirme: 'ids uniques — une collision est un echec dur',
    defaut: 'donner a un exercice l id d un autre',
    patch: (f, t) => { const j = JSON.parse(t); j.id = 'agent-detect-loop'; writeFileSync(f, JSON.stringify(j, null, 2)); },
  },
  {
    gate: 'v5421:check', fichier: 'data/program.json',
    affirme: 'ordre chronologique des 365 jours garanti, partition = 365',
    defaut: 'intervertir deux journees dans l index du programme',
    patch: (f, t) => { const j = JSON.parse(t); const a = j.days; [a[10], a[11]] = [a[11], a[10]]; writeFileSync(f, JSON.stringify(j, null, 2)); },
  },
  {
    gate: 'v52:check', fichier: 'app/page.tsx',
    affirme: 'aucune gamification dans l UI',
    defaut: 'introduire un litteral de gamification',
    patch: (f, t) => writeFileSync(f, t + NL + '// streak de 7 jours' + NL),
  },
  {
    gate: 'v542:check', fichier: 'app/page.tsx',
    affirme: '0 couleur hexadecimale en dur dans le TSX',
    defaut: 'ecrire une couleur hexadecimale en dur',
    patch: (f, t) => writeFileSync(f, t + NL + 'const ACCENT = "#ff0000";' + NL),
  },
  {
    gate: 'v64:check', fichier: 'app/day/[id]/DayPanel.tsx',
    affirme: 'le poste de travail ne rend aucun HTML brut',
    defaut: 'injecter du HTML brut issu d une reponse utilisateur (VRAI JSX, pas un commentaire : le gate retire les commentaires avant de tester, et il a raison — un commentaire ne rend rien)',
    patch: (f, t) => writeFileSync(f, t + NL + 'const Fuite = (r) => <div dangerouslySetInnerHTML={{ __html: r.texte }} />;' + NL),
  },
  {
    gate: 'v66:render', fichier: 'curriculum/days/day-004.md',
    affirme: 'chaque section de chaque fichier atteint la page — autant de titres au rendu que dans la source',
    defaut: 'echapper une cloture de bloc de code, exactement le bug du CP8 qui faisait disparaitre 11 sections sur 18',
    patch: (f, t) => writeFileSync(f, t.replace(/```/, '```') + [NL, '```bash', 'echo bonjour', String.fromCharCode(92) + '```', '', '## Section avalee par le bloc non ferme', '', 'Ce titre ne doit plus atteindre la page.', ''].join(NL)),
  },
  {
    gate: 'v5421:check', fichier: 'data/progress.json', creeLeFichier: true,
    affirme: 'la progression utilisateur est gelee a un hash precis (FROZEN_PROGRESS)',
    defaut: 'creer une progression utilisateur au mauvais contenu',
    patch: (f) => writeFileSync(f, '{"faux": true}' + NL),
  },
];

console.log('='.repeat(88));
console.log('CP14 — TESTS NEGATIFS : chaque gate voit-il le defaut qu il pretend detecter ?');
console.log('='.repeat(88));

const resultats = [];
for (const t of TESTS) {
  if (!t.creeLeFichier && !existsSync(t.fichier)) { console.log(`\n  IGNORE  ${t.gate} — fichier absent : ${t.fichier}`); continue; }
  if (t.creeLeFichier && existsSync(t.fichier)) { console.log(`\n  IGNORE  ${t.gate} — ${t.fichier} existe deja, on n y touche pas`); continue; }
  const avant = t.creeLeFichier ? Buffer.alloc(0) : readFileSync(t.fichier);
  t.patch(t.fichier, avant.toString('utf8'));
  const rouge = gateRougit(t.gate);
  if (t.creeLeFichier) sh(`rm -f ${t.fichier}`);
  else sh(`git checkout -- ${t.fichier}`);
  const restaure = t.creeLeFichier ? (!existsSync(t.fichier) && propre())
    : (readFileSync(t.fichier).equals(avant) && propre());
  if (!restaure) { console.error(`\nARRET : restauration incomplete de ${t.fichier}`); process.exit(2); }
  const attenduVert = t.attendu === 'vert';
  const conforme = attenduVert ? !rouge : rouge;
  resultats.push({ ...t, rouge, attenduVert, conforme });
  console.log(`\n  ${conforme ? (attenduVert ? 'LACUNE ' : 'VALIDE ') : 'INVALIDE'}  ${t.gate}`);
  console.log(`            affirme : ${t.affirme}`);
  console.log(`            defaut  : ${t.defaut}`);
  console.log(`            reaction: ${rouge ? 'le gate ROUGIT' : 'le gate reste VERT'}`);
  if (attenduVert) console.log(`            lecture : lacune de COUVERTURE, pas gate invalide — le gate ne promet pas ce controle`);
  console.log(`            restaure: octet pour octet, depot propre`);
}

const invalides = resultats.filter((r) => !r.conforme);
const lacunes = resultats.filter((r) => r.attenduVert);
console.log('\n' + '='.repeat(88));
console.log(`TESTS NEGATIFS : ${resultats.length}   CONFORMES : ${resultats.length - invalides.length}   INVALIDES : ${invalides.length}   (dont ${lacunes.length} lacune(s) de couverture documentee(s))`);
if (invalides.length) {
  console.log('\nGATES INVALIDES — a signaler, JAMAIS a rendre verts en abaissant un seuil :');
  for (const r of invalides) console.log(`  ${r.gate} : ${r.defaut} n a pas ete detecte.`);
}
console.log('='.repeat(88));
process.exit(0);
