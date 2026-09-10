import Item from './Item';

export default function App({ items = [] as string[] }: { items?: string[] }) {
  return (
    <ul>
      {items.map((label) => (
        <Item key={label} label={label} />
      ))}
    </ul>
  );
}
