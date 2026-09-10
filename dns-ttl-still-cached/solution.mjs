export function stillCached(ttl, elapsed) {
  return elapsed < ttl;
}
