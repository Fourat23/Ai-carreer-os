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
// ── CE QUE CE BANDEAU DIT, ET CE QU'IL NE FAIT PLUS ─────────────────────
//
// Au CP6 il décrivait aussi les OPTIONS, faute de commande pour les exercer.
// `SET_CURRICULUM_PAUSE` existe depuis le CP7, et l'audit du CP8 a constaté le
// résultat : l'action « suspendre le nouveau contenu » apparaissait **deux
// fois** sur la même page, avec deux libellés, et une seule était cliquable.
//
// Les options ont donc rejoint leur contrôle, dans le panneau de rattrapage.
// Ce bandeau garde ce qu'il est seul à pouvoir dire : **pourquoi** la journée
// ressemble à ça, et ce que la proposition ferait au budget.
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

      {/* ── V75 · CP8 — LES OPTIONS ONT DÉMÉNAGÉ, ET C'EST UNE CORRECTION ──
          L'audit du CP8 a trouvé l'action « suspendre le nouveau contenu »
          DEUX fois sur la même page, avec deux libellés, et une seule
          cliquable : décrite ici, réelle dans le panneau de rattrapage.
          Une décision et son contrôle doivent être au même endroit — sinon la
          description ressemble à un bouton mort, ce que le CP6 s'était
          justement interdit. Les options sont donc rendues à côté du bouton
          (`CatchupPlan`), et ce bandeau garde ce qu'il est seul à savoir dire :
          POURQUOI la journée ressemble à ça. */}

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
