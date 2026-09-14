// Gate v75:check — RÉCUPÉRATION ADAPTATIVE, CONTRÔLE DE L'ARRIÉRÉ, TÉLÉMÉTRIE.
//
// ── POURQUOI CETTE PORTE EXISTE ─────────────────────────────────────────
//
// Le CP14 a joué vingt-quatre mensonges plausibles contre la suite de tests :
// les vingt-quatre rougissent. Mais une suite de tests garde des COMPORTEMENTS,
// et V75 repose sur des **propriétés structurelles** qu'aucune assertion ne
// voit se dégrader :
//
//   · l'arriéré traverse la chaîne en TROIS nombres séparés — le jour où
//     quelqu'un ajoute un champ `backlog` unique, aucun test ne casse, et la
//     dette redevient masquable ;
//   · le mode de récupération n'est JAMAIS persisté — un état stocké survit à
//     la situation qui l'a produit, et rien ne le signalerait ;
//   · le store a DEUX listes blanches, écriture et lecture. Un champ absent de
//     l'une des deux est perdu **en silence** : c'est le défaut P7, qui a fait
//     disparaître `curriculumPause` du CP7 jusqu'au CP10 sans un seul test rouge.
//
// Cette porte garde exactement ce qui se dégrade sans casser. Elle ne duplique
// pas les tests, et elle ne juge aucun seuil.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const violations = [];
let verifs = 0;
const check = (ok, regle, detail = '') => { verifs += 1; if (!ok) violations.push({ regle, detail }); };

const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
/** Le code SANS les commentaires — un mot cité dans une explication n'est pas un usage. */
const code = (p) => lire(p).split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');

console.log('\n── Gate v75:check (Récupération adaptative & contrôle de l’arriéré)');

// ── A1. LES CINQ MOTEURS DE V75 EXISTENT ET SONT PURS ───────────────────
//
// « Pur » n'est pas une élégance : un moteur qui lit un fichier ne peut plus
// être rejoué à une date arbitraire, et toute la mesure du CP13 reposait sur
// ce rejeu.
const MOTEURS = [
  'lib/backlog-triage.mjs',
  'lib/recovery-mode.mjs',
  'lib/catchup-plan.mjs',
  'lib/plan-unifie.mjs',
  'lib/transfer-attempt.mjs',
  'lib/study-protocol.mjs',
];
for (const m of MOTEURS) {
  check(lire(m).length > 0, `[A1] le moteur ${m} existe`);
  check(!/from ['"]node:(fs|path|os|child_process)['"]/.test(lire(m)),
    `[A1] ${m} est PUR (aucune E/S)`);
  check(!/Math\.random/.test(code(m)), `[A1] ${m} est déterministe (aucun Math.random)`);
}

// ── A2. `I2` — L'ARRIÉRÉ RESTE TROIS NOMBRES, JAMAIS UN ─────────────────
//
// La barrière mécanique contre « cacher la dette ». Le triage publie `total`
// ET `placement` ; aucune couche n'a le droit de les fondre en un seul champ.
{
  const t = code('lib/backlog-triage.mjs');
  check(/total:\s*notions\.length/.test(t),
    '[A2] le total est le NOMBRE DE NOTIONS EN RETARD, pas une file plafonnée');
  check(/PLACEMENTS\s*=\s*Object\.freeze\(\['actif', 'differe', 'gare'\]\)/.test(t),
    '[A2] les trois placements sont déclarés en un seul endroit');
  const u = code('lib/plan-unifie.mjs');
  check(/arriere\.total/.test(u) && /arriere\.gare/.test(u),
    '[A2] le plan unifié consomme le total ET le garé, séparément');
  check(!/\bbacklog\s*[:=]\s*(?!\{)/.test(u),
    '[A2] aucun champ `backlog` agrégé unique dans le plan');
}

// ── A3. `PARKED` EXIGE UNE CONDITION DE RETOUR NOMMÉE ───────────────────
//
// Garer sans dire ce qui lèverait le garage, c'est supprimer sans le dire.
{
  const t = lire('lib/backlog-triage.mjs');
  const iParked = t.indexOf("classe: 'PARKED'");
  const iCond = t.indexOf('conditionDeRetour:', iParked);
  check(iParked > 0 && iCond > iParked && iCond - iParked < 300,
    '[A3] la classe `PARKED` porte sa condition de retour');
  check(/const soupape = notions\.length > 0/.test(code('lib/backlog-triage.mjs')),
    '[A3] la soupape existe : le garage ne peut pas tout absorber');
  check(lire('app/retention/BacklogPanel.tsx').includes('conditionDeRetour'),
    '[A3] la condition de retour est RENDUE, pas seulement calculée');
}

// ── A4. LE MODE DE RÉCUPÉRATION N'EST JAMAIS PERSISTÉ ───────────────────
//
// Le CP6 l'a décidé et le CP13 l'a rejoué 480 fois : le mode est recalculé,
// `E4` compris. Un mode stocké survivrait à la situation qui l'a produit.
{
  const store = code('lib/progress-store.mjs');
  const engine = code('lib/learning-engine.mjs');
  check(!/recoveryMode|modeRecuperation/.test(store),
    '[A4] aucun mode de récupération dans la progression');
  check(!/SET_RECOVERY_MODE/.test(engine),
    '[A4] aucune commande n’écrit un mode de récupération');
  check(/export function modeDe\(/.test(code('lib/recovery-mode.mjs')),
    '[A4] le mode est une FONCTION de la pression, pas un champ');
}

// ── A5. LE DÉFAUT P7 NE PEUT PAS SE REPRODUIRE ─────────────────────────
//
// `lib/progress-store.mjs` filtre les champs DEUX fois — à l'écriture
// (`flatOf`) et à la lecture (`activeTrackProgress`). Un champ présent dans une
// seule des deux listes est perdu sans qu'aucun test unitaire ne rougisse :
// c'est exactement ce qui est arrivé à `curriculumPause` entre le CP7 et le
// CP10. Cette règle vérifie les deux côtés, pour les deux champs de V75.
{
  const s = code('lib/progress-store.mjs');
  const iEcriture = s.indexOf('function flatOf');
  const iLecture = s.indexOf('function activeTrackProgress');
  check(iEcriture > 0 && iLecture > iEcriture, '[A5] les deux listes blanches existent');
  const ecriture = s.slice(iEcriture, iLecture);
  const lecture = s.slice(iLecture);
  for (const champ of ['transferAttempts', 'curriculumPause']) {
    check(ecriture.includes(champ), `[A5] \`${champ}\` est dans la liste blanche d’ÉCRITURE`);
    check(lecture.includes(champ), `[A5] \`${champ}\` est dans la liste blanche de LECTURE`);
  }
}

// ── A6. LE BUDGET DE LA JOURNÉE NE SE NÉGOCIE PAS ──────────────────────
//
// Le CP11 a trouvé le bug dans la contrainte même qu'il défendait : un bloc
// non borné faisait passer le total à 320 minutes sur un plafond de 300.
{
  const u = code('lib/plan-unifie.mjs');
  const bornes = (u.match(/Math\.min\(veut, restant\)/g) ?? []).length;
  check(bornes >= 2, '[A6] chaque bloc est borné par le budget restant', `${bornes} bornage(s)`);
  check(/nonPlacees/.test(u),
    '[A6] les minutes NON PLACÉES sont publiées, jamais effacées');
}

// ── A7. RECOMMANDER N'EST PAS VERROUILLER ──────────────────────────────
//
// En `CRITICAL`, le produit PROPOSE une pause. Seul l'apprenant la décide :
// aucun module de plan n'a le droit d'émettre la commande à sa place.
for (const f of ['lib/plan-unifie.mjs', 'lib/plan-unifie-server.ts', 'lib/recovery-mode.mjs', 'lib/recovery-server.ts']) {
  check(!/SET_CURRICULUM_PAUSE/.test(code(f)),
    `[A7] ${f} n’émet PAS la pause à la place de l’apprenant`);
}
check(/recommande-pause/.test(code('lib/plan-unifie.mjs')),
  '[A7] le statut « recommandé » existe et reste distinct de « suspendu »');

// ── A8. AUCUN SCORE DE MÉMOIRE, AUCUN CLASSEMENT ───────────────────────
//
// Règle §3 : ne jamais fabriquer un score de mémoire, une maîtrise ou une
// probabilité d'oubli. Vérifié sur le CODE des moteurs et sur les surfaces.
const INTERDITS = /scoreMemoire|memoryScore|probabiliteOubli|forgettingProbability|masteryScore|percentile|classement/i;
for (const f of [...MOTEURS, 'app/retention/page.tsx', 'app/day/[id]/DayPlanUnifie.tsx']) {
  const c = code(f);
  // `study-protocol.mjs` NOMME ce qu'il refuse de collecter : c'est une
  // déclaration, pas un usage. On retire le bloc `NON_COLLECTE` avant de lire.
  const sansDeclaration = c.replace(/export const NON_COLLECTE[\s\S]*?\]\);/, '');
  check(!INTERDITS.test(sansDeclaration), `[A8] ${f} ne fabrique aucun score ni classement`);
}
check(/aucune comparaison entre apprenants, aucun percentile, aucun classement/.test(lire('lib/study-protocol.mjs')),
  '[A8] le refus de comparer les apprenants est DÉCLARÉ et lisible');

// ── A9. LE TRANSFERT EST UN FAIT, PAS UNE MAÎTRISE ─────────────────────
{
  const ta = code('lib/transfer-attempt.mjs');
  check(/export function outcomeDuTransfert/.test(ta),
    '[A9] l’issue d’un transfert est DÉRIVÉE, jamais fournie par l’appelant');
  check(/dedupSorted/.test(ta),
    '[A9] les tentatives sont ordonnées et dédupliquées à la lecture');
  const lm = code('lib/learner-memory.mjs');
  check(/transfersEchoues/.test(lm),
    '[A9] un transfert ÉCHOUÉ est compté, pas seulement les réussites');
  check(/c\.outcome === 'recalled'/.test(lm),
    '[A9] seule une tentative RÉUSSIE compte comme défi réussi');
}

// ── A10. L'ÉTUDE HUMAINE RESTE NON MENÉE, ET LE DIT ────────────────────
//
// Le CP12 instrumente un protocole ; il n'en exécute aucun. Le jour où une
// surface déduirait une conclusion d'une session d'étude, ce serait une
// affirmation d'apprentissage sans donnée.
{
  const sp = lire('lib/study-protocol.mjs');
  check(/conclusionPossible:\s*false/.test(sp),
    '[A10] `conclusionPossible` vaut `false` en permanence');
  check(!/conclusionPossible:\s*(true|etat|[a-z]+ &&)/.test(sp),
    '[A10] aucune branche ne rend `conclusionPossible` vrai');
  check(/NOT YET MEASURED/.test(lire('docs/v75/V75-HUMAN-LEARNING-PROTOCOL.md')),
    '[A10] `REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED` reste écrit');
}

// ── A11. LES MOTEURS SONT RÉELLEMENT BRANCHÉS AU PRODUIT ───────────────
//
// L'équivalent V75 du critère B12 de V74. Un moteur non branché est du code
// mort qui rassure : le CP11 existe précisément parce que toute la récupération
// vivait sur `/retention` et que la page d'une journée n'en savait rien.
check(lire('app/day/[id]/page.tsx').includes('getPlanUnifie'),
  '[A11] le plan unifié est branché sur la page d’une JOURNÉE');
check(lire('app/retention/page.tsx').includes('getVueArriere'),
  '[A11] le tri de l’arriéré est branché sur `/retention`');
check(lire('app/retention/page.tsx').includes('getVueRecuperation'),
  '[A11] le mode de récupération est branché sur `/retention`');

// ── A12. `data/progress.json` N'EXISTE PAS ─────────────────────────────
check(!existsSync(join(ROOT, 'data', 'progress.json')),
  '[A12] `data/progress.json` n’existe pas dans le dépôt');

// ─────────────────────────────────────────────────────────────────────────
console.log(`── v75:check — ${verifs} vérifications passées`);
if (violations.length) {
  console.log(`\n❌ v75:check : ${violations.length} régression(s)\n`);
  for (const v of violations) console.log(`  • ${v.regle}${v.detail ? ` — ${v.detail}` : ''}`);
  process.exit(1);
}
console.log('\n✅ V75 · Récupération adaptative : arriéré en trois nombres séparés, garage toujours justifié, mode jamais persisté, deux listes blanches tenues, budget non négociable, pause recommandée jamais imposée, aucun score de mémoire, étude non menée et déclarée telle.');
