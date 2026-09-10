export function plannedChanges(desired, current) {
  const keys = new Set([...Object.keys(desired), ...Object.keys(current)]);
  let n = 0;
  for (const k of keys) if (desired[k] !== current[k]) n++;
  return n;
}
