// Chargement du programme (data/program.json) et lecture des fichiers Markdown du curriculum.
// Côté serveur uniquement (utilise fs). Les pages Server Components l'importent directement.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';
import type { Program, ProgramDay, ProgramWeek, ProgramMonth } from './types';

const ROOT = process.cwd();
const CUR = join(ROOT, 'curriculum');

let cached: Program | null = null;

export function getProgram(): Program {
  if (cached) return cached;
  const raw = readFileSync(join(ROOT, 'data', 'program.json'), 'utf8');
  cached = JSON.parse(raw) as Program;
  return cached;
}

export function getDay(day: number): ProgramDay | undefined {
  return getProgram().days.find((d) => d.day === day);
}

export function getWeek(week: number): ProgramWeek | undefined {
  return getProgram().weeks.find((w) => w.week === week);
}

export function getMonth(month: number): ProgramMonth | undefined {
  return getProgram().months.find((m) => m.month === month);
}

const pad3 = (n: number) => String(n).padStart(3, '0');
const pad2 = (n: number) => String(n).padStart(2, '0');

// Rend un fichier Markdown du curriculum en HTML. Retourne null si absent.
function renderMarkdown(relativePath: string): string | null {
  const path = join(CUR, relativePath);
  if (!existsSync(path)) return null;
  const md = readFileSync(path, 'utf8');
  // Retire un éventuel marqueur <!-- keep --> en tête (ne pas l'afficher).
  const cleaned = md.replace(/^<!-- keep -->\n?/, '');
  return marked.parse(cleaned, { async: false }) as string;
}

export function getDayHtml(day: number): string | null {
  return renderMarkdown(join('days', `day-${pad3(day)}.md`));
}
export function getSolutionHtml(day: number): string | null {
  return renderMarkdown(join('solutions', `day-${pad3(day)}-solution.md`));
}
export function getWeekHtml(week: number): string | null {
  return renderMarkdown(`week-${pad2(week)}.md`);
}
export function getMonthHtml(month: number): string | null {
  return renderMarkdown(`month-${pad2(month)}.md`);
}
export function getProjectHtml(id: string): string | null {
  return renderMarkdown(join('projects', `project-${id}.md`));
}
export function getDocHtml(relativePath: string): string | null {
  return renderMarkdown(relativePath);
}

// Extrait la checklist de validation d'un jour (les cases "- [ ] ..." de la section critères).
export function getDayChecklist(day: number): string[] {
  const path = join(CUR, 'days', `day-${pad3(day)}.md`);
  if (!existsSync(path)) return [];
  const md = readFileSync(path, 'utf8');
  const lines = md.split('\n');
  const items: string[] = [];
  let inCriteria = false;
  for (const line of lines) {
    if (line.startsWith('## ')) inCriteria = line.includes('Critères de validation');
    else if (inCriteria) {
      const m = line.match(/^- \[ \] (.+)$/);
      if (m) items.push(m[1].trim());
    }
  }
  return items;
}
