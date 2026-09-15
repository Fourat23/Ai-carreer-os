// V77 · CP8 — lecture des déclarations hors corpus. L'I/O que le module pur refuse.
//
// Le fichier ABSENT est un état NORMAL, pas une erreur : c'est même l'état livré
// par le CP8, parce que l'audit des sources n'a rien trouvé qui tranche
// honnêtement. Une absence ne doit donc jamais faire échouer une résolution.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { normaliserDeclarations, CHEMIN_DECLARATIONS } from './exercise-declarations.mjs';

type Declaration = { lessons: string[]; source: string; note: string };

let cache: Record<string, Declaration> | null = null;

export function declarationsHorsCorpus(): Record<string, Declaration> {
  if (cache) return cache;
  const p = join(process.cwd(), CHEMIN_DECLARATIONS);
  if (!existsSync(p)) { cache = {}; return cache; }
  try {
    cache = normaliserDeclarations(JSON.parse(readFileSync(p, 'utf8'))) as Record<string, Declaration>;
  } catch {
    // Un fichier illisible vaut « aucune déclaration » : on ne devine pas, et on
    // ne casse pas le produit pour un JSON mal formé.
    cache = {};
  }
  return cache;
}
