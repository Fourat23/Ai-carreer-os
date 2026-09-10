export function recover({ attemptsLeft, hasFallback }) {
  if (attemptsLeft > 0) return 'retry';
  if (hasFallback) return 'fallback';
  return 'abort';
}
