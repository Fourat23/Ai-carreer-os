export function choose({ loadAsymmetryHigh, readModelsDiffer }) {
  return (loadAsymmetryHigh && readModelsDiffer) ? 'cqrs' : 'single-model';
}
