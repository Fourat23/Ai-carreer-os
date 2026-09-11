// V74 · CP14 — QUINZE MUTATIONS NÉGATIVES.
//
// ── NOTE D'HONNÊTETÉ SUR LA PROVENANCE DE CETTE LISTE ────────────────────
//
// Le brief énumérait quinze mutations. **Je n'en ai plus le texte verbatim** :
// il appartenait au message d'origine, et ce qui m'en reste est un résumé. Je
// ne vais donc pas prétendre les rejouer à la lettre.
//
// Les quinze ci-dessous sont **dérivées des décisions gelées de V74** —
// contournements interdits `G1→G12` et critères bloquants `B1→B12` du contrat
// (`docs/v74/V74-RETENTION-CONTRACT-FROZEN.md`). Chacune attaque une décision
// nommée, et la couverture est délibérément étalée du CP2 au CP12.
//
// C'est une reconstruction fidèle à l'intention, pas une citation. Le dire vaut
// mieux que de laisser croire à une correspondance exacte.
//
// ── CE QU'UNE MUTATION DOIT PROUVER ──────────────────────────────────────
//
// Qu'une propriété est **réellement gardée**. Une mutation qui ne fait rougir
// personne n'est pas un succès : c'est un **trou de couverture**, et ce sprint
// en a déjà trouvé quatre (anomalies n° 10, 11, 12, 13).
//
// Deux vérifications que ce harnais fait et qu'on oublie facilement :
//   1. **la mutation a réellement muté le fichier** — l'anomalie n° 11 portait
//      sur `1 * 0 + 1`, qui vaut `1` : une mutation qui ne mute rien ne prouve
//      rien, et la croire efficace est pire que ne pas avoir muté ;
//   2. **le fichier est restauré à l'octet près** après coup.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = process.cwd();

/**
 * Chaque mutation : le fichier, le remplacement exact, la décision attaquée,
 * et les fichiers de test censés la garder.
 */
const MUTATIONS = [
  {
    id: 'M01', cible: 'G2 — `done` n’est pas un contact significatif',
    fichier: 'lib/learner-memory.mjs',
    de: "if (typeof s.content !== 'string' || !s.content.trim()) continue;",
    vers: "if (false) continue;",
    tests: ['tests/v74-learner-memory.test.mjs'],
  },
  {
    id: 'M02', cible: 'R-b — la correction ouverte avant disqualifie la récupération',
    fichier: 'lib/exercise-attempt.mjs',
    de: "correctionSeen: raw.correctionSeen === false ? false : true,",
    vers: "correctionSeen: raw.correctionSeen === true ? true : false,",
    tests: ['tests/v74-learner-memory.test.mjs'],
  },
  {
    id: 'M03', cible: 'R-c — la 2ᵉ tentative du même artefact le même jour n’est pas un rappel',
    fichier: 'lib/learner-memory.mjs',
    de: "c.premiereDuJour = !vus.has(cle);",
    vers: "c.premiereDuJour = true;",
    tests: ['tests/v74-learner-memory.test.mjs'],
  },
  {
    id: 'M04', cible: '§1.6 — `partial` GÈLE la série, ne la casse pas',
    fichier: 'lib/learner-memory.mjs',
    de: "else if (c.outcome === 'failed') serie = 0;",
    vers: "else serie = 0;",
    tests: ['tests/v74-learner-memory.test.mjs'],
  },
  {
    id: 'M05', cible: '§3.6 — un fait sans producteur est REFUSÉ, jamais réparé',
    fichier: 'lib/exercise-attempt.mjs',
    de: "if (!producer) return null;",
    vers: "if (false) return null;",
    tests: ['tests/v74-learner-memory.test.mjs', 'tests/progress-store.test.mjs'],
  },
  {
    id: 'M06', cible: '§3.6 — la clé métier inclut `passed/total`',
    fichier: 'lib/exercise-attempt.mjs',
    de: "return `${a.exerciseId}|${String(a.at).slice(0, 19)}|${a.passed}/${a.total}`;",
    vers: "return `${a.exerciseId}|${String(a.at).slice(0, 19)}`;",
    tests: ['tests/v74-learner-memory.test.mjs'],
  },
  {
    id: 'M07', cible: 'B1 — l’issue est DÉRIVÉE des compteurs, jamais fournie',
    fichier: 'lib/exercise-attempt.mjs',
    de: "const outcome = phase === 'run' ? outcomeOf(passed, total) : 'failure';",
    vers: "const outcome = OUTCOME_SET.has(raw.outcome) ? raw.outcome : (phase === 'run' ? outcomeOf(passed, total) : 'failure');",
    tests: ['tests/v74-learner-memory.test.mjs'],
  },
  {
    id: 'M08', cible: 'B10 — la justification cite AU PLUS deux facteurs',
    fichier: 'lib/retention-priority.mjs',
    de: '.slice(0, 2)',
    vers: '.slice(0, 7)',
    tests: ['tests/v74-retention-priority.test.mjs'],
  },
  {
    id: 'M09', cible: 'CP3 — la somme des poids vaut exactement 100',
    fichier: 'lib/retention-priority.mjs',
    de: '  ancienneteRappel: 30,',
    vers: '  ancienneteRappel: 45,',
    tests: ['tests/v74-retention-priority.test.mjs'],
  },
  {
    id: 'M10', cible: 'G5 — l’ancienneté se compte depuis le dernier rappel RÉUSSI',
    fichier: 'lib/retention-priority.mjs',
    de: 'const depuis = f.lastSuccessAt ?? f.lastRetrievalAt;',
    vers: 'const depuis = f.lastRetrievalAt ?? f.lastSuccessAt;',
    tests: ['tests/v74-retention-priority.test.mjs'],
  },
  {
    id: 'M11', cible: 'CP8 — le statut décide de la BANDE, le score du rang dedans',
    fichier: 'lib/retention-priority.mjs',
    de: `      RANG_STATUT[a.statut] - RANG_STATUT[b.statut]
      || b.score - a.score`,
    vers: `      b.score - a.score
      || RANG_STATUT[a.statut] - RANG_STATUT[b.statut]`,
    tests: ['tests/v74-espacement.test.mjs'],
  },
  {
    id: 'M12', cible: 'CP8 — une séance n’est jamais intégralement composée de retard',
    fichier: 'lib/retention-scheduler.mjs',
    de: 'const sequence = (enRetard.length && jamaisTentees.length)',
    vers: 'const sequence = (false && enRetard.length && jamaisTentees.length)',
    tests: ['tests/v74-espacement.test.mjs', 'tests/v74-apprenants.test.mjs'],
  },
  {
    id: 'M13', cible: 'CP7 — la correction complète est la DERNIÈRE marche',
    fichier: 'lib/remediation.mjs',
    de: 'export const NIVEAU_CORRECTION = 5;',
    vers: 'export const NIVEAU_CORRECTION = 1;',
    tests: ['tests/v74-remediation.test.mjs'],
  },
  {
    id: 'M14', cible: 'G12 — une journée déjà hors budget ne reçoit AUCUNE minute',
    fichier: 'lib/daily-plan.mjs',
    de: '      minutes: PLANCHER_JOURNEE_CHARGEE,',
    vers: '      minutes: cible,',
    tests: ['tests/v74-daily-plan.test.mjs', 'tests/v74-apprenants.test.mjs'],
  },
  {
    id: 'M15', cible: 'CP11 — une co-occurrence de compétences n’est PAS un transfert',
    fichier: 'lib/learner-memory.mjs',
    de: "const transferts = contacts.filter((c) => c.kind === 'evidence' && c.sourceType === 'transfer-challenge');",
    vers: "const transferts = contacts.filter((c) => c.dayRef != null && ctx.transferDays?.has(c.dayRef));",
    tests: ['tests/v74-transfert.test.mjs'],
  },
];

const lireTests = (fichiers) => {
  try {
    const out = execFileSync('node', ['--test', ...fichiers], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { rouges: 0, sortie: out };
  } catch (e) {
    const out = `${e.stdout ?? ''}${e.stderr ?? ''}`;
    const m = /^# fail (\d+)$/m.exec(out);
    return { rouges: m ? Number(m[1]) : -1, sortie: out };
  }
};

console.log('# V74 · CP14 — QUINZE MUTATIONS NÉGATIVES\n');
console.log('Liste **dérivée des décisions gelées** (G1→G12, B1→B12), le texte verbatim du brief');
console.log('n’étant plus à ma disposition. Reconstruction fidèle à l’intention, pas citation.\n');
console.log('| # | décision attaquée | tests rouges | mutation effective | restauré |');
console.log('|---|---|---|---|---|');

const muettes = [];
let restaurationKO = 0;

for (const m of MUTATIONS) {
  const chemin = join(ROOT, m.fichier);
  const original = readFileSync(chemin, 'utf8');

  if (!original.includes(m.de)) {
    console.log(`| ${m.id} | ${m.cible} | — | ❌ **motif introuvable** | — |`);
    muettes.push({ ...m, raison: 'motif introuvable' });
    continue;
  }

  const mute = original.replace(m.de, m.vers);
  // VÉRIFICATION 1 : la mutation a réellement changé le fichier.
  const effective = mute !== original;

  writeFileSync(chemin, mute);
  const { rouges } = lireTests(m.tests);
  writeFileSync(chemin, original);

  // VÉRIFICATION 2 : restauration à l'octet près.
  const restaure = readFileSync(chemin, 'utf8') === original;
  if (!restaure) restaurationKO += 1;
  if (rouges === 0) muettes.push({ ...m, raison: 'aucun test rouge' });

  console.log(`| ${m.id} | ${m.cible} | **${rouges}** | ${effective ? '✅' : '❌'} | ${restaure ? '✅' : '❌'} |`);
}

console.log(`\n**${MUTATIONS.length - muettes.length} mutations sur ${MUTATIONS.length} ont fait rougir au moins un test.**`);
if (muettes.length) {
  console.log('\n## Trous de couverture — à publier, pas à cacher\n');
  for (const m of muettes) console.log(`- **${m.id}** (${m.cible}) : ${m.raison}`);
}
if (restaurationKO) console.log(`\n⚠ ${restaurationKO} fichier(s) NON restauré(s).`);
process.exitCode = muettes.length === 0 && restaurationKO === 0 ? 0 : 1;
