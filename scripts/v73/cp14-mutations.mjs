// V73 · CP14 — LES DOUZE MUTATIONS NÉGATIVES DU CONTRAT GELÉ.
//
// Une porte qu'on n'a pas VUE rougir ne prouve rien. Chacune des douze mutations du §10 du
// contrat est appliquée, la porte concernée est exécutée, on VÉRIFIE qu'elle échoue, puis le
// dépôt est restauré et on vérifie qu'il est propre.
//
// DEUX PIÈGES DÉJÀ PAYÉS DANS CE SPRINT, ÉVITÉS ICI :
//   · anomalie n° 9  — la restauration était contrôlée par une empreinte contenant
//     `generatedAt` : trois tests valides étaient déclarés « non restaurés ». Le contrôle est
//     donc `git status --porcelain`, et rien d'autre.
//   · anomalie n° 10 — une mutation posée sur une journée qui possède DÉJÀ une clé dans
//     `LESSONS_V67` n'a AUCUN effet : la clé dupliquée est écrasée par la dernière. Chaque
//     mutation vérifie donc d'abord que sa cible est libre.
//
// Usage : node scripts/v73/cp14-mutations.mjs [--json]
import { readFileSync, writeFileSync, existsSync, unlinkSync, copyFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const sh = (c) => { try { return { ok: true, out: execSync(c, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }) }; } catch (e) { return { ok: false, out: (e.stdout ?? '') + (e.stderr ?? '') }; } };
const propre = () => execSync('git status --porcelain', { encoding: 'utf8' }).trim() === '';
const lire = (p) => readFileSync(p, 'utf8');
const ecrire = (p, t) => writeFileSync(p, t);

const PORTE_GRAPHE = 'node scripts/v73/v73-graphe-check.mjs';
const PORTE_INTEGRITE = 'node scripts/v73/cp12-integrite.mjs';
const REGEN = 'npm run generate';

if (!propre()) { console.error('ABANDON : le dépôt n\'est pas propre avant de commencer.'); process.exit(2); }

// Chaque mutation : { n, titre, invariant, appliquer(), porte, regenerer }
const MUTATIONS = [
  {
    n: 1, titre: 'une compétence CORE ramenée à 0 journée', invariant: 'I1 / C1',
    porte: PORTE_GRAPHE, regenerer: true,
    appliquer() {
      // `patterns` n'est portée que par `design-patterns-intro` : on la retire de la carte.
      const p = 'scripts/data/lessons-map.mjs'; const t = lire(p);
      const i = t.indexOf("'design-patterns-intro.md'"); const j = t.indexOf('skills:', i);
      const k = t.indexOf(']', j) + 1;
      ecrire(p, t.slice(0, j + 8) + "[]" + t.slice(k));
    },
  },
  {
    n: 2, titre: 'un livrable dépendant d\'un prérequis futur non signalé', invariant: 'I2 / C2',
    porte: PORTE_GRAPHE, regenerer: false,
    appliquer() {
      // `javascript-basics` (j4) se met à EXIGER `rag-fundamentals` (j218), sans clause d'annonce.
      const p = 'curriculum/lessons/javascript-basics.md'; const t = lire(p);
      const i = t.indexOf('## 🧩 Prérequis'); const j = t.indexOf('\n', i);
      ecrire(p, t.slice(0, j + 1) + "Tu dois maîtriser `/doc/lessons/rag-fundamentals` avant de commencer.\n" + t.slice(j + 1));
    },
  },
  {
    n: 3, titre: 'une revue liant une leçon jamais enseignée avant', invariant: 'I3 / C3',
    porte: PORTE_GRAPHE, regenerer: true,
    appliquer() {
      // la revue de la semaine 1 (j7) se met à lier une leçon du mois 8.
      const p = 'scripts/generate-curriculum.mjs'; const t = lire(p);
      const a = 'const PLAFOND_REVUE = 7;';
      ecrire(p, t.replace(a, a + "\nconst __MUT3 = true;").replace(
        "  if (l.length) day.lessonsOverride = l;",
        "  if (l.length) day.lessonsOverride = (n === 7 ? ['rag-fundamentals.md', ...l] : l);"));
    },
  },
  {
    n: 4, titre: 'une référence vers une leçon inexistante', invariant: 'C9',
    porte: PORTE_INTEGRITE, regenerer: false,
    appliquer() {
      const p = 'curriculum/lessons/clean-code.md'; const t = lire(p);
      ecrire(p, t + "\n\nVoir `/doc/lessons/lecon-qui-n-existe-pas`.\n");
    },
  },
  {
    n: 5, titre: 'une journée gonflée au-delà du budget haut', invariant: 'L1 / C10',
    porte: 'node scripts/v73/cp14-verif-charge.mjs', regenerer: true,
    appliquer() {
      // j150 (une leçon, 191 min de haut) se met à lier les six leçons RAG et les quatre LLM.
      const p = 'scripts/data/days-lessons-v67.mjs'; const t = lire(p);
      if (/^\s{2}150\s*:/m.test(t)) throw new Error('cible 150 déjà occupée — piège n° 10');
      ecrire(p, t.replace('export const LESSONS_V67 = {',
        "export const LESSONS_V67 = {\n  150: ['rag-fundamentals.md','embeddings.md','chunking-strategies.md','retrieval-reranking.md','vector-databases.md','rag-evaluation.md','llm-fundamentals.md','prompt-engineering.md','structured-outputs-tools.md','llm-cost-optimization.md','architecture-basics.md','system-design-scaling.md'],"));
    },
  },
  {
    n: 6, titre: 'un mapping jour → leçon cassé', invariant: 'I10',
    porte: PORTE_INTEGRITE, regenerer: true,
    appliquer() {
      const p = 'scripts/data/days-lessons-v67.mjs'; const t = lire(p);
      if (/^\s{2}5\s*:/m.test(t)) throw new Error('cible 5 déjà occupée — piège n° 10');
      ecrire(p, t.replace('export const LESSONS_V67 = {',
        "export const LESSONS_V67 = {\n  5: ['lecon-inexistante.md'],"));
    },
  },
  {
    n: 7, titre: 'un cycle dans le graphe des prérequis', invariant: 'I8 / C8',
    porte: PORTE_GRAPHE, regenerer: false,
    appliquer() {
      // deux leçons enseignées le MÊME jour, pour n'être qu'un cycle et non un défaut d'ordre.
      const p = 'curriculum/lessons/embeddings.md'; const t = lire(p);
      const i = t.indexOf('## 🧩 Prérequis'); const j = t.indexOf('\n', i);
      ecrire(p, t.slice(0, j + 1) + "Tu dois maîtriser `/doc/lessons/rag-fundamentals` d'abord.\n" + t.slice(j + 1));
      const p2 = 'curriculum/lessons/rag-fundamentals.md'; const t2 = lire(p2);
      const i2 = t2.indexOf('## 🧩 Prérequis'); const j2 = t2.indexOf('\n', i2);
      ecrire(p2, t2.slice(0, j2 + 1) + "Tu dois maîtriser `/doc/lessons/embeddings` d'abord.\n" + t2.slice(j2 + 1));
    },
  },
  {
    n: 8, titre: 'une leçon privée de statut', invariant: 'I5 / C5',
    porte: 'node scripts/v73/cp14-verif-statuts.mjs', regenerer: false,
    appliquer() {
      const p = 'docs/v73/V73-STATUTS-128.json'; const t = JSON.parse(lire(p));
      t[0].statut = null; ecrire(p, JSON.stringify(t, null, 1));
    },
  },
  {
    n: 9, titre: 'un expectedScores sur une compétence non enseignée avant', invariant: 'I4 / C4',
    porte: PORTE_GRAPHE, regenerer: true,
    appliquer() {
      const p = 'scripts/data/program-structure.mjs'; const t = lire(p);
      ecrire(p, t.replace('expectedScores: { algo: 3, ds: 2, jsts: 3, gitlinux: 2, se: 2 }',
        'expectedScores: { algo: 3, ds: 2, jsts: 3, gitlinux: 2, se: 2, rag: 2 }'));
    },
  },
  {
    n: 10, titre: 'une journée dupliquée', invariant: 'I9',
    porte: PORTE_GRAPHE, regenerer: false,
    appliquer() {
      const p = 'data/program.json'; const t = JSON.parse(lire(p));
      t.days[41] = { ...t.days[40] }; ecrire(p, JSON.stringify(t, null, 2));
    },
  },
  {
    n: 11, titre: 'une journée supprimée', invariant: 'I9',
    porte: PORTE_GRAPHE, regenerer: false,
    appliquer() {
      const p = 'data/program.json'; const t = JSON.parse(lire(p));
      t.days.splice(41, 1); ecrire(p, JSON.stringify(t, null, 2));
    },
  },
  {
    n: 12, titre: 'une tentative de création de data/progress.json', invariant: 'I7 / C7',
    porte: PORTE_GRAPHE, regenerer: false,
    appliquer() { ecrire('data/progress.json', '{"days":{"1":{"status":"done"}}}\n'); },
    nettoyer() { if (existsSync('data/progress.json')) unlinkSync('data/progress.json'); },
  },
];

const resultats = [];
for (const m of MUTATIONS) {
  let etat = 'ERREUR', detail = '';
  try {
    m.appliquer();
    if (m.regenerer) sh(REGEN);
    // ERREUR DE HARNAIS TROUVÉE PAR LA PREMIÈRE EXÉCUTION : le graphe n'était régénéré que
    // pour la porte du graphe. La mutation n° 5 gonfle une journée via `LESSONS_V67`, et
    // `cp6-charge.mjs` lit `docs/v73/curriculum-graph.json` : il voyait donc l'ANCIEN
    // rattachement et déclarait la journée saine. La porte n'était pas en cause ; le harnais
    // l'était. Le graphe est désormais régénéré dès qu'une mutation touche la génération.
    if (m.regenerer || m.porte === PORTE_GRAPHE) sh('node scripts/v73/cp2-graphe.mjs --ecrire');
    const r = sh(m.porte);
    etat = r.ok ? 'RESTÉE VERTE — LA PORTE NE PROTÈGE PAS' : 'VUE ROUGE';
    detail = (r.out.split('\n').filter((l) => /❌|violation|✗|Error|défaut|DÉRIVE/.test(l))[0] ?? '').trim().slice(0, 110);
  } catch (e) { etat = 'ERREUR'; detail = String(e.message).slice(0, 110); }
  // restauration, contrôlée par git et rien d'autre (anomalie n° 9)
  m.nettoyer?.();
  sh('git checkout -- .');
  sh(REGEN);
  sh('node scripts/v73/cp2-graphe.mjs --ecrire');
  sh('git checkout -- .');
  const restaure = propre() && !existsSync('data/progress.json');
  resultats.push({ n: m.n, titre: m.titre, invariant: m.invariant, etat, detail, restaure });
  const icone = etat === 'VUE ROUGE' ? '✅' : '❌';
  console.log(`${icone} ${String(m.n).padStart(2)}. ${m.titre.padEnd(58)} ${m.invariant.padEnd(9)} ${etat}${restaure ? ' · restauré' : ' · NON RESTAURÉ'}`);
  if (detail) console.log(`      ${detail}`);
}
const vues = resultats.filter((r) => r.etat === 'VUE ROUGE').length;
const rest = resultats.filter((r) => r.restaure).length;
console.log(`\nMUTATIONS VUES ROUGES : ${vues} / 12 · RESTAURÉES : ${rest} / 12`);
if (process.argv.includes('--json')) writeFileSync('docs/v73/CP14-MUTATIONS.json', JSON.stringify({ vues, restaurees: rest, resultats }, null, 1));
process.exitCode = vues === 12 && rest === 12 ? 0 : 1;
