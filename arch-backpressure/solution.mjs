export function choose({ sourceControllable, dataPerishable }) {
  if (sourceControllable) return 'backpressure';
  if (dataPerishable) return 'drop';
  return 'scale';
}
