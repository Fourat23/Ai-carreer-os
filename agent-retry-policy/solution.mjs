export function decide(error) {
  const t = error.type;
  if (['rate-limit', 'timeout', 'transient'].includes(t)) return 'retry';
  if (['ambiguous', 'low-confidence'].includes(t)) return 'ask-human';
  return 'fail';
}
