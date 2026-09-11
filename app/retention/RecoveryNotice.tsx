// V75 · CP6 — CE QUE LE PRODUIT PROPOSE QUAND LE RETARD S'INSTALLE.
//
// ── LA RÈGLE QUI COMMANDE CE COMPOSANT ───────────────────────────────────
//
// *« RECOMMANDER, pas imposer. L'utilisateur reste maître. »* Concrètement,
// trois obligations, et chacune est vérifiable en lisant le rendu :
//
//   1. **la décision est dite en une phrase**, sans jargon et sans nombre qui
//      prétende décrire une mémoire (§2 du contrat gelé) ;
//   2. **chaque option montre son effet**, y compris « ne rien changer », qui
//      n'est jamais présenté comme une erreur — une recommandation à option
//      unique est un ordre, et `R12` interdit d'imposer un rattrapage ;
//   3. **aucune option n'est appliquée automatiquement**, et le composant le
//      dit noir sur blanc plutôt que de le laisser deviner.
//
// ── POURQUOI CE NE SONT PAS DES BOUTONS ─────────────────────────────────
//
// Suspendre le nouveau contenu (`PAUSED_CURRICULUM`, §1.5) est un **choix de
// l'apprenant que le moteur ne peut qu'enregistrer** — et la commande qui
// l'enregistrerait n'existe pas encore. Afficher un bouton qui ne fait rien
// serait pire que de ne pas l'afficher : le produit prétendrait offrir un
// contrôle qu'il n'a pas. Les options sont donc décrites, pas déclenchées.
import { InlineNotice } from '@/app/ui';
import type { VueRecuperation } from '@/lib/recovery-server';

export default function RecoveryNotice({ vue }: { vue: VueRecuperation }) {
  const { mode, phrase, arbitrage } = vue;
  if (mode === 'NORMAL' || !arbitrage.recommandation.titre) return null;

  const r = arbitrage.recommandation;
  const ton = mode === 'CRITICAL' ? 'attention' : mode === 'RECOVERY' ? 'attention' : 'info';

  return (
    <InlineNotice tone={ton}>
      <strong>{r.titre}</strong>
      {/* La phrase du §2 : la décision doit pouvoir se dire en une phrase. */}
      <p className="rec-phrase">{phrase}</p>
      {r.texte ? <p className="rec-texte">{r.texte.replace(/\*\*/g, '')}</p> : null}

      {r.choix.length > 1 ? (
        <ul className="rec-choix">
          {r.choix.map((c) => (
            <li key={c.id}>
              <span className="rec-choix-libelle">{c.libelle}</span>
              <span className="rec-choix-effet">{c.effet}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {/* La minute est le contrôle qui compte : si la proposition ajoutait du
          temps, elle serait un rattrapage imposé (R12). On montre donc les deux
          allocations, et leur total. */}
      {arbitrage.ecart.revision > 0 ? (
        <p className="rec-budget">
          Aujourd’hui : {arbitrage.actuel.nouveau} min de nouveau contenu et{' '}
          {arbitrage.actuel.revision} min de révision.{' '}
          {arbitrage.ecart.total === 0 ? (
            <>
              La proposition déplace <strong>{arbitrage.ecart.revision} min</strong> de l’un
              vers l’autre — <strong>elle n’allonge pas ta journée</strong> :{' '}
              {arbitrage.propose.total} min dans les deux cas.
            </>
          ) : (
            <>
              La proposition met le nouveau contenu de côté : la journée passerait de{' '}
              {arbitrage.actuel.total} à <strong>{arbitrage.propose.total} min</strong>.{' '}
              <strong>Elle raccourcit, elle n’allonge jamais</strong> — consolider ne se paie
              pas en heures supplémentaires.
            </>
          )}
        </p>
      ) : null}

      <p className="rec-maitre">
        Rien de tout cela n’est appliqué : le produit n’enlève aucune journée et n’en
        reporte aucune de lui-même. {mode === 'CRITICAL'
          ? 'Suspendre le nouveau contenu, et le reprendre, sont tes décisions.'
          : 'C’est toi qui décides.'}
      </p>

      {arbitrage.transfert === 'suspendu' ? (
        <p className="rec-maitre">
          Les défis de transfert sont mis de côté pour l’instant : les proposer pendant que
          des prérequis sont en retard organiserait un échec de plus, pas un apprentissage.
        </p>
      ) : null}
    </InlineNotice>
  );
}
