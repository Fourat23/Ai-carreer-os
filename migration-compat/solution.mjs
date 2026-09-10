export function classifyMigration(change) {
  const compatibles = new Set(['add-nullable-column', 'add-table', 'add-index']);
  return compatibles.has(change.kind) ? 'compatible' : 'cassant';
}
