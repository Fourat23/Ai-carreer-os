export function chooseMissingStrategy(col) {
  if (col.missingRatio > 0.5) return 'drop-column';
  if (col.isCritical) return 'impute-flag';
  return 'impute-mean';
}
