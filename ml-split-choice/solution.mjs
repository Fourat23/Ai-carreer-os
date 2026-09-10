export function chooseSplit(dataset) {
  return dataset.timeOrdered ? 'temporal' : 'random';
}
