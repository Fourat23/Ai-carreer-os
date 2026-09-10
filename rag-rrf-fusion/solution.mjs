export function fuse(lists, K = 60) {
  const score = {};
  for (const list of lists) {
    list.forEach((id, i) => { score[id] = (score[id] || 0) + 1 / (K + i + 1); });
  }
  return Object.keys(score).sort((a, b) => score[b] - score[a] || (a < b ? -1 : 1));
}
