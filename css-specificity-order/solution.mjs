export function winningColor(rules) {
  let best = null;
  for (const r of rules) {
    if (best === null) { best = r; continue; }
    const cmp = r.a - best.a || r.b - best.b || r.c - best.c;
    // r plus spécifique, ou égal (l'ordre fait gagner le plus récent)
    if (cmp >= 0) best = r;
  }
  return best ? best.color : null;
}
