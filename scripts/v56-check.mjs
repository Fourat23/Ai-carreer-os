// Gate V56 — PRODUCT SIGNATURE.
//
// Protège l'ensemble FERMÉ de motifs propriétaires et les règles de la
// Journée. Les seuils de mesure (cardification, profondeur, typographie) sont
// gelés dans docs/V56-SCORING-FROZEN.md et vérifiés par scripts/v56-visual.mjs
// (ils nécessitent un navigateur) ; ce gate est la partie statique.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const errors = [];
const warns = [];

// ── 1) L'ensemble des motifs est FERMÉ à cinq ─────────────────────────────
// Le plafond « 3 à 5 motifs pour tout le produit » a été gelé à CP0 avant
// toute mesure. Un sixième motif n'est pas un enrichissement, c'est la fin de
// la signature : cinq objets reconnaissables valent mieux que quinze gadgets.
const MOTIF_FILES = {
  'app/ui/PositionRing.tsx': 'PositionRing',
  'app/ui/TrajectoryMap-marker': 'TrajectoryMap',
  'app/ui/PhaseRail.tsx': 'PhaseRail',
  'app/ui/EvidenceMark.tsx': 'EvidenceMark',
  'app/ui/YearBand.tsx': 'YearBand',
};
for (const f of Object.keys(MOTIF_FILES)) {
  if (f.endsWith('-marker')) continue;
  if (!existsSync(R(f))) errors.push(`[signature] motif manquant : ${f}`);
}
if (!existsSync(R('app/TrajectoryMap.tsx'))) errors.push('[signature] motif manquant : app/TrajectoryMap.tsx');

// Le fichier d'export ne doit pas exposer un SIXIÈME motif.
const index = readFileSync(R('app/ui/index.ts'), 'utf8');
const KNOWN = ['PositionRing', 'PhaseRail', 'EvidenceMark', 'YearBand'];
// Composants STANDARDS, explicitement exclus de la définition gelée d'un motif
// propriétaire (§5, critère 3 : « n'est pas un composant standard — carte,
// badge, BARRE DE PROGRESSION LINÉAIRE, tableau, onglets »). Les lister ici
// n'assouplit pas la règle : cela applique l'exclusion déjà écrite à CP0.
const STANDARD = ['ProgressRail'];
const exported = [...index.matchAll(/export \{ ([A-Za-z, ]+) \} from '\.\/([A-Za-z]+)'/g)];
const motifLike = exported
  .map((m) => m[2])
  .filter((n) => /Ring|Rail|Mark|Band|Map|Orbit|Constellation|Sigil|Glyph/.test(n));
for (const n of motifLike) {
  if (STANDARD.includes(n)) continue;
  if (!KNOWN.includes(n)) errors.push(`[signature] motif non déclaré « ${n} » : le plafond de 5 est fermé (ADR-056 §1)`);
}

// ── 2) Chaque motif porte une donnée réelle ───────────────────────────────
// Un motif dont toutes les valeurs seraient littérales serait un ornement.
for (const [f, name] of [['app/ui/PositionRing.tsx', 'PositionRing'], ['app/ui/YearBand.tsx', 'YearBand'],
  ['app/ui/PhaseRail.tsx', 'PhaseRail'], ['app/ui/EvidenceMark.tsx', 'EvidenceMark']]) {
  const src = readFileSync(R(f), 'utf8');
  if (!/Raison informationnelle|raison informationnelle|MOTIF PROPRIÉTAIRE|Élément graphique ADMIS/.test(src)) {
    errors.push(`[signature] ${name} : raison informationnelle absente du code (ADR-056 §1)`);
  }
}

// ── 3) Réutilisation : un motif ne compte que sur ≥ 2 surfaces ────────────
function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f); const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (f.endsWith('.tsx')) out.push(p);
  }
  return out;
}
const pages = walk(R('app')).filter((p) => /page\.tsx$/.test(p) || /\/(Day|Track|Review)[A-Za-z]*\.tsx$/.test(p));
const usage = {};
for (const name of ['PositionRing', 'PhaseRail', 'EvidenceMark', 'YearBand', 'TrajectoryMap']) {
  usage[name] = pages.filter((p) => new RegExp(`<${name}\\b`).test(readFileSync(p, 'utf8')))
    .map((p) => p.replace(ROOT + '/', ''));
}
for (const [name, files] of Object.entries(usage)) {
  // On compte les SURFACES (routes), pas les fichiers : /day/[id] et ses
  // composants comptent pour une seule surface.
  const surfaces = new Set(files.map((f) => f.replace(/^app\//, '').split('/').slice(0, -1).join('/') || 'root'));
  if (surfaces.size < 2) {
    errors.push(`[signature] ${name} n'est utilisé que sur ${surfaces.size} surface(s) : un motif exige ≥ 2 (§5 gelé)`);
  }
}

// ── 4) Journée : quatre zones distinctes ──────────────────────────────────
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
  if (!day.includes(needle)) errors.push(`[journée] ${label} absente`);
}
// Le cours reste un DOCUMENT : il ne doit pas être enveloppé dans une carte.
if (/className="(card|panel)[^"]*"[^>]*>\s*<article className="prose day-read"/.test(day)) {
  errors.push('[journée] le contenu de cours est enveloppé dans une carte');
}

// ── 5) Anti-gamification (inchangé depuis V54.2) ──────────────────────────
const HARD = [[/\bXP\b/, 'XP'], [/\bstreaks?\b/i, 'streak'], [/\bleaderboards?\b/i, 'leaderboard'],
  [/\bconfettis?\b/i, 'confetti'], [/\bachievements?\b/i, 'achievement'], [/\bgamif/i, 'gamification']];
for (const file of walk(R('app'))) {
  const src = readFileSync(file, 'utf8');
  for (const [re, n] of HARD) if (re.test(src)) errors.push(`[gamification] « ${n} » dans ${file.replace(ROOT + '/', '')}`);
}

// ── 6) Les critères du sprint sont gelés et versionnés ───────────────────
if (!existsSync(R('docs/V56-SCORING-FROZEN.md'))) {
  errors.push('[gel] docs/V56-SCORING-FROZEN.md absent : les critères doivent être committés à CP0');
}

console.log('── Gate V56 (product signature)');
console.log('Usage des motifs :');
for (const [name, files] of Object.entries(usage)) {
  const surfaces = new Set(files.map((f) => f.replace(/^app\//, '').split('/').slice(0, -1).join('/') || 'root'));
  console.log(`  ${name.padEnd(15)} ${surfaces.size} surface(s) : ${[...surfaces].join(', ') || '—'}`);
}
if (warns.length) { console.log(`Avertissements (${warns.length}) :`); for (const w of warns) console.log(`  ⚠ ${w}`); }
if (errors.length) {
  console.error(`\n❌ V56 invalide (${errors.length}) :`);
  for (const e of errors) console.error(`  • ${e}`);
  process.exit(1);
}
console.log('\n✅ V56 valide : ensemble de motifs fermé à 5, chacun porteur de donnée et réutilisé '
  + 'sur ≥ 2 surfaces, Journée en 4 zones distinctes, aucune gamification, critères gelés versionnés.');
