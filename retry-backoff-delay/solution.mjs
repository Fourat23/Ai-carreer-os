export function backoffDelay(attempt, baseMs, maxMs) {
  return Math.min(baseMs * 2 ** attempt, maxMs);
}
