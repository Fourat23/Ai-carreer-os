const STRATEGIES = { add: (a, b) => a + b, mul: (a, b) => a * b, max: (a, b) => (a > b ? a : b) };
export function apply(op, a, b) {
  const fn = STRATEGIES[op];
  if (!fn) throw new Error('opération inconnue: ' + op);
  return fn(a, b);
}
