export function frequency(words: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const w of words) {
    out[w] = (out[w] ?? 0) + 1;
  }
  return out;
}
