// V75 · CP7 — LE PLAN DE RATTRAPAGE, TEL QUE L'APPRENANT LE LIT.
//
// ── LA PHRASE INTERDITE ─────────────────────────────────────────────────
//
//   > « Vous avez 91 notions en retard, faites-les toutes. »
//
// Ce composant existe pour ne jamais l'écrire, sans pour autant cacher le
// nombre. La forme retenue : **une semaine proposée**, journée par journée,
// avec ce que chacune contient et pourquoi — puis, séparément et sans
// injonction, ce qui reste au-delà.
//
// ── CE QUI EST DIT EXPLICITEMENT, PARCE QUE ÇA CHANGE TOUT ──────────────
//
//   · le plan est **recalculé chaque jour** — sauter une journée ne « casse »
//     rien, et il n'existe nulle part de trace d'un plan manqué ;
//   · il est **abandonnable sans pénalité** ;
//   · la couverture annoncée est un **débit**, pas une promesse : « chaque
//     notion repasse une fois » ne veut pas dire « tu la sauras ». Confondre
//     les deux fabriquerait une probabilité d'oubli (`R10`).
import { Panel } from '@/app/ui';
import type { VueRattrapage } from '@/lib/catchup-server';
import type { Choix } from '@/lib/recovery-mode';
import PauseCurriculum from './PauseCurriculum';

export default function CatchupPlan(
  { vue, mode, choix = [] }: { vue: VueRattrapage; mode: string; choix?: Choix[] },
) {
  const { plan, pause } = vue;
  // Rien en retard et aucune pause en cours : pas de plan à montrer. Afficher
  // un panneau vide donnerait du poids à un problème qui n'existe pas.
  if (plan.total === 0 && !pause.paused) return null;

  return (
    <Panel label="Reprendre le retard">
      {pause.paused ? (
        <p className="ret-note">
          <strong>Tu as mis le nouveau contenu en pause</strong>
          {pause.depuisJours != null ? ` depuis ${pause.depuisJours} jour${pause.depuisJours > 1 ? 's' : ''}` : ''}.
          {' '}Les notions en retard, elles, sont restées exactement où elles étaient :
          mettre en pause n’en efface aucune. Reprendre ne coûte rien.
        </p>
      ) : null}

      {plan.jours.length === 0 ? (
        <p className="ret-note">
          {plan.couverture.phrase}
        </p>
      ) : (
        <>
          <p className="ret-note">
            Voici les <strong>{plan.jours.length} prochaines journées de travail</strong> telles
            que le produit les organiserait. <strong>Ce n’est pas une liste de devoirs</strong> :
            elle est recalculée à chaque fois que tu reviens, et sauter une journée ne casse
            rien — il n’existe nulle part de trace d’un plan manqué.
          </p>

          <ol className="cat-jours">
            {plan.jours.map((j) => (
              <li key={j.rang}>
                <div className="cat-jour-tete">
                  <span className="cat-jour-rang">Journée {j.rang}</span>
                  <span className="cat-jour-min">{j.minutes} min</span>
                </div>
                <div className="cat-jour-why">{j.pourquoi}</div>
                <ul className="cat-unites">
                  {j.titres.map((t, k) => (
                    <li key={`${j.rang}-${k}`}>{t}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          {/* Les deux nombres, côte à côte. Le total sans décomposition est un
              mur ; la décomposition sans total est une dette cachée. */}
          <p className="ret-note">
            Ces journées reprennent <strong>{plan.couvertes}</strong> notions sur les{' '}
            <strong>{plan.total}</strong> en retard.
            {plan.restantes > 0 ? (
              <> Les <strong>{plan.restantes}</strong> autres ne sont ni oubliées ni perdues :
                elles passeront dans les plans suivants, à mesure que celles-ci sortiront.</>
            ) : null}
            {plan.garees > 0 ? (
              <> <strong>{plan.garees}</strong> attendent en plus qu’un prérequis soit repris —
                les travailler maintenant ferait buter sur autre chose.</>
            ) : null}
          </p>

          <p className="ret-note">{plan.couverture.phrase}</p>
        </>
      )}

      {/* ── §1.5 — LA DÉCISION ET SON CONTRÔLE, AU MÊME ENDROIT ──
          Le CP6 recommandait la pause sans pouvoir l'enregistrer ; l'audit du
          CP8 a ensuite trouvé l'option décrite en haut de page et le bouton en
          bas. Les deux sont réunis ici : on lit ce que chaque option change,
          puis on choisit — ou on ne choisit rien, ce qui est aussi une option. */}
      {choix.length > 1 ? (
        <ul className="rec-choix">
          {choix.map((c) => (
            <li key={c.id}>
              <span className="rec-choix-libelle">{c.libelle}</span>
              <span className="rec-choix-effet">{c.effet}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <PauseCurriculum paused={pause.paused} recommande={mode === 'CRITICAL'} />
    </Panel>
  );
}
