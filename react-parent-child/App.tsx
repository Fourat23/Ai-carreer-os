import Menu from './Menu';

export default function App({ items = [] as string[] }: { items?: string[] }) {
  const handlePick = (label: string) => { console.log('pick', label); };
  return <Menu items={items} onPick={handlePick} />;
}
