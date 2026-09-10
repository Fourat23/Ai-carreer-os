import MenuItem from './MenuItem';

export default function Menu({ items, onPick }: { items: string[]; onPick: (l: string) => void }) {
  return (
    <ul>
      {items.map((it) => (
        <li key={it}><MenuItem label={it} onSelect={onPick} /></li>
      ))}
    </ul>
  );
}
