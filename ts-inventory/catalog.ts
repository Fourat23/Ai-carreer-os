// Catalogue et type — lecture seule.
export interface Item {
  name: string;
  price: number;
  qty: number;
}

export const CATALOG: Item[] = [
  { name: 'clavier', price: 30, qty: 2 },
  { name: 'souris', price: 15, qty: 4 },
];
