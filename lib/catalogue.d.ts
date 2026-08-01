// Types pour lib/catalogue.mjs (catalogue de parcours & modules, pur).
import type { Program } from './types';

export const DEFAULT_TRACK_ID: string;
export const FULLSTACK_TRACK_ID: string;
export const BACKEND_TRACK_ID: string;

export interface Technology { id: string; name: string; area: string }
export interface Module {
  id: string; title: string; summary: string;
  dayRefs: number[]; skills: string[]; projectRef: string | null;
}
export interface Track {
  id: string; version: string; status: 'available' | 'announced';
  title: string; goal: string; moduleRefs: string[]; technologies: string[]; totalDays: number;
  roles?: string[]; prerequisites?: string[]; completion?: { minDaysDone?: number; projectRefs?: string[] };
}
export interface Catalogue {
  technologies: Technology[];
  modules: Record<string, Module>;
  tracks: Track[];
}

export const TECHNOLOGIES: Technology[];
export const ANNOUNCED_TRACKS: Array<{ id: string; title: string; goal: string; technologies: string[] }>;
export function buildCatalogue(program: Program): Catalogue;
export function validateCatalogue(catalogue: Catalogue, dayNums?: Set<number> | null): boolean;
export function resolveTrackDays(catalogue: Catalogue, trackOrId: Track | string): number[];
export function resolveTrackDayObjects(catalogue: Catalogue, trackOrId: Track | string, program: Program): Program['days'];
export function getTrack(catalogue: Catalogue, id: string): Track | null;
export function getTrackModules(catalogue: Catalogue, track: Track): Module[];
export function isTrackAvailable(track: Track | null | undefined): boolean;
