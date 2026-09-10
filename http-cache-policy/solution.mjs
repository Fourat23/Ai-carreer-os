export function cachePolicy({ personalized, mutable, revalidatable }) {
  if (personalized) return 'private-no-store';
  if (mutable && revalidatable) return 'no-cache-etag';
  if (mutable) return 'short-ttl';
  return 'immutable-long-ttl';
}
