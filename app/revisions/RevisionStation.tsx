// V57 · P0 — Station de réactivation.
// V58 · CP9 — ORDRE PILOTÉ PAR L'ÉTAT, et bande d'identité partagée.
//
// V56 avait ajouté un hero à une vieille page : blind-difference échoué (2/5).
// Ce n'était pas une migration. La page est ici REcomposée : quatre zones qui
// répondent chacune à une question distincte, et non un empilement de panneaux.
//
//   1. LA FILE        — position : combien, dans quel état, quoi en tête.
//   2. L'ÉCHÉANCIER   — trajectoire : quand cela revient, sur 30 jours réels.
//   3. L'ÉCHELLE      — le modèle rendu perceptible : les intervalles réels
//                       renvoyés par `baseInterval()`, appelée pour de bon.
//   4. L'ENTRETIEN    — action réellement disponible quand la file est vide.
//
// ── Ce que le CP9 corrige, constaté sur capture 1440 avec une file CHARGÉE ──
//
// L'ordre était FIXE. Avec 6 journées dues dont 4 en retard, la liste de
// travail se retrouvait tout en bas, sous l'explication de SM-2 et sous une
// zone intitulée « Entretenir sans attendre une échéance » — c'est-à-dire que
// la page expliquait quoi faire quand rien n'est dû alors que six choses
// l'étaient, et que le bouton le plus proéminent de l'écran (`btn cta`,
// « Jour 89 ») pointait ailleurs que sur le travail à faire.
//
// La station n'a pas un ordre : elle en a DEUX, selon son état réel.
//
//   file chargée : identité → jauges → TRAVAIL → échéancier → modèle (référence)
//   file vide    : identité → jauges → échéancier → modèle + entretien
//
// L'identité passe sur la bande partagée (SurfaceHead, famille « pilot ») :
// c'était l'une des onze bandes recopiées à la main que le CP2 a unifiées.
//
// Honnêteté de l'état vide : zéro révision affiche zéro révision. Aucune tâche,
// aucun compteur, aucune échéance n'est fabriqué. Ce qui reste visible quand la
// file est vide, c'est la STRUCTURE de la file et le MODÈLE qui la remplit —
// tous deux dérivés de règles réelles, ce qui n'est pas une donnée inventée.
//
// Motif propriétaire : AUCUN, assumé (ADR-057 §4). Les cinq motifs expriment
// une position dans un curriculum (PositionRing, YearBand), une trajectoire
// annuelle (TrajectoryMap), un déroulé de document ancré (PhaseRail) ou la
// nature d'une preuve (EvidenceMark). Une file d'échéances n'est aucune de ces
// cinq choses ; en forcer un aurait été un ornement, ce que l'ADR interdit.
// La page se distingue par sa composition — bandes continues et échelle
// proportionnelle — et non par un motif emprunté.
import type { ReactNode } from 'react';
import Link from 'next/link';
import { AlertTriangle, CalendarClock, CircleDot, Gauge, Repeat2 } from 'lucide-react';
import { SurfaceHead, ContextLine } from '@/app/ui';

export type QueueRow = { day: number; title: string; skill: string; reason: string; overdueDays: number };
export type HorizonRow = { day: number; title: string; skill: string; inDays: number };

/** Un barreau de l'échelle : intervalle RÉEL renvoyé par lib/review.mjs. */
export type Rung = { key: string; label: string; hint: string; days: number };

const HORIZON_DAYS = 30;

export default function RevisionStation({
  due, horizon, rungs, maxInterval, resumeDay, resumeTitle, trackTitle, work,
}: {
  due: QueueRow[];
  horizon: HorizonRow[];
  rungs: Rung[];
  maxInterval: number;
  resumeDay: number | null;
  resumeTitle: string;
  trackTitle: string;
  /** La file de travail réelle. Rendue juste sous les jauges quand il y a
      quelque chose à traiter — c'est l'objet de la page, pas son annexe. */
  work?: ReactNode;
}) {
  const overdue = due.filter((r) => r.overdueDays > 0);
  const onTime = due.filter((r) => r.overdueDays === 0);
  const empty = due.length === 0 && horizon.length === 0;
  const hasWork = due.length > 0;
  // L'échelle des barres se réfère au plus grand PREMIER intervalle (21 j), pas
  // au plafond (180 j) : rapporté à 180, tout l'écart utile 1→21 s'écrase à
  // moins d'un pixel et la comparaison devient illisible. Les valeurs affichées
  // restent exactes ; seule la référence des barres change, et le barreau de
  // plafond est explicitement signalé comme hors échelle.
  const longest = Math.max(...rungs.map((r) => r.days));

  // ── ZONE 1 · LA FILE ──────────────────────────────────────────────────
  // Bande pleine largeur en trois compartiments réels. Elle n'est pas une
  // carte : c'est l'état de la file, lisible d'un coup d'œil. À zéro, les
  // trois compartiments RESTENT — c'est la structure qui informe.
  const queueBand = (
      <section className="rev-queue" aria-label="État de la file de révision">
        <SurfaceHead
          kind="pilot"
          eyebrow={<>Réactivation <span className="sep">/</span> parcours actif : {trackTitle}</>}
          title={empty
            ? 'Rien à réactiver aujourd’hui'
            : `${due.length} journée${due.length > 1 ? 's' : ''} à réactiver`}
          lead={hasWork
            ? <>La file est ci-dessous, dans l’ordre du retard. Chaque réponse replanifie
              l’échéance à partir du modèle décrit plus bas.</>
            : undefined}
        />

        {/* V61 · TROIS ZÉROS CÔTE À CÔTE NE SONT PAS TROIS INFORMATIONS.
            Mesuré au CP0 : la station affichait « 0 » trois fois, en trois
            jauges de même poids, chacune suivie d'une phrase disant la même
            chose autrement. À l'état neuf — qui est l'état RÉEL du produit,
            `progress.json` ne contenant aucune journée — c'est le tiers
            supérieur de l'écran occupé par l'absence.
            Quand rien n'est dû, la file le dit UNE fois, en une ligne. Quand
            quelque chose est dû, les jauges reprennent leur rôle : ce sont
            alors trois nombres différents, et trois décisions différentes. */}
        {hasWork ? (
          <div className="rev-gauges">
            <div className={`rev-gauge is-late${overdue.length ? ' has' : ''}`}>
              <span className="rev-gauge-k"><AlertTriangle size={13} strokeWidth={2} /> En retard</span>
              <span className="rev-gauge-n">{overdue.length}</span>
              <span className="rev-gauge-d">
                {overdue.length
                  ? `échéance dépassée de ${overdue[0].overdueDays} j au plus`
                  : 'aucune échéance dépassée'}
              </span>
            </div>
            <div className={`rev-gauge is-today${onTime.length ? ' has' : ''}`}>
              <span className="rev-gauge-k"><CircleDot size={13} strokeWidth={2} /> À échéance aujourd’hui</span>
              <span className="rev-gauge-n">{onTime.length}</span>
              <span className="rev-gauge-d">
                {onTime.length ? 'à traiter dans la journée' : 'rien n’arrive à échéance'}
              </span>
            </div>
            <div className={`rev-gauge is-soon${horizon.length ? ' has' : ''}`}>
              <span className="rev-gauge-k"><CalendarClock size={13} strokeWidth={2} /> Sous {HORIZON_DAYS} jours</span>
              <span className="rev-gauge-n">{horizon.length}</span>
              <span className="rev-gauge-d">
                {horizon.length
                  ? `la prochaine dans ${horizon[0].inDays} j`
                  : 'aucune échéance programmée'}
              </span>
            </div>
          </div>
        ) : (
          <p className="rev-quiet">
            Aucune échéance : ni en retard, ni aujourd’hui, ni dans les
            {' '}{HORIZON_DAYS} prochains jours. La file se remplira à la
            clôture de ta première journée.
          </p>
        )}
      </section>
  );

  // ── ZONE 2 · L'ÉCHÉANCIER ─────────────────────────────────────────────
  // Bande temporelle continue, aujourd'hui → J+30, graduée par semaine.
  // Chaque échéance réelle est posée à son décalage réel. Vide, la bande
  // reste graduée : l'horizon existe même sans rien dessus, et le dire
  // vaut mieux que de masquer la zone.
  const horizonBand = (
      <section className="rev-horizon" aria-label={`Échéancier des ${HORIZON_DAYS} prochains jours`}>
        <div className="rev-horizon-head">
          <h2 className="rev-h">Échéancier</h2>
          <span className="rev-h-note">
            {horizon.length
              ? `${horizon.length} échéance${horizon.length > 1 ? 's' : ''} programmée${horizon.length > 1 ? 's' : ''}`
              : 'aucune échéance programmée'}
          </span>
        </div>
        <div className="rev-track" role="img"
          aria-label={horizon.length
            ? `Échéancier : ${horizon.map((h) => `jour ${h.day} dans ${h.inDays} jours`).join(', ')}`
            : `Échéancier vide sur ${HORIZON_DAYS} jours`}
        >
          <div className="rev-track-grid" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((w) => (
              <span key={w} className="rev-track-week" style={{ left: `${(w * 7 / HORIZON_DAYS) * 100}%` }}>
                {w === 0 ? "auj." : `S+${w}`}
              </span>
            ))}
          </div>
          <span className="rev-track-now" aria-hidden="true" />
          {horizon.map((h) => (
            <Link
              key={h.day}
              href={`/day/${h.day}`}
              className="rev-tick"
              style={{ left: `${Math.min(100, (h.inDays / HORIZON_DAYS) * 100)}%` }}
              title={`Jour ${h.day} — ${h.title} · dans ${h.inDays} j`}
            >
              <span className="rev-tick-dot" aria-hidden="true" />
              <span className="rev-tick-lab">J{h.day}</span>
            </Link>
          ))}
          {!horizon.length && (
            <p className="rev-track-void">
              L’horizon est vide : aucune journée n’a d’échéance dans les {HORIZON_DAYS} prochains jours.
            </p>
          )}
        </div>
      </section>
  );

  // ── ZONE 3 · LE MODÈLE ────────────────────────────────────────────────
  // Une seule zone structurante : à gauche l'échelle qui rend la mécanique
  // perceptible, à droite — SEULEMENT quand rien n'est dû — ce qu'on fait
  // sans échéance. La zone d'entretien s'adresse explicitement au cas « rien
  // n'est dû » ; l'afficher au-dessus de six révisions en retard contredisait
  // l'état de la page (constat CP9). Quand il y a du travail, le modèle passe
  // en RÉFÉRENCE, après la file et l'échéancier.
  const modelZone = (
      <section className={`rev-model${hasWork ? ' is-reference' : ''}`} aria-label="Modèle de répétition espacée">
      <div className="rev-ladder">
        <div className="rev-horizon-head">
          <h2 className="rev-h">Échelle de consolidation</h2>
          <span className="rev-h-note">répétition espacée · SM-2 · local et déterministe</span>
        </div>
        <p className="rev-ladder-lead">
          À la clôture d’une journée, la compréhension que tu déclares fixe le premier
          intervalle. Ensuite, chaque révision réussie multiplie l’intervalle par la
          facilité acquise, jusqu’à un plafond de {maxInterval} jours.
        </p>
        <ol className="rev-rungs">
          {rungs.map((r) => (
            <li key={r.key} className="rev-rung">
              <span className="rev-rung-k">{r.label}</span>
              <span className="rev-rung-bar" aria-hidden="true">
                <span className="rev-rung-fill" style={{ width: `${(r.days / longest) * 100}%` }} />
              </span>
              <span className="rev-rung-n">{r.days} j</span>
              <span className="rev-rung-d">{r.hint}</span>
            </li>
          ))}
          <li className="rev-rung is-cap">
            <span className="rev-rung-k">Plafond</span>
            <span className="rev-rung-bar" aria-hidden="true">
              <span className="rev-rung-fill is-cap" style={{ width: '100%' }} />
            </span>
            <span className="rev-rung-n">{maxInterval} j</span>
            <span className="rev-rung-d">
              hors échelle — au-delà de {maxInterval} jours, l’intervalle n’augmente plus
            </span>
          </li>
        </ol>
        <p className="rev-ladder-foot">
          <Gauge size={13} strokeWidth={2} /> Une révision réactive une <strong>compétence</strong> :
          la journée revue porte la sienne, et ce qu’elle produit — exercice, mission, projet —
          reste la <Link href="/synthese">preuve</Link>, jamais le compteur de révisions.
        </p>
      </div>

      {/* ── ZONE 4 · ENTRETENIR SANS ÉCHÉANCE ───────────────────────────────
          Ce que l'on fait réellement quand rien n'est dû. Deux actions
          existantes, aucune fabriquée. Masquée dès qu'il y a du travail : le
          titre lui-même dit « sans attendre une échéance ». */}
      {!hasWork && (
      <div className="rev-maintain">
        <div className="rev-horizon-head">
          <h2 className="rev-h">Entretenir sans attendre une échéance</h2>
        </div>
        <div className="rev-maintain-row">
          <div className="rev-maintain-item">
            <span className="rev-maintain-k"><Repeat2 size={13} strokeWidth={2} /> Rappel actif à la demande</span>
            <p className="rev-maintain-d">
              Les <Link href="/diagnostics">diagnostics</Link> testent le rappel par niveau —
              te souvenir, expliquer, appliquer, diagnostiquer, transposer. Correction locale
              et déterministe ; le résultat n’entre pas dans ta progression.
            </p>
          </div>
          <div className="rev-maintain-item">
            <span className="rev-maintain-k"><CalendarClock size={13} strokeWidth={2} /> Avancer le parcours</span>
            {resumeDay != null ? (
              <>
                <p className="rev-maintain-d">
                  Reprendre là où tu t’es arrêté alimente la file : c’est la clôture d’une
                  journée qui crée une échéance.
                </p>
                <Link className="btn cta" href={`/day/${resumeDay}`}>
                  Jour {resumeDay}{resumeTitle ? ` — ${resumeTitle}` : ''}
                </Link>
              </>
            ) : (
              <p className="rev-maintain-d">
                Aucune journée à reprendre sur ce parcours.
              </p>
            )}
          </div>
        </div>
      </div>
      )}
      </section>
  );

  // ── ORDRE PILOTÉ PAR L'ÉTAT ───────────────────────────────────────────
  // Ce n'est pas une variante cosmétique : quand six journées sont dues, la
  // première chose sous les jauges doit être ce qu'il y a à faire. Quand rien
  // n'est dû, la même page redevient une explication du mécanisme et propose
  // l'entretien. Une seule composition, deux ordres justifiés par l'état réel.
  return (
    <div className={`rev-station${hasWork ? ' has-work' : ''}`}>
      {/* V61 · dernière des quinze surfaces à recevoir la ligne de contexte.
          Sans elle, /revisions était la seule à ne pas se présenter comme les
          autres — et la sonde d'identité le voyait. */}
      <ContextLine
        label="État de la file de réactivation"
        facts={[
          { k: 'Parcours', v: trackTitle },
          { k: 'À réactiver', v: `${due.length}`, here: true },
          { k: 'En retard', v: `${overdue.length}` },
          { k: 'Horizon 30 j', v: `${horizon.length}` },
          { k: 'Plafond', v: `${maxInterval} j` },
        ]}
      />
      {queueBand}
      {hasWork ? <>{work}{horizonBand}{modelZone}</> : <>{horizonBand}{modelZone}</>}
    </div>
  );
}
