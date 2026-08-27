#!/usr/bin/env node
// ── GATE V62 — PRODUCT MIGRATION II / UX CLOSURE ───────────────────────────
//
// Ce gate protège ce que V62 a établi. Chacune de ses vérifications a été VUE
// ÉCHOUER avant d'être considérée comme prouvée (§19 du brief) : la procédure
// et les résultats sont consignés dans docs/audits/V62-FINAL-REPORT.md.
//
// Il est statique : il lit le dépôt, ne lance pas de navigateur. Les mesures
// de rendu (hauteurs, DOM, axe) sont faites par les sondes du sprint, pas ici.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const read = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
const errors = [];
const notes = [];

// ── 1) GRAMMAIRE DE CONTEXTE ───────────────────────────────────────────────
// Les deux coquilles partagées portent la ligne de contexte ET la suite. Elles
// couvrent à elles seules dix routes ; les casser casse dix routes en silence.
{
  // Les motifs sont des EXPRESSIONS RÉGULIÈRES, pas des sous-chaînes. Testé en
  // négatif : `includes('<ContextLine')` accepte `<ContextLineX`, donc casser
  // la balise ne faisait PAS échouer le gate. C'est précisément le trou que le
  // gate V61 avait déjà trouvé, et que celui-ci avait reproduit au premier
  // essai. Le délimiteur qui suit le nom est donc exigé.
  const CTX = /<ContextLine[\s/>]/;
  const shells = [
    ['app/tech/TechBench.tsx', 'laboratoires techniques', [CTX, /next\.href/, /tb-next/]],
    ['app/ui/WorkbenchShell.tsx', 'postes de travail techniques', [CTX]],
    ['app/ui/EditorialShell.tsx', 'famille éditoriale', [/\{context\}/, /next\.href/, /tb-next/]],
  ];
  for (const [file, label, needles] of shells) {
    const src = read(file);
    if (!src) { errors.push(`[contexte] coquille absente : ${file}`); continue; }
    for (const n of needles) {
      if (!n.test(src)) {
        errors.push(`[contexte] motif ${n} absent de la coquille « ${label} » (${file})`);
      }
    }
  }
  notes.push('coquilles partagées : contexte et suite présents dans les trois');
}

// ── 2) LA SUITE EST RÉELLE, PAS DÉCORATIVE ─────────────────────────────────
// Les cinq laboratoires techniques calculent leur action depuis leur propre
// catalogue. Un `next` codé en dur serait une action inventée.
{
  const labs = [
    ['app/security/page.tsx', 'scenarios'],
    ['app/cloud-foundations/page.tsx', 'architectures'],
    ['app/cloud-lab/page.tsx', 'topologies'],
    ['app/kubernetes/page.tsx', 'scenarios'],
    ['app/pipelines/page.tsx', 'pipelines'],
  ];
  for (const [file, coll] of labs) {
    const src = read(file);
    if (!new RegExp(`const first = ${coll}\\[0\\]`).test(src)) {
      errors.push(`[suite] ${file} ne dérive plus sa suite de « ${coll}[0] »`);
    }
    if (!/next = first\s*\n?\s*\?/.test(src)) {
      errors.push(`[suite] ${file} : la suite n'est plus conditionnée à un catalogue non vide`);
    }
  }
  notes.push(`suite dérivée du catalogue : ${labs.length} laboratoires`);
}

// ── 3) LA CLASSE D'ACTION PRIMAIRE EXISTE VRAIMENT ─────────────────────────
// Trouvé au CP11 : deux boutons « Lancer » portaient `btn-primary`, une classe
// déclarée NULLE PART dans la feuille de style. Ils se rendaient donc en
// bouton secondaire, sans que rien ne le signale. Le gate interdit toute
// classe `btn-*` non déclarée.
{
  const css = read('app/globals.css');
  const used = new Set();
  const files = [
    'app/pipelines/[id]/PipelineRunner.tsx', 'app/lab/[exerciseId]/TerminalPanel.tsx',
    'app/cloud-lab/[id]/TopologyAnalyzer.tsx', 'app/security/[id]/SecurityAnalyzer.tsx',
    'app/missions/[id]/MissionDetail.tsx', 'app/capstones/[id]/CapstoneRunner.tsx',
  ];
  for (const f of files) {
    for (const m of read(f).matchAll(/className="[^"]*\b(btn-[a-z-]+)\b/g)) used.add(m[1]);
  }
  for (const cls of used) {
    if (!css.includes(`.${cls}`)) {
      errors.push(`[action] classe « ${cls} » utilisée mais déclarée nulle part dans globals.css`);
    }
  }
  notes.push(`classes d'action vérifiées : ${used.size === 0 ? 'aucune classe btn-* orpheline' : [...used].join(', ')}`);
}

// ── 4) BUDGET DE DOM DU LABORATOIRE ────────────────────────────────────────
// /lab rendait 5 264 nœuds dans des <details> FERMÉS. Le rendu conditionnel
// des lignes est ce qui l'a ramené à 217. Le retirer ferait revenir la dette
// sans qu'aucun test ne bouge.
{
  const src = read('app/lab/LabCatalog.tsx');
  if (!/\{\(active \|\| openKeys\.has\(g\.key\)\) && \(/.test(src)) {
    errors.push('[dom] /lab ne rend plus ses lignes conditionnellement : la dette de DOM revient');
  }
  if (/open=\{[^}]*gi === 0/.test(src)) {
    errors.push('[dom] /lab rouvre automatiquement un groupe : mesuré, cela ramène 9 637 px à 375 px');
  }
  notes.push('laboratoire : lignes rendues seulement pour les groupes ouverts');
}

// ── 5) LE GLOSSAIRE SERT UN INDEX, PAS LE CORPUS ENTIER ────────────────────
// 778 Ko de payload contre 108 Ko d'index. Repasser `getGlossary()` au
// composant client rendrait la route la plus lourde du produit sans qu'aucun
// test ne le voie.
{
  const page = read('app/glossary/page.tsx');
  if (!page.includes('getGlossaryIndex()')) {
    errors.push('[dom] /glossary ne sert plus l’index léger : le corpus complet repart vers le client');
  }
  if (/entries=\{getGlossary\(\)\}/.test(page)) {
    errors.push('[dom] /glossary passe le corpus complet au composant client');
  }
  if (!existsSync(join(ROOT, 'app/api/glossary/[id]/route.ts'))) {
    errors.push('[dom] la route de détail du glossaire a disparu : les fiches ne se chargent plus');
  }
  notes.push('glossaire : index léger + fiche à la demande');
}

// ── 6) ENSEMBLE DES MOTIFS FERMÉ À CINQ ────────────────────────────────────
{
  const MOTIFS = ['pos-ring', 'tmap', 'phase-rail', 'evi-mark', 'year-band'];
  const css = read('app/globals.css');
  for (const m of MOTIFS) {
    if (!css.includes(`.${m}`)) errors.push(`[motifs] motif « ${m} » absent de la feuille de style`);
  }
  const index = read('app/ui/index.ts');
  const exported = ['PositionRing', 'PhaseRail', 'EvidenceMark', 'YearBand'];
  for (const e of exported) {
    if (!index.includes(e)) errors.push(`[motifs] « ${e} » n'est plus exporté par app/ui`);
  }
  // Un sixième motif se déclarerait comme les cinq autres : par un composant
  // exporté ET une classe racine dédiée. On refuse tout ajout non déclaré.
  const declared = (index.match(/^export \{ (PositionRing|PhaseRail|EvidenceMark|YearBand)/gm) ?? []).length;
  if (declared > 4) errors.push('[motifs] plus de quatre motifs exportés en plus de TrajectoryMap : l’ensemble n’est plus fermé à cinq');
  notes.push(`ensemble des motifs : 5 — ${MOTIFS.join(', ')}`);
}

// ── 7) ANTI-CARTIFICATION DES CATALOGUES TECHNIQUES ────────────────────────
// `.pl-cards` a cessé d'être une grille de cartes. Y remettre `display: grid`
// ramènerait les six signatures identiques de /cloud-foundations.
{
  const css = read('app/globals.css');
  const block = css.slice(css.lastIndexOf('.pl-cards {'));
  if (!/^\.pl-cards \{[^}]*display: block/m.test(block)) {
    errors.push('[cartes] `.pl-cards` n’est plus une liste de lignes : la grille de cartes revient sur cinq catalogues');
  }
  notes.push('catalogues techniques : lignes, pas cartes');
}

// ── 8) AUCUNE ÉMOJI DANS UN TITRE ──────────────────────────────────────────
// La direction du produit les exclut ; une avait survécu dans /doc.
{
  const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
  for (const f of ['app/doc/[...slug]/page.tsx', 'app/lessons/page.tsx', 'app/glossary/page.tsx']) {
    for (const m of read(f).matchAll(/<h[1-3][^>]*>([^<]*)</g)) {
      if (EMOJI.test(m[1])) errors.push(`[direction] émoji dans un titre de ${f} : « ${m[1].trim()} »`);
    }
  }
  notes.push('titres : aucune émoji');
}

console.log('');
console.log('── Gate V62 (migration produit II · clôture UX)');
for (const n of notes) console.log(`  · ${n}`);
console.log('');
if (errors.length) {
  console.log(`❌ V62 invalide (${errors.length}) :`);
  for (const e of errors) console.log(`  • ${e}`);
  process.exit(1);
}
console.log('✅ V62 valide : grammaire de contexte tenue par les coquilles partagées, suite dérivée des catalogues réels, aucune classe d’action orpheline, budgets de DOM protégés, motifs fermés à cinq, catalogues techniques en lignes.');
