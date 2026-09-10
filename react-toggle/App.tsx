import { useState } from 'react';

export default function App({ on = false }: { on?: boolean }) {
  const [state, setState] = useState(on);
  return (
    <div>
      <span id="s">{state ? 'Allumé' : 'Éteint'}</span>
      <button type="button" onClick={() => setState(!state)}>Basculer</button>
    </div>
  );
}
