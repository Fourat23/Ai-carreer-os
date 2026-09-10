export function indexAdvice({ reads, writes, selectiveColumn, rangeQueries }) {
  if (writes > reads) return 'no-index';
  if (!selectiveColumn) return 'no-index';
  if (rangeQueries) return 'btree-index';
  return 'hash-index';
}
