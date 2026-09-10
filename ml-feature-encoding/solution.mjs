export function chooseEncoding(feature) {
  if (feature.ordered) return 'ordinal';
  if (feature.cardinality > 50) return 'group-then-one-hot';
  return 'one-hot';
}
