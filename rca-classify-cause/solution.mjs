export function classify(item) {
  if (item.observed) return 'symptom';
  if (item.deepest) return 'root-cause';
  return 'contributing-factor';
}
