export function finalPrice(price: number, discountPct: number): number {
  return price * (1 - discountPct / 100);
}
