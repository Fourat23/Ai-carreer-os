export function rateLimit(limit, windowMs, timestamps) {
  const kept = [];
  const out = [];
  for (const t of timestamps) {
    while (kept.length && kept[0] <= t - windowMs) kept.shift();
    if (kept.length < limit) { kept.push(t); out.push('allow'); }
    else out.push('deny');
  }
  return out;
}
