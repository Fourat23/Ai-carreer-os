export function startupSafe(dep) {
  return !!dep.hasHealthcheck && dep.condition === 'service_healthy';
}
