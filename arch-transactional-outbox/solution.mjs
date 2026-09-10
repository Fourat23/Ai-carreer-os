export function choose({ needsEvent, mustNotLose }) {
  if (!needsEvent) return 'none';
  return mustNotLose ? 'outbox' : 'dual-write';
}
