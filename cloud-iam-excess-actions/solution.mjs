export function excessActions(granted, needed) {
  return granted.filter(a => !needed.includes(a));
}
