export function validateArgs(schema, args) {
  for (const f of schema.required || []) if (!(f in args)) return 'missing:' + f;
  for (const f of Object.keys(schema.types || {})) if (f in args && typeof args[f] !== schema.types[f]) return 'type:' + f;
  for (const f of Object.keys(schema.enums || {})) if (f in args && !schema.enums[f].includes(args[f])) return 'enum:' + f;
  const known = new Set([...(schema.required || []), ...Object.keys(schema.types || {}), ...Object.keys(schema.enums || {})]);
  for (const f of Object.keys(args)) if (!known.has(f)) return 'unknown:' + f;
  return 'ok';
}
