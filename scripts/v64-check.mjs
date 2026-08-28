// Gate v64:check — protège les invariants STRUCTURELS du Learning Engine
// (ADR-064). Ce gate lit le code, pas le navigateur : il empêche les
// régressions qu'une relecture humaine laisse passer.
//
// Chaque vérification a été VUE ÉCHOUER avant d'être considérée acquise
// (méthode imposée depuis V56 ; c'est le quatrième sprint consécutif où le
// test négatif trouve un trou dans un gate neuf).

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

// Un gate qui lit les COMMENTAIRES est un gate qu'un commentaire peut tromper —
// et, au premier essai, la vérification 1 échouait sur sa propre note d'ADR qui
// citait le motif interdit. `code()` ne regarde que le code exécutable.
const code = (p) => read(p)
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .split('\n').map((l) => l.replace(/(^|[^:'"`\\])\/\/.*$/, '$1')).join('\n');
const errors = [];
const ok = [];
function must(cond, msg, detail = '') {
  if (cond) ok.push(msg); else errors.push(`${msg}${detail ? ` — ${detail}` : ''}`);
}

// ── 1. La route de progression n'accepte QUE des commandes ────────────────
// Régression visée : le retour du « patch libre », c'est-à-dire d'un
// `{ ...existing, ...patch }` qui accepte n'importe quel corps JSON.
{
  const route = code('app/api/progress/route.ts');
  must(/\bapplyCommand\s*\(/.test(route),
    '[api] POST /api/progress passe par le moteur');
  must(!/\.\.\.\s*existing\s*,\s*\.\.\.\s*patch/.test(route) && !/payload\.patch/.test(route),
    '[api] aucun patch libre n’est réintroduit',
    'la fusion aveugle `{ ...existing, ...patch }` est de retour');
  must(/if\s*\(\s*!\s*result\.ok\s*\)/.test(route) && route.indexOf('if (!result.ok)') < route.indexOf('writeProgress('),
    '[api] une commande refusée n’écrit rien',
    'writeProgress doit être APRÈS le retour d’erreur');
  must(/noop:/.test(route),
    '[api] un no-op n’écrit pas sur le disque');
}

// ── 2. Le moteur est PUR ──────────────────────────────────────────────────
{
  const engine = code('lib/learning-engine.mjs');
  must(!/node:fs|node:path|readFileSync|writeFileSync|process\.env/.test(engine),
    '[moteur] aucune I/O ni variable d’environnement dans le moteur');
  must(!/new Date\(\)/.test(engine),
    '[moteur] aucune horloge propre : elle est injectée',
    '`new Date()` rend le moteur non déterministe');
  must(/export function applyCommand/.test(engine),
    '[moteur] applyCommand est exporté');
}

// ── 3. La machine à états interdit NOT_STARTED → COMPLETED ────────────────
{
  const engine = code('lib/learning-engine.mjs');
  const m = engine.match(/const TRANSITIONS = \{([\s\S]*?)\n\};/);
  must(!!m, '[états] la table de transitions est déclarée');
  if (m) {
    const table = m[1];
    const notStarted = table.match(/not_started:\s*\{([^}]*)\}/)?.[1] ?? '';
    must(!/COMPLETE/.test(notStarted),
      '[états] NOT_STARTED → COMPLETED est absent de la table',
      'la transition interdite a été ajoutée');
    must(/START:\s*'active'/.test(notStarted),
      '[états] NOT_STARTED → START → active existe');
    must(!/:\s*'not_started'/.test(table),
      '[états] aucune transition ne ramène à not_started',
      'on ne peut pas ne pas avoir fait ce qu’on a fait');
  }
}

// ── 4. `status` reste une PROJECTION ──────────────────────────────────────
// Régression visée : un composant client qui repose à écrire `status`
// directement, recréant une seconde source de vérité.
{
  const files = [];
  (function walk(dir) {
    for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
      const p = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(p);
      else if (/\.tsx?$/.test(e.name)) files.push(p);
    }
  })('app');

  // TROU TROUVÉ AU TEST NÉGATIF (N6) : la première version cherchait
  // `sendCommand({ … status: … })`. Or `DayPanel` enveloppe `sendCommand` dans
  // un helper local `send()` — la commande fautive passait donc sous le radar.
  // On ne cherche plus le NOM DE L'APPELANT mais la FORME de la commande :
  // tout littéral `{ type: 'UPPERCASE', … }` est une commande du moteur, quel
  // que soit ce qui l'envoie.
  const offenders = [];
  for (const f of files) {
    if (f.endsWith('api/progress/route.ts')) continue;
    const src = code(f);
    for (const m of src.matchAll(/\{\s*(?:\.\.\.[\w.]+\s*,\s*)?type:\s*'([A-Z][A-Z_]+)'([^{}]*)\}/g)) {
      if (/\b(status|session|submissions|updatedAt)\s*:/.test(m[2])) {
        offenders.push(`${f} → commande ${m[1]} porte un champ projeté`);
      }
    }
    if (/type:\s*'day'[\s\S]{0,200}patch/.test(src)) offenders.push(`${f} (ancien protocole)`);
  }
  must(offenders.length === 0,
    '[projection] aucun client n’écrit `status` ni n’utilise l’ancien protocole',
    offenders.join(', '));
}

// ── 5. Tous les écrivains passent par le client de commandes ──────────────
//
// V65.1 · P0-0. Cette vérification énumérait ses écrivains à la main. V65 a
// recomposé `SkillsBoard.tsx` en surface de LECTURE SEULE — le composant
// n'écrit plus rien — mais il figurait encore dans la liste : le gate a exigé
// `sendCommand` d'un composant qui n'a aucune raison de l'avoir, et
// `gates:active` est resté ROUGE pendant toute la clôture de V65.
//
// Une liste codée en dur mesure l'état du code au jour où elle a été écrite,
// pas l'invariant. La liste est donc DÉRIVÉE : est écrivain tout composant
// client qui émet une commande, reconnu à la FORME de ce qu'il émet — la
// même leçon qu'au CP0 de V64, où chercher `sendCommand({ … status: … })`
// laissait passer un `send()` local.
function clientComponents() {
  const out = [];
  const walk = (dir) => {
    for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(rel);
      else if (e.name.endsWith('.tsx')) out.push(rel);
    }
  };
  walk('app');
  return out;
}

// La ROUTE DE COMMANDES, et elle seule : `/api/progress` sans segment après.
// `/api/progress/import`, `/export` et `/reset` sont des opérations de fichier
// assumées, avec leurs propres routes et leur propre validation — ce ne sont
// pas des commandes d'apprentissage et elles n'ont pas à passer par
// `sendCommand`. Sans cette distinction, le premier essai de la règle dérivée
// accusait `SettingsPanel` d'« appeler la route à la main ».
const CMD_ROUTE = /fetch\(\s*['"`]\/api\/progress['"`?]/;
const FILE_ROUTE = /\/api\/progress\/(import|export|reset)/;

const WRITERS = clientComponents().filter((f) => {
  const src = code(f);
  // Une commande se reconnaît à sa FORME : `{ type: 'UPPERCASE' … }`, quel que
  // soit le nom de la fonction qui l'envoie — au CP0 de V64, chercher
  // `sendCommand({ … })` laissait passer un `send()` local.
  return /\{\s*type:\s*['"][A-Z_]{3,}['"]/.test(src) || CMD_ROUTE.test(src);
});

{
  must(WRITERS.length >= 5,
    '[clients] la liste des écrivains est dérivée du code, pas énumérée',
    `${WRITERS.length} écrivain(s) détecté(s) — un produit qui écrit en a plusieurs`);

  const raw = [];
  for (const w of WRITERS) {
    const src = code(w);
    if (CMD_ROUTE.test(src)) raw.push(`${w} (appelle la route de commandes à la main)`);
    if (!/sendCommand/.test(src)) raw.push(`${w} (n’utilise pas sendCommand)`);
  }
  must(raw.length === 0,
    `[clients] les ${WRITERS.length} écrivains passent par sendCommand`,
    raw.join(', '));

  // Les opérations de fichier restent surveillées, séparément : elles mutent la
  // progression en entier et doivent montrer leur échec comme les autres.
  const fileOps = clientComponents().filter((f) => FILE_ROUTE.test(code(f)));
  const mute = fileOps.filter((f) => {
    const src = code(f);
    return !(/setError\(/.test(src) && /\{\s*error\s*&&/.test(src));
  });
  must(mute.length === 0,
    `[clients] les ${fileOps.length} opérations de fichier affichent leur échec`,
    mute.join(', '));

  // N12 — le gate se surveille lui-même. Si quelqu'un réénumère les écrivains,
  // la règle redevient une photo du code au lieu d'un invariant, et le trou
  // P0-0 se rouvre. On cherche un tableau littéral de ≥ 3 chemins `.tsx`.
  const self = code('scripts/v64-check.mjs');
  const hardcoded = self.match(/\[[^\]]*?(?:['"]app\/[^'"]*\.tsx['"][^\]]*?){3,}\]/s);
  must(!hardcoded,
    '[gate] la liste des écrivains n’est pas réénumérée à la main',
    'un tableau de chemins .tsx est réapparu dans le gate');
}

// ── 6. Un échec de commande est VISIBLE (brief §22) ───────────────────────
// Régression visée : le retour d'un clic sans effet — l'anomalie A10 du CP0.
{
  // Même liste dérivée qu'en 5 : qui écrit doit montrer son échec, et
  // seulement qui écrit.
  const silent = WRITERS.filter((f) => {
    const src = code(f);
    return !(/setError\(/.test(src) && /\{\s*error\s*&&/.test(src));
  });
  must(silent.length === 0,
    '[erreurs] tout écrivain affiche son échec',
    silent.join(', '));
  must(/cmd-error/.test(read('app/globals.css')),
    '[erreurs] le style du message d’échec existe');
}

// ── 7. Persistance : atomique et injectable ───────────────────────────────
{
  const ps = code('lib/progress-server.ts');
  must(/renameSync\(/.test(ps) && /fsyncSync\(/.test(ps),
    '[persistance] l’écriture est atomique (tmp + fsync + rename)');
  must(/AICOS_PROGRESS_FILE/.test(ps),
    '[persistance] la destination est injectable pour les tests');
  must(!/writeFileSync\(FILE,/.test(ps),
    '[persistance] plus d’écriture directe sur le fichier canonique',
    'writeFileSync(FILE, …) laisse un JSON tronqué en cas de coupure');
}

// ── 8. Aucune gamification introduite ─────────────────────────────────────
{
  const banned = /\b(XP|streak|leaderboard|classement de joueurs|confetti|confettis|badge de récompense)\b/i;
  const hits = [];
  for (const f of ['lib/learning-engine.mjs', 'lib/learning.mjs', 'app/day/[id]/DayPanel.tsx', 'app/progress-command.ts']) {
    if (banned.test(code(f))) hits.push(f);
  }
  must(hits.length === 0, '[produit] aucune gamification introduite', hits.join(', '));
}

// ── 9. Le contenu utilisateur n’est jamais rendu en HTML brut ─────────────
{
  const panel = code('app/day/[id]/DayPanel.tsx');
  must(!/dangerouslySetInnerHTML/.test(panel),
    '[sécurité] le poste de travail ne rend aucun HTML brut');
  const page = code('app/day/[id]/page.tsx');
  const dangerous = [...page.matchAll(/dangerouslySetInnerHTML=\{\{\s*__html:\s*([^}]+)\}\}/g)].map((m) => m[1].trim());
  const fromCorpus = dangerous.every((expr) => /split\.(read|act)|solution|Html/.test(expr));
  must(fromCorpus,
    '[sécurité] seul le CORPUS est rendu en HTML, jamais une réponse',
    dangerous.join(' | '));
}

// ── 10. Les artefacts du sprint existent ──────────────────────────────────
{
  for (const f of [
    'docs/ADR-064-learning-engine.md',
    'docs/V64-CRITERIA-FROZEN.md',
    'docs/audits/V64-CP0-AUDIT.md',
    'lib/learning-engine.mjs',
    'lib/learning-engine.d.ts',
    'scripts/v64-integrity.mjs',
    'tests/v64-learning-engine.test.mjs',
    'tests/v64-persistence.test.mjs',
  ]) {
    must(existsSync(join(ROOT, f)), `[artefacts] ${f} présent`);
  }
}

// ── Verdict ───────────────────────────────────────────────────────────────
console.log(`── v64:check — ${ok.length} vérifications passées`);
if (errors.length) {
  console.error(`\n❌ v64:check : ${errors.length} régression(s)\n`);
  for (const e of errors) console.error(`  • ${e}`);
  process.exit(1);
}
console.log('\n✅ V64 valide : commandes validées côté serveur, moteur pur et déterministe, machine à états close, statut projeté, écriture atomique et injectable, échecs visibles, aucun HTML brut depuis une réponse utilisateur.');
