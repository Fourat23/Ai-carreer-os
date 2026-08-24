// Gate V54.2.1 — VISUAL INTEGRITY.
//
// Ce gate ne vérifie pas « est-ce que ça compile » ni « est-ce que la page
// répond 200 » : d'autres gates le font déjà. Il vérifie que le RENDU représente
// correctement les données et leur ORDRE, et que les défauts corrigés par ce
// sprint ne peuvent pas revenir silencieusement.
//
// Trois régressions sont rendues impossibles :
//   1. une liste de jours de parcours non chronologique (source du désordre) ;
//   2. une mise en page multi-colonnes CSS sur une structure temporelle
//      (l'ordre du DOM reste juste, l'ordre de LECTURE devient faux) ;
//   3. une partition des 365 jours dont la somme ne fait pas 365.
//
// Les assertions DOM/visuelles réelles vivent dans scripts/v5421-calendar-order.mjs
// et scripts/v5421-visual.mjs (elles nécessitent un serveur) ; ce gate est la
// partie statique + modèle pur, exécutable dans `gates:active` sans navigateur.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildCatalogue, getTrack, isTrackAvailable, resolveTrackDays, resolveTrackDayObjects } from '../lib/catalogue.mjs';
import { buildCalendar } from '../lib/calendar-model.mjs';
import { curriculumPartition } from '../lib/curriculum-partition.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const errors = [];
const warns = [];
const FROZEN_CORPUS = '4c1f3028ed1303e0e0c5f8220215e8c88a99fdb3';
const FROZEN_PROGRESS = '323604021055588a9528a86875f36598dbdc7758';

// ── 1) Gel du corpus, de la progression et de l'ordre des 365 jours ────────
try {
  const s = execSync("find curriculum/lessons -name '*.md' | sort | xargs cat | sha1sum", { cwd: ROOT }).toString().trim().split(/\s+/)[0];
  if (s !== FROZEN_CORPUS) errors.push(`[corpus] SHA-1 modifié : ${s}`);
} catch { warns.push('[corpus] hash indisponible'); }
try {
  const b = execSync('git hash-object data/progress.json', { cwd: ROOT }).toString().trim();
  if (b !== FROZEN_PROGRESS) errors.push(`[progress] modifié : ${b}`);
} catch { warns.push('[progress] indisponible'); }

const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
if (program.days.length !== 365) errors.push(`[days] ${program.days.length} ≠ 365`);
else if (!program.days.every((d, i) => d.day === i + 1)) errors.push('[order] ordre des 365 jours modifié');

// ── 2) Contrat chronologique, parcours par parcours ────────────────────────
// C'est LA leçon de V54.2 : l'état par défaut (Fondations = les 365 jours,
// triés par construction) ne révélait rien. Il faut balayer TOUS les parcours.
const cat = buildCatalogue(program);
const tracks = cat.tracks.filter(isTrackAvailable);
let checked = 0;
for (const t of tracks) {
  const nums = resolveTrackDays(cat, t);
  if (!nums.every((n, i) => i === 0 || n > nums[i - 1])) {
    errors.push(`[ordre] resolveTrackDays(${t.id}) n'est pas chronologique`);
  }
  const cal = buildCalendar(resolveTrackDayObjects(cat, t, program));
  if (!cal.monthOrderOk) errors.push(`[calendrier] mois désordonnés (${t.id})`);
  if (!cal.weekOrderOk || !cal.weekChainOk) errors.push(`[calendrier] semaines désordonnées (${t.id})`);
  if (!cal.dayOrderOk) errors.push(`[calendrier] jours désordonnés (${t.id})`);
  if (cal.duplicates.length) errors.push(`[calendrier] ${cal.duplicates.length} doublon(s) (${t.id})`);
  if (cal.rendered !== nums.length) errors.push(`[calendrier] ${cal.rendered} rendus ≠ ${nums.length} attendus (${t.id})`);

  // ── 3) Partition : la somme des catégories vaut TOUJOURS 365 ─────────────
  const p = curriculumPartition(program, nums);
  if (!p.ok) errors.push(`[partition] somme ${p.sum} ≠ ${p.total} (${t.id})`);
  if (p.inTrack !== nums.length) errors.push(`[partition] inTrack ${p.inTrack} ≠ ${nums.length} (${t.id})`);
  checked++;
}

// Le modèle doit trier même une entrée volontairement désordonnée : c'est le
// cœur du contrat V54.2.1 (le rendu ne dépend pas de la qualité de l'entrée).
{
  const sample = [
    { day: 9, month: 2, week: 2 }, { day: 3, month: 1, week: 1 },
    { day: 8, month: 2, week: 2 }, { day: 1, month: 1, week: 1 },
  ];
  const c = buildCalendar(sample);
  const flatMonths = c.months.map((m) => m.month);
  const flatDays = c.months.flatMap((m) => m.weeks.flatMap((w) => w.days.map((d) => d.day)));
  if (String(flatMonths) !== '1,2') errors.push('[modèle] buildCalendar ne trie pas les mois d\'une entrée désordonnée');
  if (String(flatDays) !== '1,3,8,9') errors.push('[modèle] buildCalendar ne trie pas les jours d\'une entrée désordonnée');
  if (c.inputOrdered) errors.push('[modèle] inputOrdered devrait signaler une entrée désordonnée');
  if (!c.ordered) errors.push('[modèle] la sortie triée doit être déclarée ordonnée');
}

// ── 4) Aucune mise en page qui réordonne une structure temporelle ──────────
// `column-count` / `columns` remplissent colonne par colonne : l'ordre de
// lecture (ligne par ligne) cesse de correspondre à l'ordre du DOM. Interdit
// sur les conteneurs porteurs d'une séquence (calendrier, jalons, roadmap).
const css = readFileSync(R('app/globals.css'), 'utf8');
const SEQUENTIAL = ['.cal-months', '.lx-milestones', '.track-roadmap', '.traj-grid'];
for (const sel of SEQUENTIAL) {
  // On ne regarde que les blocs qui DÉCLARENT des colonnes (pas ceux qui les
  // annulent explicitement avec `initial`).
  const re = new RegExp(`\\${sel}\\s*\\{[^}]*\\}`, 'g');
  for (const block of css.match(re) ?? []) {
    if (/(^|[^-])column-count\s*:\s*(?!initial)/.test(block) || /(^|[^-])columns\s*:\s*(?!initial)/.test(block)) {
      errors.push(`[ordre visuel] colonnes CSS sur « ${sel} » : casse l'ordre de lecture d'une séquence`);
    }
  }
}

// ── 5) Contrat de composition du Dashboard ────────────────────────────────
// Le socle et le pied doivent vivre DANS la colonne principale : c'est ce qui
// rend les deux colonnes indépendantes et supprime le vide structurel.
const dash = readFileSync(R('app/page.tsx'), 'utf8');
const mainStart = dash.indexOf('className="dash-main"');
const asideStart = dash.indexOf('className="dash-side"');
if (mainStart < 0 || asideStart < 0) errors.push('[dashboard] colonnes .dash-main / .dash-side introuvables');
else {
  const socle = dash.indexOf('className="dash-socle"');
  const foot = dash.indexOf('className="dash-foot"');
  if (!(socle > mainStart && socle < asideStart)) errors.push('[dashboard] le socle n\'est pas dans la colonne principale (vide structurel possible)');
  if (!(foot > mainStart && foot < asideStart)) errors.push('[dashboard] le pied de contexte n\'est pas dans la colonne principale');
}
if ((dash.match(/<PrimaryFocus/g) ?? []).length !== 1) errors.push('[dashboard] il doit y avoir exactement 1 PrimaryFocus');

// ── 6) CTA du Parcours dans le bloc du parcours actif ─────────────────────
const parc = readFileSync(R('app/parcours/page.tsx'), 'utf8');
const blockStart = parc.indexOf('className="track-active"');
const cta = parc.indexOf('btn cta');
if (blockStart < 0) errors.push('[parcours] bloc .track-active introuvable');
else if (cta < 0 || cta < blockStart) errors.push('[parcours] le CTA principal doit être DANS le bloc du parcours actif');

// ── 7) Vocabulaire partagé programme global / parcours actif ──────────────
// Une seule source dérivée : les trois surfaces consomment le même read-model.
for (const f of ['app/page.tsx', 'app/parcours/page.tsx', 'app/calendar/page.tsx']) {
  if (!readFileSync(R(f), 'utf8').includes('curriculumPartition')) {
    errors.push(`[vocabulaire] ${f} n'utilise pas le read-model de partition partagé`);
  }
}

// ── 8) Anti-gamification / anti-donnée inventée (mêmes règles que V54.2) ──
function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f); const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (f.endsWith('.tsx') || f.endsWith('.ts')) out.push(p);
  }
  return out;
}
const HARD = [
  [/\bXP\b/, 'XP'], [/\bstreaks?\b/i, 'streak'], [/\bleaderboards?\b/i, 'leaderboard'],
  [/\bconfettis?\b/i, 'confetti'], [/\bachievements?\b/i, 'achievement'], [/\bgamif/i, 'gamification'],
];
// « niveau » reste légitime (niveau de compétence, de difficulté) : seul le
// niveau GAMIFIÉ est interdit — pas de faux positif naïf.
const GAMIFIED_LEVEL = /\blevel\s*up\b|\bniveau\s+(?:utilisateur|du\s+joueur|joueur)\b/i;
for (const file of existsSync(R('app')) ? walk(R('app')) : []) {
  const src = readFileSync(file, 'utf8');
  const rel = file.replace(ROOT + '/', '');
  for (const [re, name] of HARD) if (re.test(src)) errors.push(`[gamification] « ${name} » dans ${rel}`);
  if (GAMIFIED_LEVEL.test(src)) errors.push(`[gamification] niveau gamifié dans ${rel}`);
}

// ── 9) Les harnais navigateur existent (le gate statique ne les remplace pas) ─
for (const s of ['scripts/v5421-calendar-order.mjs', 'scripts/v5421-visual.mjs']) {
  if (!existsSync(R(s))) errors.push(`[harnais] ${s} manquant`);
}

// ── Rapport ────────────────────────────────────────────────────────────────
console.log('── Gate V54.2.1 (visual integrity)');
console.log(`Parcours vérifiés : ${checked} · jours du programme : ${program.days.length}`);
if (warns.length) { console.log(`Avertissements (${warns.length}) :`); for (const w of warns) console.log(`  ⚠ ${w}`); }
if (errors.length) {
  console.error(`\n❌ V54.2.1 invalide (${errors.length}) :`);
  for (const e of errors) console.error(`  • ${e}`);
  process.exit(1);
}
console.log('\n✅ V54.2.1 valide : ordre chronologique garanti sur tous les parcours, partition = 365, '
  + 'aucune colonne CSS sur une séquence, composition Dashboard/Parcours conforme, aucune gamification.');
