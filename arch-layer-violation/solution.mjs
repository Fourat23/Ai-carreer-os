const RANK = { presentation: 0, domain: 1, data: 2 };
export function check(edge) {
  return RANK[edge.to] >= RANK[edge.from] ? 'ok' : 'violation';
}
