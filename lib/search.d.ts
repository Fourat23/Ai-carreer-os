// Types pour lib/search.mjs (recherche locale pure).
import type { Program } from './types';

export interface SearchItem {
  id: string;
  type: 'command' | 'page' | 'day' | 'week' | 'month' | 'skill' | 'project' | 'lesson';
  title: string;
  subtitle: string;
  href: string;
  keywords: string;
}

export function normalize(s: unknown): string;
export function tokenize(s: unknown): string[];
export function buildIndex(program: Program, opts?: { resumeDay?: number }): SearchItem[];
export function parseJump(query: string): (SearchItem & { type: string }) | null;
export function search(items: SearchItem[], query: string, limit?: number): SearchItem[];
