export function detectDrift(stats) {
  return Math.abs(stats.prodMean - stats.trainMean) > stats.threshold ? 'drift' : 'stable';
}
