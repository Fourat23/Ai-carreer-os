// Chargement serveur des capstones (fixtures JSON validées, mémoïsées). Les
// capstones sont du CONTENU versionné (data/capstones/*.json), séparé de la
// progression personnelle. Chaque fixture est validée au chargement : une fixture
// cassée lève une erreur explicite plutôt que d'échouer plus tard.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateCapstone } from './capstone.mjs';
import type { Capstone } from './capstone';

const DIR = join(process.cwd(), 'data', 'capstones');

let cached: Capstone[] | null = null;

function loadAll(): Capstone[] {
  let files: string[] = [];
  try {
    files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();
  } catch {
    return [];
  }
  const out: Capstone[] = [];
  const seen = new Set<string>();
  for (const f of files) {
    const raw = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
    const v = validateCapstone(raw);
    if (!v.ok) throw new Error(`Capstone invalide (${f}) : ${v.errors.join(' ; ')}`);
    if (seen.has(raw.id)) throw new Error(`Capstone : id dupliqué « ${raw.id} » (${f}).`);
    seen.add(raw.id);
    out.push(raw as Capstone);
  }
  return out;
}

export function listCapstones(): Capstone[] {
  if (!cached) cached = loadAll();
  return cached;
}

export function getCapstone(id: string): Capstone | null {
  return listCapstones().find((c) => c.id === id) ?? null;
}
