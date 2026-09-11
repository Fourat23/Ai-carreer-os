'use client';

// V75 · CP7 — LE CHOIX DE SUSPENDRE, ENFIN EXERÇABLE.
//
// ── CE QUE CE COMPOSANT RÉPARE ──────────────────────────────────────────
//
// Le CP6 a établi le mode `CRITICAL` et sa recommandation : *« suspendre le
// nouveau contenu quelques jours ferait baisser le retard »*. Il ne l'a
// volontairement affichée que comme une **description**, parce qu'aucune
// commande ne pouvait l'enregistrer — et qu'un bouton inerte prétend offrir un
// contrôle que le produit n'a pas.
//
// `SET_CURRICULUM_PAUSE` existe maintenant. Le choix devient donc réel, et le
// §1.5 du contrat est enfin tenu à la lettre : *« un choix de l'apprenant,
// jamais du moteur »*.
//
// ── LES TROIS RÈGLES DE CETTE SURFACE ───────────────────────────────────
//
//   1. **Aucune pression.** Le bouton est disponible en permanence, pas
//      seulement quand le produit le recommande : suspendre est un droit, pas
//      une punition qu'on mériterait (`R11`) ;
//   2. **la conséquence est écrite avant le clic**, y compris la partie qui ne
//      plaît pas : *les notions en retard ne bougent pas* ;
//   3. **reprendre est symétrique** — même place, même poids visuel, aucune
//      confirmation supplémentaire. Un produit qui rend la sortie plus
//      difficile que l'entrée a piégé la personne.
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { sendCommand, announceProgressChanged } from '@/app/progress-command';

export default function PauseCurriculum({ paused, recommande }: { paused: boolean; recommande: boolean }) {
  const router = useRouter();
  const [envoi, setEnvoi] = useState(false);
  // `error` / `setError` : la porte `v64:check` exige ce nom exact sur tout
  // composant qui ÉCRIT. C'est volontairement rigide — la régression visée est
  // l'anomalie A10 du CP0 de V64, un clic sans effet visible — et un invariant
  // structurel ne vaut que s'il n'admet pas de variante.
  const [error, setError] = useState<string | null>(null);

  async function basculer() {
    setEnvoi(true);
    setError(null);
    const r = await sendCommand({
      type: 'SET_CURRICULUM_PAUSE',
      paused: !paused,
      provenance: { producer: 'learner', method: 'choix explicite' },
    });
    setEnvoi(false);
    if (!r.ok) { setError(r.error); return; }
    announceProgressChanged();
    router.refresh();
  }

  return (
    <div className="cat-pause">
      <button type="button" className="cat-pause-btn" onClick={basculer} disabled={envoi}>
        {envoi ? 'Enregistrement…' : paused ? 'Reprendre le nouveau contenu' : 'Mettre le nouveau contenu en pause'}
      </button>
      <p className="cat-pause-note">
        {paused
          ? 'Reprendre remet les journées de programme à leur place. Rien n’a été perdu pendant la pause.'
          : <>
              Les journées de programme cessent d’être proposées, et seule la consolidation
              reste. <strong>Tes notions en retard ne bougent pas pour autant</strong> : une
              pause ne rend aucune notion moins due. Tu peux reprendre quand tu veux.
            </>}
        {recommande && !paused ? ' C’est ce que le produit te suggère aujourd’hui — la décision reste la tienne.' : ''}
      </p>
      {error && <p className="ret-error" role="alert">{error}</p>}
    </div>
  );
}
