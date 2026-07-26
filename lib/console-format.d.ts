// Types pour lib/console-format.mjs (bornage des logs de preview, pur).
export interface PreviewLogEntry {
  type: 'console' | 'error';
  level: string;
  text: string;
  line: number | null;
  col: number | null;
  at: number;
}
export const MAX_LOGS: number;
export const MAX_TEXT: number;
export function boundLogEntry(raw: unknown): PreviewLogEntry;
export function appendPreviewLog(list: PreviewLogEntry[], raw: unknown): PreviewLogEntry[];
