import Row from './Row';

export default function App({ items = [] as string[], query = '' }: { items?: string[]; query?: string }) {
  const q = query.toLowerCase();
  return (
    <ul>
      {items.filter((it) => it.toLowerCase().includes(q)).map((it) => (
        <Row key={it} label={it} />
      ))}
    </ul>
  );
}
