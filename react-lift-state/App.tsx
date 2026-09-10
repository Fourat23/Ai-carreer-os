import { useState } from 'react';
import Display from './Display';

export default function App({ initial = '', options = [] as string[] }: { initial?: string; options?: string[] }) {
  const [selected, setSelected] = useState(initial);
  return (
    <div>
      <Display value={selected} />
      {options.map((o) => (
        <button className="opt" key={o} onClick={() => setSelected(o)}>{o}</button>
      ))}
    </div>
  );
}
