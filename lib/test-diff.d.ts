// Types pour lib/test-diff.mjs (diff structuré pur).
export interface DiffEntry {
  path: string;
  kind: 'value' | 'type' | 'length';
  expected: unknown;
  actual: unknown;
}
export function describeDiff(expected: unknown, actual: unknown, maxItems?: number): DiffEntry[];
