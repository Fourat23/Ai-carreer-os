// Gate V54.2 — barre de qualité visuelle des 3 surfaces de référence
// (Dashboard / Parcours / Synthèse) + anti-AI-slop affiné.
//
// Différence avec v53/v54:check : ce gate cible la QUALITÉ DE COMPOSITION et
// évite les faux positifs naïfs (« niveau » est légitime pour un niveau de
// compétence ou de difficulté ; seul le niveau GAMIFIÉ est interdit).
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const errors = [];
const warns = [];
// Empreinte des leçons REGELÉE au V66 · CP8 (précédente : e34b1c76dc7f9e7be1cc40f7f8fcd0b7733811f2).
// 9 leçons durcies + une clôture de bloc réparée dans rag-evaluation.md.
// Inventaire ligne à ligne : docs/audits/V66-FLAGSHIPS.md. Le gel n'est pas
// assoupli : il a rougi comme prévu sur une modification autorisée.
// V67 · CP3-CP8 — RE-GEL, TROISIEME, sur autorisation explicite. 44 des 45
// lecons de famille C etaient privees de correction, de cas professionnel, de
// transfert et de recuperation active ; 17 lecons passaient sous le seuil de
// profondeur. V67 a traite ce stock. Le gel a rougi de lui-meme, ce qui est sa
// fonction ; il est mis a jour ici, jamais silencieusement.
//   V66 -> e34b1c76dc7f9e7be1cc40f7f8fcd0b7733811f2
//   V67 -> d8b7dc354abb1bec61acb8bc86259a0332d55199
// Re-gelé par V68 (CP15). Le corpus de leçons a changé parce que les 41 leçons du
// parcours qui n'avaient AUCUNE correction en ont désormais une, et que
// metrics-percentiles portait un p99 faux d'un facteur 50. Voir
// docs/V68-CP0-AUDIT.md et docs/V68-FINAL-REPORT.md. Aucune journée n'a été
// réordonnée ; data/progress.json est inchangé.
// Re-gelé en V69 (CP3-CP8) : réécriture pédagogique autorisée de 40 exemples guidés
// (docs/V69-FINAL-REPORT.md, docs/V69-LESSON-LEDGER.md). Le gel protège contre une
// dérive SILENCIEUSE du corpus, pas contre une réécriture décidée et documentée.
// Chaîne des empreintes : 7c9db74f -> b5ed5aee -> 7a3fd017 -> 64748e15.
// RE-GEL V70 CP5 puis CP6 — le corpus des 128 leçons a été modifié volontairement.
// Lot Frontend / Next.js / CSS : 19 leçons réécrites en profondeur (exemples
// guidés reconstruits, pratiques avec production observable, corrections
// raisonnées). Le gel passe de 64748e1522904dbc811bb486409d6fb53dc0ec75
// à d8b7dc354abb1bec61acb8bc86259a0332d55199.
// Ce n'est pas un contournement du gate : le gate protège contre une
// modification NON DÉCLARÉE du corpus, et celle-ci est déclarée, committée
// et mesurée (mini-statut CP5).
const FROZEN_CORPUS = 'd8b7dc354abb1bec61acb8bc86259a0332d55199';
const FROZEN_PROGRESS = '323604021055588a9528a86875f36598dbdc7758';
const REF_PAGES = ['app/page.tsx', 'app/parcours/page.tsx', 'app/synthese/page.tsx'];

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f); const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (f.endsWith('.tsx') || f.endsWith('.ts')) out.push(p);
  }
  return out;
}
const tsxFiles = existsSync(R('app')) ? walk(R('app')) : [];
const rel = (f) => f.replace(ROOT + '/', '');

// ── 1) Gel du curriculum / de la progression ────────────────────────────────
try {
  const s = execSync("find curriculum/lessons -name '*.md' | sort | xargs cat | sha1sum", { cwd: ROOT }).toString().trim().split(/\s+/)[0];
  if (s !== FROZEN_CORPUS) errors.push(`[corpus] SHA-1 modifié : ${s}`);
} catch { warns.push('[corpus] hash indisponible'); }
try {
  const b = execSync('git hash-object data/progress.json', { cwd: ROOT }).toString().trim();
  if (b !== FROZEN_PROGRESS) errors.push(`[progress] modifié : ${b}`);
} catch { warns.push('[progress] indisponible'); }
try {
  const prog = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
  if (prog.days.length !== 365) errors.push(`[days] ${prog.days.length} ≠ 365`);
  else if (!prog.days.every((d, i) => d.day === i + 1)) errors.push('[order] ordre des 365 jours modifié');
} catch { warns.push('[program] illisible'); }

// ── 2) Anti-AI-slop / anti-gamification (sans faux positifs naïfs) ──────────
// Interdits SANS ambiguïté :
const HARD = [
  [/\bXP\b/, 'XP'],
  [/\bstreaks?\b/i, 'streak'],
  [/\bleaderboards?\b/i, 'leaderboard'],
  [/\bconfettis?\b/i, 'confetti'],
  [/\bachievements?\b/i, 'achievement'],
  [/\bgamif/i, 'gamification'],
  [/\btrophée?s?\b/i, 'trophée'],
];
// « niveau » n'est interdit QUE sous forme gamifiée (niveau utilisateur/joueur,
// « niveau 12 », « level up »). Niveau de compétence/difficulté = légitime.
const GAMIFIED_LEVEL = /\blevel\s*up\b|\bniveau\s+(?:utilisateur|du\s+joueur|joueur)\b|\bniveau\s+\d+\s*(?:\/|sur)?\s*(?:\d+)?\s*(?:!|🎉)/i;
// Décor interdit : dégradés décoratifs et halos dans le CSS des surfaces.
const DECOR = [
  [/linear-gradient\([^)]*\)/i, 'gradient décoratif'],
  [/\bbox-shadow:[^;]*\b(?:0\s+0\s+\d{2,}px)/i, 'halo/glow'],
  [/\banimation:\s*(?!none)/i, 'animation décorative'],
];

for (const f of tsxFiles) {
  const txt = readFileSync(f, 'utf8');
  txt.split('\n').forEach((ln, i) => {
    for (const [re, label] of HARD) {
      if (re.test(ln)) errors.push(`[slop] ${rel(f)}:${i + 1} « ${label} » : ${ln.trim().slice(0, 60)}`);
    }
    if (GAMIFIED_LEVEL.test(ln)) errors.push(`[slop] ${rel(f)}:${i + 1} niveau gamifié : ${ln.trim().slice(0, 60)}`);
  });
}

// ── 3) Couleurs en dur interdites dans le TSX ──────────────────────────────
let hex = 0;
for (const f of tsxFiles) { const m = readFileSync(f, 'utf8').match(/#[0-9a-fA-F]{6}\b/g); if (m) hex += m.length; }
if (hex > 0) errors.push(`[tokens] ${hex} couleur(s) hex en dur dans le TSX (base 0)`);

// ── 4) Surfaces de référence : composition attendue ────────────────────────
for (const p of REF_PAGES) if (!existsSync(R(p))) errors.push(`[ref] page de référence manquante : ${p}`);

const dash = existsSync(R('app/page.tsx')) ? readFileSync(R('app/page.tsx'), 'utf8') : '';
// Un seul POINT FOCAL par page (jamais deux).
// V55 : la primitive a changé de forme — `PrimaryFocus` (panneau) est devenu
// `HeroFocus` (hero pleine largeur, cran typographique display). L'intention
// testée est inchangée : exactement un point focal.
const focusCount = (dash.match(/<PrimaryFocus\b/g) ?? []).length + (dash.match(/<HeroFocus\b/g) ?? []).length;
if (focusCount !== 1) errors.push(`[composition] le Dashboard doit avoir exactement 1 point focal (trouvé ${focusCount})`);
// Socle pleine largeur (règle anti-vide).
if (!/dash-socle/.test(dash)) errors.push('[composition] Dashboard : socle pleine largeur absent (règle anti-vide)');
// Anti-redondance : le « prochain livrable » doit être conditionné (≠ jour du focus).
if (!/nextDeliverable\.day\s*!==\s*pos\.resumeDay/.test(dash)) {
  errors.push('[composition] Dashboard : « prochain livrable » non dé-dupliqué du PrimaryFocus');
}
// Anti-métrique vide : le rythme ne doit pas s'afficher quand le compteur est arrêté.
if (!/pos\.expectedDay\s*!==\s*null\s*&&/.test(dash)) {
  errors.push('[composition] Dashboard : « rythme » affiché même sans compteur démarré');
}

const parc = existsSync(R('app/parcours/page.tsx')) ? readFileSync(R('app/parcours/page.tsx'), 'utf8') : '';
if (!/btn cta/.test(parc)) errors.push('[composition] Parcours : action principale (btn cta) absente');
if (!/track-roadmap/.test(parc)) errors.push('[composition] Parcours : roadmap (séquence de modules) absente');

const synth = existsSync(R('app/synthese/page.tsx')) ? readFileSync(R('app/synthese/page.tsx'), 'utf8') : '';
if (!/col-p/.test(synth) || !/col-s/.test(synth)) {
  errors.push('[composition] Synthèse : colonnes PRIMARY/SECONDARY non déclarées (col-p / col-s)');
}
// Représentation mobile : chaque cellule repliable doit porter un libellé.
const labelled = (synth.match(/data-label=/g) ?? []).length;
if (labelled < 6) errors.push(`[composition] Synthèse : représentation mobile incomplète (${labelled} data-label < 6)`);

// ── 5) CSS des surfaces : pas de décor interdit dans les blocs V54.2 ───────
const css = existsSync(R('app/globals.css')) ? readFileSync(R('app/globals.css'), 'utf8') : '';
const v542Css = css.split('V54.2').slice(1).join('\n');
for (const [re, label] of DECOR) {
  if (re.test(v542Css)) warns.push(`[decor] motif « ${label} » présent dans le CSS V54.2 — vérifier qu'il est fonctionnel`);
}
if (!/prefers-reduced-motion/.test(css)) errors.push('[a11y] prefers-reduced-motion absent');

// ── 6) Intégrité de progression : la preuve doit exister ───────────────────
if (!existsSync(R('scripts/v542-integrity.mjs'))) {
  errors.push('[integrity] preuve VISIT_*_DOES_NOT_MUTATE_PROGRESS absente');
}

console.log('── Gate V54.2 (barre de qualité visuelle)');
console.log(`Fichiers UI : ${tsxFiles.length} · hex : ${hex} · surfaces de référence : ${REF_PAGES.length}`);
if (warns.length) { console.log(`Avertissements (${warns.length}) :`); for (const w of warns.slice(0, 8)) console.log('  ⚠ ' + w); }
if (errors.length) {
  console.error(`\n❌ Gate V54.2 : ${errors.length} violation(s) :`);
  for (const e of errors) console.error('  • ' + e);
  process.exit(1);
}
console.log('\n✅ V54.2 valide : curriculum gelé, aucune gamification, composition conforme (1 focus, socle, anti-redondance), colonnes PRIMARY/SECONDARY + mobile libellé, 0 hex.');
