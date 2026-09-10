export function choose({ canDefer, spiky, longRunning }) {
  return (canDefer && (spiky || longRunning)) ? 'queue' : 'sync';
}
