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
      return NextResponse.json({ run });
    }
    // Docker : workspace pour un éventuel montage borné ; sinon indisponible honnête.
    prep = local.prepare();
    seedWorkspace(prep.workspaceDir, task.seedFiles);
    const config = { ...docker.hardenedDefaults(task.dockerImage ?? 'alpine:3.20'), workspaceMount: null };
    const run = await docker.execute(task, rawArgs, config, { runId });
    return NextResponse.json({ run });
  } catch (e) {
    return NextResponse.json({ error: 'Échec d’exécution.', detail: String((e as Error)?.message ?? '').slice(0, 200) }, { status: 500 });
  } finally {
    if (prep) { try { local.cleanup(prep.runToken); } catch { /* best-effort */ } }
    ACTIVE.delete(taskId);
  }
}
