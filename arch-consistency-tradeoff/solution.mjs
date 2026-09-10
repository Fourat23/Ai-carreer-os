export function choose({ staleReadHarmful }) {
  return staleReadHarmful ? 'CP' : 'AP';
}
