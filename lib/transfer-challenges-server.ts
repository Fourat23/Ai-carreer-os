// Chargement serveur des défis de transfert (fixtures JSON validées, mémoïsées).
// Contenu versionné (data/transfer-challenges/*.json), séparé de la progression.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateTransferChallenge } from './transfer-challenge.mjs';
import type { TransferChallenge } from './transfer-challenge';

const DIR = join(process.cwd(), 'data', 'transfer-challenges');

let cached: TransferChallenge[] | null = null;

function loadAll(): TransferChallenge[] {
  let files: string[] = [];
  try { files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort(); } catch { return []; }
  const out: TransferChallenge[] = [];
  const seen = new Set<string>();
  for (const f of files) {
    const raw = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
    const v = validateTransferChallenge(raw);
    if (!v.ok) throw new Error(`Défi de transfert invalide (${f}) : ${v.errors.join(' ; ')}`);
    if (seen.has(raw.id)) throw new Error(`Défi de transfert : id dupliqué « ${raw.id} » (${f}).`);
    seen.add(raw.id);
    out.push(raw as TransferChallenge);
  }
  return out;
}

export function listTransferChallenges(): TransferChallenge[] {
  if (!cached) cached = loadAll();
  return cached;
}

export function getTransferChallenge(id: string): TransferChallenge | null {
  return listTransferChallenges().find((c) => c.id === id) ?? null;
}
