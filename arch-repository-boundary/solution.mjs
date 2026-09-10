export function choose({ callSites, swappableStore, testWithoutDb }) {
  return (callSites >= 2 && (swappableStore || testWithoutDb)) ? 'repository' : 'direct';
}
