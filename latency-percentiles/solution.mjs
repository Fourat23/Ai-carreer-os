export function percentiles(samples) {
  if (!samples.length) throw new Error('aucun échantillon');
  const sorted = [...samples].sort((a, b) => a - b);
  const at = (p) => sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)];
  return { p50: at(50), p95: at(95), p99: at(99) };
}
