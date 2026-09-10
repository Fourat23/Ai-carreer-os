export function nextState(failures, threshold) {
  return failures >= threshold ? 'open' : 'closed';
}
