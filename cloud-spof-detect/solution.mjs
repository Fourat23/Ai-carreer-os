export function spofs(resources) {
  return resources.filter(r => r.critical && r.count < 2 && !r.redundant).map(r => r.kind);
}
