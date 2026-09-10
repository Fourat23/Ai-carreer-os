export function chunkWindows({ length, size, overlap }) {
  const step = Math.max(1, size - overlap);
  const out = [];
  let start = 0;
  while (start < length) {
    const end = Math.min(start + size, length);
    out.push([start, end]);
    if (end === length) break;
    start += step;
  }
  return out;
}
