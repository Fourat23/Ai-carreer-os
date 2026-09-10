export function classifyUpdate(op) {
  return op.kind === 'read-then-write' ? 'risque-perte' : 'sûr';
}
