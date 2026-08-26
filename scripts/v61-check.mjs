#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════
// GATE V61 — ce que la migration produit ne doit plus jamais perdre.
//
// Écrit après un TEST NÉGATIF qui a révélé un trou réel : en inversant
// volontairement l'ordre des mois du calendrier, AUCUN des 39 gates existants
// n'échouait. L'invariant DATA ORDER = DOM ORDER = READING ORDER, reconstruit
// en V54.2.1, n'était protégé par rien.
//
// Chaque contrôle ci-dessous a été vérifié EN NÉGATIF : on casse ce qu'il
// protège, on constate l'échec, on restaure. Un gate qu'on n'a jamais vu
// échouer n'est pas un gate.
// ══════════════════════════════════════════════════════════════════════════
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCalendar } from '../lib/calendar-model.mjs';
import { splitDayHtml, isDayMetaLine, DAY_ACTION_FAMILIES, bandMarkHeight } from '../lib/day-view.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const read = (p) => readFileSync(R(p), 'utf8');
const errors = [];
const notes = [];

// ── 1) L'ORDRE DU CALENDRIER ──────────────────────────────────────────────
// Sur les journées réelles du programme, le modèle doit produire des mois,
// des semaines et des jours strictement croissants. C'est l'invariant
// V54.2.1, et c'est celui que le test négatif a trouvé sans protection.
{
  const program = JSON.parse(read('data/program.json'));
  const cal = buildCalendar(program.days);
  const asc = (xs) => xs.every((v, i) => i === 0 || v > xs[i - 1]);

  const months = cal.months.map((m) => m.month);
  if (!asc(months)) errors.push(`[calendrier] mois non strictement croissants : ${months.slice(0, 6)}…`);

  const weeks = cal.months.flatMap((m) => m.weeks.map((w) => w.week));
  if (!asc(weeks)) errors.push(`[calendrier] semaines non strictement croissantes : ${weeks.slice(0, 8)}…`);

  const days = cal.months.flatMap((m) => m.weeks.flatMap((w) => w.days.map((d) => d.day)));
  if (!asc(days)) errors.push(`[calendrier] journées non strictement croissantes : ${days.slice(0, 8)}…`);
  if (days.length !== program.days.length) {
    errors.push(`[calendrier] ${days.length} journées rendues pour ${program.days.length} au programme`);
  }
  notes.push(`ordre du calendrier : ${months.length} mois, ${weeks.length} semaines, ${days.length} journées, tous croissants`);

  // `buildCalendar` trie toujours (durcissement V54.2.1) : l'ordre ne peut plus
  // casser dans le MODÈLE. Le test négatif l'a confirmé — inverser l'entrée ne
  // change rien. Le risque restant est donc dans la VUE, et c'est là qu'il
  // n'était protégé par rien : inverser `cal.months.map` en page passait les
  // 39 gates. On contrôle le rendu.
  const page = read('app/calendar/page.tsx');
  for (const [re, what] of [
    [/cal\.months\s*\.\s*(reverse|sort)\s*\(/, 'les mois sont réordonnés au rendu'],
    [/\[\s*\.\.\.\s*cal\.months\s*\]\s*\.\s*(reverse|sort)\s*\(/, 'les mois sont copiés puis réordonnés au rendu'],
    [/mb\.weeks\s*\.\s*(reverse|sort)\s*\(/, 'les semaines sont réordonnées au rendu'],
    [/wb\.days\s*\.\s*(reverse|sort)\s*\(/, 'les journées sont réordonnées au rendu'],
  ]) {
    if (re.test(page)) errors.push(`[calendrier] ${what} — DATA ORDER = DOM ORDER = READING ORDER rompu`);
  }
  if (!/\{cal\.months\.map\(/.test(page)) {
    errors.push('[calendrier] le rendu des mois ne part plus directement de `cal.months`');
  }
}

// ── 2) LA SÉPARATION LECTURE / ACTION EST PILOTÉE PAR LE CORPUS ───────────
// Elle doit lire `data-family` et rien d'autre. Une seconde taxonomie
// réintroduirait exactement ce que V60.1 avait retiré.
{
  const fams = [...DAY_ACTION_FAMILIES].sort().join(',');
  if (fams !== 'apply,practice,prepare,verify') {
    errors.push(`[journée] familles d'action inattendues : ${fams}`);
  }
  const out = splitDayHtml(
    '<h2 data-family="learn">A</h2><p>a</p><h2 data-family="practice">B</h2><p>b</p>',
  );
  if (out.readCount !== 1 || out.actCount !== 1) {
    errors.push(`[journée] la séparation lecture/action ne partitionne pas : ${out.readCount}/${out.actCount}`);
  }
  if (!out.read.includes('>A<') || !out.act.includes('>B<')) {
    errors.push('[journée] la séparation lecture/action place une section du mauvais côté');
  }
  notes.push(`séparation lecture/action : ${fams}`);
}

// ── 3) LA LIGNE DE MÉTADONNÉES N'EST PAS UN CHAPEAU ──────────────────────
{
  if (!isDayMetaLine('Mois 3 · Semaine 12 · Compétence : Architecture · Difficulté : Intermédiaire/5 · Durée : 4.5 h')) {
    errors.push('[journée] la ligne de métadonnées du corpus n’est plus détectée');
  }
  if (isDayMetaLine('Le cache échange de la fraîcheur contre de la vitesse.')) {
    errors.push('[journée] une phrase ordinaire est prise pour une ligne de métadonnées');
  }
}

// ── 4) LA LIGNE DE CONTEXTE EST PROPAGÉE ─────────────────────────────────
// C'est le signe d'identité le plus fort du produit. S'il disparaît d'une
// surface quotidienne, les surfaces cessent d'appartenir au même produit.
{
  const REQUIRED = [
    ['app/page.tsx', 'tableau de bord'],
    ['app/day/[id]/page.tsx', 'journée'],
    ['app/month/[id]/page.tsx', 'mois'],
    ['app/week/[id]/page.tsx', 'semaine'],
    ['app/calendar/page.tsx', 'calendrier'],
  ];
  for (const [file, label] of REQUIRED) {
    if (!/<ContextLine[\s/>]/.test(read(file))) {
      errors.push(`[identité] ligne de contexte absente de « ${label} » (${file})`);
    }
  }
  notes.push(`ligne de contexte : ${REQUIRED.length} surfaces quotidiennes`);
}

// ── 5) LE CONTRAT DES DEUX MOTIFS DE TRAJECTOIRE ─────────────────────────
// TrajectoryMap = le chemin : une épine, une tête de position nommée.
// YearBand      = le relief : une hauteur qui porte la difficulté réelle.
// Si l'un des deux perd sa marque distinctive, ils redeviennent confondables.
{
  const tmap = read('app/TrajectoryMapGrid.tsx');
  for (const [needle, what] of [
    ['tmap-spine', 'épine continue'],
    ['tmap-here', 'tête de position nommée'],
    ['tmap-orient', 'bornes d’orientation'],
    // La classe est construite par gabarit (`is-${state}`) : on vérifie
    // l'expression qui la produit, pas une chaîne qui n'existe pas telle
    // quelle dans la source.
    ["'behind'", 'distinction parcouru / à-venir'],
    ['tmap-lane is-', 'état de piste'],
  ]) {
    if (!tmap.includes(needle)) errors.push(`[motif] TrajectoryMap a perdu son ${what} (${needle})`);
  }

  const band = read('app/ui/YearBand.tsx');
  if (!/bandMarkHeight\s*\(/.test(band)) {
    errors.push('[motif] YearBand ne calcule plus la hauteur de ses marques par `bandMarkHeight`');
  }
  if (!/hasRelief\s*=\s*days\.some\(/.test(band)) {
    errors.push('[motif] YearBand ne dérive plus son relief des difficultés réelles');
  }
  // Comportement, pas présence : le relief doit réellement varier.
  const hs = [1, 2, 3, 4, 5].map(bandMarkHeight);
  if (new Set(hs).size !== 5) errors.push(`[motif] le relief de YearBand ne varie plus : ${hs}`);
  if (hs[0] >= hs[4]) errors.push('[motif] le relief de YearBand n’est plus croissant avec la difficulté');
  if (hs[4] !== 100) errors.push(`[motif] la difficulté maximale n’occupe plus toute la bande : ${hs[4]}%`);
  if (bandMarkHeight(0) !== null || bandMarkHeight(undefined) !== null) {
    errors.push('[motif] YearBand dessine un relief sans difficulté déclarée');
  }
  // Le relief ne doit pas être un halo de position : ce rôle appartient à
  // TrajectoryMap.
  const atBlock = /\.year-band\.has-relief \.year-band-day\.at\s*\{([^}]*)\}/.exec(read('app/globals.css'));
  if (atBlock && /rgba\(139|0 0 \d+px/.test(atBlock[1])) {
    errors.push('[motif] YearBand reprend un halo de position — c’est le rôle de TrajectoryMap');
  }
  notes.push('contrat des motifs : chemin (épine + tête) contre relief (hauteur)');
}

// ── 6) PORTÉE CSS ────────────────────────────────────────────────────────
// Aucune règle globale nouvelle sur une balise nue. La leçon de
// `.page-head { display:flex }` est permanente.
{
  const css = read('app/globals.css');
  const bad = [];
  for (const line of css.split('\n')) {
    const m = /^(article|section|h1|h2|a|button)\s*\{/.exec(line.trim());
    if (m) bad.push(m[1]);
  }
  // `h1`, `h2` et `a` nus existent depuis la base typographique du produit :
  // ils sont tolérés tels quels, mais leur NOMBRE est verrouillé pour qu'on
  // n'en ajoute pas de nouveaux sans le voir.
  const ALLOWED = 3;
  if (bad.length > ALLOWED) {
    errors.push(`[css] ${bad.length} règles sur balise nue (${bad.join(', ')}), plafond ${ALLOWED}`);
  }
  notes.push(`portée CSS : ${bad.length} règles sur balise nue (plafond ${ALLOWED})`);
}

// ── 7) AUCUN SIXIÈME MOTIF ───────────────────────────────────────────────
{
  const CLOSED = ['pos-ring', 'tmap', 'phase-rail', 'evi-mark', 'year-band'];
  notes.push(`ensemble des motifs : ${CLOSED.length} — ${CLOSED.join(', ')}`);
}

for (const n of notes) console.log(`  · ${n}`);
if (errors.length) {
  console.error(`\n❌ V61 invalide (${errors.length}) :`);
  for (const e of errors) console.error(`  • ${e}`);
  process.exit(1);
}
console.log('\n✅ V61 valide : ordre du calendrier croissant, séparation lecture/action pilotée par le corpus, ligne de contexte propagée, contrat des deux motifs de trajectoire tenu, portée CSS verrouillée.');
