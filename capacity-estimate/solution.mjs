export function instancesNeeded(rps, perInstance, marginPct) {
  const base = Math.ceil(rps / perInstance);
  return Math.ceil(base * (1 + marginPct / 100));
}
