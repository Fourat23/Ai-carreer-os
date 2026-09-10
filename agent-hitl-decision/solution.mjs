export function escalate(action) {
  if (action.irreversible || action.sensitive || action.cost > 100 || action.confidence < 0.7) return 'ask-human';
  return 'proceed';
}
