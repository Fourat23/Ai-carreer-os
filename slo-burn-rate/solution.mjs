export function burnRate(consumedFraction, elapsedFraction) {
  if (elapsedFraction <= 0) return 0;
  return consumedFraction / elapsedFraction;
}
