export function publish(subscribers, events) {
  const out = subscribers.map((s) => [s.name, events.filter((e) => s.types.includes(e.type)).length]);
  out.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  return out;
}
