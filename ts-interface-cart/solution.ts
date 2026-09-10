import { CartItem } from './types';

export function totalWithTax(items: CartItem[], taxRate: number): number {
  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  return Math.round(subtotal * (1 + taxRate) * 100) / 100;
}
