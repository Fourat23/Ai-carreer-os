export function conflictingFiles(oursChanged, theirsChanged) {
  const theirs = new Set(theirsChanged);
  return [...new Set(oursChanged.filter((f) => theirs.has(f)))].sort();
}
