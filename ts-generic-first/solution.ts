export function first<T>(arr: T[]): T | null {
  return arr.length > 0 ? arr[0] : null;
}
