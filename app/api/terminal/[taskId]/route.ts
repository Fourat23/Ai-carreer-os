// API du terminal pédagogique borné (V20 CP7). GET → tâche publique +
// disponibilité de l'adaptateur. POST { action } → run | cancel | cleanup |
// availability. Aucun shell libre : on n'exécute QUE des TerminalTask déclarées,
// via les adaptateurs CP5 (local) / CP6 (Docker). Sortie bornée côté serveur,
// aucun secret transmis, workspace temporaire supprimé après exécution.
import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { getTerminalTask, publicTerminalTask } from '@/lib/terminal-tasks-server';
import { validateWorkspacePath } from '@/lib/terminal.mjs';
import * as local from '@/lib/terminal-local.mjs';
import * as docker from '@/lib/terminal-docker.mjs';
import { readProgressFresh, writeProgress } from '@/lib/progress-server';
import { applyCommand } from '@/lib/learning-engine';
import type { Progress } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Garde de concurrence (mono-utilisateur local) : une exécution par tâche.
const ACTIVE = new Map<string, string>(); // taskId -> runId

async function availabilityFor(adapter: string) {
  if (adapter === 'docker') return docker.detectDocker();
  return local.availability();
}

function seedWorkspace(dir: string, seedFiles?: { path: string; content: string }[]) {
  for (const sf of seedFiles ?? []) {
    if (!validateWorkspacePath(sf?.path).ok) continue;
    const abs = join(dir, sf.path);
    try { mkdirSync(dirname(abs), { recursive: true }); writeFileSync(abs, String(sf.content ?? '').slice(0, 8192)); } catch { /* best-effort */ }
  }
}

/**
 * ── V77 · CP3 — CE QUE LE TERMINAL A LE DROIT D'ÉCRIRE ──────────────────
 *
 * Avant V77, cette route exécutait vraiment — `exitCode 0`, sortie bornée, bac
 * à sable — et n'en gardait **rien**. Le CP0 a mesuré les deux moitiés du
 * problème : l'exécution est réelle, mais les trois tâches du terminal ne
 * portent aucun critère de réussite pédagogique et leurs arguments sont des
 * énumérations fermées. Une tâche dit d'elle-même « démonstration d'exécution
 * bornée ».
 *
 * D'où la politique `USAGE_ONLY` : on écrit **que la chose a eu lieu**, jamais
 * qu'elle a réussi. Pas de preuve, aucun moteur touché, aucun `passed`.
 *
 * Et `exitCode` est enregistré **sans être interprété** : 0 ne veut pas dire
 * réussi, il veut dire que le processus s'est terminé sans erreur. C'est une
 * observation, pas un verdict — la distinction est tout le CP3.
 *
 * Écriture au mieux : un échec de persistance ne doit jamais faire échouer
 * l'exécution que l'apprenant vient de lancer.
 */
function noterUsage(taskId: string, adapter: string, run: unknown) {
  try {
    const r = (run ?? {}) as { exitCode?: number | null; durationMs?: number };
    const res = applyCommand(readProgressFresh(), {
      type: 'RECORD_USAGE_EVENT',
      surface: 'terminal',
      action: 'run',
      ref: taskId,
      detail: {
        adapter,
        ...(typeof r.exitCode === 'number' ? { exitCode: r.exitCode } : {}),
        ...(typeof r.durationMs === 'number' ? { durationMs: r.durationMs } : {}),
      },
      provenance: { producer: 'terminal-route', method: 'POST /api/terminal/[taskId] action=run' },
    }, { now: new Date() });
    if (res.ok) writeProgress(res.progress as Progress);
  } catch { /* au mieux : l'usage est un bonus, jamais une dépendance */ }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const task = getTerminalTask(taskId);
  if (!task) return NextResponse.json({ error: 'Tâche introuvable.' }, { status: 404 });
  return NextResponse.json({ task: publicTerminalTask(task), availability: await availabilityFor(task.adapter) });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const task = getTerminalTask(taskId);
  if (!task) return NextResponse.json({ error: 'Tâche introuvable.' }, { status: 404 });

  let body: { action?: string; args?: Record<string, string>; runId?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 }); }
  const action = String(body.action ?? '');
  const rawArgs = (body.args && typeof body.args === 'object' && !Array.isArray(body.args)) ? body.args : {};
  if (Object.keys(rawArgs).length > 20) return NextResponse.json({ error: 'Trop d’arguments.' }, { status: 400 });

  if (action === 'availability') {
    return NextResponse.json({ availability: await availabilityFor(task.adapter) });
  }

  if (action === 'cancel') {
    const runId = String(body.runId ?? '');
    if (!runId) return NextResponse.json({ error: 'runId requis.' }, { status: 400 });
    if (task.adapter === 'local') { const r = local.cancel(runId); return NextResponse.json({ ok: true, ...r }); }
    return NextResponse.json({ ok: true, cancelled: false }); // Docker : annulation via timeout/cleanup
  }

  if (action === 'cleanup') {
    return NextResponse.json({ ok: true });
  }

  if (action !== 'run') {
    return NextResponse.json({ error: `Action inconnue « ${action} ».` }, { status: 400 });
  }

  // ── action = run ──
  if (ACTIVE.has(taskId)) return NextResponse.json({ error: 'Une exécution est déjà en cours pour cette tâche.' }, { status: 409 });
  const runId = randomUUID();
  ACTIVE.set(taskId, runId);
  let prep: { runToken: string; workspaceDir: string } | null = null;
  try {
    if (task.adapter === 'local') {
      prep = local.prepare();
      seedWorkspace(prep.workspaceDir, task.seedFiles);
      // Annulation via abandon de la requête (fetch AbortController côté client).
      req.signal?.addEventListener('abort', () => { try { local.cancel(runId); } catch { /* ok */ } });
      const run = await local.execute(task, rawArgs, { runToken: prep.runToken, runId });
      noterUsage(taskId, 'local', run);
      return NextResponse.json({ run });
    }
    // Docker : workspace pour un éventuel montage borné ; sinon indisponible honnête.
    prep = local.prepare();
    seedWorkspace(prep.workspaceDir, task.seedFiles);
    const config = { ...docker.hardenedDefaults(task.dockerImage ?? 'alpine:3.20'), workspaceMount: null };
    const run = await docker.execute(task, rawArgs, config, { runId });
    noterUsage(taskId, 'docker', run);
    return NextResponse.json({ run });
  } catch (e) {
    return NextResponse.json({ error: 'Échec d’exécution.', detail: String((e as Error)?.message ?? '').slice(0, 200) }, { status: 500 });
  } finally {
    if (prep) { try { local.cleanup(prep.runToken); } catch { /* best-effort */ } }
    ACTIVE.delete(taskId);
  }
}
