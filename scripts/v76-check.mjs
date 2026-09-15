// Gate v76:check — ATELIER DE PRATIQUE : ISOLATION, ANTI-FUITE, FAITS.
//
// ── POURQUOI CETTE PORTE EXISTE ─────────────────────────────────────────
//
// Le CP14 joue plus de trente mensonges plausibles contre la suite de tests et
// les sondes : tous rougissent. Mais une suite de tests garde des
// COMPORTEMENTS, et V76 repose sur des **propriétés structurelles** qu'aucune
// assertion ne voit se dégrader :
//
//   · **l'exécution ne doit jamais repartir vers l'hôte.** Le CP0 a trouvé
//     TROIS points de spawn dans `workspace-fs.mjs` ; en oublier un rouvrirait
//     les cinq évasions sur tout un runtime, et aucun test unitaire ne le
//     verrait — le code marche, il n'isole simplement plus ;
//   · **`SEC3` est PARTIEL en Python.** Le jour où quelqu'un écrit `total` sans
//     mesure, le produit ment sur sa sécurité et rien ne casse ;
//   · **le registre des preuves ne doit pas redoubler.** Le double comptage du
//     CP11 a vécu un sprint entier DANS UN COMMENTAIRE, sans qu'un seul test
//     rougisse ;
//   · **la vue publique d'un défi de transfert ne doit pas revenir en arrière.**
//     Le repli hors ligne, supprimé au CP8, était la fuite elle-même.
//
// Cette porte garde exactement ce qui se dégrade sans casser. Elle ne duplique
// pas les tests, et elle ne juge aucun seuil de qualité pédagogique.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const violations = [];
let verifs = 0;
const check = (ok, regle, detail = '') => { verifs += 1; if (!ok) violations.push({ regle, detail }); };

const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
/** Le code SANS les commentaires — un mot cité dans une explication n'est pas un usage. */
const code = (p) => lire(p).split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');

console.log('\n── Gate v76:check (Atelier de pratique & IDE intégré)');

// ── B1. LES MODULES PURS DE V76 EXISTENT, ET SONT PURS ──────────────────
//
// « Pur » n'est pas une élégance. Le CP9 a payé pour l'apprendre : trois
// mutations ont survécu parce que la décision vivait dans une route TypeScript
// qu'aucun test ne peut exécuter. Une décision qu'on ne peut vérifier qu'en
// lançant un serveur n'est vérifiée par personne.
const PURS = [
  ['lib/sandbox.mjs', 'la frontière d’exécution'],
  ['lib/diagnostic.mjs', 'le symptôme observé'],
  ['lib/hint-view.mjs', 'l’aide consultée'],
  ['lib/workspace-conflit.mjs', 'la lecture d’un refus de sauvegarde'],
  ['lib/attempt-journal.mjs', 'le journal d’une tentative'],
  ['lib/attempt-diff.mjs', 'la comparaison de deux tentatives'],
];
for (const [f, role] of PURS) {
  const src = lire(f);
  check(src.length > 0, `[B1] ${f} existe (${role})`);
  check(!/from '(node:fs|node:child_process|node:http)/.test(src),
    `[B1] ${f} reste PUR (aucune I/O)`);
}
// `workspace-conflit.mjs` est chargé par un composant CLIENT : il ne doit
// importer AUCUN module Node, pas même `node:path`.
check(!/from 'node:/.test(lire('lib/workspace-conflit.mjs')),
  '[B1] `workspace-conflit.mjs` n’importe aucun module Node (composant client)');

// ── B2. TOUTE EXÉCUTION PASSE PAR LA FRONTIÈRE ──────────────────────────
//
// Le CP0 a trouvé trois points de spawn. Le CP5 les a tous fait passer par
// `execIsole`. Un quatrième ajouté plus tard, ou un repli direct, rouvrirait
// les évasions sans casser un seul test.
//
// ── LE TROU QUE LE SCRIPT NÉGATIF A TROUVÉ DANS CETTE RÈGLE ──
//
// La première version comptait les `execIsole(` et exigeait `>= 3`. Or le
// fichier en contient QUATRE : la définition de la fonction, plus trois appels.
// Neutraliser un appel en laissait trois — et la règle restait verte pendant
// qu'un runtime entier repassait par un spawn direct. *Un seuil calculé sur un
// total qui inclut la définition ne mesure pas ce qu'il croit mesurer.*
//
// On compte donc les APPELS (`await execIsole(`), et on exige que `execFileP`
// n'apparaisse qu'à l'intérieur de `execIsole`.
{
  const fs_ = code('lib/workspace-fs.mjs');
  const appels = (fs_.match(/await execIsole\(\{/g) ?? []).length;
  check(appels === 3, '[B2] les TROIS points d’exécution passent par `execIsole`', `${appels} appel(s)`);
  // `execFileP` : une définition, un usage — et cet usage est dans `execIsole`.
  const iFrontiere = fs_.indexOf('async function execIsole(');
  const iFin = fs_.indexOf('\n}', fs_.indexOf('return execFileP(', iFrontiere));
  const usages = [...fs_.matchAll(/execFileP\(/g)].map((m) => m.index);
  check(usages.length === 1, '[B2] `execFileP` n’est appelé qu’une seule fois', `${usages.length} appel(s)`);
  check(usages.every((i) => i > iFrontiere && i < iFin),
    '[B2] le seul spawn direct vit À L’INTÉRIEUR de la frontière');
}

// ── B3. AUCUN REPLI VERS L'HÔTE ─────────────────────────────────────────
//
// Le contrat gelé du CP1 : « Docker indisponible ⇒ runtime déclaré
// indisponible, jamais de repli silencieux. » Le mode `HOTE` existe dans
// `lib/sandbox.mjs` **pour être refusé**.
//
// On IMPORTE le module plutôt que de lire son texte : une expression régulière
// sur `Object.freeze({…})` se serait cassée au premier retour à la ligne, et
// surtout elle n'aurait prouvé que la présence d'une chaîne. Ici, ce sont les
// VALEURS que le produit utilise qui sont vérifiées.
const sandbox = await import(new URL('../lib/sandbox.mjs', import.meta.url).href);
{
  const sb = lire('lib/sandbox.mjs');
  check(JSON.stringify(sandbox.MODES) === JSON.stringify(['PERMISSION_NET', 'NAMESPACE_CHROOT', 'HOTE']),
    '[B3] le vocabulaire des modes reste fermé', JSON.stringify(sandbox.MODES));
  check(/Aucun repli vers l’hôte n’est autorisé/.test(sb),
    '[B3] `ligneDeCommande` refuse explicitement tout mode non isolé');
  // Le mode `HOTE` existe POUR ÊTRE REFUSÉ : il ne doit rien prétendre tenir.
  const hote = sandbox.CONTENU_PAR_MODE.HOTE ?? {};
  check(sandbox.INTERDITS.every((i) => hote[i] === 'aucun'),
    '[B3] le mode `HOTE` ne prétend tenir aucun des cinq interdits');
  // Et il est effectivement refusé à l'exécution, pas seulement en commentaire.
  let refuse = false;
  try { sandbox.ligneDeCommande({ mode: 'HOTE', binaire: '/bin/true', argsRuntime: [], dir: '/tmp' }); }
  catch { refuse = true; }
  check(refuse, '[B3] `ligneDeCommande` JETTE sur le mode `HOTE`');
  // Chacun des six runtimes exige un mode ISOLÉ, nommément.
  for (const rt of ['node-js', 'typescript', 'react-tsx', 'web', 'python3', 'python-ds']) {
    check(['PERMISSION_NET', 'NAMESPACE_CHROOT'].includes(sandbox.MODE_REQUIS[rt]),
      `[B3] le runtime \`${rt}\` exige une frontière isolée`, String(sandbox.MODE_REQUIS[rt]));
  }
}

// ── B4. `SEC3` RESTE PARTIEL EN PYTHON, ET LE DIT ───────────────────────
//
// La règle du brief, mot pour mot : « Si certains runtimes ne peuvent pas être
// sandboxés correctement : NE PAS prétendre qu'ils le sont. » Passer cette
// valeur à `total` sans mesure serait le mensonge le plus grave du sprint.
{
  const nc = sandbox.CONTENU_PAR_MODE.NAMESPACE_CHROOT ?? {};
  check(nc.SEC3 === 'partiel', '[B4] `SEC3` vaut `partiel` en `NAMESPACE_CHROOT`', String(nc.SEC3));
  check(['SEC1', 'SEC2', 'SEC4', 'SEC5'].every((i) => nc[i] === 'total'),
    '[B4] les quatre autres interdits restent `total` — la limite est ciblée, pas générale');
  check(typeof nc.note === 'string' && /partiel/.test(nc.note),
    '[B4] la limite est EXPLIQUÉE dans le code, pas seulement chiffrée');
  // Et le mode `PERMISSION_NET`, lui, tient les cinq : la limite est propre à
  // Python, elle ne doit pas se propager par mégarde.
  const pn = sandbox.CONTENU_PAR_MODE.PERMISSION_NET ?? {};
  check(sandbox.INTERDITS.every((i) => pn[i] === 'total'),
    '[B4] `PERMISSION_NET` tient les CINQ interdits — la limite Python ne se propage pas');
}

// ── B5. L'ANTI-FUITE DES DÉFIS DE TRANSFERT NE REVIENT PAS EN ARRIÈRE ───
{
  const tc = lire('lib/transfer-challenge.mjs');
  check(/export function vuePubliqueDuDefi/.test(tc), '[B5] la vue publique existe');
  const page = lire('app/transfer/[id]/page.tsx');
  check(/vuePubliqueDuDefi\(/.test(page) && !/challenge=\{challenge\}/.test(page),
    '[B5] la page ne passe jamais le défi complet au composant client');
  const runner = lire('app/transfer/[id]/ChallengeRunner.tsx');
  check(!/gradeTransferChallenge/.test(runner),
    '[B5] le client ne corrige plus lui-même — un client qui se corrige détient le corrigé');
  check(/Omit<AssessmentQuestion, 'answer' \| 'explanation'>/.test(lire('lib/transfer-challenge.d.ts')),
    '[B5] le TYPE public exclut explicitement `answer` et `explanation`');
}

// ── B6. UNE RÉUSSITE N'ÉCRIT QU'UNE PREUVE ──────────────────────────────
//
// Le défaut du CP11 : `evidenceId` servait à la fois d'identifiant de preuve de
// JOURNÉE et de `sourceId` de preuve CANONIQUE, sous deux conventions de nommage
// différentes. Le jour où `canonicalSourceId` disparaît, le double comptage
// revient — et il avait déjà vécu un sprint entier sans qu'un test rougisse.
{
  const route = lire('app/api/lab/[exerciseId]/route.ts');
  check(/canonicalSourceId:\s*ex\.id/.test(route),
    '[B6] la route nomme le FAIT séparément de la preuve de journée');
  check(/evidenceId:\s*`lab-\$\{ex\.id\}`/.test(route),
    '[B6] la preuve de JOURNÉE garde son identifiant `lab-<id>`');
  check(/validId\(cmd\.canonicalSourceId, 64\) \?\? cmd\.evidenceId/.test(lire('lib/learning-engine.mjs')),
    '[B6] le moteur lit `canonicalSourceId`, avec repli compatible');
  check(/export function fusionnerPreuvesDeLaboratoire/.test(lire('lib/evidence.mjs')),
    '[B6] les registres déjà écrits sont réparés à la lecture');
}

// ── B7. LES FAITS NE SE PERDENT PAS DANS UNE LISTE BLANCHE ──────────────
//
// Le défaut P7 de V75 : `curriculumPause` absent d'une des deux listes du store
// a disparu en silence pendant trois checkpoints. `hintViews`, ajouté au CP7,
// court exactement le même risque.
//
// ── LE SECOND TROU TROUVÉ PAR LE SCRIPT NÉGATIF ──
//
// La première version comptait les occurrences de `hintViews` dans le fichier
// et exigeait `>= 3`. Il y en a cinq ; en supprimer une de la liste de LECTURE
// en laissait trois, et la règle restait verte — c'est-à-dire précisément le
// défaut P7 qu'elle prétend garder. *Compter des occurrences dans un fichier ne
// dit rien de l'endroit où elles se trouvent.*
//
// On regarde donc CHAQUE liste blanche séparément, par son corps de fonction.
{
  const store = lire('lib/progress-store.mjs');
  const corps = (nom) => {
    const i = store.indexOf(`function ${nom}(`);
    if (i < 0) return '';
    const j = store.indexOf('\n}', i);
    return store.slice(i, j > i ? j : store.length);
  };
  for (const [fn, sens] of [['flatOf', 'écriture'], ['activeTrackProgress', 'lecture'], ['emptyFlat', 'état vide']]) {
    const b = corps(fn);
    check(b.length > 0, `[B7] la fonction \`${fn}\` existe`);
    check(/hintViews/.test(b), `[B7] \`hintViews\` traverse la liste blanche de ${sens} (\`${fn}\`)`);
  }
  check(/'RECORD_HINT_VIEW'/.test(lire('lib/learning-engine.mjs')),
    '[B7] la commande `RECORD_HINT_VIEW` existe dans le vocabulaire du moteur');
}

// ── B8. AUCUN `RESET` N'EFFACE UN FAIT ──────────────────────────────────
//
// Contrat gelé §1.11. Effacer l'histoire d'un échec est le contournement `R4`
// de V75, et le journal du CP10 vit hors de l'espace de travail pour cette
// raison précise.
{
  const route = lire('app/api/lab/[exerciseId]/route.ts');
  for (const action of ["action === 'reset'", "action === 'reset-file'"]) {
    const i = route.indexOf(action);
    check(i > 0, `[B8] la branche \`${action}\` existe`);
    const bloc = route.slice(i, i + 400);
    for (const interdit of ['writeProgress', 'applyCommand', 'consigner', 'journal']) {
      check(!bloc.includes(interdit), `[B8] \`${action}\` ne touche pas à « ${interdit} »`);
    }
  }
  check(!route.includes("'reset-exercise'"), '[B8] `RESET_EXERCISE` n’a pas été créé');
  const srv = lire('lib/attempt-journal-server.ts');
  const racine = srv.match(/^const ROOT = .*$/m)?.[0] ?? '';
  check(/lab-journals/.test(racine) && !/lab-workspaces/.test(racine),
    '[B8] le journal vit HORS de l’espace de travail qu’un `RESET` efface');
}

// ── B9. LE JOURNAL NE DEVIENT PAS UNE FUITE ─────────────────────────────
//
// Archiver les résultats complets ou les fichiers cachés contournerait
// l'anti-fuite par la porte d'une fonctionnalité de confort — et un
// contournement qui passe par du confort est celui qu'on ne voit pas venir.
{
  const route = lire('app/api/lab/[exerciseId]/route.ts');
  const i = route.indexOf('consigner(ex.id');
  check(i > 0, '[B9] la route consigne bien chaque tentative');
  const bloc = route.slice(i, i + 900);
  check(/resultats:\s*publicResults/.test(bloc), '[B9] le journal ne reçoit que les résultats PUBLICS');
  check(/editables\.has\(p\)/.test(bloc), '[B9] le journal ne conserve que les fichiers ÉDITABLES');
  const j = lire('lib/attempt-journal.mjs');
  check(!/expected|received/.test(j.split('\n').filter((l) => !/^\s*(\/\/|\*)/.test(l)).join('\n')),
    '[B9] une entrée de journal ne retient ni attendu ni reçu');
}

// ── B10. LA SURFACE NE SE CORRIGE JAMAIS SEULE ──────────────────────────
//
// Deux applications de la même règle : le client ne détient pas le corrigé, et
// il ne décide pas à la place de l'apprenant sur un conflit d'écriture.
{
  const ui = code('app/lab/[exerciseId]/LabWorkspace.tsx');
  check(/lectureDuRefus\(/.test(ui), '[B10] le refus de sauvegarde est lu par une fonction pure');
  check(!/forceSave|ecraserQuandMeme|overwrite:\s*true/i.test(ui),
    '[B10] la surface ne propose jamais de forcer l’écrasement');
  check(/className="wb-conflit" role="alert"/.test(lire('app/lab/[exerciseId]/LabWorkspace.tsx')),
    '[B10] le conflit est annoncé comme une alerte');
}

// ── B11. LE DIAGNOSTIC DÉCRIT, IL NE DONNE PAS LA RÉPONSE ───────────────
//
// L'anomalie n° 5 du CP6 : une classe nommée `BORNE` affirmait une
// interprétation que le résultat de test ne soutenait pas. Le vocabulaire est
// fermé, et il le reste.
{
  const d = lire('lib/diagnostic.mjs');
  check(/CLASSES = Object\.freeze\(\[/.test(d), '[B11] le vocabulaire du diagnostic est fermé');
  check(/'INDETERMINE'/.test(d), '[B11] la classe `INDETERMINE` existe — le produit sait dire « je ne sais pas »');
  for (const mot of ['BORNE', 'LIMITE', 'COMPARAISON']) {
    check(!new RegExp(`'${mot}'`).test(d), `[B11] la classe « ${mot} » n’est pas réintroduite`);
  }
}

// ── B12. L'AIDE NE DEVIENT PAS UNE NOTE ─────────────────────────────────
//
// Contrat §1.12 : « la réussite après une aide lourde reste une réussite ; sa
// provenance doit le montrer ». En faire un score serait le « score fabriqué »
// que V75 avait interdit.
{
  const hv = lire('lib/hint-view.mjs');
  check(/reussite:\s*true/.test(hv), '[B12] `provenanceDeLaReussite` rend toujours `reussite: true`');
  check(!/penalite|score|note:|malus/i.test(code('lib/hint-view.mjs')),
    '[B12] aucune pénalité ni score dans la provenance');
}

// ── B13. LES CAPACITÉS NON CONSTRUITES LE RESTENT ───────────────────────
//
// `G13` : ne pas construire d'atelier SQL ou HTTP alors que le corpus n'en
// contient AUCUN exercice. Le jour où le corpus en contiendra, ce sera une
// décision de curriculum, pas une envie d'ingénierie.
{
  const exercices = readdirSync(join(ROOT, 'data/exercises')).filter((f) => f.endsWith('.json'));
  check(exercices.length === 376, '[B13] le corpus compte toujours 376 exercices', `${exercices.length}`);
  const runtimes = new Set();
  for (const f of exercices) {
    try { runtimes.add(JSON.parse(readFileSync(join(ROOT, 'data/exercises', f), 'utf8')).runtime); } catch { /* ignoré */ }
  }
  check(!runtimes.has('sql') && !runtimes.has('http'),
    '[B13] aucun runtime SQL ni HTTP n’a été inventé', [...runtimes].sort().join(' '));
  // Et aucun identifiant ne commence par `lab-` : la fusion du CP11 en dépend.
  check(exercices.every((f) => !f.startsWith('lab-')),
    '[B13] aucun exercice ne porte un identifiant commençant par `lab-`');
}

// ── B14. LES LIMITES DÉCLARÉES RESTENT ÉCRITES ──────────────────────────
//
// Une limite qu'on cesse d'écrire devient une limite qu'on cesse de connaître.
check(/SEC3.*partiel|partiel.*SEC3/s.test(lire('docs/v76/V76-STATE.md')),
  '[B14] la limite `SEC3` partiel reste écrite dans l’état du sprint');
check(existsSync(join(ROOT, 'docs/v76/V76-WORKBENCH-CONTRACT-FROZEN.md')),
  '[B14] le contrat gelé du CP1 est toujours présent');
check(existsSync(join(ROOT, 'docs/v76/V76-THREAT-MODEL.md')),
  '[B14] le modèle de menace est toujours présent');

// ── B15. `data/progress.json` N'EXISTE PAS ──────────────────────────────
check(!existsSync(join(ROOT, 'data', 'progress.json')),
  '[B15] `data/progress.json` n’existe pas dans le dépôt');
check(/^data\/lab-journals\/$/m.test(lire('.gitignore')),
  '[B15] `data/lab-journals/` est ignoré par git');

// ── B16. LA PORTE PEUT ÉCHOUER ──────────────────────────────────────────
//
// ── POURQUOI CE CROCHET EXISTE ──────────────────────────────────────────
//
// Le brief l'exige : « TESTER LA PORTE V76 ELLE-MÊME PAR MUTATION ». Le CP14
// l'a fait, et le résultat mérite d'être écrit : **une porte ne peut pas
// détecter sa propre neutralisation en se lançant elle-même**. Remplacer
// `if (violations.length)` par `if (false && violations.length)` rend la porte
// verte quoi qu'il arrive, et elle s'en déclare satisfaite.
//
// Il faut donc un juge EXTÉRIEUR. `V76_SELFTEST=1` injecte une violation dont
// on sait qu'elle est fausse : la porte DOIT alors sortir en erreur et la
// nommer. `tests/v76-gate.test.mjs` s'en sert, et c'est lui qui tue les
// mutations de la machinerie de rapport.
//
// Ce crochet ne relâche aucune règle : il en ajoute une, et seulement quand on
// le demande explicitement.
if (process.env.V76_SELFTEST === '1') {
  check(false, '[B16] AUTOTEST — violation injectée volontairement',
    'si cette ligne n’apparaît pas, la porte est incapable de signaler quoi que ce soit');
}

// ─────────────────────────────────────────────────────────────────────────
console.log(`── v76:check — ${verifs} vérifications passées`);
if (violations.length) {
  console.log(`\n❌ v76:check : ${violations.length} régression(s)\n`);
  for (const v of violations) console.log(`  • ${v.regle}${v.detail ? ` — ${v.detail}` : ''}`);
  process.exit(1);
}
console.log('\n✅ V76 · Atelier de pratique : toute exécution isolée, aucun repli vers l’hôte, `SEC3` partiel déclaré tel quel, corrigés jamais servis, une réussite = une preuve, aucun `RESET` n’efface un fait, l’aide décrit sans noter.');
