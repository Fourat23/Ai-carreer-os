// V68 · CP15 — TESTS NÉGATIFS SUR LES SONDES NEUVES.
//
// V68 a introduit cinq sondes de lecture. Une sonde qui ne rougit jamais ne mesure
// rien — et ce projet en a produit treize de fausses, dont deux écartées au CP0 de
// V68 lui-même. On abîme donc une COPIE du corpus et on exige que la mesure CHANGE.
//
// Deux scénarios sont déclarés AVEUGLES à l'avance : leur non-détection est le
// résultat attendu, et le publier vaut mieux que fabriquer un contrôle qui
// prétendrait voir ce qu'il ne voit pas. C'est la leçon du test négatif 2 de V67.

import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const RACINE = process.cwd();
const vus = [];
const aveugles = [];

/**
 * On exécute la COPIE du script, jamais l'original : les imports ESM se résolvent
 * par rapport au FICHIER, pas au `cwd`. V67 s'est fait piéger exactement là et a
 * failli conclure qu'une sonde était aveugle alors que le sabotage n'était jamais lu.
 */
function mesurer(dir, slug) {
  return execFileSync('node', [join(dir, 'scripts/v68-lecture.mjs'), slug], { cwd: dir, encoding: 'utf8' });
}

function prepare() {
  const dir = mkdtempSync(join(tmpdir(), 'v68-neg-'));
  for (const d of ['curriculum', 'data', 'scripts']) cpSync(join(RACINE, d), join(dir, d), { recursive: true });
  return dir;
}

function scenario(nom, attendu, slug, saboter, extraire) {
  const dir = prepare();
  try {
    const avant = extraire(mesurer(dir, slug));
    saboter(join(dir, 'curriculum', 'lessons', `${slug}.md`));
    const apres = extraire(mesurer(dir, slug));
    const detecte = avant !== apres;
    vus.push({ nom, detecte });
    console.log(`${detecte ? '✅' : '❌'} ${nom}`);
    console.log(`     attendu : ${attendu}`);
    console.log(`     avant « ${avant} »  →  après « ${apres} »`);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

function scenarioAveugle(nom, attendu, slug, saboter, extraire) {
  const dir = prepare();
  try {
    const avant = extraire(mesurer(dir, slug));
    saboter(join(dir, 'curriculum', 'lessons', `${slug}.md`));
    const apres = extraire(mesurer(dir, slug));
    const vu = avant !== apres;
    aveugles.push({ nom, vu });
    console.log(`${vu ? '⚠️ ' : '📎'} ${nom}`);
    console.log(`     ${attendu}`);
    console.log(`     ${vu ? 'DÉTECTÉ — la limite documentée n’existe plus, mettre à jour ce test' : 'non détecté, conforme à la limite documentée'}`);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

const ligne = (re) => (s) => (re.exec(s)?.[1] ?? '?').trim();
const ecrire = (p, f) => writeFileSync(p, f(readFileSync(p, 'utf8')));

// 1. Retirer entièrement la correction d'une leçon traitée.
scenario(
  'Correction supprimée de resilience-patterns',
  'la sonde « exercice sans correction » doit basculer',
  'resilience-patterns',
  (p) => ecrire(p, (md) => md.replace(/^## ✅ Correction attendue[\s\S]*?(?=^## )/m, '')),
  ligne(/exercice sans correction\s+:\s+(\S+)/),
);

// 2. Vider la correction de sa substance en gardant l'intertitre.
//    C'est le scénario que V67 avait déclaré aveugle pour sa grammaire structurelle.
//    La sonde de V68 lit le CORPS et cherche une erreur nommée : elle doit voir.
scenario(
  'Correction de postmortem-rca réduite à « voir la solution »',
  'la sonde doit signaler une correction qui ne nomme aucune erreur',
  'postmortem-rca',
  (p) => ecrire(p, (md) => md.replace(/^## ✅ Correction attendue[\s\S]*?(?=^## )/m,
    '## ✅ Correction attendue\nVoir la solution.\n\n')),
  ligne(/correction\s+:\s+(.+)/),
);

// 3. Coller les réponses dans une section de vérification muette.
scenario(
  'Réponses collées dans la vérification de networking-dns',
  'la sonde « vérification sans réponse » doit basculer',
  'networking-dns',
  (p) => ecrire(p, (md) => md.replace(
    /1\. Tu dois migrer une IP demain[\s\S]*?en une minute \?/,
    '1. Combien de temps faut-il attendre ? → une heure, à cause de l’ancien TTL.')),
  ligne(/vérification sans réponse\s+:\s+(\S+)/),
);

// 4. Ajouter un terme au Vocabulaire sans jamais l'expliquer.
scenario(
  'Terme « idempotence » ajouté au Vocabulaire de css-grid sans explication',
  'la sonde « terme jamais expliqué » doit le nommer',
  'css-grid',
  (p) => ecrire(p, (md) => md.replace(/^## 📚 Vocabulaire\n/m, '## 📚 Vocabulaire\n**idempotence** · ')),
  (s) => (/termes jamais expliqués\s+:\s+(.+)/.exec(s)?.[1] ?? 'aucun').trim(),
);

// 5. Réduire l'exemple guidé à une ligne.
scenario(
  "Exemple guidé de metrics-percentiles réduit à une ligne",
  'la taille de l’exemple guidé doit s’effondrer',
  'metrics-percentiles',
  (p) => ecrire(p, (md) => md.replace(/^## 🛠 Exemple guidé[\s\S]*?(?=^## )/m,
    '## 🛠 Exemple guidé\nRegarder les percentiles.\n\n')),
  ligne(/exemple guidé\s+:\s+(\S+)/),
);

// --- AVEUGLEMENTS DÉCLARÉS ---

// A. Une correction qui nomme une erreur FAUSSE passe le contrôle.
//    La sonde cherche le champ lexical de l'erreur, pas sa justesse. Aucun
//    programme ne peut vérifier qu'une erreur pédagogique est la bonne : c'est
//    la lecture qui décide, et c'est pourquoi le barème gelé note PAR LECTURE.
scenarioAveugle(
  'Erreur probable remplacée par une erreur inventée dans resilience-patterns',
  'AVEUGLEMENT CONNU : la sonde voit qu’une erreur est nommée, jamais qu’elle est juste',
  'resilience-patterns',
  (p) => ecrire(p, (md) => md.replace(
    /\*\*L'erreur probable[\s\S]*?décide\./,
    "**L'erreur probable.** On se trompe souvent en croyant que le mot « timeout » vient du tennis. C'est faux, et le piège séduit parce que c'est amusant.")),
  ligne(/correction\s+:\s+(.+)/),
);

// B. Une question de vérification dont la réponse est ailleurs dans la page.
//    La sonde vérifie l'absence de réponse ADJACENTE, pas l'impossibilité de la
//    trouver trois sections plus haut. Limite assumée : le but est l'effort de
//    rappel, et un lecteur qui remonte chercher fait déjà cet effort.
scenarioAveugle(
  'Question de vérification dont la réponse figure déjà dans le cours',
  'AVEUGLEMENT ASSUMÉ : la sonde mesure l’adjacence, pas l’introuvabilité',
  'slo-error-budget',
  (p) => ecrire(p, (md) => md.replace(
    /1\. Ton service tourne à 99,95 %[\s\S]*?pourquoi \?/,
    '1. Que vaut le budget d’erreur d’un SLO à 99,9 % sur 30 jours ?')),
  ligne(/vérification sans réponse\s+:\s+(\S+)/),
);

const ok = vus.filter((v) => v.detecte).length;
console.log(`\n${ok}/${vus.length} régressions réellement détectées`);
console.log(`${aveugles.filter((a) => !a.vu).length}/${aveugles.length} aveuglement(s) confirmé(s) et documenté(s)`);
process.exit(ok === vus.length ? 0 : 1);
