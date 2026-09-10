export function commitCount(files) {
  return new Set(files.map((f) => f.reason)).size;
}
