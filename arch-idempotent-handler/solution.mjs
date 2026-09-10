export function processOnce(ids) {
  const seen = new Set();
  let processed = 0;
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    processed += 1;
  }
  return processed;
}
