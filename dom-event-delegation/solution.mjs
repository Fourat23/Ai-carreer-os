export function delegatedMatch(path, tag) {
  for (const t of path) {
    if (t === tag) return t;
  }
  return null;
}
