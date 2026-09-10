export function classifyApiChange(change) {
  const compatibles = new Set(['add-optional-param', 'add-response-field', 'add-endpoint']);
  return compatibles.has(change.kind) ? 'compatible' : 'cassant';
}
