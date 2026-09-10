export function priceCart(items, coupon) {
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  let total = subtotal;
  if (coupon && coupon.type === 'percent') total = subtotal * (1 - coupon.value / 100);
  else if (coupon && coupon.type === 'fixed') total = Math.max(0, subtotal - coupon.value);
  return Math.round(total * 100) / 100;
}
