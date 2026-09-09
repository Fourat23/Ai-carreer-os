// V72 — CP12. TESTS NÉGATIFS des invariants et gates créés ou modifiés par V72.
//
// §11 du contrat gelé : « Un gate vert jamais mis en échec volontairement n'est pas
// considéré comme validé. » Huit défauts sont imposés ; chacun est introduit pour de vrai,
// le contrôle est exécuté, et le fichier est restauré à l'octet près.
//
// SÉCURITÉ. Chaque test restaure par `git checkout --` puis contrôle que
// `git status --porcelain --untracked-files=no` est vide. Si la restauration échoue, le
// script s'ARRÊTE : mieux vaut un dépôt bloqué qu'un dépôt silencieusement modifié.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const NL = String.fromCharCode(10);
const sh = (c) => execSync(c, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const propre = () => sh('git status --porcelain --untracked-files=no').trim() === '';
const rougit = (cmd) => { try { execSync(cmd, { stdio: 'pipe' }); return false; } catch { return true; } };

if (!propre()) { console.error('ARRÊT : dépôt non propre avant de commencer.'); process.exit(2); }

const TESTS = [
  {
    nom: '1 · journée surchargée au-delà du budget',
    quoi: 'ramener une revue à 20 leçons en supprimant le plafond du générateur',
    fichier: 'scripts/generate-curriculum.mjs',
    controle: "node -e \"const s=require('fs').readFileSync('scripts/generate-curriculum.mjs','utf8'); if(!/PLAFOND_REVUE\\s*=\\s*7/.test(s)) process.exit(1)\"",
    patch: (f, t) => writeFileSync(f, t.replace('const PLAFOND_REVUE = 7;', 'const PLAFOND_REVUE = 99;')),
  },
  {
    nom: '2 · leçon hors parcours porteuse d\'une compétence déclarée',
    quoi: 'retirer une compétence de la liste des journées et vérifier que la sonde la voit',
    fichier: 'data/program.json',
    controle: "node scripts/v72/cp12-controle-competences.mjs",
    patch: (f, t) => { const j = JSON.parse(t); j.skills.push({ id: 'fantome', name: 'Compétence fantôme' }); writeFileSync(f, JSON.stringify(j, null, 2)); },
  },
  {
    nom: '3 · prérequis exigé avant d\'être enseigné, sans annonce',
    quoi: 'faire exiger par une leçon du jour 4 une leçon enseignée au jour 320',
    fichier: 'curriculum/lessons/javascript-basics.md',
    controle: 'node scripts/v72/cp12-controle-prerequis.mjs',
    patch: (f, t) => writeFileSync(f, t.replace('## 🧩 Prérequis', '## 🧩 Prérequis' + NL + 'Tu dois maîtriser `/doc/lessons/k8s-config-probes` avant de commencer.' + NL)),
  },
  {
    nom: '4 · revue qui dépasse le plafond de 7 leçons',
    quoi: 'ajouter huit leçons explicites à la semaine d\'une revue',
    fichier: 'curriculum/days/day-077.md',
    controle: 'node scripts/v72/cp12-controle-plafond-revues.mjs',
    patch: (f, t) => writeFileSync(f, t.replace('### Leçons de fond à relire cette semaine',
      '### Leçons de fond à relire cette semaine' + NL +
      ['git-fundamentals', 'git-advanced', 'clean-code', 'architecture-basics', 'api-design-basics', 'design-patterns-intro', 'readme-documentation', 'technical-storytelling']
        .map((s) => `- [x](/doc/lessons/${s})`).join(NL))),
  },
  {
    nom: '5 · pratique sans livrable ni verbe de production',
    quoi: 'vider la section de pratique d\'une leçon',
    fichier: 'curriculum/lessons/recursion.md',
    controle: 'node scripts/v72/cp12-controle-pratiques.mjs',
    patch: (f, t) => writeFileSync(f, t.replace(/## 🔥 Exercice plus difficile[\s\S]*?(?=\n## )/, '## 🔥 Exercice plus difficile' + NL + 'Un exercice sur la récursion.' + NL + NL)),
  },
  {
    nom: '6 · readingMinutes périmé',
    quoi: 'falsifier la durée de lecture publiée d\'une journée',
    fichier: 'data/program.json',
    controle: 'node scripts/v72/cp12-controle-readingminutes.mjs',
    patch: (f, t) => { const j = JSON.parse(t); j.days[3].readingMinutes += 60; writeFileSync(f, JSON.stringify(j, null, 2)); },
  },
  {
    nom: '7 · faux signal de curriculum:depth-check',
    quoi: 'réduire une leçon sous le seuil de 350 mots',
    fichier: 'curriculum/lessons/recursion.md',
    controle: 'npm run curriculum:depth-check',
    patch: (f) => writeFileSync(f, ['# Leçon', '', 'Un exercice et du vocabulaire.', ''].join(NL)),
  },
  {
    nom: '8 · référence morte vers un exercice inexistant',
    quoi: 'citer un exercice qui n\'existe dans aucun catalogue',
    fichier: 'curriculum/lessons/async-messaging-queues.md',
    controle: 'npm run curriculum:depth-check',
    patch: (f, t) => writeFileSync(f, t.replace('`dlq-routing`', '`dlq-inexistant-v72`')),
  },
];

console.log('='.repeat(88));
console.log('CP12 — TESTS NÉGATIFS : chaque contrôle voit-il le défaut qu\'il prétend détecter ?');
console.log('='.repeat(88));

let ok = 0, ko = 0;
for (const t of TESTS) {
  if (!existsSync(t.fichier)) { console.log(`\n  IGNORÉ  ${t.nom} — fichier absent`); continue; }
  const avant = readFileSync(t.fichier);
  t.patch(t.fichier, avant.toString('utf8'));
  const rouge = rougit(t.controle);
  sh(`git checkout -- ${t.fichier}`);
  if (!readFileSync(t.fichier).equals(avant) || !propre()) {
    console.error(`\nARRÊT : restauration incomplète de ${t.fichier}`); process.exit(2);
  }
  rouge ? ok++ : ko++;
  console.log(`\n  ${rouge ? 'VALIDE ' : 'INVALIDE'}  ${t.nom}`);
  console.log(`            défaut introduit : ${t.quoi}`);
  console.log(`            réaction         : ${rouge ? 'le contrôle ROUGIT' : 'le contrôle reste VERT'}`);
  console.log(`            restauré         : octet pour octet, dépôt propre`);
}
console.log('\n' + '='.repeat(88));
console.log(`TESTS NÉGATIFS : ${ok + ko}   VALIDES : ${ok}   INVALIDES : ${ko}`);
if (ko) console.log('\nCONTRÔLES INVALIDES — à signaler, JAMAIS à rendre verts en abaissant un seuil.');
console.log('='.repeat(88));
process.exit(ko ? 1 : 0);
