// Chargement serveur des tâches de terminal pédagogique (V20 CP7). Contenu
// versionné (data/terminal-tasks/*.json), validé au chargement contre les
// allowlists réelles des adaptateurs, les compétences et les jours. Une tâche
// cassée lève une erreur explicite. Aucun shell libre : chaque tâche est bornée.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cache } from 'react';
import { validateTerminalTask, publicTaskView } from './terminal.mjs';
import type { TerminalTask } from './terminal';
import { LOCAL_ALLOWLIST } from './terminal-local.mjs';
import { DOCKER_EXEC_ALLOWLIST } from './terminal-docker.mjs';
import { getProgram } from './program';
import { isKnownSkill } from './skill-taxonomy.mjs';

const DIR = join(process.cwd(), 'data', 'terminal-tasks');

interface RawTask extends TerminalTask {
  seedFiles?: { path: string; content: string }[];
  dockerImage?: string;
}

function loadAll(): RawTask[] {
  let files: string[] = [];
  try { files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort(); } catch { return []; }
  const program = getProgram();
  const validDays = new Set<number>((program.days ?? []).map((d: { day: number }) => d.day));
  const skillIds = { has: (s: string) => isKnownSkill(s) };
  const out: RawTask[] = [];
  const seen = new Set<string>();
  for (const f of files) {
    const raw = JSON.parse(readFileSync(join(DIR, f), 'utf8')) as RawTask;
    const allowlist = raw.adapter === 'docker' ? DOCKER_EXEC_ALLOWLIST : LOCAL_ALLOWLIST;
    const v = validateTerminalTask(raw, { allowlist, skillIds, validDays });
    if (!v.ok) throw new Error(`Tâche terminal invalide (${f}) : ${v.errors.join(' ; ')}`);
    if (seen.has(raw.id)) throw new Error(`Tâche terminal : id dupliqué « ${raw.id} » (${f}).`);
    seen.add(raw.id);
    out.push(raw);
  }
  return out;
}

export const listTerminalTasks: () => RawTask[] = cache(() => loadAll());

export function getTerminalTask(id: string): RawTask | null {
  return listTerminalTasks().find((t) => t.id === id) ?? null;
}

/** Tâches reliées à au moins une des journées fournies (dérivé de dayRefs). */
export function tasksForDays(days: number[]): RawTask[] {
  const set = new Set(days);
  return listTerminalTasks().filter((t) => (t.dayRefs ?? []).some((d) => set.has(d)));
}

/** Vue publique d'une tâche (jamais de seedFiles bruts inutiles côté client). */
export function publicTerminalTask(t: RawTask) {
  return publicTaskView(t);
}
