// V76 · CP5 — LA FRONTIÈRE D'EXÉCUTION.
//
// ── CE QUE CES TESTS GARDENT ────────────────────────────────────────────
//
// Le CP0 a mesuré cinq évasions contre le produit en marche (`T12`–`T16`), et
// le contrat gelé les a transformées en cinq interdits absolus (`SEC1`–`SEC5`).
// Les sondes de `scripts/v76/cp0-security.mjs` vérifient le RÉSULTAT sur un
// serveur lancé ; ces tests-ci gardent la DÉCISION, qui se teste sans processus.
//
// La distinction compte : une sonde d'attaque prouve qu'aujourd'hui ça tient ;
// un test de décision empêche que demain quelqu'un rouvre la porte en pensant
// simplifier.
//
// ── LA PROPRIÉTÉ LA PLUS IMPORTANTE ─────────────────────────────────────
//
// Contrat §3.4 : **aucun repli silencieux vers l'hôte**. Un produit qui, faute
// de frontière, exécuterait quand même le code serait pire qu'avant : il aurait
// en plus la prétention d'être protégé.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  INTERDITS, MODES, MODE_REQUIS, CONTENU_PAR_MODE,
  choisirFrontiere, ligneDeCommande, messageIndisponible, tient,
} from '../lib/sandbox.mjs';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
const TOUT_DISPO = { permission: true, netns: true, chroot: true };

// ── 1 · AUCUN REPLI VERS L'HÔTE, JAMAIS ─────────────────────────────────

test('V76 · CP5 — sans frontière, le runtime est REFUSÉ, pas exécuté', () => {
  for (const [runtime, mode] of Object.entries(MODE_REQUIS)) {
    // On retire, une par une, chaque capacité dont ce runtime dépend.
    const capacites = mode === 'PERMISSION_NET' ? ['permission', 'netns'] : ['netns', 'chroot'];
    for (const manquante of capacites) {
      const d = choisirFrontiere(runtime, { ...TOUT_DISPO, [manquante]: false });
      assert.equal(d.ok, false, `${runtime} accepté sans « ${manquante} »`);
      assert.equal(d.mode, null, `${runtime} a reçu un mode malgré « ${manquante} » manquante`);
      assert.ok(d.raison.length > 10, `${runtime} refusé sans raison lisible`);
    }
  }
});

test('V76 · CP5 — construire une ligne de commande en mode `HOTE` LÈVE', () => {
  // `HOTE` existe comme valeur nommée et REFUSÉE. S'il devenait constructible,
  // il deviendrait un repli — et le repli est exactement l'interdit du §3.4.
  assert.throws(
    () => ligneDeCommande({ mode: 'HOTE', binaire: '/usr/bin/node', dir: '/tmp/x' }),
    /refusé|repli/i,
  );
  assert.equal(CONTENU_PAR_MODE.HOTE.SEC1, 'aucun');
  for (const i of INTERDITS) assert.equal(tient('HOTE', i), false, `HOTE prétend tenir ${i}`);
});

test('V76 · CP5 — un runtime inconnu n’obtient aucune frontière par défaut', () => {
  const d = choisirFrontiere('bash-libre', TOUT_DISPO);
  assert.equal(d.ok, false);
  assert.match(d.raison, /inconnu/);
});

// ── 2 · CHAQUE RUNTIME REÇOIT UNE FRONTIÈRE RÉELLE ──────────────────────

test('V76 · CP5 — les six runtimes du corpus ont chacun un mode déclaré', () => {
  for (const rt of ['node-js', 'typescript', 'react-tsx', 'web', 'python3', 'python-ds']) {
    assert.ok(MODE_REQUIS[rt], `aucun mode pour ${rt}`);
    const d = choisirFrontiere(rt, TOUT_DISPO);
    assert.equal(d.ok, true, `${rt} refusé alors que tout est disponible`);
    assert.ok(MODES.includes(d.mode));
  }
});

test('V76 · CP5 — ce que chaque mode contient est DÉCLARÉ, interdit par interdit', () => {
  for (const mode of ['PERMISSION_NET', 'NAMESPACE_CHROOT']) {
    for (const i of INTERDITS) {
      const v = CONTENU_PAR_MODE[mode][i];
      assert.ok(['total', 'partiel', 'aucun'].includes(v), `${mode}.${i} = ${v}`);
    }
    assert.ok(CONTENU_PAR_MODE[mode].mecanisme?.length > 10, `${mode} sans mécanisme nommé`);
  }
  // Le seul interdit non totalement tenu DOIT porter sa note explicative.
  assert.equal(CONTENU_PAR_MODE.NAMESPACE_CHROOT.SEC3, 'partiel');
  assert.match(CONTENU_PAR_MODE.NAMESPACE_CHROOT.note, /confiné|même racine/i);
});

test('V76 · CP5 — aucun mode ne PRÉTEND tenir ce qu’il ne tient pas', () => {
  // Le contournement le plus tentant du CP5 : écrire « total » partout.
  // Ce test exige que la seule valeur non totale soit celle qu'on sait vraie.
  const partiels = [];
  for (const mode of ['PERMISSION_NET', 'NAMESPACE_CHROOT']) {
    for (const i of INTERDITS) if (CONTENU_PAR_MODE[mode][i] !== 'total') partiels.push(`${mode}.${i}`);
  }
  assert.deepEqual(partiels, ['NAMESPACE_CHROOT.SEC3'],
    'la déclaration de contenu a changé : vérifier qu’elle correspond à une mesure, pas à un souhait');
});

// ── 3 · LA LIGNE DE COMMANDE NE PASSE PAS PAR UN SHELL ──────────────────

test('V76 · CP5 — les chemins voyagent en `argv`, jamais dans une chaîne', () => {
  const dir = '/tmp/ws avec espace';
  for (const mode of ['PERMISSION_NET', 'NAMESPACE_CHROOT']) {
    const { file, args } = ligneDeCommande({
      mode, binaire: '/usr/bin/x', argsRuntime: ['h.mjs'], dir,
      aide: '/a/aide.sh', racine: '/tmp/r', lectures: ['/l'],
    });
    assert.equal(typeof file, 'string');
    assert.ok(Array.isArray(args) && args.every((a) => typeof a === 'string'));
    // Le chemin à espace doit apparaître comme UN argument entier.
    assert.ok(args.some((a) => a === dir || a.endsWith(dir)), `${mode} : le dossier n’est pas un argument propre`);
    // Aucun argument ne doit contenir un opérateur de shell.
    for (const a of args) assert.doesNotMatch(a, /[;&|`$(){}]/, `${mode} : argument suspect « ${a} »`);
  }
});

test('V76 · CP5 — le mode Node borne l’ÉCRITURE au seul espace de travail', () => {
  const { args } = ligneDeCommande({
    mode: 'PERMISSION_NET', binaire: '/usr/bin/node', argsRuntime: ['h.mjs'],
    dir: '/tmp/ws', lectures: ['/repo/node_modules', '/opt/node/bin'],
  });
  const ecritures = args.filter((a) => a.startsWith('--allow-fs-write='));
  assert.deepEqual(ecritures, ['--allow-fs-write=/tmp/ws'],
    'l’écriture doit rester bornée à l’espace de travail : SEC2 n’admet aucune exception');
  // Les lectures supplémentaires sont permises, mais seulement celles fournies.
  const lectures = args.filter((a) => a.startsWith('--allow-fs-read=')).map((a) => a.slice('--allow-fs-read='.length));
  assert.deepEqual(lectures, ['/tmp/ws', '/repo/node_modules', '/opt/node/bin']);
  assert.ok(args.includes('--permission'), 'le modèle de permissions n’est pas activé');
  assert.equal(args[0], '--net', 'l’espace de noms réseau n’est pas demandé');
});

// ── 4 · CE QUI NE DOIT JAMAIS ÊTRE LISIBLE ──────────────────────────────

test('V76 · CP5 — le corpus de corrections n’est JAMAIS dans les lectures autorisées', () => {
  // `SEC5`. Le CP0 avait mesuré qu'on pouvait lire la `reference` d'un autre
  // exercice depuis le code de l'apprenant ; c'est ce que cette liste interdit.
  const src = lire('lib/workspace-fs.mjs');
  const bloc = src.slice(src.indexOf('const LECTURES_BIBLIOTHEQUES'), src.indexOf('const LECTURES_BIBLIOTHEQUES') + 400);
  assert.ok(bloc.includes('node_modules'), 'les bibliothèques ne sont pas autorisées : React ne fonctionnera pas');
  for (const interdit of ['data/exercises', 'data/progress', "'data'", 'process.cwd()\n', 'transfer-challenges']) {
    assert.ok(!bloc.includes(interdit), `chemin interdit dans les lectures autorisées : ${interdit}`);
  }
});

test('V76 · CP5 — l’aide d’entrée ne monte ni `/etc`, ni `/home`, ni le dépôt', () => {
  const aide = lire('scripts/sandbox/enter-root.sh');
  assert.ok(aide.length > 0, 'l’aide d’entrée en racine minimale est introuvable');
  const code = aide.split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');
  for (const interdit of ['/etc', '/home', '/root', '/var']) {
    assert.doesNotMatch(code, new RegExp(`--bind[^\\n]*\\s${interdit}\\s`), `l’aide monte ${interdit}`);
  }
  // Ce qu'elle DOIT monter, et rien de plus, en dehors des bibliothèques annoncées.
  assert.match(code, /--bind -o ro \/usr/, '`/usr` doit être monté en lecture seule');
  assert.match(code, /AICOS_LIBS/, 'les bibliothèques supplémentaires doivent être explicites');
});

// ── 5 · LE REFUS EST LISIBLE PAR L'APPRENANT ────────────────────────────

test('V76 · CP5 — le message d’indisponibilité dit la vérité et ne propose rien d’autre', () => {
  const m = messageIndisponible('python3', 'aucun espace de noms réseau n’est créable');
  assert.match(m, /python3/);
  assert.match(m, /indisponible/);
  assert.match(m, /sans protection|sans frontière/);
  // Il ne doit surtout pas suggérer d'exécuter quand même.
  assert.doesNotMatch(m, /quand même|malgré tout|forcer|ignorer/i);
});

// ── 6 · TOUT SPAWN PASSE PAR LA FRONTIÈRE ───────────────────────────────
//
// Le test le plus important du fichier. Le CP0 avait trouvé TROIS points
// d'exécution distincts (harnais web, harnais React, runtime générique) ; il
// suffirait d'en oublier un pour rouvrir les cinq évasions sur un runtime.

test('V76 · CP5 — aucun point d’exécution ne contourne `execIsole`', () => {
  const src = lire('lib/workspace-fs.mjs');
  const code = src.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
  const parFrontiere = (code.match(/await execIsole\(\{/g) ?? []).length;
  assert.ok(parFrontiere >= 3, `seulement ${parFrontiere} point(s) d’exécution isolé(s) : il y en avait 3 au CP0`);
  // Et surtout : plus aucun spawn direct du code d'apprenant.
  assert.doesNotMatch(code, /execFileP\(\s*process\.execPath/, 'spawn direct de Node hors frontière');
  assert.doesNotMatch(code, /execFileP\(\s*det\.binary/, 'spawn direct du binaire de runtime hors frontière');
});

test('V76 · CP5 — le refus d’exécuter remonte comme un ÉCHEC LISIBLE, pas comme un crash', () => {
  const src = lire('lib/workspace-fs.mjs');
  const n = (src.match(/RUNTIME_NON_ISOLABLE/g) ?? []).length;
  // Une levée + une branche de rattrapage par point d'exécution.
  assert.ok(n >= 4, `\`RUNTIME_NON_ISOLABLE\` n’est traité qu’à ${n} endroit(s)`);
});
