export function canTransition(from, to, allowed) {
  const outs = allowed[from] || [];
  return outs.includes(to) ? 'ok' : 'invalid';
}
