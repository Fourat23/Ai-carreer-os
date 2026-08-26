// Gate V57 — PROPAGATION DE LA SIGNATURE.
//
// Partie statique du sprint. Les mesures de composition exigent un navigateur
// et vivent dans scripts/v57-visual.mjs ; ce gate protège ce qui peut l'être
// sans rendu : l'intégrité du gel, l'ensemble fermé de motifs, l'invariant de
// l'addendum, et l'absence de gamification.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const errors = [];

// ── 1) Le gel V56 est INTACT, à l'octet près ──────────────────────────────
// C'est le cœur du gate. La règle « on ne réécrit pas un seuil pour mieux
// correspondre au résultat » ne vaut que si sa violation est détectable.
// L'empreinte du document gelé est donc vérifiée : toute retouche, même d'un
// seul chiffre, casse la chaîne de gates.
const FROZEN_V56 = '62527f1918b2c44ae4c84b01ce1b8c0494a7efde';
if (!existsSync(R('docs/V56-SCORING-FROZEN.md'))) {
  errors.push('[gel] docs/V56-SCORING-FROZEN.md absent');
} else {
  const h = execSync('git hash-object docs/V56-SCORING-FROZEN.md', { cwd: ROOT }).toString().trim();
  if (h !== FROZEN_V56) {
    errors.push(`[gel] docs/V56-SCORING-FROZEN.md MODIFIÉ (${h}) : les seuils gelés ne se retouchent pas`);
  }
}
if (!existsSync(R('docs/V57-METRICS-ADDENDUM.md'))) {
  errors.push('[gel] docs/V57-METRICS-ADDENDUM.md absent : les métriques ajoutées doivent être committées avant mesure');
}

// ── 2) Les métriques V57 sont ADDITIVES, pas substitutives ────────────────
// Le harnais doit continuer à calculer les formules gelées ET porter le
// contrôle d'invariant qui empêche l'addendum de dériver de `cards`.
const vis = readFileSync(R('scripts/v57-visual.mjs'), 'utf8');
for (const [needle, why] of [
  ['const topBlocks = blocks.length', 'topBlocks absent du harnais'],
  ['const cardsItem = cards - cardsContainer', 'cardsItem doit être dérivé de la métrique gelée `cards`'],
  ["r.cardsItem + r.cardsContainer !== r.cards", "l'invariant cardsItem + cardsContainer === cards n'est pas vérifié"],
  ['const dominance = blocks.length', 'la formule gelée de dominance a disparu du harnais'],
]) {
  if (!vis.includes(needle)) errors.push(`[addendum] ${why}`);
}
// Un seuil gelé ne doit pas réapparaître modifié dans le harnais V57.
for (const bad of [/dominance\s*>=?\s*0\.[12]\d/, /cards\s*<=\s*(1[0-9]|[2-9]\d)/]) {
  if (bad.test(vis)) errors.push(`[gel] seuil réécrit dans scripts/v57-visual.mjs : ${bad}`);
}

// ── 3) L'ensemble des motifs reste FERMÉ à cinq ───────────────────────────
// Reprise de la règle V56 (ADR-056 §1), reconduite sans assouplissement :
// aucun sixième motif en V57.
const KNOWN = ['PositionRing', 'PhaseRail', 'EvidenceMark', 'YearBand', 'TrajectoryMap'];
// Composants STANDARDS, exclus par la définition gelée §5 critère 3
// (« barre de progression linéaire »). Les nommer applique l'exclusion
// existante, ne l'élargit pas.
const STANDARD = ['ProgressRail'];
const index = readFileSync(R('app/ui/index.ts'), 'utf8');
const exported = [...index.matchAll(/export \{ ([A-Za-z, ]+) \} from '\.\/([A-Za-z]+)'/g)].map((m) => m[2]);
for (const n of exported) {
  if (!/Ring|Rail|Mark|Band|Map|Orbit|Constellation|Sigil|Glyph|Halo|Beacon/.test(n)) continue;
  if (STANDARD.includes(n) || KNOWN.includes(n)) continue;
  errors.push(`[signature] motif non déclaré « ${n} » : l'ensemble est fermé à 5 (ADR-056 §1, reconduit ADR-057 §4)`);
}

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f); const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (f.endsWith('.tsx')) out.push(p);
  }
  return out;
}
const tsx = walk(R('app'));

// ── 4) Un motif posé sans raison est un ornement ──────────────────────────
// Chaque motif doit rester porteur d'une raison informationnelle écrite.
for (const [f, name] of [['app/ui/PositionRing.tsx', 'PositionRing'], ['app/ui/YearBand.tsx', 'YearBand'],
  ['app/ui/PhaseRail.tsx', 'PhaseRail'], ['app/ui/EvidenceMark.tsx', 'EvidenceMark']]) {
  const src = readFileSync(R(f), 'utf8');
  if (!/Raison informationnelle|raison informationnelle|MOTIF PROPRIÉTAIRE|Élément graphique ADMIS/.test(src)) {
    errors.push(`[signature] ${name} : raison informationnelle absente du code`);
  }
}

// ── 5) Journée : les quatre zones de V56 sont préservées ──────────────────
// V57 durcit /day, il ne le reconstruit pas. La distinction « je lis / je
// fais » ne doit jamais disparaître.
const day = readFileSync(R('app/day/[id]/page.tsx'), 'utf8');
for (const [needle, label] of [
  ['<DayMission', 'zone 1 · mission'],
  ['<PhaseRail', 'zone 2 · déroulé'],
  // V61 · la zone de lecture et la zone de pratique sont devenues les deux
  // colonnes de l'atelier borné (`day-shop-read` / `day-shop-do`). Les QUATRE
  // zones restent exigées : seul le nom de la classe a suivi la recomposition.
  ['className="prose day-read"', 'zone 3 · lecture'],
  ['className="day-shop-do"', 'zone 4 · pratique'],
  ['className="day-shop-read"', 'zone 3b · colonne de lecture'],
]) {
  if (!day.includes(needle)) errors.push(`[journée] ${label} absente — V56 est la baseline, elle ne se démonte pas`);
}

// ── 6) Anti-gamification (reconduit depuis V54.2) ─────────────────────────
const HARD = [[/\bXP\b/, 'XP'], [/\bstreaks?\b/i, 'streak'], [/\bleaderboards?\b/i, 'leaderboard'],
  [/\bconfettis?\b/i, 'confetti'], [/\bachievements?\b/i, 'achievement'], [/\bgamif/i, 'gamification'],
  [/\bbadge de (mérite|niveau)/i, 'badge de mérite']];
for (const file of tsx) {
  const src = readFileSync(file, 'utf8');
  for (const [re, n] of HARD) if (re.test(src)) errors.push(`[gamification] « ${n} » dans ${file.replace(ROOT + '/', '')}`);
}

// ── 7) Le ledger des routes recomposées existe et est vérifiable ──────────
// Le plancher se démontre, il ne se déclare pas. Chaque ligne du ledger doit
// désigner un fichier de route qui existe réellement.
const LEDGER = 'docs/audits/V57-RECOMPOSITION-LEDGER.md';
if (!existsSync(R(LEDGER))) {
  errors.push(`[plancher] ${LEDGER} absent : la liste des routes recomposées doit être versionnée`);
} else {
  const led = readFileSync(R(LEDGER), 'utf8');
  const files = [...led.matchAll(/`(app\/[^`]+\.tsx)`/g)].map((m) => m[1]);
  for (const f of new Set(files)) {
    if (!existsSync(R(f))) errors.push(`[plancher] ledger : ${f} n'existe pas`);
  }
  if (!files.length) errors.push('[plancher] ledger : aucune route citée avec son fichier');
}

// ── 8) Aucune route publique supprimée ────────────────────────────────────
// V57 recompose, il ne retire pas d'URL. Le compte du CP0 fait foi.
const pages = tsx.filter((p) => /page\.tsx$/.test(p)).length;
if (pages < 36) errors.push(`[urls] ${pages} routes publiques < 36 : une URL a été supprimée`);

console.log('── Gate V57 (propagation de la signature)');
console.log(`  routes publiques : ${pages}`);
console.log(`  gel V56 : ${existsSync(R('docs/V56-SCORING-FROZEN.md')) ? 'présent' : 'ABSENT'} · addendum V57 : ${existsSync(R('docs/V57-METRICS-ADDENDUM.md')) ? 'présent' : 'ABSENT'}`);
if (errors.length) {
  console.error(`\n❌ V57 invalide (${errors.length}) :`);
  for (const e of errors) console.error(`  • ${e}`);
  process.exit(1);
}
console.log('\n✅ V57 valide : gel V56 intact à l\'octet près, métriques strictement additives, '
  + 'ensemble de motifs fermé à 5, quatre zones de la Journée préservées, aucune gamification, '
  + 'ledger de recomposition vérifiable, aucune URL supprimée.');
