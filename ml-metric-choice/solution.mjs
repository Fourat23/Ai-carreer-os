export function chooseMetric(ctx) {
  if (!ctx.imbalanced) return 'accuracy';
  return ctx.falseNegativeCostly ? 'recall' : 'precision';
}
