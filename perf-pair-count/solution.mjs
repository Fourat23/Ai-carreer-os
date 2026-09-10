export function countPairsWithSum(nums, target) {
  const seen = new Map();
  let count = 0;
  let lookups = 0;
  for (const n of nums) {
    lookups++; // une seule consultation par élément
    count += seen.get(target - n) ?? 0;
    seen.set(n, (seen.get(n) ?? 0) + 1);
  }
  return { count, lookups };
}
