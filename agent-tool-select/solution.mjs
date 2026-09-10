export function selectTool(intent, tools) {
  const match = tools.find((t) => t.capability === intent.need);
  return match ? match.id : 'none';
}
