// RÉACTIVATION — la surface du Retention Engine I (V66 · CP6).
//
// /revisions répond « quelles JOURNÉES faut-il revoir, d'après ce que j'ai
// déclaré comprendre ». Cette page répond à une autre question, et c'est celle
// que le sprint V66 pose : « quelles NOTIONS suis-je capable de retrouver,
// d'après ce que j'ai réellement su restituer ».
//
// Rien n'est calculé ici. Deux read-models fournissent tout, et ils ont des
// responsabilités DISJOINTES (§4 du contrat gelé V74) :
//   · `getRetentionSummary()` (V66) — l'ÉTAT d'une notion et son échéance ;
//   · `getPlanDuJour()`      (V74) — l'ORDRE, la forme, le budget, le pourquoi.
// L'arbitre est au-dessus des moteurs : il les lit, il ne les remplace pas.

import Link from 'next/link';
import { getRetentionSummary, getRecallPrompt } from '@/lib/retention-server';
import { getPlanDuJour } from '@/lib/plan-jour-server';
import { getVueArriere, getPositionApprenant, HORIZON_ESSENTIEL } from '@/lib/backlog-server';
import { getVueRecuperation } from '@/lib/recovery-server';
import { getVueRattrapage } from '@/lib/catchup-server';
import { RETENTION_STATE_LABEL, INTERVALS, RETAINED_MIN_SPAN_DAYS } from '@/lib/retention';
import { PageHeader, ContextLine, Panel, EmptyState, Metric, InlineNotice } from '@/app/ui';
import RecallStation from './RecallStation';
import BacklogPanel from './BacklogPanel';
import RecoveryNotice from './RecoveryNotice';
import CatchupPlan from './CatchupPlan';

export const dynamic = 'force-dynamic';

export default function RetentionPage() {
  const now = new Date().toISOString();
  const s = getRetentionSummary(now);

  // ── V74 · CP12 — l'arbitre décide de l'ORDRE, V66 décide de l'ÉTAT ──
  //
  // Jusqu'ici cette page classait par la seule série de réussites consécutives.
  // Le plan du jour applique la chaîne complète : sept facteurs explicables
  // (CP3), les bandes de statut et la place réservée (CP8), la forme adaptée
  // (CP4), un archétype citant une section réelle (CP5), et le budget que la
  // journée peut réellement donner (CP10).
  //
  // Les deux sources ne se contredisent pas : V66 garde la responsabilité de
  // l'ÉTAT d'une notion (§4 du contrat gelé), l'arbitre celle de l'ORDRE. C'est
  // exactement le partage que le CP1 avait écrit.
  // ── V75 · CP5 → CP8 — L'ORDRE DES QUATRE APPELS EST LA DÉCISION ──
  //
  // 1. la POSITION, seule et d'abord. Elle ne dépend de rien d'autre ;
  // 2. le plan la reçoit — c'était le second verrou du défaut **P1** : appelé
  //    sans position, `getPlanDuJour` voit une charge `null` et retombe
  //    toujours sur le budget nominal, quelle que soit la journée réelle ;
  // 3. le triage reçoit la TAILLE RÉELLE de la séance que ce plan produit.
  //    **C'est la correction du constat bloquant de l'audit CP8** : l'arriéré
  //    était trié avec le plafond du scheduler (8), si bien que la page
  //    annonçait « Aujourd'hui : 8 » au-dessus d'une file de 2 cartes ;
  // 4. la récupération reçoit les deux plutôt que de les recalculer, sans quoi
  //    la page afficherait deux budgets différents pour la même journée.
  const jourCourant = getPositionApprenant(now);
  const plan = getPlanDuJour(now, jourCourant);
  const arriere = getVueArriere(now, { capaciteActive: plan.unites.length });
  const recuperation = getVueRecuperation(now, { arriere, plan });
  // V75 · CP7 — le plan de rattrapage consomme le triage et les minutes déjà
  // calculés : deux sources produiraient deux plans sur la même page.
  const rattrapage = getVueRattrapage(recuperation, now);
  const parConcept = new Map(plan.unites.map((u) => [u.id, u]));

  // ── V75 · CP5 — CE QUE L'ARRIÉRÉ CORRIGE ──
  //
  // Le CP0 a mesuré le défaut **P2** sur cette page même : à 84 notions
  // réellement en retard, elle affichait « 8 » — la longueur de la file V66,
  // plafonnée — et proposait 3 cartes. Aucune intention de cacher, et pourtant
  // la dette était cachée.
  //
  // L'invariant `I5` du contrat gelé exige l'inverse : le nombre montré comme
  // « en retard » est l'arriéré TOTAL. Et puisqu'un total sans décomposition
  // n'est qu'un mur (106 notions pour l'apprenant irrégulier du CP0), le
  // triage du CP5 l'accompagne : ce qui est pris aujourd'hui, ce qui attend,
  // ce qui est garé — et pourquoi, notion par notion.

  // Les unités du plan sont retrouvées dans la PROJECTION COMPLÈTE de V66, pas
  // dans sa file. La nuance est le défaut trouvé en lisant la page réelle :
  // chercher dans `s.queue` revenait à refiltrer le choix de l'arbitre par la
  // règle d'échéance de V66 — deux décideurs pour une même question, et une
  // page qui affichait « rien n'est dû aujourd'hui » alors que le plan venait
  // d'écarter des unités faute de budget. **Un seul décide de l'ordre.**
  const base = plan.unites.length > 0
    ? plan.unites.map((u) => s.projection.find((p) => p.conceptId === u.id)).filter((p) => p != null)
    : s.queue;
  const prompts = base.map((p) => {
    const row = getRecallPrompt(p!);
    const u = parConcept.get(row.conceptId);
    return u ? {
      ...row,
      // La FORME vient de l'arbitre, comme la consigne. Les laisser diverger
      // était un défaut réel, visible seulement en lisant la page rendue : le
      // libellé affichait la forme choisie par V66 (« Mise en application »)
      // pendant que la consigne venait de la forme choisie par le CP4
      // (« réponds aux questions d'entretien »). Une carte ne peut pas annoncer
      // un exercice et en demander un autre.
      format: u.format as typeof row.format,
      pourquoi: u.pourquoi,
      consigne: u.consigne || undefined,
      verifier: u.verifier,
      minutes: u.minutes,
    } : row;
  });

  // Deux grandeurs DISJOINTES, et leur somme vaut le total — sinon la page se
  // contredit (défaut trouvé au CP14 en lisant la page réelle).
  const rencontres = s.totalConcepts - s.notYetReached;
  const testes = rencontres - s.counts.nouveau;

  return (
    <>
      <ContextLine
        label="Réactivation"
        facts={[
          { k: 'Surface', v: 'Réactivation', here: true },
          { k: 'Notions du programme', v: `${s.totalConcepts}` },
          { k: 'Rencontrées', v: `${rencontres}` },
          { k: 'Mises à l’épreuve', v: `${testes}` },
          // I5 · l'arriéré TOTAL, jamais une file plafonnée (défaut P2).
          { k: 'En retard', v: `${arriere.total}` },
        ]}
      />

      <PageHeader
        eyebrow="Rétention"
        title="Réactivation"
        sub={<>
          Une notion n’est pas retenue parce qu’elle a été lue : elle l’est quand tu sais
          la retrouver <strong>sans le cours sous les yeux</strong>, à plusieurs semaines
          d’intervalle. Cette page ne mesure que ça. Elle ne peut rien conclure tant que
          tu n’as rien tenté. <Link href="/revisions">Révisions par journée</Link>.
        </>}
      />

      {s.attemptCount === 0 ? (
        <EmptyState
          title="Aucune tentative de rappel enregistrée"
          hint={
            <>
              Le produit ne sait donc <strong>rien</strong> de ce que tu retiens, et il ne
              va pas le deviner à partir des journées que tu as terminées : avoir lu une
              leçon et savoir la restituer sont deux faits différents, et seul le second
              se mesure ici.
              {' '}
              {rencontres > 0
                ? <>Tu as rencontré <strong>{rencontres}</strong> notions sur {s.totalConcepts}. Elles sont toutes à l’état « Nouveau » tant qu’aucune n’a été mise à l’épreuve.</>
                : <>Ouvre une journée pour rencontrer tes premières notions.</>}
            </>
          }
        />
      ) : null}

      {/* ── Le signal de charge (CP10). Il PROPOSE, il ne décide pas : sauter
          une journée de programme appartient à la personne, jamais au
          planificateur. Aucun chiffre de « score » ici — seulement un décompte
          de notions, qui se vérifie. */}
      {/* ── V75 · CP8 — UN SEUL SIGNAL À LA FOIS ──
          L'audit du CP8 a lu la page rendue : ce bandeau annonçait « Rien à
          changer pour l'instant ; le nombre ne monte plus », immédiatement
          suivi de « Le retard s'est installé au point qu'avancer le creuse ».
          Deux avis opposés à trois lignes d'intervalle.
          Le signal de V74 ne connaît que le VOLUME ; le mode du CP6 connaît
          les cinq facteurs. Quand un mode est actif, c'est lui qui parle —
          le signal de charge n'est pas supprimé, il est subordonné. */}
      {plan.signal.message && recuperation.mode === 'NORMAL' ? (
        <InlineNotice tone={plan.signal.niveau === 'ralentir' ? 'attention' : 'info'}>
          {plan.signal.message}
          {plan.signal.proposition ? <> {plan.signal.proposition}</> : null}
        </InlineNotice>
      ) : null}

      {/* V75 · CP6 — le mode du jour, et ce qu'il PROPOSE. Placé au-dessus de
          la file : savoir pourquoi la séance ressemble à ça doit précéder la
          séance, pas la suivre. */}
      <RecoveryNotice vue={recuperation} />

      <div className="ret-grid">
        <div className="ret-main">
          <Panel label={`File du jour${prompts.length ? ` — ${prompts.length}` : ''}`}>
            {prompts.length === 0 ? (
              <p className="ret-note">
                {s.attemptCount === 0
                  ? 'Rien à réactiver : aucune notion n’a encore été tentée.'
                  : plan.minutesAccordees === 0
                    ? plan.motifBudget
                    : 'Rien n’est dû aujourd’hui. Les échéances sont calculées depuis tes tentatives réelles — revenir plus tôt n’avancerait rien.'}
              </p>
            ) : (
              <>
                <p className="ret-note">
                  Notions dues, <strong>entrelacées</strong> : deux notions de la même
                  compétence ne se suivent pas tant qu’une autre attend. Réviser six
                  notions du même domaine d’affilée donne une impression de maîtrise sans
                  jamais obliger à les distinguer.
                </p>
                <RecallStation prompts={prompts} />
              </>
            )}
          </Panel>

          {/* V75 · CP5 — l'arriéré TOTAL, décomposé. Il est dans la colonne
              PRINCIPALE et non dans le rail : le CP0 a montré qu'un retard
              relégué en marge se lit comme une note de bas de page, alors
              qu'il est la question la plus importante pour un apprenant
              irrégulier (80 % du corpus en retard, profil B). */}
          <BacklogPanel vue={arriere} horizon={HORIZON_ESSENTIEL} />

          {/* V75 · CP7 — la semaine proposée, et le choix de suspendre. Placé
              APRÈS l'arriéré : on ne propose un plan qu'à quelqu'un qui vient
              de voir ce qu'il couvre et ce qu'il ne couvre pas. */}
          <CatchupPlan
            vue={rattrapage}
            mode={recuperation.mode}
            choix={recuperation.arbitrage.recommandation.choix}
          />
        </div>

        <aside className="ret-rail">
          <Panel label="État des notions">
            <dl className="ret-counts">
              {(['a_revoir', 'fragile', 'en_consolidation', 'retenu', 'nouveau'] as const).map((k) => (
                <div key={k}>
                  <dt>{RETENTION_STATE_LABEL[k]}</dt>
                  <dd>{s.counts[k]}</dd>
                </div>
              ))}
            </dl>
            {s.notYetReached > 0 && (
              <p className="ret-note">
                <strong>{s.notYetReached}</strong> notions ne sont pas encore dans le
                décompte : le programme les enseigne dans des journées que tu n’as pas
                ouvertes. Ce n’est pas un retard, c’est la suite du parcours.
              </p>
            )}
          </Panel>

          <Panel label="Comment l’état est obtenu">
            {/* La règle est ÉNONCÉE, pas cachée : un apprenant doit pouvoir
                contester un état, donc savoir ce qui le produit. Les valeurs
                viennent du modèle, elles ne sont pas recopiées à la main. */}
            <ul className="ret-rule">
              <li><strong>Nouveau</strong> — rencontré, jamais mis à l’épreuve.</li>
              <li><strong>Fragile</strong> — dernier essai raté, ou une seule journée de réussite.</li>
              <li><strong>En consolidation</strong> — plusieurs réussites, mais pas encore assez espacées.</li>
              <li><strong>Retenu</strong> — 3 réussites, à 3 dates différentes, sur au moins {RETAINED_MIN_SPAN_DAYS} jours.</li>
              <li><strong>À revoir</strong> — l’échéance est passée. Prime sur tout le reste.</li>
            </ul>
            <p className="ret-note">
              Espacement après chaque réussite consécutive :
              {' '}{INTERVALS.join(' · ')} jours. Un échec ramène à {INTERVALS[0]} jour.
              Aucun de ces états ne peut être posé à la main : il se mérite par des
              tentatives, ou il ne s’obtient pas.
            </p>
          </Panel>

          {/* V74 · CP12 — ce que l'arbitre a ÉCARTÉ, et pourquoi.
              Le CP4 traite `differes` comme une SORTIE, pas un reliquat :
              savoir ce qui n'a pas été retenu vaut autant que savoir ce qui
              l'a été, et c'est ce qui rend l'ordre contestable. */}
          {plan.differes.length > 0 && (
            <Panel label="Écarté aujourd’hui">
              <ul className="ret-rule">
                {plan.differes.map((d) => (
                  <li key={d.titre}><strong>{d.titre}</strong> — {d.motif}</li>
                ))}
              </ul>
            </Panel>
          )}

          {plan.jamaisTransferees > 0 && (
            <Panel label="Su, mais jamais ailleurs">
              <p className="ret-note">
                <strong>{plan.jamaisTransferees}</strong> notions que tu sais retrouver
                n’ont jamais été employées <strong>hors de leur contexte d’origine</strong>.
                Rien n’échoue dessus, donc rien ne t’alerte — c’est précisément pourquoi
                c’est écrit ici.
              </p>
            </Panel>
          )}

          <Panel label="Ce que cette page ne mesure pas">
            <p className="ret-note">
              Elle mesure ta capacité à <strong>retrouver</strong> une notion, pas ta
              capacité à l’<strong>appliquer</strong> sous pression sur un vrai problème.
              La démonstration d’une compétence reste du ressort des exercices, des
              diagnostics et des capstones — <Link href="/skills">Compétences</Link>.
            </p>
          </Panel>
        </aside>
      </div>

      <div className="ret-metrics">
        <Metric label="Notions rencontrées" value={`${rencontres}`} sub={`sur ${s.totalConcepts} au programme`} />
        <Metric label="Mises à l’épreuve" value={`${testes}`} sub="au moins une tentative" />
        <Metric label="Tentatives enregistrées" value={`${s.attemptCount}`} sub="réussites, partielles et échecs" />
      </div>
    </>
  );
}
