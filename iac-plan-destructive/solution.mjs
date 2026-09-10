export function isDestructive(action) {
  return action === 'destroy' || action === 'replace';
}
