#!/usr/bin/env node
// Gate d'audit pédagogique V20 — lance : npm run v20:pedagogy-check
//
// 1. Scan de DANGER toujours actif sur un ensemble de fichiers (scanGlobs du
//    registre) : tout signal BLOQUANT (commande destructive/privilégiée non
//    signalée, promesse de sécurité trompeuse, code tronqué) échoue la gate.
// 2. Validation du REGISTRE de notes humaines (docs/architecture/
//    v20-pedagogy-audit.json) contre les seuils de la rubrique, + scan de danger
//    sur la source réelle de chaque élément audité.
// Lecture seule ; exit 1 au moindre problème bloquant. Passe avec un registre vide.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateAuditLedger, detectDangerSignals, structuralSignals } from '../lib/pedagogy-audit.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const errors = [];
const warnings = [];

const LEDGER_PATH = R('docs/architecture/v20-pedagogy-audit.json');
if (!existsSync(LEDGER_PATH)) { console.error(`❌ registre introuvable : ${LEDGER_PATH}`); process.exit(1); }
const ledger = JSON.parse(readFileSync(LEDGER_PATH, 'utf8'));

const dayPath = (id) => R(`curriculum/days/day-${String(id).replace(/^day-?/i, '').padStart(3, '0')}.md`);
const glossaryText = (() => {
  let g = [];
  try { g = JSON.parse(readFileSync(R('curriculum/glossary/glossary.json'), 'utf8')); } catch { /* ignore */ }
  const byTerm = new Map(g.map((e) => [String(e.term).toLowerCase(), e]));
  return (id) => {
    const e = byTerm.get(String(id).toLowerCase());
    return e ? `${e.shortDefinition}\n${e.detailedDefinition}\n${e.meetingExample ?? ''}` : null;
  };
})();

/** Résout le contenu source d'un élément audité selon son kind. */
function loadSource(item) {
  try {
    if (item.kind === 'day') { const p = dayPath(item.id); return existsSync(p) ? readFileSync(p, 'utf8') : null; }
    if (item.kind === 'exercise') { const p = R(`data/exercises/${item.id}.json`); return existsSync(p) ? readFileSync(p, 'utf8') : null; }
    if (item.kind === 'mission') { const p = R(`data/missions/${item.id}.json`); return existsSync(p) ? readFileSync(p, 'utf8') : null; }
    if (item.kind === 'glossary') return glossaryText(item.id);
    if (item.kind === 'content' && item.sourcePath) { const p = R(item.sourcePath); return existsSync(p) ? readFileSync(p, 'utf8') : null; }
  } catch { /* ignore */ }
  return null;
}

// ── 1. Scan de danger toujours actif (scanGlobs) ─────────────────────────────
function expandGlob(spec) {
  // Support minimal : "curriculum/days/*.md", "data/exercises/*.json", chemin exact.
  const m = spec.match(/^(.*)\/\*(\.\w+)$/);
  if (!m) { const p = R(spec); return existsSync(p) ? [spec] : []; }
  const dir = R(m[1]); const ext = m[2];
  try { return readdirSync(dir).filter((f) => f.endsWith(ext)).map((f) => `${m[1]}/${f}`); } catch { return []; }
}
const scanFiles = [...new Set((ledger.scanGlobs ?? []).flatMap(expandGlob))];
let scanned = 0;
for (const rel of scanFiles) {
  const p = R(rel);
  if (!existsSync(p)) continue;
  scanned += 1;
  for (const s of detectDangerSignals(readFileSync(p, 'utf8'))) {
    const msg = `${rel} : ${s.code} — ${s.excerpt}`;
    if (s.severity === 'blocking') errors.push(msg); else warnings.push(msg);
  }
}

// ── 2. Registre de notes humaines + danger sur chaque source ─────────────────
const res = validateAuditLedger(ledger, loadSource);
errors.push(...res.errors);
warnings.push(...res.warnings);

// Complétude structurelle (informative) des journées auditées.
for (const item of ledger.items ?? []) {
  if (item.kind !== 'day') continue;
  const src = loadSource(item);
  if (typeof src !== 'string') { warnings.push(`${item.id} : source introuvable pour l'analyse structurelle`); continue; }
  const s = structuralSignals(src);
  if (s.missing.length) warnings.push(`${item.id} : composants absents (${s.missing.join(', ')})`);
}

console.log('── Gate d\'audit pédagogique V20 ──');
console.log(`Registre                : ${res.summary.items} élément(s) noté(s) (${res.summary.recent} récent·s)`);
console.log(`Fichiers scannés (danger): ${scanned}`);
console.log(`Avertissements          : ${warnings.length}`);
for (const w of warnings.slice(0, 30)) console.log(`⚠️  ${w}`);
if (warnings.length > 30) console.log(`   … (+${warnings.length - 30})`);
if (errors.length) { console.error(`\n❌ ${errors.length} problème(s) bloquant(s) :`); for (const e of errors) console.error(`   • ${e}`); process.exit(1); }
console.log('\n✅ Audit pédagogique V20 : aucun signal bloquant, notes conformes aux seuils.');
