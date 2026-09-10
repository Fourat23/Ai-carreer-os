export function renderedWidth({ width, padding = 0, border = 0, boxSizing = 'content-box' }) {
  if (boxSizing === 'border-box') return width;
  return width + 2 * padding + 2 * border;
}
