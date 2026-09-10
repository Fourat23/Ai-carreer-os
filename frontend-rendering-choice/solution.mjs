export function chooseRendering({ isPrivate, needsFreshPerRequest, indexable }) {
  if (isPrivate || !indexable) return 'CSR';
  if (needsFreshPerRequest) return 'SSR';
  return 'SSG';
}
