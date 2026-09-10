export default function MenuItem({ label, onSelect }: { label: string; onSelect: (l: string) => void }) {
  return <button className="menu-item" onClick={() => onSelect(label)}>{label}</button>;
}
