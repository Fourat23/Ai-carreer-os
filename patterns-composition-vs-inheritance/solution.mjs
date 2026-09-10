export function choose({ isA, behaviorVaries }) {
  return (isA && !behaviorVaries) ? 'inheritance' : 'composition';
}
