export function chooseLayout({ needsRows, needsColumns }) {
  return needsRows && needsColumns ? 'grid' : 'flexbox';
}
