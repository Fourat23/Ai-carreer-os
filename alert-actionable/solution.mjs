export function isGoodAlert(a) {
  return !!a.userImpact && !!a.actionable;
}
