// V75 · CP8 — UX DE LA TÉLÉMÉTRIE : une page, une vérité, aucun jargon.
//
// ── CE QUE L'AUDIT DU CP8 A LU SUR LA PAGE RENDUE ───────────────────────
//
// Serveur lancé, fixture réelle (profil L au jour 180, 78 notions en retard) :
//
//   · **quatre nombres décrivaient « aujourd'hui », aucun ne concordait** —
//     « Aujourd'hui : 8 » au-dessus d'une file de **2** cartes, « 6 min de
//     révision » à côté d'une « Journée 1 » de 32 min ;
//   · **deux bandeaux se contredisaient à trois lignes d'intervalle** :
//     « Rien à changer pour l'instant » puis « le retard s'est installé au
//     point qu'avancer le creuse » ;
//   · le garage citait **`observability-logging`** — un nom de fichier ;
//   · l'action « suspendre » existait **deux fois**, avec deux libellés, et
//     une seule était cliquable.
//
// Aucun de ces quatre défauts n'est visible dans un test unitaire de moteur :
// chacun naît de la RENCONTRE de deux surfaces correctes. Ces tests gardent
// donc la page, pas les fonctions.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { trierArriere } from '../lib/backlog-triage.mjs';
import { recommandationDe } from '../lib/recovery-mode.mjs';

const ROOT = process.cwd();
const lire = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
/** Le fichier sans ses commentaires — un test ne doit pas garder sa propre doc. */
const code = (p) => lire(p).split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');

const SURFACES = [
  'app/retention/page.tsx',
  'app/retention/BacklogPanel.tsx',
  'app/retention/RecoveryNotice.tsx',
  'app/retention/CatchupPlan.tsx',
  'app/retention/PauseCurriculum.tsx',
];

// ── UNE SEULE VÉRITÉ SUR « AUJOURD'HUI » ────────────────────────────────

test('V75 · CP8 — le triage reçoit la taille RÉELLE de la séance', () => {
  // Le constat bloquant de l'audit. Sans ce passage, `trierArriere` retombe
  // sur le plafond du scheduler (8) et la page annonce huit notions au-dessus
  // d'une file qui en propose deux.
  const page = code('app/retention/page.tsx');
  assert.match(page, /getVueArriere\(now,\s*\{\s*capaciteActive:\s*plan\.unites\.length\s*\}\)/,
    'le triage doit être borné par la séance réelle, pas par un plafond');
});

test('V75 · CP8 — l’ordre position → plan → triage casse le cycle', () => {
  const page = code('app/retention/page.tsx');
  const iPos = page.indexOf('getPositionApprenant(now)');
  const iPlan = page.indexOf('getPlanDuJour(now,');
  const iTri = page.indexOf('getVueArriere(now,');
  assert.ok(iPos >= 0 && iPlan > iPos, 'la position doit précéder le plan');
  assert.ok(iTri > iPlan, 'le triage doit suivre le plan pour connaître sa taille');
});

test('V75 · CP8 — la capacité transmise BORNE réellement l’actif', () => {
  // La preuve par le moteur, pas seulement par le branchement.
  const fiches = Array.from({ length: 30 }, (_, i) => ({
    id: `c${i}`, lastMeaningfulContactAt: '2026-01-01T00:00:00.000Z',
    lastRetrievalAt: '2026-01-01T00:00:00.000Z', lastSuccessAt: '2026-01-01T00:00:00.000Z',
    lastFailureAt: null, consecutiveSuccesses: 1,
  }));
  const now = '2026-09-01T10:00:00.000Z';
  const opts = { fiches, dueAtOf: () => '2026-06-01T00:00:00.000Z', statutDe: () => 'OVERDUE', now };
  assert.equal(trierArriere({ ...opts, capaciteActive: 2 }).placement.actif, 2);
  assert.equal(trierArriere({ ...opts, capaciteActive: 8 }).placement.actif, 8);
  // Et l'invariant I2 survit au changement de capacité.
  for (const c of [0, 2, 8, 99]) {
    const r = trierArriere({ ...opts, capaciteActive: c });
    assert.equal(r.placement.actif + r.placement.differe + r.placement.gare, r.total);
  }
});

// ── UN SEUL SIGNAL À LA FOIS ────────────────────────────────────────────

test('V75 · CP8 — le signal de charge V74 se tait quand un mode parle', () => {
  // « Rien à changer pour l'instant » juste avant « le retard s'est installé »
  // n'est pas une nuance, c'est une contradiction. Le signal de V74 ne connaît
  // que le VOLUME ; le mode du CP6 connaît les cinq facteurs.
  const page = code('app/retention/page.tsx');
  assert.match(page, /plan\.signal\.message\s*&&\s*recuperation\.mode === 'NORMAL'/,
    'le signal de charge doit être subordonné au mode');
});

// ── AUCUN JARGON, AUCUN IDENTIFIANT TECHNIQUE ───────────────────────────

test('V75 · CP8 — le garage nomme la notion, pas son fichier', () => {
  const r = trierArriere({
    fiches: [
      { id: 'cause', lastMeaningfulContactAt: '2026-01-01T00:00:00.000Z', lastRetrievalAt: '2026-01-01T00:00:00.000Z', lastSuccessAt: '2026-01-01T00:00:00.000Z', lastFailureAt: null, consecutiveSuccesses: 1 },
      { id: 'consequence', lastMeaningfulContactAt: '2026-01-01T00:00:00.000Z', lastRetrievalAt: '2026-01-01T00:00:00.000Z', lastSuccessAt: '2026-01-01T00:00:00.000Z', lastFailureAt: null, consecutiveSuccesses: 1 },
    ],
    dueAtOf: () => '2026-06-01T00:00:00.000Z',
    statutDe: () => 'OVERDUE',
    prerequisDe: (id) => (id === 'consequence' ? ['cause'] : []),
    libelleDe: (id) => (id === 'cause' ? 'Git : les fondamentaux' : id),
    now: '2026-09-01T10:00:00.000Z',
  });
  const g = r.notions.find((n) => n.classe === 'PARKED');
  assert.match(g.raison, /Git : les fondamentaux/);
  assert.match(g.conditionDeRetour, /Git : les fondamentaux/);
  assert.doesNotMatch(g.raison, /\bcause\b/, 'l’identifiant technique ne doit plus apparaître');
});

test('V75 · CP8 — le read-model injecte bien les titres', () => {
  assert.match(code('lib/backlog-server.ts'), /libelleDe:\s*\(id: string\) => titreDe\.get\(id\)/);
});

test('V75 · CP8 — aucune surface n’affiche de vocabulaire de moteur', () => {
  // Interdits nommés par le brief : « score mémoire 0.63 », « decay 0.72 »,
  // « percentile », le jargon d'implémentation. On lit le texte rendu, pas les
  // commentaires — et on tolère les noms de CLASSES dans les tables de
  // libellés, qui servent justement à les traduire.
  const INTERDITS = /\b(decay|percentile|score de mémoire|memory score|backlog pressure|DEFERRABLE|PARKED|OVERDUE|CATCH_UP|RECOVERY_MODE)\b/;
  for (const f of SURFACES) {
    const src = code(f);
    // Les chaînes littérales affichées : tout ce qui est entre guillemets JSX
    // ou dans du texte brut. On approxime en retirant les clés d'objet.
    const texte = src.replace(/^\s*[A-Z_]+:\s*'[^']*',?$/gm, '');
    const m = texte.match(INTERDITS);
    assert.equal(m, null, `${f} affiche du jargon moteur : ${m?.[0]}`);
  }
});

// ── UNE ACTION, UN SEUL LIBELLÉ, UN SEUL ENDROIT ────────────────────────

test('V75 · CP8 — l’option « pause » porte le MÊME libellé que son bouton', () => {
  const r = recommandationDe('CRITICAL', { supplement: 20, nouveauActuel: 200 });
  const pause = r.choix.find((c) => c.id === 'pause');
  const bouton = lire('app/retention/PauseCurriculum.tsx');
  assert.ok(bouton.includes(pause.libelle),
    `l’option dit « ${pause.libelle} », le bouton dit autre chose`);
});

test('V75 · CP8 — les options sont rendues À CÔTÉ du contrôle, une seule fois', () => {
  const notice = code('app/retention/RecoveryNotice.tsx');
  const plan = code('app/retention/CatchupPlan.tsx');
  assert.doesNotMatch(notice, /r\.choix\.map/, 'le bandeau ne doit plus lister les options');
  assert.match(plan, /choix\.map/, 'les options doivent être là où est le bouton');
  assert.match(plan, /<PauseCurriculum/);
});

// ── LES ÉTATS LIMITES DE CHAQUE SURFACE ─────────────────────────────────

test('V75 · CP8 — chaque surface gère son état VIDE explicitement', () => {
  assert.match(code('app/retention/BacklogPanel.tsx'), /vue\.total === 0/,
    'le panneau d’arriéré doit avoir un état vide');
  assert.match(code('app/retention/CatchupPlan.tsx'), /plan\.total === 0 && !pause\.paused/,
    'le plan doit disparaître quand il n’y a rien à proposer');
  assert.match(code('app/retention/RecoveryNotice.tsx'), /mode === 'NORMAL'[\s\S]{0,60}return null/,
    'le bandeau de mode ne doit rien afficher en mode normal');
});

test('V75 · CP8 — l’écrivain affiche son erreur (invariant V64)', () => {
  const p = code('app/retention/PauseCurriculum.tsx');
  assert.match(p, /setError\(/);
  assert.match(p, /\{\s*error\s*&&/);
  assert.match(p, /role="alert"/);
});

// ── RESPONSIVE : LA RÈGLE EST DANS LE CSS, PAS DANS L'ESPOIR ────────────

test('V75 · CP8 — les blocs de métriques passent en colonne sur mobile', () => {
  const css = lire('app/globals.css');
  assert.match(css, /\.ret-backlog-metrics\s*\{[^}]*grid-template-columns:\s*repeat\(3/);
  assert.match(css, /@media \(max-width: 520px\) \{ \.ret-backlog-metrics \{ grid-template-columns: 1fr; \} \}/,
    'trois nombres comprimés ne valent pas mieux qu’un nombre caché');
});

test('V75 · CP8 — aucun texte long sans `overflow-wrap` dans les listes V75', () => {
  const css = lire('app/globals.css');
  for (const sel of ['.ret-backlog-titre', '.ret-backlog-raison', '.cat-unites li', '.rec-choix-effet']) {
    const bloc = css.split(sel)[1]?.slice(0, 200) ?? '';
    assert.match(bloc, /overflow-wrap:\s*anywhere/, `${sel} peut déborder sur mobile`);
  }
});

// ── LA PAGE NE PEUT PLUS SE CONTREDIRE EN SILENCE ───────────────────────

test('V75 · CP8 — toutes les surfaces V75 lisent la MÊME source', () => {
  // Un composant qui rappellerait un read-model pour son propre compte
  // réintroduirait exactement les quatre nombres divergents de l'audit.
  for (const f of SURFACES.filter((x) => !x.endsWith('page.tsx'))) {
    const src = code(f);
    assert.doesNotMatch(src, /getVueArriere|getPlanDuJour|getVueRecuperation|getVueRattrapage/,
      `${f} recalcule une vue au lieu de la recevoir`);
  }
});

test('V75 · CP8 — aucune surface de la page ne lit la file plafonnée de V66', () => {
  // `s.queue` est la file V66 bornée à 8 : c'est elle qui a produit le défaut
  // P2 (« 8 » annoncé sur 84 réels). Elle ne doit plus servir de décompte.
  const fichiers = readdirSync(join(ROOT, 'app', 'retention')).filter((f) => f.endsWith('.tsx'));
  for (const f of fichiers) {
    const src = code(`app/retention/${f}`);
    assert.doesNotMatch(src, /s\.queue\.length/, `${f} réutilise la file plafonnée comme un total`);
  }
});
