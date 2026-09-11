// V75 · CP5 — L'ARRIÉRÉ, EN ENTIER, ET CE QUE LE PRODUIT EN FAIT.
//
// ── CE QUE CE COMPOSANT DOIT DIRE, ET DANS QUEL ORDRE ────────────────────
//
// Le CP0 a mesuré deux choses sur le rendu réel de cette page :
//   · **84 notions en retard, « 8 » affichées** (défaut P2) — la dette était
//     cachée par un plafond d'affichage ;
//   · pour l'apprenant irrégulier, **106 notions** en retard — un nombre que
//     personne ne peut regarder sans se décourager.
//
// Les deux erreurs sont symétriques et il faut éviter les deux. La règle du
// brief est explicite : *« ne jamais afficher : vous avez 91 notions en retard,
// faites-les toutes »*, et en même temps *« ne jamais cacher la dette »*.
//
// D'où la forme retenue : **le total d'abord, puis ce qu'on en fait**. Trois
// nombres qui s'additionnent exactement au total (`I2`), et pour chaque notion
// garée, la raison ET la condition qui la ramène. Un garage sans date de sortie
// serait une suppression déguisée.
//
// ── AUCUN SCORE ─────────────────────────────────────────────────────────
//
// Rien ici n'affiche de « pression », de probabilité d'oubli ni de score de
// mémoire. Les cinq facteurs de `BACKLOG_PRESSURE` sont montrés **nommés et
// séparés** (§2 du contrat gelé) : un nombre unique se lirait comme une note.
import { Panel, Metric, InlineNotice } from '@/app/ui';
import type { VueArriere } from '@/lib/backlog-server';

// Le libellé humain du garage. Trois autres entrées existaient ici, jamais
// utilisées : chaque classe du triage porte déjà sa RAISON en clair, et une
// table de traduction morte finit par diverger de ce qu'elle traduit.
const EN_ATTENTE = 'en attente d’un prérequis';

export default function BacklogPanel({ vue, horizon }: { vue: VueArriere; horizon: number }) {
  if (vue.total === 0) {
    return (
      <Panel label="Ton retard">
        <p className="ret-note">
          <strong>Aucune notion en retard.</strong> Ce n’est pas un score : c’est le
          décompte des notions dont l’échéance de réactivation est passée, et il est
          vide.
        </p>
      </Panel>
    );
  }

  const garees = vue.notions.filter((n) => n.placement === 'gare');
  const actives = vue.notions.filter((n) => n.placement === 'actif');
  const urgentes = vue.notions.filter((n) => n.classe === 'URGENT');

  return (
    <Panel label={`Ton retard — ${vue.total} notion${vue.total > 1 ? 's' : ''}`}>
      {/* Le total EST le titre. On ne le découvre pas en dépliant un panneau. */}
      <div className="ret-backlog-metrics">
        <Metric label="Aujourd’hui" value={vue.actif} sub="ce que la séance prend" emphasis />
        <Metric label="Plus tard" value={vue.differe} sub="revient tout seul demain" />
        <Metric
          label="En attente"
          value={vue.gare}
          sub={vue.gare > 0 ? 'bloquées par un prérequis' : 'aucune notion bloquée'}
        />
      </div>

      <p className="ret-note">
        Ces trois nombres font <strong>{vue.total}</strong> : aucune notion en retard n’est
        retirée du décompte. « En attente » ne veut pas dire « acquise » — cela veut dire
        que la travailler maintenant reviendrait à buter sur autre chose.
      </p>

      {/* Le facteur qui déclenche l'urgence est `bloquantes`, jamais le volume
          (§3 du contrat). On le dit dans ces termes-là. */}
      {vue.pression.bloquantes > 0 ? (
        <InlineNotice tone="attention">
          <strong>{vue.pression.bloquantes}</strong>{' '}
          notion{vue.pression.bloquantes > 1 ? 's' : ''} en retard{' '}
          {vue.pression.bloquantes > 1 ? 'servent' : 'sert'} de base à ce que le parcours
          enseigne dans les {horizon} prochains jours. C’est ce qui compte, pas le total :
          soixante notions dont rien ne dépend avant un mois ne bloquent rien.
        </InlineNotice>
      ) : null}

      {urgentes.length > 0 ? (
        <>
          <h3 className="ret-backlog-h">À reprendre en priorité</h3>
          <ul className="ret-backlog-list">
            {urgentes.slice(0, 8).map((n) => (
              <li key={n.id}>
                <span className="ret-backlog-titre">{n.titre}</span>
                <span className="ret-backlog-raison">{n.raison}</span>
              </li>
            ))}
          </ul>
          {urgentes.length > 8 ? (
            <p className="ret-note">
              … et {urgentes.length - 8} autre{urgentes.length - 8 > 1 ? 's' : ''}. La séance
              du jour en prend {actives.length} : le reste attend demain, il n’est pas perdu.
            </p>
          ) : null}
        </>
      ) : null}

      {garees.length > 0 ? (
        <>
          <h3 className="ret-backlog-h">En attente, et pourquoi</h3>
          <ul className="ret-backlog-list">
            {garees.slice(0, 6).map((n) => (
              <li key={n.id}>
                <span className="ret-backlog-titre">{n.titre}</span>
                <span className="ret-backlog-raison">{n.raison}</span>
                {/* La condition de sortie est OBLIGATOIRE : un garage sans
                    levée serait une suppression qui ne dit pas son nom. */}
                <span className="ret-backlog-retour">{n.conditionDeRetour}</span>
              </li>
            ))}
          </ul>
          {garees.length > 6 ? (
            <p className="ret-note">… et {garees.length - 6} autre{garees.length - 6 > 1 ? 's' : ''}, toutes pour la même raison : leur prérequis est lui-même en retard.</p>
          ) : null}
        </>
      ) : null}

      {vue.soupape ? (
        <InlineNotice tone="info">
          Toutes tes notions en retard dépendent les unes des autres. Plutôt que de tout
          mettre en attente — ce qui ne te laisserait rien à faire — le produit les remet
          toutes en circulation et repart des plus simples.
        </InlineNotice>
      ) : null}

      {vue.sansGraphePrerequis ? (
        <p className="ret-note">
          Le graphe de prérequis du programme n’est pas disponible : aucune notion ne peut
          donc être déclarée « en attente », ni « nécessaire à la suite ». Le décompte
          reste juste, le tri est simplement moins fin.
        </p>
      ) : null}

      {/* `BACKLOG_PRESSURE` — cinq facteurs NOMMÉS et séparés. Jamais un total :
          un nombre unique sans unité se lirait comme une note de mémoire. */}
      <details className="ret-backlog-details">
        <summary>D’où vient ce tri</summary>
        <dl className="ret-counts">
          <div><dt>Notions nécessaires à la suite</dt><dd>{vue.pression.bloquantes}</dd></div>
          <div><dt>Tentatives échouées sans reprise</dt><dd>{vue.pression.echecsNonRepris}</dd></div>
          <div><dt>Notions en retard</dt><dd>{vue.pression.volume}</dd></div>
          <div><dt>Minutes que tout reprendre demanderait</dt><dd>{vue.pression.minutesRequises}</dd></div>
          <div><dt>Jours depuis la plus ancienne échéance</dt><dd>{vue.pression.anciennete}</dd></div>
        </dl>
        <p className="ret-note">
          Ces cinq nombres ne sont pas additionnés. Il n’existe pas de « score de retard » :
          soixante notions dont rien ne dépend et quatre notions exigées la semaine
          prochaine ne se comparent pas, et les résumer par un seul chiffre effacerait
          exactement la différence qui compte.
        </p>
        <p className="ret-note">
          Une notion classée <em>{EN_ATTENTE}</em> garde son échéance, son
          état et son historique. Rien n’est remis à zéro, rien n’est déclaré acquis.
        </p>
      </details>
    </Panel>
  );
}
