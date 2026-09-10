// V73 · CP2 — TESTS NÉGATIFS DE LA PORTE DU GRAPHE.
//
// « Un gate vert qui n'a jamais été mis volontairement en échec n'est pas considéré comme
// validé. » Chaque test provoque une mutation RÉELLE d'une source déclarative, vérifie que
// `v73-graphe-check.mjs` ROUGIT avec le bon motif, puis restaure l'octet près.
//
// Le dépôt doit être propre avant de lancer : une restauration ratée doit être visible.
import { readFileSync, writeFileSync, existsSync, unlinkSync, copyFileSync, rmSync } from 'node:fs';
import { execFileSync, execSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const sale = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
if (sale) { console.error('ARRÊT : dépôt non propre avant de commencer.\n' + sale); process.exit(1); }

const sha = (p) => (existsSync(p) ? createHash('sha1').update(readFileSync(p)).digest('hex') : 'ABSENT');
const porte = () => {
  try { execFileSync('node', ['scripts/v73/v73-graphe-check.mjs'], { encoding: 'utf8', stdio: 'pipe' }); return { rouge: false, sortie: '' }; }
  catch (e) { return { rouge: true, sortie: `${e.stdout ?? ''}${e.stderr ?? ''}` }; }
};
const regenerer = () => { try { execFileSync('node', ['scripts/generate-curriculum.mjs'], { stdio: 'pipe' }); } catch { /* la mutation peut casser la génération : c'est un échec valide */ } };

const TESTS = [
  {
    n: 1, nom: 'I2 — un prérequis futur exigé sans annonce',
    cible: 'curriculum/lessons/javascript-basics.md',
    motif: /I2 ·/,
    muter: (f) => {
      const md = readFileSync(f, 'utf8');
      const i = md.indexOf('## 🧩 Prérequis');
      const j = md.indexOf('\n## ', i + 1);
      writeFileSync(f, md.slice(0, j) + "\n\nTu dois maîtriser `/doc/lessons/rag-fundamentals` avant de commencer.\n" + md.slice(j));
    },
  },
  {
    n: 2, nom: 'I3 — une revue qui introduit une leçon jamais enseignée',
    cible: 'scripts/data/days-lessons-v67.mjs',
    motif: /I3 ·/,
    apresMutation: regenerer,
    muter: (f) => {
      const t = readFileSync(f, 'utf8');
      writeFileSync(f, t.replace(/^(export const LESSONS_V67 = \{)/m, "$1\n  7: ['cloud-aws-core.md'],"));
    },
  },
  {
    n: 3, nom: 'I4 — un niveau attendu sur une compétence jamais enseignée avant',
    cible: 'scripts/data/program-structure.mjs',
    motif: /I4 ·/,
    apresMutation: regenerer,
    muter: (f) => {
      const t = readFileSync(f, 'utf8');
      // le mois 1 se voit attribuer un niveau attendu en `rag`, enseigné au jour 218
      writeFileSync(f, t.replace(/(expectedScores:\s*\{)/, '$1 rag: 3,'));
    },
  },
  {
    n: 4, nom: 'C9 — une référence morte vers une leçon inexistante',
    cible: 'scripts/data/days-lessons-v67.mjs',
    motif: /C9 ·/,
    apresMutation: regenerer,
    muter: (f) => {
      const t = readFileSync(f, 'utf8');
      writeFileSync(f, t.replace(/^(export const LESSONS_V67 = \{)/m, "$1\n  51: ['lecon-qui-nexiste-pas-v73.md'],"));
    },
  },
  {
    n: 5, nom: 'C9 — une référence morte vers un exercice inexistant',
    cible: 'data/day-exercises.json',
    motif: /C9 ·/,
    muter: (f) => {
      const j = JSON.parse(readFileSync(f, 'utf8'));
      j['1'] = [...(j['1'] ?? []), 'exercice-inexistant-v73'];
      writeFileSync(f, JSON.stringify(j, null, 2));
    },
  },
  {
    n: 6, nom: 'I8 — un cycle introduit dans le graphe des prérequis',
    cible: 'curriculum/lessons/clean-code.md',
    motif: /I8 ·/,
    muter: (f) => {
      // clean-code exige testing-foundations, qui exige déjà clean-code : cycle réel
      const md = readFileSync(f, 'utf8');
      const i = md.indexOf('## 🧩 Prérequis');
      const j = md.indexOf('\n## ', i + 1);
      writeFileSync(f, md.slice(0, j) + "\n\nTu dois maîtriser `/doc/lessons/testing-foundations`.\n" + md.slice(j));
    },
  },
  {
    n: 7, nom: 'I10 — une leçon hors parcours privée de son encadré de référence',
    cible: 'curriculum/lessons/css-grid.md',
    motif: /I10 ·/,
    muter: (f) => {
      const md = readFileSync(f, 'utf8');
      writeFileSync(f, md.replace(/> \*\*📚 Étagère de référence[\s\S]*?\n\n/, ''));
    },
  },
  {
    n: 8, nom: 'I6/I9 — une journée supprimée du calendrier',
    cible: 'data/program.json',
    motif: /I6 ·|I9 ·/,
    muter: (f) => {
      const p = JSON.parse(readFileSync(f, 'utf8'));
      p.days = p.days.filter((d) => d.day !== 200);
      writeFileSync(f, JSON.stringify(p, null, 2));
    },
  },
  {
    n: 9, nom: 'I6/I9 — une journée dupliquée',
    cible: 'data/program.json',
    motif: /I6 ·|I9 ·/,
    muter: (f) => {
      const p = JSON.parse(readFileSync(f, 'utf8'));
      const i = p.days.findIndex((d) => d.day === 200);
      p.days.splice(i, 0, { ...p.days[i] });
      writeFileSync(f, JSON.stringify(p, null, 2));
    },
  },
  {
    n: 10, nom: 'I7 — création de data/progress.json',
    cible: null,                                   // fichier créé, pas muté
    motif: /I7 ·/,
    muter: () => writeFileSync('data/progress.json', '{"days":{}}'),
    restaurer: () => { if (existsSync('data/progress.json')) unlinkSync('data/progress.json'); },
  },
];

let valides = 0, invalides = 0;
console.log('TESTS NÉGATIFS — porte du graphe V73\n');
for (const t of TESTS) {
  const cibles = t.cible ? [t.cible] : [];
  const sauvegarde = new Map();
  for (const c of cibles) { copyFileSync(c, `${c}.v73bak`); sauvegarde.set(c, sha(c)); }
  // le curriculum généré peut être touché par la régénération : on le sauvegarde aussi
  const empreinteAvant = execSync("find curriculum data -name '*.md' -o -name 'program.json' | sort | xargs cat | sha1sum", { encoding: 'utf8' }).trim();

  let etat = 'INVALIDE', detail = '';
  try {
    t.muter(t.cible);
    if (t.apresMutation) t.apresMutation();
    const r = porte();
    if (!r.rouge) detail = 'la porte est restée VERTE devant la mutation';
    else if (!t.motif.test(r.sortie)) detail = `rouge, mais pour un autre motif : ${r.sortie.split('\n').filter((l) => l.includes('•')).slice(0, 2).join(' | ')}`;
    else { etat = 'VALIDE'; detail = r.sortie.split('\n').filter((l) => l.includes('•'))[0]?.trim() ?? ''; }
  } catch (e) { detail = `exception : ${e.message.slice(0, 120)}`; }

  // restauration
  if (t.restaurer) t.restaurer();
  for (const c of cibles) { copyFileSync(`${c}.v73bak`, c); rmSync(`${c}.v73bak`); }
  if (t.apresMutation) regenerer();
  const empreinteApres = execSync("find curriculum data -name '*.md' -o -name 'program.json' | sort | xargs cat | sha1sum", { encoding: 'utf8' }).trim();
  const restaure = empreinteAvant === empreinteApres && cibles.every((c) => sha(c) === sauvegarde.get(c));

  if (etat === 'VALIDE' && restaure) valides++; else invalides++;
  console.log(`  ${String(t.n).padStart(2)}. ${t.nom}`);
  console.log(`      réaction    : ${etat === 'VALIDE' ? 'la porte ROUGIT' : 'ÉCHEC — ' + detail}`);
  if (etat === 'VALIDE') console.log(`      message     : ${detail}`);
  console.log(`      restauré    : ${restaure ? 'octet pour octet' : '❌ ÉTAT NON RESTAURÉ'}`);
}

const final = porte();
console.log(`\n${'='.repeat(78)}`);
console.log(`TESTS NÉGATIFS : ${TESTS.length}   VALIDES : ${valides}   INVALIDES : ${invalides}`);
console.log(`porte après restauration : ${final.rouge ? '❌ ROUGE' : '✅ VERTE'}`);
console.log('='.repeat(78));
process.exit(invalides === 0 && !final.rouge ? 0 : 1);
