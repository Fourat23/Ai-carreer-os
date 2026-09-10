export function choose({ variants, changesOften }) {
  return (variants > 3 || changesOften) ? 'strategy' : 'inline-if';
}
