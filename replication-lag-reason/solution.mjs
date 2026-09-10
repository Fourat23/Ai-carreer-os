export function readFreshness({ fromReplica, justWrote }) {
  return (fromReplica && justWrote) ? 'stale-possible' : 'fresh';
}
