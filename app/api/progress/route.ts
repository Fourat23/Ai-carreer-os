// API de progression : GET lit data/progress.json, POST applique une mise à jour partielle.
// Usage local mono-utilisateur, pas d'authentification.

import { NextRequest, NextResponse } from 'next/server';
import { readProgress, writeProgress } from '@/lib/progress-server';
import { EMPTY_DAY_PROGRESS, type Progress, type DayProgress } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(readProgress());
}

// Corps accepté : { type, payload }
//  - 'day'          : { day, patch: Partial<DayProgress> }
//  - 'skill'        : { skill, score }
//  - 'start'        : {}                       (fixe startDate à aujourd'hui si absent)
//  - 'weeklyReview' : { week, patch }
//  - 'monthlyReview': { month, patch }
export async function POST(req: NextRequest) {
  let body: { type: string; payload: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
  }
  const progress = readProgress();
  const now = new Date().toISOString();

  switch (body.type) {
    case 'day': {
      const day = Number(body.payload.day);
      if (!Number.isInteger(day) || day < 1 || day > 365)
        return NextResponse.json({ error: 'jour invalide' }, { status: 400 });
      const patch = (body.payload.patch ?? {}) as Partial<DayProgress>;
      const existing: DayProgress = progress.days[String(day)] ?? { ...EMPTY_DAY_PROGRESS };
      progress.days[String(day)] = { ...existing, ...patch, updatedAt: now };
      if (!progress.startDate) progress.startDate = now.slice(0, 10);
      break;
    }
    case 'skill': {
      const skill = String(body.payload.skill);
      const score = Number(body.payload.score);
      if (!skill || score < 0 || score > 5)
        return NextResponse.json({ error: 'score invalide' }, { status: 400 });
      progress.skills[skill] = score;
      break;
    }
    case 'start': {
      if (!progress.startDate) progress.startDate = now.slice(0, 10);
      break;
    }
    case 'weeklyReview': {
      const week = String(body.payload.week);
      const base = progress.weeklyReviews[week] ?? { done: false, note: '', score: null };
      progress.weeklyReviews[week] = { ...base, ...(body.payload.patch as object) };
      break;
    }
    case 'monthlyReview': {
      const month = String(body.payload.month);
      const base = progress.monthlyReviews[month] ?? { done: false, note: '', score: null };
      progress.monthlyReviews[month] = { ...base, ...(body.payload.patch as object) };
      break;
    }
    default:
      return NextResponse.json({ error: 'type inconnu' }, { status: 400 });
  }

  writeProgress(progress as Progress);
  return NextResponse.json({ ok: true });
}
