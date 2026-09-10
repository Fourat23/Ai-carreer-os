import { CATALOG, Item } from './catalog';

export function totalValue(items: Item[] = CATALOG): number {
  return items.reduce((sum, it) => sum + it.price * it.qty, 0);
}
