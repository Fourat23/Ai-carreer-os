const ORDER = ['extract', 'clean', 'transform', 'load'];
export function orderPipeline(steps) {
  return ORDER.filter((s) => steps.includes(s));
}
