// Gate V59 — immuabilité forensique et invariants de signature.
//
// V58 a laissé réécrire son instantané de mesure en cours de sprint, ce qui a
// rendu son AVANT irrécupérable. Cette porte rend le même accident impossible :
// si `cp0-before.json` bouge d'un seul octet, le sprint échoue.
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const ROOT = process.cwd();
const CRITERIA = join(ROOT, 'docs', 'V59-CRITERIA-FROZEN.md');
const BEFORE = join(ROOT, 'docs', 'audits', 'v59', 'cp0-before.json');

const fail = [];
const ok = (m) => console.log(`  · ${m}`);

console.log('\n── Gate V59 (immuabilité forensique + signature)');

// ── 1. Les critères existent DANS LE DÉPÔT ─────────────────────────────────
if (!existsSync(CRITERIA)) {
  fail.push('docs/V59-CRITERIA-FROZEN.md absent : les critères ne vivent nulle part.');
} else {
  const c = readFileSync(CRITERIA, 'utf8');
  const required = [
    ['SHA-256 du BEFORE', /SHA-256 du BEFORE/],
    ['grille 12 catégories', /## 2\. Grille de notation/],
    ['conditions bloquantes', /Conditions bloquantes/],
    ['protocole blind difference', /## 5\. Blind difference/],
    ['tirage pré-enregistré', /## 6\. Navigation aléatoire/],
    ['règles de classification', /## 7\. Classification/],
    ['invariants', /## 8\. Invariants/],
    ['questions de certification', /## 9\. QUESTIONS DE CERTIFICATION/],
    ['question finale', /## 10\. QUESTION FINALE/],
  ];
  for (const [label, re] of required) {
    if (!re.test(c)) fail.push(`docs/V59-CRITERIA-FROZEN.md : section manquante — ${label}.`);
  }
  // Les 12 questions doivent être réellement présentes, pas seulement le titre.
  const qBlock = c.split('## 9. QUESTIONS DE CERTIFICATION')[1]?.split('## 10.')[0] ?? '';
  const nQ = (qBlock.match(/^\d+\.\s/gm) ?? []).length;
  if (nQ !== 12) fail.push(`questions de certification : ${nQ} trouvée(s), 12 attendues.`);
  else ok(`12 questions de certification présentes dans le dépôt`);

  // ── 2. Immuabilité de l'instantané CP0 ───────────────────────────────────
  const declared = c.match(/`([0-9a-f]{64})`/)?.[1] ?? null;
  if (!declared) fail.push('aucun SHA-256 déclaré dans les critères gelés.');
  else if (!existsSync(BEFORE)) fail.push('docs/audits/v59/cp0-before.json absent.');
  else {
    const actual = createHash('sha256').update(readFileSync(BEFORE)).digest('hex');
    if (actual !== declared) {
      fail.push(`INSTANTANÉ CP0 MODIFIÉ.\n      déclaré : ${declared}\n      réel    : ${actual}`);
    } else ok(`instantané CP0 intact — sha256 ${actual.slice(0, 16)}…`);
  }
}

// ── 3. Ensemble de motifs fermé à cinq ─────────────────────────────────────
const MOTIFS = ['pos-ring', 'tmap', 'phase-rail', 'evi-mark', 'year-band'];
const css = existsSync(join(ROOT, 'app', 'globals.css'))
  ? readFileSync(join(ROOT, 'app', 'globals.css'), 'utf8') : '';
const declaredMotifs = MOTIFS.filter((m) => css.includes(`.${m}`));
ok(`motifs propriétaires déclarés : ${declaredMotifs.length} (${declaredMotifs.join(', ')})`);
if (declaredMotifs.length > 5) fail.push(`${declaredMotifs.length} motifs : l'ensemble doit rester fermé à 5.`);

// ── 4. Aucune gamification ─────────────────────────────────────────────────
const BANNED = [
  [/\bXP\b/, 'XP'], [/confetti/i, 'confetti'], [/leaderboard/i, 'leaderboard'],
  [/\bstreak\b/i, 'streak'],
];
const scan = [];
for (const f of ['app/globals.css']) if (existsSync(join(ROOT, f))) scan.push([f, readFileSync(join(ROOT, f), 'utf8')]);
for (const [f, src] of scan) {
  for (const [re, label] of BANNED) if (re.test(src)) fail.push(`gamification détectée (${label}) dans ${f}.`);
}
if (!fail.some((m) => m.startsWith('gamification'))) ok('aucune gamification dans la feuille de style');

// ── 5. Verdict ─────────────────────────────────────────────────────────────
if (fail.length) {
  console.error('\n❌ V59 invalide :');
  for (const m of fail) console.error(`   - ${m}`);
  process.exit(1);
}
console.log('\n✅ V59 valide : critères et questions présents dans le dépôt, instantané CP0 intact à l\'octet près, ensemble de motifs fermé à 5, aucune gamification.\n');
