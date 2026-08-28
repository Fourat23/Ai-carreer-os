// V67 · CP14 — TESTS NÉGATIFS. Un contrôle qui ne rougit jamais ne contrôle rien.
//
// Le brief énumère six régressions à injecter. Pour chacune : on abîme une COPIE
// du corpus, on relance la mesure, et on exige qu'elle CHANGE. Aucun fichier du
// dépôt n'est modifié — tout se passe dans un répertoire temporaire.
//
// Un test négatif qui « passe » sans que la sonde bouge est un test qui ment.
// C'est arrivé en V66 sur `v66:render` : la première version de la règle était
// aveugle au défaut qu'elle prétendait détecter, et seul le test négatif l'a
// montré.

import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const RACINE = process.cwd();
const cas = [];
const aveugles = [];

/**
 * Exécute une mesure dans un corpus abîmé et rend sa sortie.
 *
 * On exécute la COPIE du script, pas l'original. Premier essai : `join(RACINE,
 * script)` avec `cwd: dir`. Les lectures de fichiers relatives suivaient bien le
 * `cwd`, mais les imports ESM se résolvent par rapport au FICHIER — donc
 * `v67-stock.mjs` importait le `days-lessons-v67.mjs` du dépôt, pas celui que le
 * scénario 6 venait de vider. Le test annonçait « 25 orphelines avant, 25 après »
 * et concluait que la sonde était aveugle, alors que le sabotage n'était
 * simplement jamais lu.
 */
function mesurer(dir, script, args = []) {
  return execFileSync('node', [join(dir, script), ...args], { cwd: dir, encoding: 'utf8' });
}

function scenario(nom, attendu, prepare, script, extraire, args = []) {
  const dir = mkdtempSync(join(tmpdir(), 'v67-neg-'));
  try {
    for (const d of ['curriculum', 'data', 'scripts']) {
      cpSync(join(RACINE, d), join(dir, d), { recursive: true });
    }
    const avant = extraire(mesurer(dir, script, args));
    prepare(dir);
    const apres = extraire(mesurer(dir, script, args));
    const detecte = avant !== apres;
    cas.push({ nom, attendu, avant, apres, detecte });
    console.log(`${detecte ? '✅' : '❌'} ${nom}`);
    console.log(`     attendu : ${attendu}`);
    console.log(`     avant ${avant}  →  après ${apres}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Scénario dont le NON-détection est le résultat attendu et publié. */
function scenarioAveugle(nom, attendu, prepare, script, extraire, args = []) {
  const dir = mkdtempSync(join(tmpdir(), 'v67-neg-'));
  try {
    for (const d of ['curriculum', 'data', 'scripts']) cpSync(join(RACINE, d), join(dir, d), { recursive: true });
    const avant = extraire(mesurer(dir, script, args));
    prepare(dir);
    const apres = extraire(mesurer(dir, script, args));
    const vu = avant !== apres;
    aveugles.push({ nom, attendu, vu });
    console.log(`${vu ? '⚠️ ' : '📎'} ${nom}`);
    console.log(`     ${attendu}`);
    console.log(`     ${vu ? 'DÉTECTÉ — la limite documentée n’existe plus, mettre à jour ce test' : 'non détecté, conforme à la limite documentée'}`);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

const lecon = (dir, slug) => join(dir, 'curriculum', 'lessons', `${slug}.md`);
const jour = (dir, n) => join(dir, 'curriculum', 'days', `day-${String(n).padStart(3, '0')}.md`);

// 1. Retirer le modèle mental d'une leçon.
scenario(
  'Modèle mental supprimé de system-design-scaling',
  'la grammaire pédagogique doit signaler une fonction absente',
  (dir) => {
    const p = lecon(dir, 'system-design-scaling');
    const md = readFileSync(p, 'utf8');
    writeFileSync(p, md.replace(/^## 🧠 Modèle mental[\s\S]*?(?=^## )/m, ''));
  },
  'scripts/v67-lesson.mjs', (s) => s.trim(), ['system-design-scaling'],
);

// 2. Remplacer une correction par la seule réponse.
//
// RÉSULTAT ATTENDU : NON DÉTECTÉ, et c'est le point du test.
//
// On vide le corps de la correction en gardant son intertitre. La grammaire
// pédagogique continue de compter la fonction « correction » comme présente,
// parce qu'elle lit des TITRES et non de la substance. Une correction réduite à
// « Voir la solution » passe donc le contrôle structurel.
//
// Ce n'est pas un défaut du test, c'est la limite mesurée de la sonde — et
// c'est exactement pourquoi le barème gelé note les 15 dimensions PAR LECTURE
// et se sert des compteurs uniquement pour savoir où lire. Le publier vaut
// mieux que fabriquer un contrôle qui prétendrait voir ce qu'il ne voit pas.
scenarioAveugle(
  'Correction de javascript-basics réduite à la réponse',
  'AVEUGLEMENT CONNU : la grammaire compte des titres, pas de la substance',
  (dir) => {
    const p = lecon(dir, 'javascript-basics');
    const md = readFileSync(p, 'utf8');
    writeFileSync(p, md.replace(/^## ✅ Correction attendue[\s\S]*?(?=^## )/m,
      '## ✅ Correction attendue\nVoir la solution.\n\n'));
  },
  'scripts/v67-lesson.mjs', (s) => s.trim(), ['javascript-basics'],
);

// 3. Injecter douze termes marqués sans explication.
scenario(
  'Douze termes marqués injectés en trois lignes dans error-handling',
  'la densité de termes (soupe) doit augmenter',
  (dir) => {
    const p = lecon(dir, 'error-handling');
    const md = readFileSync(p, 'utf8');
    const soupe = '\n**idempotence** **backoff** **jitter** **bulkhead** **fallback** **hedging**\n'
      + '**deadline** **budget** **quota** **throttle** **backpressure** **saturation**\n'
      + '**circuit** **retry** **timeout**\n';
    writeFileSync(p, md.replace(/^## 🔧 Exemple simple/m, soupe + '## 🔧 Exemple simple'));
  },
  'scripts/v67-lesson.mjs', (s) => s.trim(), ['error-handling'],
);

// 4. Vider le travail d'une journée en gardant sa durée annoncée.
scenario(
  'Jour 79 vidé de sa pratique, durée annoncée inchangée',
  'la condition 5 du barème gelé doit compter une violation',
  (dir) => {
    const p = jour(dir, 79);
    const md = readFileSync(p, 'utf8');
    let out = md.replace(/^## ✍️ Pratique autonome[\s\S]*?(?=^## )/m, '## ✍️ Pratique autonome\nTravaille.\n\n');
    out = out.replace(/^## 📦 Livrable attendu[\s\S]*?(?=^## )/m, '## 📦 Livrable attendu\nUn truc.\n\n');
    out = out.replace(/^\s*-\s*\[ \].*$/gm, '');
    writeFileSync(p, out);
  },
  'scripts/v67-charge.mjs',
  (s) => (/CONDITION 5[\s\S]*?(\d+) violation/.exec(s)?.[1] ?? '?') + ' violation(s)',
);

// 5. Retirer la récupération active d'une revue.
scenario(
  'Revue du jour 7 privée de ses tests et de sa checklist',
  'la revue doit perdre son activité concrète',
  (dir) => {
    const p = jour(dir, 7);
    const md = readFileSync(p, 'utf8');
    let out = md.replace(/^### Test pratique[\s\S]*?(?=^### )/m, '### Test pratique\nRelis.\n\n');
    out = out.replace(/^\s*-\s*\[ \].*$/gm, '');
    writeFileSync(p, out);
  },
  'scripts/v67-charge.mjs',
  (s) => (/dont revues\s+(\d+)\/(\d+)/.exec(s) ?? []).slice(1).join('/') || '?',
);

// 6. Casser le rattachement d'une leçon au parcours.
scenario(
  'Rattachement V67 des leçons d’observabilité retiré',
  'le compte de leçons orphelines doit remonter',
  (dir) => {
    const p = join(dir, 'scripts', 'data', 'days-lessons-v67.mjs');
    const src = readFileSync(p, 'utf8');
    writeFileSync(p, src.replace(/^export const LESSONS_V67 = \{/m, 'export const LESSONS_V67 = { /* vidé */ };\nconst _ignore = {'));
    // Le compte d'orphelines se lit sur les journées GÉNÉRÉES, pas sur la
    // source : sans régénération, le sabotage n'atteint jamais ce qui est
    // mesuré. Premier essai sans cette ligne : « 25 avant, 25 après », et j'ai
    // failli en conclure que la sonde était aveugle.
    execFileSync('node', [join(dir, 'scripts', 'generate-curriculum.mjs')], { cwd: dir, stdio: 'ignore' });
  },
  'scripts/v67-stock.mjs',
  (s) => (/(\d+) orphelines/.exec(s)?.[1] ?? '?') + ' orphelines',
);

const vus = cas.filter((c) => c.detecte).length;
console.log(`\n${vus}/${cas.length} régressions réellement détectées`);
console.log(`${aveugles.filter((a) => !a.vu).length}/${aveugles.length} aveuglement(s) confirmé(s) et documenté(s)`);
process.exit(vus === cas.length ? 0 : 1);
