const SHAPES = { square: (s) => s * s, circle: (s) => 3 * s * s };
export function area(shape) {
  const fn = SHAPES[shape.kind];
  if (!fn) throw new Error('forme inconnue: ' + shape.kind);
  return fn(shape.size);
}
