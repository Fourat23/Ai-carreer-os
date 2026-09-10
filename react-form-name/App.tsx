import { useState } from 'react';

export default function App({ value = '' }: { value?: string }) {
  const [name, setName] = useState(value);
  return (
    <form>
      <label>Nom : <input id="n" value={name} onChange={(e) => setName(e.target.value)} /></label>
      <p id="g">Bonjour, {name} !</p>
    </form>
  );
}
