// V70 CP14 — TESTS NÉGATIFS.
// Une porte qu'on n'a jamais vue refuser n'est pas une porte vérifiée. C'est le
// raisonnement que ce programme applique à la CI, aux portes qualité et au
// durcissement d'un serveur ; il s'applique d'abord à ses propres contrôles.
//
// Protocole, identique pour chacun : introduire une dégradation réelle, vérifier
// que le contrôle passe au ROUGE, puis RESTAURER et vérifier qu'il repasse au
// VERT. Un test qui ne restaure pas laisse le dépôt cassé ; un test qui ne
// vérifie pas le retour au vert ne prouve pas que c'est la dégradation qui a
// causé le rouge.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const lire  = (f) => fs.readFileSync(f, 'utf8');
const ecrire = (f, s) => fs.writeFileSync(f, s);
const run = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, { encoding: 'utf8', timeout: 900000, ...opts });

const rouge = (r) => r.status !== 0;
let passes = 0, echecs = [];

// ── RESTAURATION SUR TERMINAISON FORCÉE ────────────────────────────────────
// DÉFAUT RENCONTRÉ ET CORRIGÉ, consigné parce qu'il est instructif.
// La première version de ce harnais ne s'appuyait que sur try/finally. Elle a
// été tuée par un délai d'attente pendant le test 7, et `finally` NE S'EXÉCUTE
// PAS sur une terminaison forcée : le dépôt est resté avec un fichier dégradé
// (`scripts/v70-verifications/n-plus-un.mjs`, restauré à la main).
// C'est très exactement le mécanisme enseigné dans `linux-processes-signals` :
// le signal de terminaison forcée ne peut être ni intercepté ni retardé, et
// tout ce qui doit être fait avant de mourir doit l'être en réponse au signal
// d'ARRÊT DEMANDÉ. Le harnais qui teste les contrôles avait le défaut qu'il
// teste.
// Correctif : un registre des fichiers en cours de dégradation, restauré par
// try/finally ET par les gestionnaires de signaux.
const enCours = new Map();                    // chemin -> contenu d'origine
const restaurerTout = () => {
  for (const [f, orig] of enCours) { try { fs.writeFileSync(f, orig); } catch {} }
  enCours.clear();
};
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(sig, () => { restaurerTout(); process.exit(130); });
}
process.on('uncaughtException', (e) => { restaurerTout(); throw e; });

function test(nom, cible, degrader, controle) {
  const avant = lire(cible);
  let vertAvant, rougePendant, vertApres;
  try {
    vertAvant = !rouge(controle());
    enCours.set(cible, avant);                 // enregistré AVANT la dégradation
    ecrire(cible, degrader(avant));
    rougePendant = rouge(controle());
  } finally {
    ecrire(cible, avant);                      // restauration systématique
    enCours.delete(cible);
  }
  vertApres = !rouge(controle());
  const ok = vertAvant && rougePendant && vertApres;
  if (ok) passes++; else echecs.push(nom);
  console.log(`  ${ok ? 'OK   ' : 'ÉCHEC'} ${nom}`);
  console.log(`         vert avant : ${vertAvant} | ROUGE pendant : ${rougePendant} | vert après : ${vertApres}`);
  if (!ok) console.log('         -> ce contrôle n a pas refusé la dégradation, ou n est pas revenu au vert.');
  return ok;
}

const gate = (script) => () => run('node', [script]);
const npmr = (s) => () => run('npm', ['run', s]);

console.log('TESTS NÉGATIFS V70 — chaque contrôle doit être vu REFUSER\n');

// ── 1 à 3 : les portes de gel du corpus ────────────────────────────────
// NOTE — le premier jet ciblait v66-check pour le test 3. Vérifié : v66-check
// ne contient AUCUNE constante de gel du corpus. Seules NEUF portes en portent
// une (v48, v49, v50, v51, v52, v53, v54, v542, v5421). Le test visait donc une
// porte qui n'a jamais prétendu faire ce contrôle. Corrigé vers v53-check.
for (const [n, g] of [[1, 'scripts/v48-check.mjs'], [2, 'scripts/v51-check.mjs'],
                      [3, 'scripts/v53-check.mjs']]) {
  test(`${n}. gel du corpus — ${g.split('/').pop()} refuse une leçon modifiée`,
    'curriculum/lessons/http-rest-json.md',
    (s) => s + '\n\nligne ajoutée par le test négatif V70 CP14.\n',
    gate(g));
}

// ── 4 : la porte de profondeur refuse une leçon sans exercice ──────────
test('4. profondeur — refuse une leçon dont la section exercice disparaît',
  'curriculum/lessons/sql-foundations.md',
  (s) => s.replace(/##[^\n]*(Mini-exercice|Pratique)[^\n]*/gi, '## Section neutralisée'),
  npmr('curriculum:depth-check'));

// ── 5 et 6 : la porte v35, sur une leçon DE SON PÉRIMÈTRE ──────────────
// CONSTAT DU TEST NÉGATIF, publié au CP14 : v35 ne valide PAS les 128 leçons.
// Son périmètre est `newLessons + hardenedLegacy`, soit 12 leçons au moment de
// ce contrôle. Le premier jet de ces deux tests ciblait css-grid et
// error-handling, hors périmètre, et v35 n'a donc rien refusé — ce qui est son
// comportement correct, pas un défaut. Les tests visent désormais une leçon de
// son périmètre. La couverture partielle reste une DETTE, publiée au CP15.
test('5. v35 — refuse un marqueur d authoring non résolu',
  'curriculum/lessons/deployment-secrets.md',
  (s) => s.replace('## 🎯 Objectif', '## 🎯 Objectif\n\nTODO : compléter cette section.'),
  gate('scripts/v35-check.mjs'));

// ── 6 : la porte v35 refuse un lien mort vers une leçon ────────────────
test('6. v35 — refuse un lien vers une leçon inexistante',
  'curriculum/lessons/deployment-secrets.md',
  (s) => s.replace('## 🎯 Objectif',
    '## 🎯 Objectif\n\nVoir `/doc/lessons/lecon-qui-nexiste-pas-du-tout`.'),
  gate('scripts/v35-check.mjs'));

// ── 7 et 8 : le contrôle des ancres et de la vitalité des vérifications ─
// On n'exécute PAS le rejeu complet ici : il dure sept minutes, et deux
// exécutions par test (rouge puis vert) en feraient vingt-huit. On applique la
// MÊME logique — le script tourne-t-il, et ses ancres sont-elles présentes —
// sur le seul script dégradé. C'est le même contrôle, restreint à sa cible.
const controleUn = (chemin, cmd, ancres) => () => {
  const r = run(cmd[0], [...cmd.slice(1), chemin]);
  if (r.status !== 0) return { status: 1 };
  const norm = (t) => t.replace(/[\u00a0\u202f\u2009]/g, ' ');
  const sortie = norm((r.stdout || '') + (r.stderr || ''));
  return { status: ancres.every((a) => sortie.includes(norm(a))) ? 0 : 1 };
};

test('7. ancres — refuse un script dont un chiffre cité disparaît',
  'scripts/v70-verifications/n-plus-un.mjs',
  (s) => s.replace(/console\.log/g, 'void 0 && console.log'),
  controleUn('scripts/v70-verifications/n-plus-un.mjs', [process.execPath], ['51']));

test('8. vitalité — refuse un script de vérification qui plante',
  'scripts/v70-verifications/slo-budget-erreur.py',
  (s) => 'raise SystemExit("panne volontaire du test negatif V70 CP14")\n' + s,
  controleUn('scripts/v70-verifications/slo-budget-erreur.py', ['python3'], ['43']));

// ── 9 : la sonde de jargon refuse un terme nu ──────────────────────────
test('9. jargon — signale un terme technique introduit sans définition',
  'curriculum/lessons/css-grid.md',
  (s) => s.replace('## 🎯 Objectif',
    '## 🎯 Objectif\n\nLa mémoïsation des pistes évite le hoisting du quorum.'),
  () => {
    const r = run('node', ['scripts/v70/jargon.mjs']);
    const m = /termes techniques[^:]*: (\d+) leçons/.exec(r.stdout || '');
    // Le contrôle « refuse » si le nombre de leçons signalées dépasse la ligne
    // de base. LIGNE DE BASE MISE À JOUR — V70 CP14 : elle valait 1 quand ce
    // test a été écrit ; après le resserrement de la sonde et le glossage des
    // 20 termes réellement nus qu'il a révélés, elle vaut 0. Le seuil suit la
    // mesure, il ne la précède pas.
    return { status: (m && Number(m[1]) > 0) ? 1 : 0 };
  });

// ── 10 : les tests unitaires refusent une régression de code ───────────
test('10. tsc — refuse une erreur de type introduite dans lib/',
  'lib/types.ts',
  (s) => s + '\nconst REGRESSION_V70_CP14: number = "panne volontaire du test negatif";\n',
  () => run('npx', ['tsc', '--noEmit']));

// ── 11 : une leçon vidée doit être refusée ─────────────────────────────
// CIBLE CORRIGÉE — V70 CP14, après mesure. Ce test visait d'abord
// `v66:render`. Exécution réelle sur `vector-databases.md` vidée :
//   curriculum:check        -> 0   (ne regarde pas les leçons)
//   curriculum:depth-check  -> 1   <- refuse
//   glossary:check          -> 0
//   v35                     -> 0   (hors de son périmètre de 12 leçons)
//   v48 (gel du corpus)     -> 1   <- refuse
//   v66:render              -> 0   <- NE refuse PAS
// `v66:render` compare les sections de la source aux sections rendues. Un
// fichier vide donne 0 section source et 0 section rendue : rien n'est perdu
// entre les deux, donc la porte passe. C'est le comportement CORRECT de ce
// qu'elle mesure — une intégrité de rendu, pas une intégrité de contenu. Le
// test était mal ciblé, pas la porte. Je ne modifie donc pas `v66-render-
// integrity.mjs` : ce serait déplacer une sonde pour lui faire dire autre
// chose que ce qu'elle mesure (§6). Je vise le contrôle qui couvre vraiment
// ce risque, `curriculum:depth-check`, et je publie que `v66:render` seule ne
// protège pas d'un fichier vidé.
test('11. depth-check — refuse un fichier du curriculum vidé',
  'curriculum/lessons/vector-databases.md',
  () => '<!-- keep -->\n# Leçon — vidée par le test négatif\n',
  npmr('curriculum:depth-check'));

console.log(`\ntests négatifs réussis : ${passes} / 11`);
if (echecs.length) {
  console.log('CONTRÔLES QUI N ONT PAS REFUSÉ :');
  for (const e of echecs) console.log(`   ${e}`);
}
// Contrôle de non-régression du protocole lui-même : le dépôt doit être propre.
const st = run('git', ['status', '--porcelain']);
const sales = (st.stdout || '').trim().split('\n').filter(Boolean);
console.log(`\nfichiers modifiés après restauration : ${sales.length}`);
if (sales.length) { console.log(sales.join('\n')); process.exit(1); }
process.exit(echecs.length ? 1 : 0);
