export function regressionVerdict(baselineMs, currentMs, budgetPct) {
  const allowed = baselineMs * (1 + budgetPct / 100);
  if (currentMs > allowed) return 'regression';
  if (currentMs < baselineMs) return 'improved';
  return 'ok';
}
