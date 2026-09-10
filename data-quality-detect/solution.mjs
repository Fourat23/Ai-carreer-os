export function dataIssue(record) {
  if (record.value === null || record.value === undefined || record.value === '') return 'missing';
  if (record.seenBefore) return 'duplicate';
  if (typeof record.value !== record.expectedType) return 'type-mismatch';
  return 'ok';
}
