export function consume(messages, maxAttempts) {
  const applied = new Set();
  return messages.map((m) => {
    if (applied.has(m.id)) return 'deduped';
    if (m.failsBeforeOk < maxAttempts) { applied.add(m.id); return 'applied'; }
    return 'dlq';
  });
}
