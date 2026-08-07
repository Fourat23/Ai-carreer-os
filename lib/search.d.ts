// Types pour lib/search.mjs (recherche locale pure).
import type { Program } from './types';
import type { Catalogue } from './catalogue';

export interface SearchItem {
  id: string;
  type: 'command' | 'page' | 'day' | 'week' | 'month' | 'skill' | 'project' | 'lesson' | 'track' | 'module' | 'technology' | 'exercise' | 'mission' | 'pipeline' | 'topology' | 'manifest' | 'scenario' | 'playbook' | 'glossary' | 'cloud-arch';
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
export function buildIndex(program: Program, catalogue?: Catalogue | null, exercises?: ExerciseSummary[] | null, missions?: Array<{ id: string; title: string; category?: string; skills?: string[] }> | null, pipelines?: Array<{ id: string; title?: string; name?: string; description?: string; summary?: string }> | null, topologies?: Array<{ id: string; title?: string; name?: string; description?: string }> | null, manifests?: Array<{ id: string; title?: string; name?: string; description?: string }> | null, scenarios?: Array<{ id: string; title?: string; domain?: string; skills?: string[] }> | null, playbooks?: Array<{ id: string; title?: string; situation?: string; domain?: string | null }> | null, glossaryEntries?: Array<{ id: string; term: string; fullForm?: string | null; frenchMeaning?: string; aliases?: string[] }> | null, cloudArchitectures?: Array<{ id: string; title?: string; provider?: string; region?: string; skills?: string[] }> | null): SearchItem[];
export function parseJump(query: string): (SearchItem & { type: string }) | null;
export function search(items: SearchItem[], query: string, limit?: number): SearchItem[];
export function resumeCommand(resumeDay: number): SearchItem | null;
export function reviewsCommand(dueCount: number): SearchItem | null;
export function mergeIndex(staticItems: SearchItem[], dynamic?: (SearchItem | null)[]): SearchItem[];
