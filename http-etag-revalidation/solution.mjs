export function revalidate(currentEtag, ifNoneMatch) {
  if (!Array.isArray(ifNoneMatch) || ifNoneMatch.length === 0) return 200;
  if (ifNoneMatch.includes('*') || ifNoneMatch.includes(currentEtag)) return 304;
  return 200;
}
