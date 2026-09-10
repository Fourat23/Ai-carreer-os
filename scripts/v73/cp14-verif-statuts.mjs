// V73 · CP14 — vérificateur de statuts, pour la mutation n° 8.
// Rouge si une leçon du registre n'a pas un statut parmi les cinq du §2 du contrat (règle I5 :
// aucune zone grise).
import { readFileSync } from 'node:fs';
const STATUTS = new Set(['CORE', 'ADVANCED', 'OPTIONAL', 'REFERENCE', 'DEPRECATED']);
const reg = JSON.parse(readFileSync('docs/v73/V73-STATUTS-128.json', 'utf8'));
const sans = reg.filter((l) => !STATUTS.has(l.statut));
console.log(`I5 — leçons du registre : ${reg.length} · sans statut valide : ${sans.length}`);
if (reg.length !== 128) { console.log(`❌ le registre doit contenir 128 leçons`); process.exitCode = 1; }
if (sans.length) { console.log(`❌ violation de I5 : ${sans.map((l) => l.slug).join(', ')}`); process.exitCode = 1; }
