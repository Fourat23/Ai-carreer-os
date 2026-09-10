export function choose({ readWriteRatio, stalenessOkSeconds }) {
  if (readWriteRatio < 2) return 'no-cache';
  if (stalenessOkSeconds > 0) return 'cache-aside';
  return 'write-through';
}
