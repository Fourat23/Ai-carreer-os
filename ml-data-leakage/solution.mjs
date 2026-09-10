export function findLeakage(features) {
  const leak = features.find((f) => f.knowsTarget);
  return leak ? leak.name : 'none';
}
