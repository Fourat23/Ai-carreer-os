export function countPositives(nums: number[]): number {
  let count = 0;
  for (const n of nums) {
    if (n > 0) count++;
  }
  return count;
}
