export function hasCycle(graph) {
  const state = {};
  const visit = (n) => {
    if (state[n] === 'active') return true;
    if (state[n] === 'done') return false;
    state[n] = 'active';
    for (const m of graph[n] || []) if (visit(m)) return true;
    state[n] = 'done';
    return false;
  };
  return Object.keys(graph).some((n) => visit(n));
}
