export function estimateCents(usage) {
  const input = usage.inTokens / 1000 * usage.inPricePer1kCents;
  const output = usage.outTokens / 1000 * usage.outPricePer1kCents;
  return Math.round(input + output);
}
