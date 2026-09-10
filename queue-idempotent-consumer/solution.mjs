export function applyOnce(messages) {
  const seen = new Set();
  let total = 0;
  for (const m of messages) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    total += m.amount;
  }
  return total;
}
