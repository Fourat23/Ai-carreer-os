export function signalFor(intent) {
  return { graceful: 'SIGTERM', force: 'SIGKILL', reload: 'SIGHUP' }[intent] ?? 'SIGTERM';
}
