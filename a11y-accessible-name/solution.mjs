export function accessibleName({ tag, ariaLabel = '', text = '', alt = '' }) {
  if (ariaLabel.trim() !== '') return ariaLabel;
  if (tag === 'img') return alt;
  if (text.trim() !== '') return text;
  return '';
}
