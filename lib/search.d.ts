// Types pour lib/search.mjs (recherche locale pure).
import type { Program } from './types';
import type { Catalogue } from './catalogue';

export interface SearchItem {
  id: string;
  type: 'command' | 'page' | 'day' | 'week' | 'month' | 'skill' | 'project' | 'lesson' | 'track' | 'module' | 'technology' | 'exercise' | 'mission' | 'pipeline';
  title: string;
  subtitle: string;
  href: string;
  keywords: string;
}

export interface ExerciseSummary {
  id: string;
  title: string;
  skills?: string[];
  language?: string;
  runtimeLabel?: string;
  difficulty?: number;
}

export function normalize(s: unknown): string;
export function tokenize(s: unknown): string[];
export function buildIndex(program: Program, catalogue?: Catalogue | null, exercises?: ExerciseSummary[] | null, missions?: Array<{ id: string; title: string; category?: string; skills?: string[] }> | null, pipelines?: Array<{ id: string; title?: string; name?: string; description?: string; summary?: string }> | null): SearchItem[];
export function parseJump(query: string): (SearchItem & { type: string }) | null;
export function search(items: SearchItem[], query: string, limit?: number): SearchItem[];
export function resumeCommand(resumeDay: number): SearchItem | null;
export function reviewsCommand(dueCount: number): SearchItem | null;
export function mergeIndex(staticItems: SearchItem[], dynamic?: (SearchItem | null)[]): SearchItem[];
