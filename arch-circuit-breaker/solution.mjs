export function choose({ failing, retriesAmplify, transient }) {
  if (!failing) return 'fail-fast';
  if (retriesAmplify) return 'circuit-breaker';
  if (transient) return 'retry';
  return 'fail-fast';
}
