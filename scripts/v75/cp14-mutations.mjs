// V75 · CP14 — TESTS DE MUTATION : vingt-quatre manières de tricher.
//
// ── CE QUE MESURE CE SCRIPT ─────────────────────────────────────────────
//
// Pas « les tests passent-ils ». **« Les tests empêchent-ils de mentir ? »**
//
// Une suite verte ne prouve rien tant qu'on n'a pas montré qu'elle sait rougir.
// Le sprint en a fait l'expérience trois fois — la plus coûteuse au CP9 :
// remplacer `sourceType: 'transfer-challenge'` par `'assessment'` **dans la
// route** laissait 1797 tests verts, parce qu'ils vérifiaient le fabricant de
// preuve et jamais la route. Le contournement que le checkpoint devait
// interdire passait sous les tests censés l'interdire.
//
// Ce script applique donc, une par une, les **vingt-quatre mutations nommées
// par le brief** — chacune est une façon plausible de faire dire au produit
// quelque chose de faux — et exige pour chacune :
//
//   1. **RED** : au moins un test ciblé échoue ;
//   2. **restauration** : le fichier revient à l'octet près ;
//   3. **GREEN** : les mêmes tests repassent.
//
// Une mutation qui reste verte n'est pas un détail de couverture : c'est la
// démonstration qu'un mensonge précis est indétectable. Le script sort en
// code 1 dans ce cas, sans exception.
//
// ── CE QUE CE SCRIPT NE FAIT PAS ────────────────────────────────────────
//
// Il ne modifie **jamais** un test pour obtenir un rouge, et il ne laisse
// **jamais** une mutation en place : chaque fichier est relu, muté, restauré
// depuis son contenu d'origine gardé en mémoire, puis revérifié.
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = process.cwd();
const T = (...f) => f.map((x) => `tests/${x}`);

/**
 * ── LES VINGT-QUATRE MUTATIONS ───────────────────────────────────────────
 *
 * `avant` doit apparaître **exactement une fois** dans le fichier : le script
 * refuse de tourner sinon. Une mutation appliquée au mauvais endroit mesurerait
 * autre chose que ce qu'elle annonce — c'est l'anomalie n° 7 de ce sprint,
 * transposée aux mutations.
 */
export const MUTATIONS = [
  {
    id: 'M1', nom: 'un échec est supprimé',
    fichier: 'lib/learner-memory.mjs',
    avant: "const echecs = recuperations.filter((c) => c.outcome === 'failed');",
    apres: 'const echecs = [];',
    tests: T('v74-learner-memory.test.mjs', 'v74-oubli.test.mjs', 'v75-backlog-triage.test.mjs'),
  },
  {
    id: 'M2', nom: 'un succès est compté deux fois',
    fichier: 'lib/learner-memory.mjs',
    avant: "const reussites = recuperations.filter((c) => c.outcome === 'recalled');",
    apres: "const reussites = recuperations.filter((c) => c.outcome === 'recalled').flatMap((c) => [c, c]);",
    tests: T('v74-learner-memory.test.mjs', 'v74-espacement.test.mjs'),
  },
  {
    id: 'M3', nom: 'un exercice est rattaché à un `conceptId` faux',
    fichier: 'lib/exercise-mapping.mjs',
    avant: "return { concepts: decl, classe: 'UNAMBIGUOUS', regle: 'R1 · déclaré par une seule leçon' };",
    apres: "return { concepts: ['concept-qui-nexiste-pas'], classe: 'UNAMBIGUOUS', regle: 'R1 · déclaré par une seule leçon' };",
    tests: T('v75-exercise-mapping.test.mjs', 'v75-concept-evidence.test.mjs'),
  },
  {
    id: 'M4', nom: 'une preuve multi-concepts est forcée à un seul concept',
    fichier: 'lib/exercise-mapping.mjs',
    avant: "return { concepts: decl, classe: 'MULTI_CONCEPT_BY_DESIGN', regle: `R2 · déclaré par ${decl.length} leçons` };",
    apres: "return { concepts: [decl[0]], classe: 'MULTI_CONCEPT_BY_DESIGN', regle: `R2 · déclaré par ${decl.length} leçons` };",
    tests: T('v75-exercise-mapping.test.mjs', 'v75-concept-evidence.test.mjs'),
  },
  {
    id: 'M5', nom: "l'arriéré TOTAL est caché derrière l'arriéré actif",
    fichier: 'lib/backlog-triage.mjs',
    avant: '    total: notions.length,',
    apres: '    total: placement.actif,',
    tests: T('v75-backlog-triage.test.mjs', 'v75-telemetrie-ux.test.mjs'),
  },
  {
    id: 'M6', nom: 'une notion garée est traitée comme acquise (retirée du total)',
    fichier: 'lib/backlog-triage.mjs',
    avant: '  for (const n of notions) { compte[n.classe] += 1; placement[n.placement] += 1; }',
    apres: "  for (const n of notions) { if (n.classe === 'PARKED') continue; compte[n.classe] += 1; placement[n.placement] += 1; }",
    tests: T('v75-backlog-triage.test.mjs'),
  },
  {
    id: 'M7', nom: 'le mode récupération ne se déclenche JAMAIS',
    fichier: 'lib/recovery-mode.mjs',
    avant: '  CATCH_UP: { bloquantes: 1, echecsNonRepris: 3 },',
    apres: '  CATCH_UP: { bloquantes: 99999, echecsNonRepris: 99999 },',
    tests: T('v75-recovery-mode.test.mjs'),
  },
  {
    id: 'M8', nom: 'le mode récupération se déclenche TOUJOURS',
    fichier: 'lib/recovery-mode.mjs',
    avant: '  CRITICAL: { bloquantes: 6, facteurMinutes: 6 },',
    apres: '  CRITICAL: { bloquantes: 0, facteurMinutes: 0 },',
    tests: T('v75-recovery-mode.test.mjs'),
  },
  {
    id: 'M9', nom: 'on ne peut JAMAIS sortir de la récupération',
    fichier: 'lib/recovery-mode.mjs',
    avant: '  const sortieConfirmee = toutesTenues(sortieAujourdhui) && E4;',
    apres: '  const sortieConfirmee = false;',
    tests: T('v75-recovery-mode.test.mjs'),
  },
  {
    id: 'M10', nom: 'la sortie de récupération est trop facile (un seul bon jour)',
    fichier: 'lib/recovery-mode.mjs',
    avant: '  const sortieConfirmee = toutesTenues(sortieAujourdhui) && E4;',
    apres: '  const sortieConfirmee = true;',
    tests: T('v75-recovery-mode.test.mjs'),
  },
  {
    id: 'M11', nom: 'le nouveau contenu continue normalement en `CRITICAL`',
    fichier: 'lib/plan-unifie.mjs',
    avant: "        statut: 'recommande-pause',",
    apres: "        statut: 'inclus',",
    tests: T('v75-plan-unifie.test.mjs'),
  },
  {
    id: 'M12', nom: 'un projet urgent passe en dernier',
    fichier: 'lib/plan-unifie.mjs',
    avant: "  NORMAL: ['PROJECT', 'NEW', 'REVIEW', 'REMEDIATION', 'TRANSFER'],",
    apres: "  NORMAL: ['NEW', 'REVIEW', 'REMEDIATION', 'TRANSFER', 'PROJECT'],",
    tests: T('v75-plan-unifie.test.mjs'),
  },
  {
    id: 'M13', nom: 'une absence de 60 jours est traitée comme une absence de 1 jour',
    fichier: 'lib/retention-priority.mjs',
    avant: '  const retard = dueAt ? joursEntre(dueAt, now) : null;',
    apres: '  const retard = dueAt ? Math.min(joursEntre(dueAt, now), 1) : null;',
    tests: T('v74-retention-priority.test.mjs', 'v74-oubli.test.mjs', 'v75-backlog-triage.test.mjs'),
  },
  {
    id: 'M14', nom: 'les horodatages de tentatives ne sont plus ordonnés',
    fichier: 'lib/transfer-attempt.mjs',
    avant: '  return dedupSorted(out, transferAttemptKey, { max: MAX_TRANSFER_ATTEMPTS });',
    apres: '  return out;',
    tests: T('v75-transfer-attempt.test.mjs'),
  },
  {
    id: 'M15', nom: 'un `TransferAttempt` est perdu à la persistance',
    fichier: 'lib/progress-store.mjs',
    avant: '  flat.transferAttempts = normalizeTransferAttempts(track?.transferAttempts).slice(-MAX_TRANSFER_ATTEMPTS);',
    apres: '  flat.transferAttempts = [];',
    tests: T('progress-store.test.mjs', 'v75-transfer-attempt.test.mjs'),
  },
  {
    id: 'M16', nom: 'un `TransferAttempt` raté compte comme une réussite',
    fichier: 'lib/learner-memory.mjs',
    avant: "    if (c.kind === 'transfer' && c.outcome === 'recalled') defisReussis.add(c.challengeId);",
    apres: "    if (c.kind === 'transfer') defisReussis.add(c.challengeId);",
    tests: T('v75-transfer-attempt.test.mjs', 'v74-transfert.test.mjs', 'v75-transfert.test.mjs'),
  },
  {
    id: 'M17', nom: 'le schéma `weeklyReview` est cassé à l’écriture',
    fichier: 'lib/progress-store.mjs',
    avant: '  const flat = { startDate: m.startDate, days: m.days, skills: m.skills, weeklyReviews: m.weeklyReviews, monthlyReviews: m.monthlyReviews };',
    apres: '  const flat = { startDate: m.startDate, days: m.days, skills: m.skills, weeklyReviews: null, monthlyReviews: m.monthlyReviews };',
    tests: T('progress-store.test.mjs'),
  },
  {
    id: 'M18', nom: '`data/progress.json` est créé dans le dépôt',
    // Pas une mutation de code : on crée réellement le fichier interdit et on
    // vérifie qu'une PORTE le refuse. L'invariant du sprint est de ne jamais
    // le créer ; encore faut-il que quelque chose s'en aperçoive.
    fichierInterdit: 'data/progress.json',
    commande: ['node', 'scripts/v74-check.mjs'],
  },
  {
    id: 'M19', nom: 'le scheduler devient non déterministe',
    fichier: 'lib/retention-scheduler.mjs',
    avant: '  const palier = INTERVALS[Math.min(fiche.consecutiveSuccesses ?? 0, INTERVALS.length - 1)];',
    apres: '  const palier = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];',
    tests: T('v74-retention-scheduler.test.mjs', 'v74-espacement.test.mjs'),
  },
  {
    id: 'M20', nom: 'le budget quotidien est dépassé',
    fichier: 'lib/plan-unifie.mjs',
    avant: '      const accordeNew = Math.min(veut, restant);',
    apres: '      const accordeNew = veut;',
    tests: T('v75-plan-unifie.test.mjs'),
  },
  {
    id: 'M21', nom: 'une reprise écrase la tentative initiale',
    fichier: 'lib/learning-engine.mjs',
    avant: '    progress: { ...progress, transferAttempts: [...existantes, attempt] },',
    apres: '    progress: { ...progress, transferAttempts: [...existantes.filter((a) => a.challengeId !== attempt.challengeId), attempt] },',
    tests: T('v75-transfer-attempt.test.mjs'),
  },
  {
    id: 'M22', nom: 'un doublon réseau crée deux faits',
    fichier: 'lib/learning-engine.mjs',
    avant: '  if (existantes.some((a) => transferAttemptKey(a) === cle)) {',
    apres: '  if (false) {',
    tests: T('v75-transfer-attempt.test.mjs'),
  },
  {
    id: 'M23', nom: 'la soupape disparaît : famine possible au garage',
    fichier: 'lib/backlog-triage.mjs',
    avant: "  const soupape = notions.length > 0 && notions.every((n) => n.classe === 'PARKED');",
    apres: '  const soupape = false;',
    tests: T('v75-backlog-triage.test.mjs'),
  },
  {
    id: 'M24', nom: 'le plan de reprise ne donne plus aucune justification',
    fichier: 'lib/plan-unifie.mjs',
    avant: "export function explicationsDe({ mode, blocs, pression = {}, journeeLourde = false, charge = null, plafond = 0 }) {\n  const out = [];",
    apres: "export function explicationsDe({ mode, blocs, pression = {}, journeeLourde = false, charge = null, plafond = 0 }) {\n  const out = [];\n  if (out.length === 0) return out;",
    tests: T('v75-plan-unifie.test.mjs'),
  },
];

/** Lance des tests et rend `true` s'ils passent tous. */
function testsPassent(fichiers) {
  try {
    execFileSync('node', ['--test', ...fichiers], { cwd: ROOT, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/** Lance une commande et rend `true` si elle sort en 0. */
function commandePasse([bin, ...args]) {
  try {
    execFileSync(bin, args, { cwd: ROOT, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/** Une mutation, du vert au rouge et retour au vert. */
export function jouer(m) {
  // ── Cas particulier : le fichier interdit ──
  if (m.fichierInterdit) {
    const p = join(ROOT, m.fichierInterdit);
    if (existsSync(p)) throw new Error(`${m.fichierInterdit} existe déjà : l'invariant est déjà rompu`);
    const vertAvant = commandePasse(m.commande);
    mkdirSync(join(ROOT, 'data'), { recursive: true });
    writeFileSync(p, '{"tracks":{}}\n');
    const rouge = !commandePasse(m.commande);
    unlinkSync(p);
    const vertApres = commandePasse(m.commande);
    return { id: m.id, nom: m.nom, vertAvant, rouge, vertApres, cible: m.fichierInterdit };
  }

  const chemin = join(ROOT, m.fichier);
  const origine = readFileSync(chemin, 'utf8');

  // ── L'ANCRAGE : la mutation doit viser UN endroit, et un seul ──
  const occurrences = origine.split(m.avant).length - 1;
  if (occurrences !== 1) {
    throw new Error(`${m.id} : « avant » apparaît ${occurrences} fois dans ${m.fichier} (attendu : 1)`);
  }

  const vertAvant = testsPassent(m.tests);
  let rouge = false;
  let vertApres = false;
  try {
    writeFileSync(chemin, origine.replace(m.avant, m.apres));
    rouge = !testsPassent(m.tests);
  } finally {
    // Restauration inconditionnelle, à l'octet près, même si tout a échoué.
    writeFileSync(chemin, origine);
  }
  if (readFileSync(chemin, 'utf8') !== origine) throw new Error(`${m.id} : restauration incomplète`);
  vertApres = testsPassent(m.tests);

  return { id: m.id, nom: m.nom, vertAvant, rouge, vertApres, cible: m.fichier };
}

if (process.argv[1] && process.argv[1].endsWith('cp14-mutations.mjs')) {
  const seul = process.argv[2] ?? null;
  const liste = seul ? MUTATIONS.filter((m) => m.id === seul) : MUTATIONS;

  console.log('# V75 · CP14 — Vingt-quatre manières de tricher, et ce qui les arrête\n');
  console.log('> Une suite verte ne prouve rien tant qu’on n’a pas montré qu’elle sait rougir.');
  console.log('> Chaque ligne : **vert** avant · **rouge** sous mutation · **vert** après restauration.\n');
  console.log('| # | mutation | fichier | vert avant | ROUGE | vert après |');
  console.log('|---|---|---|---|---|---|');

  const res = [];
  for (const m of liste) {
    const r = jouer(m);
    res.push(r);
    const ok = (b) => (b ? '✅' : '❌');
    console.log(`| ${r.id} | ${r.nom} | \`${r.cible}\` | ${ok(r.vertAvant)} | ${r.rouge ? '✅ rouge' : '❌ **RESTE VERT**'} | ${ok(r.vertApres)} |`);
  }

  const survivantes = res.filter((r) => !r.rouge);
  const malRestaurees = res.filter((r) => !r.vertApres);
  const malAncrees = res.filter((r) => !r.vertAvant);

  console.log('\n## Verdict\n');
  console.log(`**Mutations jouées** : ${res.length}`);
  console.log(`**Survivantes** (mensonge indétectable) : ${survivantes.length === 0 ? '✅ aucune' : `❌ ${survivantes.map((r) => r.id).join(' ')}`}`);
  console.log(`**Restaurations incomplètes** : ${malRestaurees.length === 0 ? '✅ aucune' : `❌ ${malRestaurees.map((r) => r.id).join(' ')}`}`);
  console.log(`**Départ non vert** (la mesure ne vaudrait rien) : ${malAncrees.length === 0 ? '✅ aucune' : `❌ ${malAncrees.map((r) => r.id).join(' ')}`}`);

  writeFileSync(join(ROOT, 'docs', 'v75', 'cp14-mutations.json'), `${JSON.stringify(res, null, 1)}\n`);
  console.log('\nécrit : docs/v75/cp14-mutations.json');

  if (survivantes.length || malRestaurees.length || malAncrees.length) process.exitCode = 1;
}
