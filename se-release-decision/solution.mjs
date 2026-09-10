export function releaseDecision({ coverage, flakyTests, openSev1, canaryErrorRate }) {
  if (openSev1 > 0) return 'block';
  if (canaryErrorRate > 5) return 'rollback';
  if (coverage < 60 || flakyTests > 3) return 'hold';
  return 'ship';
}
