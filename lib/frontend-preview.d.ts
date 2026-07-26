// Types pour lib/frontend-preview.mjs (construction pure du srcDoc de preview).
export interface PreviewFile { path: string; content: string }
export interface PreviewResult {
  srcDoc: string;
  channel: string;
  entry: string;
  cssOrder: string[];
  jsOrder: string[];
}
export function buildPreviewDoc(
  files: PreviewFile[],
  opts?: { channel?: string; entry?: string },
): PreviewResult;
export function makeChannel(): string;
export const PREVIEW_CSP: string;
