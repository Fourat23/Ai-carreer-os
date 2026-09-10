export function meetsRpo(backupIntervalMin, rpoMin) {
  return backupIntervalMin <= rpoMin;
}
