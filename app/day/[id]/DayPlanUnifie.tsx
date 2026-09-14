// V75 · CP11 — LE PLAN DU JOUR, TEL QU'IL ARRIVE SUR LA JOURNÉE.
//
// ── POURQUOI CE PANNEAU EXISTE ICI, ET PAS SEULEMENT SUR /retention ─────
//
// Jusqu'au CP10, tout le moteur de récupération vivait sur `/retention`. La
// page d'une journée — **celle que l'apprenant ouvre pour travailler** —
// n'en savait rien : elle proposait la journée entière, quel que soit
// l'arriéré, quel que soit le mode, quelle que soit la charge.
//
// Le brief §11.6 l'exige nommément : *« Vérifier sur le produit réel :
// page/day, retention, recovery surface, daily plan. Pas seulement un
// module. »* Un moteur qui n'influence pas la page où l'on travaille
// n'influence rien.
//
// ── CE QUE CE PANNEAU MONTRE, DANS CET ORDRE ────────────────────────────
//
//   1. **l'explication d'abord** — pourquoi la journée ressemble à ça ;
//   2. les blocs, dans **l'ordre d'arbitrage**, avec minutes et raison ;
//   3. ce qui a été **réduit, différé ou suspendu**, et ce que ça coûte ;
//   4. l'arriéré en **trois nombres distincts** (§11.4).
//
// ── CE QU'IL NE FAIT PAS ────────────────────────────────────────────────
//
// Il ne retire **aucune section** de la journée et n'en verrouille aucune
// (§11.3). Il dit ce que le produit ferait ; l'apprenant lit sa journée
// entière juste en dessous, comme avant.
import Link from 'next/link';
import { Panel, InlineNotice } from '@/app/ui';
import type { VuePlanUnifie } from '@/lib/plan-unifie-server';

const TON: Record<string, 'info' | 'attention'> = {
  NORMAL: 'info', CATCH_UP: 'info', RECOVERY: 'attention', CRITICAL: 'attention',
};

export default function DayPlanUnifie({ vue }: { vue: VuePlanUnifie }) {
  const { plan, arriere, curriculumEnPause } = vue;

  // Rien à dire : mode normal, aucun arriéré, aucune modification. Un panneau
  // qui s'affiche toujours cesse d'être lu.
  if (!plan.modifie && arriere.total === 0 && !curriculumEnPause) return null;

  const modifies = plan.blocs.filter((b) => b.statut !== 'inclus');

  return (
    <Panel label="Ta journée, telle que le produit l’organiserait">
      {curriculumEnPause ? (
        <InlineNotice tone="info">
          <strong>Tu as mis le nouveau contenu en pause.</strong> Cette journée reste
          entièrement lisible — la pause ne retire aucune section, elle change seulement ce
          que le produit te propose de faire en priorité.
        </InlineNotice>
      ) : null}

      {/* §11.5 — l'explication passe AVANT les chiffres. Un plan modifié sans
          raison est un plan qu'on ne peut pas contester. */}
      {plan.explications.length > 0 ? (
        <InlineNotice tone={TON[plan.mode] ?? 'info'}>
          {plan.explications.map((p, i) => (
            <p key={i} className="rec-phrase">{p}</p>
          ))}
        </InlineNotice>
      ) : null}

      <ul className="dpu-blocs">
        {plan.blocs.map((b) => (
          <li key={b.nature} className={`dpu-bloc is-${b.statut}`}>
            <div className="dpu-bloc-tete">
              <span className="dpu-bloc-nom">{b.libelle}</span>
              <span className="dpu-bloc-min">
                {b.statut === 'suspendu' || b.statut === 'differe'
                  ? '—'
                  : `${b.minutes} min`}
                {b.demande > b.minutes && b.statut !== 'suspendu'
                  ? <span className="dpu-bloc-coupe"> sur {b.demande}</span>
                  : null}
              </span>
            </div>
            <div className="dpu-bloc-why">{b.pourquoi}</div>
          </li>
        ))}
      </ul>

      {/* La contrainte qui ne se négocie pas, DITE plutôt que supposée. */}
      <p className="ret-note">
        Total proposé : <strong>{plan.budget.accorde} min</strong> sur un budget de{' '}
        {plan.budget.journee} min.
        {plan.budget.nonPlacees > 0 ? (
          <> <strong>{plan.budget.nonPlacees} min</strong> n’ont pas trouvé de place
            aujourd’hui — elles ne sont pas perdues, elles reviennent.</>
        ) : null}
        {' '}Le produit ne rallonge jamais ta journée pour rattraper.
      </p>

      {modifies.length > 0 ? (
        <p className="ret-note">
          {modifies.length} bloc{modifies.length > 1 ? 's' : ''} {modifies.length > 1 ? 'ont' : 'a'}{' '}
          été ajusté{modifies.length > 1 ? 's' : ''} — et <strong>rien n’a été retiré de la
          journée</strong> : tu peux lire et faire tout ce qui suit, dans l’ordre que tu veux.
        </p>
      ) : null}

      {/* §11.4 — les trois nombres, distincts jusqu'au bout. */}
      {arriere.total > 0 ? (
        <p className="ret-note">
          En retard : <strong>{arriere.total}</strong> notions — {arriere.actif} aujourd’hui,{' '}
          {arriere.differe} plus tard, {arriere.gare} en attente d’un prérequis.{' '}
          « En attente » ne veut pas dire « acquise ».{' '}
          <Link href="/retention">Voir le détail</Link>.
        </p>
      ) : null}
    </Panel>
  );
}
