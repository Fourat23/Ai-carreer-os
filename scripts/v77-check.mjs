// Gate v77:check — COUVERTURE DE LA PRATIQUE & UNIFICATION DES PREUVES.
//
// ── POURQUOI CETTE PORTE EXISTE ─────────────────────────────────────────
//
// Une suite de tests garde des COMPORTEMENTS. V77 repose sur des **propriétés
// structurelles** qu'aucune assertion ne voit se dégrader :
//
//   · **une surface qui écrit un fait qu'elle n'a pas le droit d'écrire.** Le
//     CP0 a mesuré qu'un clic d'auto-validation était archivé `passed` ; rien
//     n'avait rougi pendant des mois ;
//   · **un fait qui perd une de ses quatre listes blanches.** Le défaut P7 a
//     coûté deux fois, et le CP3 en a trouvé une quatrième, invisible depuis le
//     store ;
//   · **`isQualifying` qui cesse de regarder le niveau.** Tout redeviendrait
//     vert : le produit crédite simplement plus généreusement ;
//   · **une analyse d'artefact enregistrée sans artefact.** Le compte monte, et
//     une page vue devient un travail.
//
// Elle garde exactement ce qui se dégrade **sans casser**, et ne juge aucun
// seuil pédagogique.
//
// ── ELLE NE SE JUGE PAS ELLE-MÊME ───────────────────────────────────────
//
// V76 · CP14 a mesuré que vérifier une porte en la lançant ne prouve rien : deux
// mutations de règles avaient survécu parce que je les avais validées avec la
// porte elle-même. `tests/v77-gate.test.mjs` est le JUGE EXTERNE, et
// `V77_SELFTEST=1` lui permet d'exercer les règles sans lancer le dépôt entier.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const violations = [];
let verifs = 0;
const check = (ok, regle, detail = '') => { verifs += 1; if (!ok) violations.push({ regle, detail }); };

const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
/** Le code SANS les commentaires — un mot cité dans une explication n'est pas un usage. */
const code = (p) => lire(p).split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
const json = (p) => { try { return JSON.parse(lire(p)); } catch { return null; } };

console.log('\n── Gate v77:check (Couverture de la pratique & unification des preuves)');

// ── A1. LES MODULES PURS DE V77 EXISTENT, ET SONT PURS ──────────────────
//
// « Pur » n'est pas une élégance : une décision qui ne peut être vérifiée qu'en
// lançant un serveur n'est vérifiée par personne (V76 · CP9).
const PURS = [
  ['lib/practice-model.mjs', 'la carte des surfaces'],
  ['lib/usage-event.mjs', 'l’usage observé'],
  ['lib/assessment-attempt.mjs', 'la soumission d’un diagnostic'],
  ['lib/mission-submission.mjs', 'le livrable rendu'],
  ['lib/artifact-analysis.mjs', 'l’artefact analysé'],
  ['lib/evidence-matrix.mjs', 'la matrice des preuves'],
  ['lib/exercise-declarations.mjs', 'la déclaration hors corpus'],
];
for (const [f, role] of PURS) {
  const src = lire(f);
  check(src.length > 0, `[A1] ${f} existe (${role})`);
  check(!/from '(node:fs|node:child_process|node:http|node:path)/.test(src), `[A1] ${f} reste PUR (aucune I/O)`);
}

// ── A2. LES QUATRE LISTES BLANCHES, EXÉCUTÉES ───────────────────────────
//
// Le défaut P7 a coûté deux fois, et le CP3 a trouvé une QUATRIÈME liste dans
// `lib/backup.mjs` — invisible depuis le store. On exécute donc la chaîne
// complète : écrire, sérialiser, relire, sauvegarder, restaurer.
{
  const store = await import('../lib/progress-store.mjs');
  const backup = await import('../lib/backup.mjs');
  const T = '2026-01-01T00:00:00.000Z';
  const FAITS = store.FAITS_DU_PRODUIT ?? [];
  check(FAITS.length >= 9, '[A2] les neuf faits du produit sont énumérés', `${FAITS.length}`);

  const plat = { ...store.emptyFlat() };
  for (const f of FAITS) check(Array.isArray(plat[f]), `[A2] le fait \`${f}\` existe dans l’état vide`);

  // Un exemplaire de chaque fait NOUVEAU de V77, poussé jusqu'au disque.
  plat.usageEvents = [{ at: T, surface: 'terminal', action: 'run', ref: 'g', provenance: { producer: 'gate' } }];
  plat.assessmentAttempts = [{ at: T, assessmentId: 'g', passed: 1, total: 2, provenance: { producer: 'gate' } }];
  plat.missionSubmissions = [{ at: T, missionId: 'g', deliverableId: 'd', mode: 'review', statut: 'validated', provenance: { producer: 'gate' } }];
  plat.artifactAnalyses = [{ at: T, surface: 'kubernetes', artifactId: 'g', artefactFourni: true, diagnostics: 1, provenance: { producer: 'gate' } }];

  const v3 = store.writeActiveTrack(store.migrateToV7({}), plat);
  const relu = store.activeTrackProgress(JSON.parse(JSON.stringify(v3)));
  for (const f of ['usageEvents', 'assessmentAttempts', 'missionSubmissions', 'artifactAnalyses']) {
    check(relu[f]?.length === 1, `[A2] \`${f}\` survit à l’écriture PUIS à la relecture`);
  }
  const restaure = backup.parseBackupV3(JSON.stringify(backup.serializeBackupV3(v3, {})), new Map());
  const t = restaure.ok ? restaure.v3.tracks[restaure.v3.activeTrackId] : {};
  for (const f of ['usageEvents', 'assessmentAttempts', 'missionSubmissions', 'artifactAnalyses']) {
    check(t[f]?.length === 1, `[A2] \`${f}\` survit à sa propre SAUVEGARDE (4ᵉ liste blanche)`);
  }
}

// ── A3. AUCUN FAIT D'USAGE NE PORTE UNE ISSUE ───────────────────────────
//
// Contrainte n°5 du contrat gelé. Si elle cède, l'événement d'usage devient un
// `TerminalAttempt` déguisé — exactement ce que le CP3 a refusé de construire.
{
  const u = await import('../lib/usage-event.mjs');
  const e = u.normalizeUsageEvent({
    surface: 'terminal', action: 'run', ref: 'g', provenance: { producer: 'gate' },
    detail: { adapter: 'local', exitCode: 0, passed: true, score: 100, allPassed: true },
  }, { now: '2026-01-01T00:00:00.000Z' });
  check(Boolean(e), '[A3] un usage bien formé est accepté');
  for (const champ of u.CHAMPS_INTERDITS) {
    check(!(champ in (e?.detail ?? {})) && !(champ in (e ?? {})), `[A3] un usage ne porte jamais « ${champ} »`);
  }
  check(u.usageDe([e], 'terminal').vautReussite === false, '[A3] un usage ne vaut JAMAIS une réussite');
}

// ── A4. UNE ANALYSE SANS ARTEFACT N'EST PAS UN TRAVAIL ──────────────────
//
// La garde la plus facile à perdre du CP7 : les quatre routes acceptent
// `analyze` sans artefact et analysent alors la FIXTURE du produit.
{
  const a = await import('../lib/artifact-analysis.mjs');
  const base = { surface: 'kubernetes', artifactId: 'g', diagnostics: 3, provenance: { producer: 'gate' } };
  const T = '2026-01-01T00:00:00.000Z';
  check(a.normalizeArtifactAnalysis({ ...base, artefactFourni: false }, { now: T }) === null,
    '[A4] sans artefact posté, AUCUN fait n’est écrit');
  check(a.normalizeArtifactAnalysis({ ...base }, { now: T }) === null,
    '[A4] `artefactFourni` absent vaut refus, pas défaut');
  const ok = a.normalizeArtifactAnalysis({ ...base, artefactFourni: true, diagnostics: 0 }, { now: T });
  check(ok?.niveau === 'OBSERVED', '[A4] le niveau est une CONSTANTE structurelle');
  for (const champ of a.CHAMPS_INTERDITS) check(!(champ in (ok ?? {})), `[A4] une analyse ne porte jamais « ${champ} »`);
  check(a.lectureDesAnalyses([ok], 'kubernetes', 'g').vautReussite === false,
    '[A4] `0 diagnostic` ne devient JAMAIS une réussite');
  const helper = code('lib/artifact-analysis-server.ts');
  check(/if\s*\(!artefactFourni\)\s*return;/.test(helper), '[A4] l’écriture partagée refuse avant d’appeler le moteur');
  for (const f of ['app/api/kubernetes/[id]/route.ts', 'app/api/cloud-lab/[id]/route.ts',
    'app/api/cloud-foundations/[id]/route.ts', 'app/api/security/[id]/route.ts']) {
    check(!code(f).includes('RECORD_ARTIFACT_ANALYSIS'),
      `[A4] ${f} appelle l’écriture PARTAGÉE, il ne la recopie pas`);
  }
}

// ── A5. LA MATRICE DES PREUVES NE SE CONTREDIT PAS ──────────────────────
//
// 192 lignes ne se relisent pas à l'œil. On vérifie les propriétés sur la table
// entière — la différence entre « on a regardé » et « on a vérifié ».
{
  const m = await import('../lib/evidence-matrix.mjs');
  const e = await import('../lib/evidence.mjs');
  const lignes = m.matriceDesPreuves();
  check(lignes.length === 192, '[A5] la matrice énumère 192 combinaisons', `${lignes.length}`);
  check(m.incoherencesDeLaMatrice(lignes).length === 0, '[A5] la matrice ne contient AUCUNE incohérence',
    m.incoherencesDeLaMatrice(lignes).join(' ; '));
  check(m.combinaisonsQualifiantes(lignes).length === 12, '[A5] 12 combinaisons qualifient, pas une de plus');

  // La décision du CP9, vérifiée sur la table plutôt que sur un exemple.
  for (const l of lignes) {
    if (l.qualifiesFor.competency && l.evidenceLevel !== 'VALIDATED') {
      check(false, '[A5] rien ne qualifie sans `VALIDATED`', `${l.sourceType}+${l.kind}+${l.status}`);
    }
  }
  check(e.niveauDePreuve('mission', { status: 'passed', kind: 'mission-deliverables' }) === 'DECLARED',
    '[A5] une mission ne dépasse jamais `DECLARED`');
  check(e.niveauDePreuve('capstone', { status: 'passed', kind: 'capstone-review' }) === 'OBSERVED',
    '[A5] une preuve héritée `capstone-review` n’est PAS remontée');
  check(e.niveauDePreuve('capstone', { status: 'passed', kind: 'capstone-grade' }) === 'VALIDATED',
    '[A5] un capstone corrigé par le serveur vaut `VALIDATED`');
}

// ── A6. UNE MISSION NE SE DÉCLARE PLUS RÉUSSIE ──────────────────────────
//
// Le CP0 a mesuré que 42 missions sur 42 terminent sur une revue auto-signée, et
// que le produit écrivait pourtant `passed`.
{
  const src = code('lib/mission-state.mjs');
  check(!/status:\s*'passed'/.test(src), '[A6] `recordMissionCompletion` n’écrit plus `passed`');
  check(/derivedFrom/.test(src), '[A6] la filiation vers l’exercice est écrite (CP10)');

  const ms = await import('../lib/mission-submission.mjs');
  const dir = join(ROOT, 'data', 'missions');
  const fichiers = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')) : [];
  check(fichiers.length === 42, '[A6] le corpus compte 42 missions', `${fichiers.length}`);
  let sansRevue = 0;
  for (const f of fichiers) {
    const mission = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    if (ms.maillonFaibleDeLaMission(mission) !== 'DECLARED') sansRevue += 1;
  }
  // Si ce compte cessait d'être zéro, le plafond `DECLARED` deviendrait trop
  // sévère pour certaines missions — et il faudrait le ROUVRIR, pas le subir.
  check(sansRevue === 0, '[A6] les 42 missions ont pour maillon faible une revue auto-signée', `${sansRevue} exception(s)`);
}

// ── A7. LES COMMANDES DE V77 EXISTENT, ET N'EXPOSENT AUCUNE ISSUE ───────
{
  const engine = await import('../lib/learning-engine.mjs');
  for (const c of ['RECORD_USAGE_EVENT', 'RECORD_ASSESSMENT_ATTEMPT', 'RECORD_MISSION_SUBMISSION', 'RECORD_ARTIFACT_ANALYSIS']) {
    check(engine.COMMANDS.includes(c), `[A7] la commande \`${c}\` existe`);
  }
  const d = lire('lib/learning-engine.d.ts');
  for (const [cmd, interdits] of [
    ["RECORD_USAGE_EVENT", ['passed', 'score', 'outcome']],
    ["RECORD_ARTIFACT_ANALYSIS", ['passed', 'score', 'outcome']],
  ]) {
    const i = d.indexOf(`type: '${cmd}'`);
    const bloc = i > 0 ? d.slice(i, i + 500) : '';
    check(i > 0, `[A7] le type de \`${cmd}\` est déclaré`);
    for (const x of interdits) {
      check(!new RegExp(`\\b${x}\\b\\s*[?:]`).test(bloc), `[A7] \`${cmd}\` n’expose pas « ${x} »`);
    }
  }
}

// ── A8. AUCUN MOTEUR NE LIT LES FAITS QUI NE LE CONCERNENT PAS ──────────
//
// Contrainte n°3 du contrat gelé pour l'usage ; pour les trois autres, les
// CP4→CP7 n'ont pas encore décidé ce qu'ils qualifient. Une dépendance, pas une
// convention de commentaire.
{
  for (const f of ['lib/competency.mjs', 'lib/retention.mjs', 'lib/recovery-mode.mjs']) {
    const src = lire(f);
    for (const champ of ['usageEvents', 'assessmentAttempts', 'missionSubmissions', 'artifactAnalyses']) {
      check(!src.includes(champ), `[A8] ${f} ne lit pas \`${champ}\``);
    }
  }
}

// ── A9. LES MESURES PUBLIÉES EXISTENT, ET DISENT CE QU'ELLES DISENT ─────
//
// Un document de sprint vieillit sans rougir. On rattache les chiffres au code.
{
  const cp8 = json('docs/v77/cp8-ambiguite.json');
  check(Boolean(cp8), '[A9] la mesure d’ambiguïté est publiée');
  if (cp8) {
    check(cp8.apres?.AMBIGUOUS === 125, '[A9] 125 exercices restent ambigus, et c’est déclaré');
    const resolus = (cp8.avant?.AMBIGUOUS ?? 0) - (cp8.apres?.AMBIGUOUS ?? 0);
    check(resolus <= (cp8.declarationsPresentes ?? 0),
      '[A9] aucune résolution SANS déclaration (sinon : heuristique)', `${resolus} résolu(s)`);
  }
  const cp10 = json('docs/v77/cp10-double-comptage.json');
  check(Boolean(cp10), '[A9] la mesure de double comptage est publiée');
  if (cp10) {
    check(cp10.doubleComptageAujourdhui === 0, '[A9] ZÉRO double comptage effectif', `${cp10.doubleComptageAujourdhui}`);
    check(cp10.pairesQuiChevauchent === 14, '[A9] 14 paires chevauchent une compétence (le « 14 » du CP0)');
  }
  const cp13 = json('docs/v77/cp13-e2e.json');
  check(cp13?.chaines?.length === 6, '[A9] les six chaînes E2E sont publiées');
}

// ── A10. AUCUN SCORE N'EST APPARU ───────────────────────────────────────
//
// L'interdit le plus large du brief, et le plus facile à enfreindre par
// commodité. On regarde les modules de V77, code seul.
{
  const INTERDITS = ['masteryScore', 'learningScore', 'employabilityScore', 'percentile', 'ranking', 'memoryProbability'];
  for (const [f] of PURS) {
    const src = code(f);
    for (const mot of INTERDITS) check(!src.includes(mot), `[A10] ${f} n’invente pas « ${mot} »`);
  }
  // Et la lecture d'un diagnostic ne juge pas.
  const aa = await import('../lib/assessment-attempt.mjs');
  const l = aa.lectureDuDiagnostic([], 'x');
  check(l.tentatives === 0 && /Aucune soumission observée/.test(l.lecture),
    '[A10] « aucune soumission » est une DONNÉE, pas un trou');
}

// ── A11. LE CONTRAT GELÉ ET LA CARTE SONT INTACTS ───────────────────────
{
  check(lire('docs/v77/V77-PRACTICE-OBSERVABILITY-CONTRACT-FROZEN.md').length > 2000,
    '[A11] le contrat gelé du CP1 est présent');
  const pm = await import('../lib/practice-model.mjs');
  check(pm.incoherences().length === 0, '[A11] la carte des surfaces ne se contredit pas', pm.incoherences().join(' ; '));
  check(pm.politiqueDe('terminal')?.politique === 'NO_FACT', '[A11] `terminal` reste `NO_FACT` dans la carte');
  check(pm.politiqueDe('pipelines')?.politique === 'NO_FACT', '[A11] `pipelines` reste `NO_FACT` dans la carte');
  check(pm.niveauMaximal('missions') === 'OBSERVED', '[A11] une mission ne peut pas dépasser `OBSERVED`');
}

// ── A12. LA PROGRESSION PERSONNELLE N'EST PAS DANS LE DÉPÔT ─────────────
check(!existsSync(join(ROOT, 'data', 'progress.json')), '[A12] `data/progress.json` est absent du dépôt');

// ── A13. AUTOTEST — LA PORTE SAIT-ELLE ROUGIR ? ─────────────────────────
//
// V76 · CP14 a mesuré que deux mutations de règles avaient SURVÉCU parce que je
// les vérifiais en lançant la porte elle-même : *une porte ne peut pas détecter
// sa propre neutralisation en se lançant.*
//
// Cette règle existe pour que le JUGE EXTERNE (`tests/v77-gate.test.mjs`) puisse
// lui imposer une violation et constater qu'elle sort non nulle, en nommant la
// règle qui a cédé. Sans elle, `if (false && violations.length)` passerait
// inaperçu et la porte serait parfaitement décorative.
check(process.env.V77_SELFTEST !== '1', '[A13] AUTOTEST — violation imposée par le juge externe');

// ── RÉSULTAT ────────────────────────────────────────────────────────────
console.log(`── v77:check — ${verifs} vérifications passées`);
if (violations.length) {
  console.log(`\n❌ v77:check : ${violations.length} régression(s)\n`);
  for (const v of violations) console.log(`  • ${v.regle}${v.detail ? ` — ${v.detail}` : ''}`);
  console.log('');
  process.exit(1);
}
console.log('\n✅ V77 · Couverture de la pratique : chaque surface a une politique explicite, '
  + 'aucun usage ne vaut une réussite, aucune analyse sans artefact, la matrice des preuves ne se '
  + 'contredit pas, une mission ne se déclare plus réussie, et aucun score n’est apparu.\n');
