export function diagnose(scores) {
  if (scores.train >= 80 && scores.val < scores.train - 15) return 'overfit';
  if (scores.train < 70) return 'underfit';
  return 'good';
}
