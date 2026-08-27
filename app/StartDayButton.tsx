'use client';

// Ouverture d'une journée depuis une surface de pilotage. V64 : le clic envoie
// la commande START du Learning Engine et ATTEND sa réponse. Un échec s'affiche
// au lieu de se traduire par un clic sans effet (anomalie A10 du CP0).

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Play, AlertTriangle } from 'lucide-react';
import { sendCommand, announceProgressChanged } from './progress-command';

export default function StartDayButton({ day, label, className }: { day: number; label?: string; className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);
    const r = await sendCommand({ type: 'START', day });
    // INVALID_TRANSITION signifie ici « déjà commencée » : ce n'est pas une
    // erreur pour l'apprenant, c'est une reprise. On ouvre la journée.
    if (!r.ok && r.code !== 'INVALID_TRANSITION') {
      setLoading(false);
      setError(r.error);
      return;
    }
    announceProgressChanged();
    router.push(`/day/${day}`);
  }

  return (
    <>
      <button className={className ?? 'btn primary big'} onClick={start} disabled={loading}>
        <Play size={15} strokeWidth={2.2} />
        {loading ? 'Ouverture…' : (label ?? 'Commencer la journée')}
      </button>
      {error && (
        <p className="cmd-error" role="alert">
          <AlertTriangle size={13} strokeWidth={2} /> {error}
        </p>
      )}
    </>
  );
}
