import { useState } from 'react';

export default function App({ start = 0 }: { start?: number }) {
  const [n, setN] = useState(start);
  return (
    <div>
      <p>Compteur : <b id="v">{n}</b></p>
      <button type="button" onClick={() => setN(n + 1)}>Incrémenter</button>
    </div>
  );
}
