export function semverBump(changes) {
  if (changes.some((c) => c.type === 'breaking')) return 'major';
  if (changes.some((c) => c.type === 'feature')) return 'minor';
  if (changes.some((c) => c.type === 'fix')) return 'patch';
  return 'none';
}
