export function onlyStrings(items: (string | number)[]): string[] {
  return items.filter((x): x is string => typeof x === 'string');
}
